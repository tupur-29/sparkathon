import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function LiveMap() {
  const [markers, setMarkers] = useState([]);

  const initialScans = [
    { id: 1, lat: 40.7128, lng: -74.0060, city: "New York", country: "USA", scans: 1247, risk: "high" },
    { id: 2, lat: 51.5074, lng: -0.1278, city: "London", country: "UK", scans: 892, risk: "medium" },
    { id: 3, lat: 35.6762, lng: 139.6503, city: "Tokyo", country: "Japan", scans: 1156, risk: "low" },
    { id: 4, lat: 48.8566, lng: 2.3522, city: "Paris", country: "France", scans: 634, risk: "medium" },
    { id: 5, lat: -33.8688, lng: 151.2093, city: "Sydney", country: "Australia", scans: 423, risk: "low" },
    { id: 6, lat: 37.7749, lng: -122.4194, city: "San Francisco", country: "USA", scans: 987, risk: "high" },
    { id: 7, lat: 52.5200, lng: 13.4050, city: "Berlin", country: "Germany", scans: 567, risk: "medium" },
    { id: 8, lat: 55.7558, lng: 37.6176, city: "Moscow", country: "Russia", scans: 745, risk: "high" },
    { id: 9, lat: 39.9042, lng: 116.4074, city: "Beijing", country: "China", scans: 1834, risk: "high" },
    { id: 10, lat: 28.6139, lng: 77.2090, city: "New Delhi", country: "India", scans: 1456, risk: "medium" }
  ];

  useEffect(() => {
    setMarkers(initialScans);
    
    const cities = [
      { name: "Mumbai", lat: 19.0760, lng: 72.8777, country: "India" },
      { name: "Lagos", lat: 6.5244, lng: 3.3792, country: "Nigeria" },
      { name: "Shanghai", lat: 31.2304, lng: 121.4737, country: "China" },
      { name: "São Paulo", lat: -23.5505, lng: -46.6333, country: "Brazil" },
      { name: "Mexico City", lat: 19.4326, lng: -99.1332, country: "Mexico" }
    ];
    
    const interval = setInterval(() => {
      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      const scan = {
        id: Date.now(),
        lat: randomCity.lat + (Math.random() - 0.5) * 0.1,
        lng: randomCity.lng + (Math.random() - 0.5) * 0.1,
        city: randomCity.name,
        country: randomCity.country,
        scans: Math.floor(Math.random() * 500) + 100,
        risk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
      };
      
      setMarkers(prevMarkers => {
        // Keep only the 20 most recent markers
        const updatedMarkers = [scan, ...prevMarkers];
        return updatedMarkers.slice(0, 20);
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getRiskColor = (risk) => {
    const riskColors = {
      high: '#DC2626',
      medium: '#D97706',
      low: '#059669'
    };
    return riskColors[risk] || '#3B82F6';
  };

  return (
    <div className="chart-container">
      <h2 className="text-xl font-bold text-white mb-4">Live Global Scan Map</h2>
      <div style={{ height: '400px', borderRadius: '8px' }}>
        <MapContainer 
          center={[20, 0]} 
          zoom={2} 
          style={{ height: '100%', width: '100%', borderRadius: '8px', background: '#1E293B' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='© OpenStreetMap contributors © CARTO'
            subdomains='abcd'
            maxZoom={19}
          />
          {markers.map(marker => (
            <CircleMarker
              key={marker.id}
              center={[marker.lat, marker.lng]}
              radius={Math.min(marker.scans / 50, 20) + 5}
              fillColor={getRiskColor(marker.risk)}
              color={getRiskColor(marker.risk)}
              weight={2}
              fillOpacity={0.7}
            >
              <Popup>
                <div style={{ padding: '10px' }}>
                  <h4 style={{ fontWeight: 'bold' }}>{marker.city}, {marker.country}</h4>
                  <p>Scans: {marker.scans.toLocaleString()}</p>
                  <p>Risk Level: <span className={`metric-badge metric-${marker.risk}`}>{marker.risk.toUpperCase()}</span></p>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default LiveMap;
