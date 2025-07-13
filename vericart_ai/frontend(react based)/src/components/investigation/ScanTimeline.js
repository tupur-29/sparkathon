import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faMapMarkerAlt, 
  faTachometerAlt, 
  faWifi, 
  faClock,
  faIndustry
} from '@fortawesome/free-solid-svg-icons';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';

function ScanTimeline() {
  const [timelineFilters, setTimelineFilters] = useState({
    productId: 'IP-15-PRO-789',
    startDate: '2024-01-10',
    endDate: '2024-01-15',
    scanType: 'anomaly'
  });

  const [isLoading, setIsLoading] = useState(false);
  
  // Timeline events data
  const timelineEvents = [
    {
      id: 1,
      type: 'anomaly',
      title: 'Counterfeit Detection',
      time: '14:23:45',
      description: 'Product flagged as potential counterfeit',
      location: 'New York, NY (40.7128, -74.0060)',
      icon: faMapMarkerAlt,
      coordinates: [40.7128, -74.0060]
    },
    {
      id: 2,
      type: 'warning',
      title: 'Speed Alert',
      time: '12:15:30',
      description: 'Unrealistic travel speed detected',
      location: 'Speed: 243 km/h over 2,914 km',
      icon: faTachometerAlt,
      coordinates: [39.7392, -104.9903]
    },
    {
      id: 3,
      type: 'normal',
      title: 'Valid Scan',
      time: '02:45:12',
      description: 'Product verified successfully',
      location: 'Cupertino, CA (37.3382, -122.0922)',
      icon: faMapMarkerAlt,
      coordinates: [37.3382, -122.0922]
    },
    {
      id: 4,
      type: 'anomaly',
      title: 'RFID Mismatch',
      time: '01:30:45',
      description: 'RFID signature doesn\'t match expected pattern',
      location: 'Signal strength: -85 dBm (Expected: -45 dBm)',
      icon: faWifi,
      coordinates: [37.3382, -122.0922]
    },
    {
      id: 5,
      type: 'warning',
      title: 'Multiple Scans',
      time: '01:25:15',
      description: 'Product scanned 8 times in 2 minutes',
      location: 'Frequency: 4 scans/minute',
      icon: faClock,
      coordinates: [37.3382, -122.0922]
    },
    {
      id: 6,
      type: 'normal',
      title: 'Manufacturing Scan',
      time: 'Jan 10, 09:00:00',
      description: 'Initial product registration',
      location: 'Apple Manufacturing Facility, Zhengzhou',
      icon: faIndustry,
      coordinates: [34.7472, 113.6249]
    }
  ];

  // Quick stats
  const stats = {
    totalScans: 47,
    anomalies: 12,
    uniqueLocations: 8,
    maxSpeed: '243 km/h'
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { id, value } = e.target;
    setTimelineFilters(prev => ({
      ...prev,
      [id.replace('timeline', '').toLowerCase()]: value
    }));
  };

  // Handle load timeline button click
  const handleLoadTimeline = () => {
    setIsLoading(true);
    
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  // Filter events based on scan type
  const filteredEvents = timelineFilters.scanType 
    ? timelineEvents.filter(event => event.type === timelineFilters.scanType)
    : timelineEvents;

  // Create path for the map
  const mapCoordinates = timelineEvents
    .filter(event => event.coordinates && event.coordinates.length === 2)
    .map(event => event.coordinates);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 fade-in">
      {/* Timeline Filters */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Timeline Filters</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="timelineProductId" className="block text-sm font-medium text-gray-300 mb-2">
              Product ID
            </label>
            <input 
              type="text" 
              id="timelineProductId" 
              placeholder="Enter product ID" 
              className="form-input" 
              value={timelineFilters.productId}
              onChange={handleFilterChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="date" 
                id="startDate" 
                className="form-input"
                value={timelineFilters.startDate}
                onChange={handleFilterChange}
              />
              <input 
                type="date" 
                id="endDate" 
                className="form-input"
                value={timelineFilters.endDate}
                onChange={handleFilterChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="scanTypeFilter" className="block text-sm font-medium text-gray-300 mb-2">
              Scan Type
            </label>
            <select 
              id="scanTypeFilter" 
              className="form-input"
              value={timelineFilters.scanType}
              onChange={handleFilterChange}
            >
              <option value="">All Scans</option>
              <option value="normal">Authentic Only</option>
              <option value="anomaly">Anomalies Only</option>
              <option value="warning">Warnings Only</option>
            </select>
          </div>

          <button 
            className="btn btn-primary w-full"
            onClick={handleLoadTimeline}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Loading...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSearch} className="mr-2" />
                Load Timeline
              </>
            )}
          </button>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 border-t border-gray-600 pt-4">
          <h3 className="text-lg font-semibold text-white mb-3">Quick Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Total Scans</span>
              <span className="text-white font-bold">{stats.totalScans}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Anomalies Found</span>
              <span className="text-red-400 font-bold">{stats.anomalies}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Unique Locations</span>
              <span className="text-blue-400 font-bold">{stats.uniqueLocations}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Max Speed</span>
              <span className="text-yellow-400 font-bold">{stats.maxSpeed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="lg:col-span-2">
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Scan Timeline</h2>
          <div className="relative">
            <div>
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-600"></div>
                <div className="space-y-6">
                  {filteredEvents.map(event => (
                    <div key={event.id} className={`timeline-event ${event.type}`}>
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className={`metric-badge metric-${
                              event.type === 'anomaly' ? 'high' : 
                              event.type === 'warning' ? 'medium' : 'low'
                            }`}>
                              {event.type.toUpperCase()}
                            </span>
                            <h4 className="text-white font-semibold mt-2">{event.title}</h4>
                          </div>
                          <span className="text-gray-400 text-sm">{event.time}</span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{event.description}</p>
                        <div className="text-xs text-gray-400">
                          <FontAwesomeIcon icon={event.icon} className="mr-1" />
                          {event.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Map */}
        <div className="mt-8 bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Geographic Timeline</h2>
          <div style={{ height: '400px', borderRadius: '8px' }}>
            <MapContainer
              center={[39.8283, -98.5795]}
              zoom={4}
              style={{ height: '100%', width: '100%', borderRadius: '8px', background: '#1E293B' }}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='© OpenStreetMap contributors © CARTO'
              />
              
              {/* Add path line between points */}
              <Polyline 
                positions={mapCoordinates}
                color="#3B82F6"
                weight={3}
                opacity={0.7}
                dashArray="10, 10"
              />
              
              {/* Add markers for each location */}
              {timelineEvents
                .filter(event => event.coordinates && event.coordinates.length === 2)
                .map(event => {
                  const color = 
                    event.type === 'anomaly' ? 'red' : 
                    event.type === 'warning' ? 'orange' : 
                    'green';
                  
                  return (
                    <Marker 
                      key={event.id}
                      position={event.coordinates}
                    >
                      <Popup>
                        <div style={{ color: 'black' }}>
                          <h4 style={{ fontWeight: 'bold' }}>{event.title}</h4>
                          <p>Time: {event.time}</p>
                          <p>Status: <span style={{ color }}>{event.type.toUpperCase()}</span></p>
                          <p>{event.description}</p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })
              }
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScanTimeline;
