# Live Taxi Fleet Dashboard: An Advanced Real-Time Analytics Platform

This project is an advanced, real-time analytics platform for a taxi service, featuring a live-tracking dashboard with advanced charting. The entire system is containerized using Docker and orchestrated with a single `docker-compose.yml` file.

## Features

- **Real-Time Ride Simulation**: The `producer` service simulates a continuous stream of taxi rides, each with a `start`, `in_progress`, and `end` status.
- **Live Fleet Tracking**: The frontend displays active taxis moving on a map of Kochi, India, in real-time.
- **Advanced Charting & Analytics**:
  - **Active Taxis Chart**: A real-time line chart showing the number of active taxis over the last hour.
  - **Rides Per Hour Chart**: A bar chart displaying the total number of rides started in each of the last 24 hours.
- **Live Metrics Dashboard**: The dashboard displays key metrics, including total earnings and the number of currently active taxis.
- **Recent Events Log**: A real-time log on the dashboard shows the latest events from the Kafka stream.
- **Scalable Architecture**: Built with Kafka, Docker, and Python, the system is designed to be scalable and resilient.

## Architecture

- **`zookeeper` & `kafka`**: Form the event streaming backbone of the application.
- **`producer`**: A Python service that simulates and sends taxi ride data to Kafka.
- **`processor-api`**: A Python service that consumes the data, performs real-time and historical aggregations, and exposes a rich Flask REST API.
- **`frontend`**: A React single-page application that provides the advanced visualization dashboard, including the map and charts.


##View the application:**
   - After the services initialize (which may take up to a minute), you can see the live dashboard by opening your web browser and navigating to:
     **[http://localhost:3000](http://localhost:3000)**

