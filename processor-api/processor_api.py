import json
import threading
import time
from collections import deque
from flask import Flask, jsonify
from flask_cors import CORS
from kafka import KafkaConsumer

# --- In-Memory Data Store ---
metrics = {
    "total_rides": 0,
    "total_earnings": 0.0,
    "latest_rides": deque(maxlen=10), # Increased size for more context
    "heatmap_data": [],
    "active_rides": {} # To track live location of rides
}
metrics_lock = threading.Lock()

# --- Flask API ---
app = Flask(__name__)
CORS(app)

def kafka_consumer_worker():
    """
    Consumes ride events from Kafka and updates metrics in a thread-safe manner.
    """
    consumer = None
    while not consumer:
        try:
            consumer = KafkaConsumer(
                'ride_events',
                bootstrap_servers=['kafka:9092'],
                auto_offset_reset='earliest',
                group_id='metrics-group-v2', # New group id for the new logic
                value_deserializer=lambda x: json.loads(x.decode('utf-8'))
            )
            print("Consumer connected to Kafka.")
        except Exception as e:
            print(f"Could not connect to Kafka consumer: {e}. Retrying in 5 seconds...")
            time.sleep(5)

    for message in consumer:
        event = message.value
        ride_id = event.get("ride_id")
        status = event.get("ride_status")

        with metrics_lock:
            # Always add recent events to the latest_rides list
            metrics["latest_rides"].appendleft(event)

            if status == 'start':
                metrics["total_rides"] += 1
                metrics["heatmap_data"].append({
                    "lat": event["latitude"],
                    "lng": event["longitude"],
                    "intensity": 1
                })
                # Add ride to active rides
                metrics["active_rides"][ride_id] = {
                    "ride_id": ride_id,
                    "vehicle_type": event.get("vehicle_type"),
                    "lat": event["latitude"],
                    "lng": event["longitude"],
                    "timestamp": event["timestamp"]
                }

            elif status == 'in_progress':
                if ride_id in metrics["active_rides"]:
                    metrics["active_rides"][ride_id].update({
                        "lat": event["latitude"],
                        "lng": event["longitude"],
                        "timestamp": event["timestamp"]
                    })

            elif status == 'end':
                metrics["total_earnings"] += event.get('fare', 0.0)
                # Remove ride from active rides
                if ride_id in metrics["active_rides"]:
                    del metrics["active_rides"][ride_id]

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    """
    Returns the current ride metrics, including active ride locations.
    """
    with metrics_lock:
        # Convert deque and dict values to lists for JSON serialization
        response_data = {
            "total_rides": metrics["total_rides"],
            "total_earnings": round(metrics["total_earnings"], 2),
            "latest_rides": list(metrics["latest_rides"]),
            "heatmap_data": metrics["heatmap_data"],
            "active_rides": list(metrics["active_rides"].values()),
            "active_rides_count": len(metrics["active_rides"])
        }
    return jsonify(response_data)

# Start the Kafka consumer in a background daemon thread
consumer_thread = threading.Thread(target=kafka_consumer_worker, daemon=True)
consumer_thread.start()

if __name__ == '__main__':
    # For local development without Gunicorn
    app.run(host='0.0.0.0', port=5001, debug=True)
