# Dockerized Real-Time Ride Analytics Platform (Enhanced)

This project is a complete, real-time ride analytics platform for a taxi service, featuring a live-tracking dashboard. The entire system is containerized using Docker and orchestrated with a single `docker-compose.yml` file.

## Features

- **Real-Time Ride Simulation**: The `producer` service simulates a continuous stream of taxi rides, each with a `start`, `in_progress`, and `end` status.
- **Live Taxi Tracking**: The frontend displays active taxis moving on a map of Kochi, India, in real-time.
- **Heatmap Visualization**: A live heatmap shows the most popular areas for ride pick-ups.
- **Live Metrics Dashboard**: The dashboard displays key metrics, including total rides, total earnings, and the number of currently active rides.
- **Recent Events Log**: A log on the dashboard shows the latest events from the Kafka stream, color-coded by status.
- **Scalable Architecture**: Built with Kafka, Docker, and Python, the system is designed to be scalable and resilient.

## Architecture

The platform consists of five main services:

- **`zookeeper`**: Manages Kafka cluster state.
- **`kafka`**: A distributed event streaming platform used as a message broker for ride events.
- **`producer`**: A Python service that simulates and sends ride lifecycle data (`start`, `in_progress`, `end`) to Kafka.
- **`processor-api`**: A Python service that consumes ride data, tracks active ride locations, calculates metrics, and exposes a Flask REST API.
- **`frontend`**: A React single-page application that visualizes the live fleet and metrics on an interactive dashboard.

## How to Run

To run the entire application stack, you need to have `Docker` and `docker-compose` installed on your machine.

1. **Add Taxi Icon**:
   - Before building, place a `32x32` PNG icon named `taxi.png` inside the `frontend/public/` directory. This icon will be used to represent the taxis on the map.

2. **Build and run the services:**
   - Open a terminal in the project root directory and run the following command:
   ```sh
   docker-compose up --build
   ```
   This command will build the Docker images for the custom services and start all five containers.

3. **View the application:**
   - After the services initialize (which may take a minute), you can see the live dashboard by opening your web browser and navigating to:
     **[http://localhost:3000](http://localhost:3000)**

4. **Access the API:**
   - The live metrics API is available at:
     **[http://localhost:5001/api/metrics](http://localhost:5001/api/metrics)**

## Stopping the Application

To stop all the running containers, press `Ctrl + C` in the terminal where `docker-compose` is running. To remove the containers and associated networks, you can run:
```sh
docker-compose down
```
