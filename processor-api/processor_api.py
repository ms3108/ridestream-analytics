import json
import threading
import time
from collections import deque
from datetime import datetime, timezone, timedelta
from flask import Flask, jsonify
from flask_cors import CORS
from kafka import KafkaConsumer

# --- In-Memory Data Store ---
HOURS_TO_TRACK = 24
MINUTES_TO_TRACK = 60

metrics = {
    "total_earnings": 0.0,
    "latest_events": deque(maxlen=20),
    "active_vehicles": {},
    "hourly_stats": deque(maxlen=HOURS_TO_TRACK),
    "active_vehicles_history": deque(maxlen=MINUTES_TO_TRACK),
    "vehicle_type_counts": {"Taxi": 0, "Airplane": 0}
}
metrics_lock = threading.Lock()

# Initialize hourly stats
for i in range(HOURS_TO_TRACK):
    hour_timestamp = datetime.now(timezone.utc) - timedelta(hours=i)
    metrics["hourly_stats"].appendleft({
        "hour": hour_timestamp.strftime('%Y-%m-%dT%H:00:00Z'),
        "rides": 0,
        "earnings": 0.0
    })

# --- Flask API ---
app = Flask(__name__)
CORS(app)

def kafka_consumer_worker():
    consumer = None
    while not consumer:
        try:
            consumer = KafkaConsumer(
                'ride_events',
                bootstrap_servers=['kafka:9092'],
                auto_offset_reset='earliest',
                group_id='metrics-group-v3',
                value_deserializer=lambda x: json.loads(x.decode('utf-8'))
            )
            print("Consumer connected to Kafka.")
        except Exception as e:
            print(f"Could not connect to Kafka consumer: {e}. Retrying...")
            time.sleep(5)

    for message in consumer:
        event = message.value
        ride_id = event.get("ride_id")
        status = event.get("ride_status")

        with metrics_lock:
            metrics["latest_events"].appendleft(event)

            if status == 'start':
                vehicle_type = event.get("vehicle_type", "Taxi")
                if vehicle_type != "Airplane": vehicle_type = "Taxi"
                metrics["vehicle_type_counts"][vehicle_type] += 1

                metrics["active_vehicles"][ride_id] = {
                    "ride_id": ride_id, "vehicle_type": vehicle_type,
                    "lat": event["latitude"], "lng": event["longitude"], "timestamp": event["timestamp"]
                }

                event_time = datetime.fromisoformat(event["timestamp"])
                hour_key = event_time.strftime('%Y-%m-%dT%H:00:00Z')
                for stat in metrics["hourly_stats"]:
                    if stat["hour"] == hour_key:
                        stat["rides"] += 1
                        break

            elif status == 'in_progress':
                if ride_id in metrics["active_vehicles"]:
                    metrics["active_vehicles"][ride_id].update({
                        "lat": event["latitude"], "lng": event["longitude"], "timestamp": event["timestamp"]
                    })

            elif status == 'end':
                if ride_id in metrics["active_vehicles"]:
                    del metrics["active_vehicles"][ride_id]

                fare = event.get('fare', 0.0)
                metrics["total_earnings"] += fare
                event_time = datetime.fromisoformat(event["timestamp"])
                hour_key = event_time.strftime('%Y-%m-%dT%H:00:00Z')
                for stat in metrics["hourly_stats"]:
                    if stat["hour"] == hour_key:
                        stat["earnings"] += fare
                        break

def history_ticker():
    while True:
        with metrics_lock:
            now = datetime.now(timezone.utc)
            metrics["active_vehicles_history"].append({
                "time": now.isoformat(),
                "count": len(metrics["active_vehicles"])
            })

            current_hour_key = now.strftime('%Y-%m-%dT%H:00:00Z')
            if not any(stat['hour'] == current_hour_key for stat in metrics['hourly_stats']):
                 metrics['hourly_stats'].append({
                    "hour": current_hour_key, "rides": 0, "earnings": 0.0
                 })
        time.sleep(60)

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    with metrics_lock:
        response_data = {
            "total_earnings": round(metrics["total_earnings"], 2),
            "latest_events": list(metrics["latest_events"]),
            "active_vehicles": list(metrics["active_vehicles"].values()),
            "active_vehicles_count": len(metrics["active_vehicles"]),
            "charts": {
                "active_history": list(metrics["active_vehicles_history"]),
                "hourly_stats": list(metrics["hourly_stats"]),
                "vehicle_distribution": metrics["vehicle_type_counts"]
            }
        }
    return jsonify(response_data)

# Start background threads
consumer_thread = threading.Thread(target=kafka_consumer_worker, daemon=True)
ticker_thread = threading.Thread(target=history_ticker, daemon=True)
consumer_thread.start()
ticker_thread.start()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
