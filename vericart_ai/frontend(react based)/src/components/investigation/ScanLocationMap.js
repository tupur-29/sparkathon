import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function ScanLocationMap() {
  // This would typically come from the form or API
  const location = { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'USA' };
  
  return (
    <div className="mt-8 bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Scan Location</h2>
      <div style={{ height: '300px', borderRadius: '8px' }}>
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%', borderRadius: '8px', background: '#1E293B' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='© OpenStreetMap contributors © CARTO'
            subdomains='abcd'
            maxZoom={19}
          />
          <Marker position={[location.lat, location.lng]}>
            <Popup>
              <div style={{ color: 'black', fontWeight: 'bold' }}>
                {location.city}, {location.country}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}

export default ScanLocationMap;
