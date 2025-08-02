import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import HeatmapLayer from 'react-leaflet-heatmap';
import './App.css';

// API endpoint is proxied during development, but this is for direct connection
const API_URL = `http://${window.location.hostname}:5001/api/metrics`;
const MAP_CENTER = [9.9312, 76.2673]; // Kochi, India
const MAP_ZOOM = 12;

function App() {
  const [metrics, setMetrics] = useState({
    total_rides: 0,
    total_earnings: 0,
    latest_rides: [],
    heatmap_data: [],
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMetrics(data);
        setError(null);
      } catch (e) {
        console.error("Error fetching metrics:", e);
        setError("Could not connect to the data service. Please wait...");
      }
    };

    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 3000); // Fetch every 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Live Ride Analytics</h1>
      </header>
      <main className="container">
        {error && <p className="error-message">{error}</p>}
        <div className="stats-container">
          <div className="stat-card">
            <h2>Total Rides</h2>
            <p>{metrics.total_rides}</p>
          </div>
          <div className="stat-card">
            <h2>Total Earnings</h2>
            <p>${metrics.total_earnings.toFixed(2)}</p>
          </div>
        </div>
        <div className="map-container">
          <h2>Ride Start Heatmap</h2>
          <MapContainer center={MAP_CENTER} zoom={MAP_ZOOM} style={{ height: '500px', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {metrics.heatmap_data.length > 0 &&
              <HeatmapLayer
                points={metrics.heatmap_data}
                longitudeExtractor={m => m.lng}
                latitudeExtractor={m => m.lat}
                intensityExtractor={m => parseFloat(m.intensity)}
                max={1.0}
                radius={25}
                blur={20}
              />
            }
          </MapContainer>
        </div>
        <div className="rides-container">
          <h2>Recent Ride Events</h2>
          <ul className="ride-list">
            {metrics.latest_rides.length === 0 && <p>No recent rides...</p>}
            {metrics.latest_rides.map(ride => (
              <li key={ride.ride_id + ride.timestamp} className={`ride-item ${ride.ride_status}`}>
                <span title={ride.ride_id}>ID: {ride.ride_id.substring(0, 8)}...</span>
                <span className="status">Status: {ride.ride_status}</span>
                {ride.fare != null && <span className="fare">Fare: ${ride.fare.toFixed(2)}</span>}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

export default App;
