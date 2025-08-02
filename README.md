# Dockerized Real-Time Ride Analytics Platform

This project is a complete, real-time ride analytics platform for a taxi service. The entire system is containerized using Docker and orchestrated with a single `docker-compose.yml` file.

## Architecture

The platform consists of five main services:

- **`zookeeper`**: Manages Kafka cluster state.
- **`kafka`**: A distributed event streaming platform used as a message broker.
- **`producer`**: A Python service that generates and sends simulated ride data to a Kafka topic.
- **`processor-api`**: A Python service that consumes the ride data from Kafka, processes it in real-time to calculate metrics, and exposes these metrics via a Flask REST API.
- **`frontend`**: A React single-page application that visualizes the live metrics from the API on a dashboard.

## How to Run

To run the entire application stack, you need to have `Docker` and `docker-compose` installed on your machine.

1. **Clone the repository:**
   ```sh
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Build and run the services:**
   Open a terminal in the project root directory and run the following command:
   ```sh
   docker-compose up --build
   ```
   This command will build the Docker images for the custom services (`producer`, `processor-api`, `frontend`) and start all five containers.

3. **View the application:**
   - The **producer** service will start generating data automatically. You can see the logs in your terminal.
   - The **processor-api** will start consuming and processing this data.
   - To see the live dashboard, open your web browser and navigate to:
     **[http://localhost:3000](http://localhost:3000)**

4. **Access the API:**
   - The live metrics API is available at:
     **[http://localhost:5001/api/metrics](http://localhost:5001/api/metrics)**

## Stopping the Application

To stop all the running containers, press `Ctrl + C` in the terminal where `docker-compose` is running. To remove the containers and associated networks, you can run:
```sh
docker-compose down
```
