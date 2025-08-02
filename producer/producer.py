import json
import time
import uuid
import random
from datetime import datetime
from kafka import KafkaProducer

# Coordinates for Kochi, India
KOCHI_COORDS = {"lat": 9.9312, "lng": 76.2673}
VEHICLE_TYPES = ["Sedan", "SUV", "Hatchback"]

def get_kafka_producer():
    """Tries to connect to Kafka and returns a producer instance."""
    producer = None
    while not producer:
        try:
            producer = KafkaProducer(
                bootstrap_servers=['kafka:9092'],
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                retries=10,
                request_timeout_ms=60000
            )
            print("Successfully connected to Kafka.")
        except Exception as e:
            print(f"Could not connect to Kafka: {e}. Retrying in 5 seconds...")
            time.sleep(5)
    return producer

def simulate_ride(producer):
    """
    Simulates a full ride from start to end, including in-progress updates.
    """
    ride_id = str(uuid.uuid4())
    vehicle_type = random.choice(VEHICLE_TYPES)

    # 1. Generate Start Event
    start_lat = KOCHI_COORDS['lat'] + random.uniform(-0.05, 0.05)
    start_lng = KOCHI_COORDS['lng'] + random.uniform(-0.05, 0.05)

    start_event = {
        "ride_id": ride_id,
        "vehicle_type": vehicle_type,
        "ride_status": "start",
        "latitude": start_lat,
        "longitude": start_lng,
        "timestamp": datetime.utcnow().isoformat()
    }
    producer.send('ride_events', value=start_event)
    print(f"Sent event: {start_event}")

    # 2. Simulate In-Progress Events
    current_lat, current_lng = start_lat, start_lng
    destination_lat = start_lat + random.uniform(-0.02, 0.02)
    destination_lng = start_lng + random.uniform(-0.02, 0.02)

    num_steps = random.randint(5, 10)
    lat_step = (destination_lat - start_lat) / num_steps
    lng_step = (destination_lng - start_lng) / num_steps

    for _ in range(num_steps):
        time.sleep(random.uniform(0.5, 1.5)) # Wait between position updates
        current_lat += lat_step
        current_lng += lng_step

        in_progress_event = {
            "ride_id": ride_id,
            "ride_status": "in_progress",
            "latitude": current_lat,
            "longitude": current_lng,
            "timestamp": datetime.utcnow().isoformat()
        }
        producer.send('ride_events', value=in_progress_event)
        print(f"Sent event: {in_progress_event}")

    # 3. Generate End Event
    time.sleep(1) # Final pause before ending
    end_event = {
        "ride_id": ride_id,
        "ride_status": "end",
        "latitude": destination_lat,
        "longitude": destination_lng,
        "timestamp": datetime.utcnow().isoformat(),
        "fare": round(random.uniform(5, 50), 2)
    }
    producer.send('ride_events', value=end_event)
    print(f"Sent event: {end_event}")

    producer.flush()

def main():
    """Main function to produce ride events to Kafka."""
    producer = get_kafka_producer()

    while True:
        simulate_ride(producer)
        # Wait before starting a new ride simulation
        time.sleep(random.uniform(1, 4))

if __name__ == "__main__":
    # A delay to wait for Kafka to be fully ready
    time.sleep(20)
    main()
