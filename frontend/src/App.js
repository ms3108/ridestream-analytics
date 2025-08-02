import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';

// --- Styles ---
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/dist/styles.min.css';
import './App.css';

// --- Child Components ---
import ActiveRidesChart from './components/ActiveRidesChart';
import RidesPerHourChart from './components/RidesPerHourChart';

// --- Configuration ---
const API_URL = `http://${window.location.hostname}:5001/api/metrics`;
const MAP_CENTER = [9.9312, 76.2673]; // Kochi, India
const MAP_ZOOM = 12; // Zoom in for a city-level view

// --- Custom Icon ---
const taxiIcon = new L.Icon({
    iconUrl: '/taxi.png',
    iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32],
});

// --- Main App Component ---
function App() {
  const [metrics, setMetrics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        setMetrics(await response.json());
        setError(null);
      } catch (e) {
        console.error("Error fetching metrics:", e);
        setError("Could not connect to the data service. Retrying...");
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics) {
    return <div className="loading-screen"><h1>Loading Live Analytics...</h1><p>{error || "Please wait."}</p></div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Live Taxi Fleet Dashboard</h1>
      </header>

      <div className="dashboard-grid">

        <div className="card large-card map-card">
          <h2>Live Fleet Map</h2>
          <MapContainer center={MAP_CENTER} zoom={MAP_ZOOM} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' />
            <MarkerClusterGroup>
              {metrics.active_vehicles.map(v => (
                <Marker key={v.ride_id} position={[v.lat, v.lng]} icon={taxiIcon}>
                  <Popup><b>ID:</b> {v.ride_id.substring(0,8)}...<br/><b>Type:</b> {v.vehicle_type}</Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        </div>

        <div className="card small-card">
            <h2>Active Taxis</h2>
            <p className="stat-number active">{metrics.active_vehicles_count}</p>
        </div>
        <div className="card small-card">
            <h2>Total Earnings</h2>
            <p className="stat-number">${metrics.total_earnings.toFixed(2)}</p>
        </div>

        <div className="card medium-card">
          <ActiveRidesChart data={metrics.charts.active_history} />
        </div>
        <div className="card medium-card">
          <RidesPerHourChart data={metrics.charts.hourly_stats} />
        </div>

        <div className="card large-card list-card">
          <h2>Recent Events Log</h2>
          <ul className="ride-list">
            {metrics.latest_events.map(e => (
              <li key={`${e.ride_id}-${e.timestamp}`} className={`ride-item ${e.ride_status}`}>
                <span>{new Date(e.timestamp).toLocaleTimeString()}</span>
                <span title={e.ride_id}>ID: {e.ride_id.substring(0, 8)}...</span>
                <span className="status">{e.ride_status.toUpperCase()}</span>
                {e.fare != null && <span className="fare">Fare: ${e.fare.toFixed(2)}</span>}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}

export default App;
