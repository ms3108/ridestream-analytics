import json
import time
import uuid
import random
from datetime import datetime
from kafka import KafkaProducer

# Coordinates for Kochi, India
KOCHI_COORDS = {"lat": 9.9312, "lng": 76.2673}

def generate_ride_event():
    """Generates a random ride event."""
    ride_id = str(uuid.uuid4())
    ride_status = random.choice(['start', 'end'])

    event = {
        "ride_id": ride_id,
        "ride_status": ride_status,
        "latitude": KOCHI_COORDS['lat'] + random.uniform(-0.05, 0.05),
        "longitude": KOCHI_COORDS['lng'] + random.uniform(-0.05, 0.05),
        "timestamp": datetime.utcnow().isoformat()
    }

    if ride_status == 'end':
        event['fare'] = round(random.uniform(5, 50), 2)

    return event

def main():
    """Main function to produce ride events to Kafka."""
    producer = None
    while not producer:
        try:
            producer = KafkaProducer(
                bootstrap_servers=['kafka:9092'],
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                retries=5,
                request_timeout_ms=60000 # Increased timeout
            )
        except Exception as e:
            print(f"Could not connect to Kafka: {e}. Retrying in 5 seconds...")
            time.sleep(5)

    print("Producer connected. Sending ride events to 'ride_events' topic...")

    while True:
        ride_event = generate_ride_event()
        print(f"Sending event: {ride_event}")
        producer.send('ride_events', value=ride_event)
        producer.flush()
        time.sleep(2)

if __name__ == "__main__":
    # A delay to wait for Kafka to be ready is good practice
    time.sleep(20)
    main()
