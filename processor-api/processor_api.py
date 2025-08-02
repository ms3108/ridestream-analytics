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
    "latest_rides": deque(maxlen=5),
    "heatmap_data": []
}
metrics_lock = threading.Lock()

# --- Flask API ---
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

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
                group_id='metrics-group',
                value_deserializer=lambda x: json.loads(x.decode('utf-8'))
            )
            print("Consumer connected to Kafka.")
        except Exception as e:
            print(f"Could not connect to Kafka consumer: {e}. Retrying in 5 seconds...")
            time.sleep(5)

    for message in consumer:
        event = message.value
        print(f"Received event: {event}")

        with metrics_lock:
            metrics["latest_rides"].appendleft(event)

            if event.get('ride_status') == 'start':
                metrics["total_rides"] += 1
                metrics["heatmap_data"].append({
                    "lat": event["latitude"],
                    "lng": event["longitude"],
                    "intensity": 1
                })
            elif event.get('ride_status') == 'end':
                metrics["total_earnings"] += event.get('fare', 0.0)

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    """
    Returns the current ride metrics.
    """
    with metrics_lock:
        response_data = {
            "total_rides": metrics["total_rides"],
            "total_earnings": round(metrics["total_earnings"], 2),
            "latest_rides": list(metrics["latest_rides"]),
            "heatmap_data": metrics["heatmap_data"]
        }
    return jsonify(response_data)

# Start the Kafka consumer in a background daemon thread
# This ensures it runs when the app starts, even with Gunicorn
consumer_thread = threading.Thread(target=kafka_consumer_worker, daemon=True)
consumer_thread.start()

if __name__ == '__main__':
    # For local development without Gunicorn
    app.run(host='0.0.0.0', port=5001, debug=True)
