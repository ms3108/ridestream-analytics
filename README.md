# Global Fleet Command Center: An Advanced Real-Time Analytics Platform

This project is an advanced, real-time analytics platform for a global logistics company, featuring a live-tracking dashboard with advanced charting. The entire system is containerized using Docker and orchestrated with a single `docker-compose.yml` file.

## Features

- **Multi-Vehicle Simulation**: The `producer` service simulates a continuous stream of journeys for both **taxis** and **airplanes**, each with a `start`, `in_progress`, and `end` status.
- **Live Fleet Tracking**: The frontend displays active vehicles moving on a dynamic world map, with distinct icons for each vehicle type.
- **Advanced Charting & Analytics**:
  - **Active Vehicles Chart**: A real-time line chart showing the number of active vehicles over the last hour.
  - **Rides Per Hour Chart**: A bar chart displaying the total number of journeys started in each of the last 24 hours.
  - **Vehicle Distribution Chart**: A pie chart showing the distribution of journeys between taxis and airplanes.
- **Live Metrics Dashboard**: The dashboard displays key metrics, including total earnings and the number of currently active vehicles.
- **Recent Events Log**: A real-time log on the dashboard shows the latest events from the Kafka stream.
- **Scalable Architecture**: Built with Kafka, Docker, and Python, the system is designed to be scalable and resilient.

## Architecture

- **`zookeeper` & `kafka`**: Form the event streaming backbone of the application.
- **`producer`**: A Python service that simulates and sends vehicle journey data to Kafka.
- **`processor-api`**: A Python service that consumes the data, performs real-time and historical aggregations, and exposes a rich Flask REST API.
- **`frontend`**: A React single-page application that provides the advanced visualization dashboard, including the map and charts.

## How to Run

To run the entire application stack, you need to have `Docker` and `docker-compose` installed on your machine.

1. **Add Vehicle Icons**:
   - Before building, place two `32x32` PNG icons in the `frontend/public/` directory:
     - `taxi.png`
     - `airplane.png`
   - These icons are required to represent the vehicles on the map.

2. **Build and run the services:**
   - Open a terminal in the project root directory and run the following command:
   ```sh
   docker-compose up --build
   ```
   This command will build the Docker images for the custom services and start all five containers.

3. **View the application:**
   - After the services initialize (which may take up to a minute), you can see the live dashboard by opening your web browser and navigating to:
     **[http://localhost:3000](http://localhost:3000)**

## Stopping the Application

To stop all the running containers, press `Ctrl + C` in the terminal where `docker-compose` is running. To remove the containers and associated networks, you can run:
```sh
docker-compose down
```
