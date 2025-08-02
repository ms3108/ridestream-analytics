import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import HeatmapLayer from 'react-leaflet-heatmap';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/dist/styles.min.css';
import './App.css';

// --- Configuration ---
const API_URL = `http://${window.location.hostname}:5001/api/metrics`;
const MAP_CENTER = [9.9312, 76.2673]; // Kochi, India
const MAP_ZOOM = 12;

// --- Custom Icon ---
const taxiIcon = new L.Icon({
    iconUrl: '/taxi.png', // Assumes taxi.png is in the public folder
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

// --- Main App Component ---
function App() {
  const [metrics, setMetrics] = useState({
    total_rides: 0,
    total_earnings: 0,
    active_rides_count: 0,
    latest_rides: [],
    heatmap_data: [],
    active_rides: [],
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setMetrics(data);
        setError(null);
      } catch (e) {
        console.error("Error fetching metrics:", e);
        setError("Could not connect to the data service. Retrying...");
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000); // Fetch every 2 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Live Taxi Fleet Analytics</h1>
      </header>
      <main className="container">
        {error && <p className="error-message">{error}</p>}

        <div className="stats-container">
          <div className="stat-card">
            <h2>Total Rides Today</h2>
            <p>{metrics.total_rides}</p>
          </div>
          <div className="stat-card">
            <h2>Active Rides</h2>
            <p className="active">{metrics.active_rides_count}</p>
          </div>
          <div className="stat-card">
            <h2>Total Earnings</h2>
            <p>${metrics.total_earnings.toFixed(2)}</p>
          </div>
        </div>

        <div className="map-container">
          <h2>Live Fleet Map</h2>
          <MapContainer center={MAP_CENTER} zoom={MAP_ZOOM} style={{ height: '600px', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {metrics.heatmap_data.length > 0 &&
              <HeatmapLayer
                points={metrics.heatmap_data}
                longitudeExtractor={m => m.lng}
                latitudeExtractor={m => m.lat}
                intensityExtractor={m => 1.0}
                max={5.0} radius={20} blur={25}
              />
            }
            <MarkerClusterGroup>
              {metrics.active_rides.map(ride => (
                <Marker key={ride.ride_id} position={[ride.lat, ride.lng]} icon={taxiIcon}>
                  <Popup>
                    <b>Ride ID:</b> {ride.ride_id.substring(0,8)}...<br/>
                    <b>Vehicle:</b> {ride.vehicle_type}<br/>
                    <b>Last Update:</b> {new Date(ride.timestamp).toLocaleTimeString()}
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        </div>

        <div className="rides-container">
          <h2>Recent Ride Events Log</h2>
          <ul className="ride-list">
            {metrics.latest_rides.length === 0 && <p>Awaiting ride events...</p>}
            {metrics.latest_rides.map(ride => (
              <li key={`${ride.ride_id}-${ride.timestamp}`} className={`ride-item ${ride.ride_status}`}>
                <span title={ride.ride_id}>ID: {ride.ride_id.substring(0, 8)}...</span>
                <span className="status">Status: <strong>{ride.ride_status.toUpperCase()}</strong></span>
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
