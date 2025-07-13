import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, 
  faRoute, 
  faLink,
  faClock,
  faGlobe,
  faExclamationTriangle,
  faFlag,
  faBan,
  faEnvelope,
  faClipboardList
} from '@fortawesome/free-solid-svg-icons';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function AlertAnalysis() {
  const initialAlerts = [
    {
      id: 'alert-001',
      priority: 'HIGH',
      time: '5 min ago',
      title: 'Counterfeit iPhone Detected',
      description: 'Suspicious product scan in New York, NY',
      location: { text: '40.7128, -74.0060', icon: faMapMarkerAlt }
    },
    {
      id: 'alert-002',
      priority: 'MEDIUM',
      time: '12 min ago',
      title: 'Unusual Movement Pattern',
      description: 'Product traveled 500km in 2 hours',
      location: { text: 'Speed: 250 km/h', icon: faRoute }
    },
    {
      id: 'alert-003',
      priority: 'HIGH',
      time: '18 min ago',
      title: 'Blockchain Verification Failed',
      description: 'Product hash doesn\'t match blockchain record',
      location: { text: 'Product ID: LX-9934', icon: faLink }
    },
    {
      id: 'alert-004',
      priority: 'MEDIUM',
      time: '25 min ago',
      title: 'Multiple Rapid Scans',
      description: 'Same product scanned 15 times in 5 minutes',
      location: { text: 'Frequency: 3 scans/min', icon: faClock }
    },
    {
      id: 'alert-005',
      priority: 'LOW',
      time: '32 min ago',
      title: 'Location Anomaly',
      description: 'Product scanned in unexpected region',
      location: { text: 'Expected: US, Found: CN', icon: faGlobe }
    }
  ];

  const [selectedAlertId, setSelectedAlertId] = useState('alert-001');
  const [searchQuery, setSearchQuery] = useState('');
  const [alerts, setAlerts] = useState(initialAlerts);
  
  // Filter alerts based on search query
  const filteredAlerts = alerts.filter(alert => {
    const fullText = `${alert.title} ${alert.description} ${alert.location.text}`.toLowerCase();
    return fullText.includes(searchQuery.toLowerCase());
  });
  
  // Get currently selected alert data
  const selectedAlert = alerts.find(alert => alert.id === selectedAlertId) || alerts[0];
  
  // Analysis data for the selected alert
  const analysisData = {
    'alert-001': {
      anomalyScore: '8.7/10',
      confidenceLevel: '94.2%',
      modelVersion: 'v2.1.3',
      topFeatures: [
        { name: 'Serial Format', value: '0.89' },
        { name: 'Weight', value: '0.76' },
        { name: 'RFID Signal', value: '0.64' }
      ],
      geoAnalysis: {
        currentLocation: 'New York, NY',
        lastLocation: 'Cupertino, CA',
        distanceTraveled: '2,914 km',
        transitTime: '12 hours',
        avgSpeed: '243 km/h'
      },
      riskAssessment: {
        riskPercent: 87,
        riskLevel: 'High Risk',
        counterFeitProb: '94%',
        movementAnomaly: '78%',
        identityMismatch: '89%'
      },
      detectionTime: '2024-01-15 14:23:45',
      productId: 'IP-15-PRO-789',
      scannerId: 'SC-NY-001',
      userId: 'user_78923',
      detectionTriggers: [
        'Serial number format mismatch',
        'Packaging inconsistencies detected',
        'Weight variance: -15g from expected',
        'RFID signature anomaly'
      ]
    },
    'alert-002': {
      anomalyScore: '7.3/10',
      confidenceLevel: '89.1%',
      modelVersion: 'v2.1.3',
      topFeatures: [
        { name: 'Speed', value: '0.92' },
        { name: 'Path Analysis', value: '0.84' },
        { name: 'Time Pattern', value: '0.71' }
      ],
      geoAnalysis: {
        currentLocation: 'Chicago, IL',
        lastLocation: 'Detroit, MI',
        distanceTraveled: '346 km',
        transitTime: '2 hours',
        avgSpeed: '173 km/h'
      },
      riskAssessment: {
        riskPercent: 73,
        riskLevel: 'Medium Risk',
        counterFeitProb: '65%',
        movementAnomaly: '92%',
        identityMismatch: '61%'
      },
      detectionTime: '2024-01-15 14:10:30',
      productId: 'IP-15-PRO-456',
      scannerId: 'SC-CH-003',
      userId: 'user_45678',
      detectionTriggers: [
        'Unrealistic travel pattern',
        'GPS location anomaly',
        'Unusual scan sequence',
        'Timestamp mismatch'
      ]
    },
    // Data for other alerts can be added here
  };

  const currentAnalysis = analysisData[selectedAlertId] || analysisData['alert-001'];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 fade-in">
      {/* Alert Selection */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Select Alert for Analysis</h2>
        
        <div className="mb-4">
          <input 
            type="text" 
            id="alertSearch" 
            placeholder="Search alerts..." 
            className="form-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredAlerts.map(alert => (
            <div 
              key={alert.id}
              className={`alert-item ${selectedAlertId === alert.id ? 'selected' : ''}`}
              onClick={() => setSelectedAlertId(alert.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`metric-badge metric-${alert.priority.toLowerCase()}`}>
                  {alert.priority}
                </span>
                <span className="text-xs text-gray-400">{alert.time}</span>
              </div>
              <p className="text-white font-medium">{alert.title}</p>
              <p className="text-gray-400 text-sm">{alert.description}</p>
              <div className="mt-2 text-xs text-gray-500">
                <FontAwesomeIcon icon={alert.location.icon} className="mr-1" />
                {alert.location.text}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Details */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Alert Analysis</h2>
        <div>
          {/* Alert details for selected alert */}
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <span className={`metric-badge metric-${selectedAlert.priority.toLowerCase()} mr-3`}>
                {selectedAlert.priority} PRIORITY
              </span>
              <span className="text-gray-400 text-sm">Alert ID: {selectedAlert.id}</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{selectedAlert.title}</h3>
            <p className="text-gray-300 mb-4">{selectedAlert.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-gray-300 text-sm">Detection Time</div>
                <div className="text-white font-semibold">{currentAnalysis.detectionTime}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-gray-300 text-sm">Product ID</div>
                <div className="text-white font-semibold">{currentAnalysis.productId}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-gray-300 text-sm">Scanner ID</div>
                <div className="text-white font-semibold">{currentAnalysis.scannerId}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-gray-300 text-sm">User ID</div>
                <div className="text-white font-semibold">{currentAnalysis.userId}</div>
              </div>
            </div>

            <div className="bg-red-900 border border-red-600 rounded-lg p-4 mb-4">
              <h4 className="text-red-300 font-semibold mb-2">Detection Triggers</h4>
              <ul className="text-red-200 text-sm space-y-1">
                {currentAnalysis.detectionTriggers.map((trigger, index) => (
                  <li key={index}>• {trigger}</li>
                ))}
              </ul>
            </div>

            <div className="border-t border-gray-600 pt-4">
              <h4 className="text-white font-semibold mb-3">Recommended Actions</h4>
              <div className="space-y-2">
                <button className="btn btn-primary w-full">
                  <FontAwesomeIcon icon={faFlag} className="mr-2" />
                  Flag for Manual Review
                </button>
                <button className="btn btn-warning w-full">
                  <FontAwesomeIcon icon={faBan} className="mr-2" />
                  Block Product from System
                </button>
                <button className="btn btn-secondary w-full">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                  Notify Brand Owner
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Investigation Tools */}
      <div className="lg:col-span-2">
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ML Model Insights */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">ML Model Insights</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Anomaly Score</span>
                <span className="text-red-400 font-bold">{currentAnalysis.anomalyScore}</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2 mb-3">
                <div 
                  className="bg-red-400 h-2 rounded-full" 
                  style={{ width: `${parseFloat(currentAnalysis.anomalyScore) * 10}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Confidence Level</span>
                <span className="text-blue-400 font-bold">{currentAnalysis.confidenceLevel}</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2 mb-3">
                <div 
                  className="bg-blue-400 h-2 rounded-full" 
                  style={{ width: currentAnalysis.confidenceLevel }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Model Version</span>
                <span className="text-purple-400 font-bold">{currentAnalysis.modelVersion}</span>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-600">
                <div className="text-gray-300 text-sm mb-2">Top Features</div>
                <div className="space-y-1 text-xs">
                  {currentAnalysis.topFeatures.map((feature, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-400">{feature.name}</span>
                      <span className={
                        parseFloat(feature.value) > 0.8 ? 'text-red-300' :
                        parseFloat(feature.value) > 0.7 ? 'text-orange-300' :
                        'text-yellow-300'
                      }>{feature.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Geographic Analysis */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Geographic Analysis</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Current Location</span>
                <span className="text-yellow-400 font-bold">{currentAnalysis.geoAnalysis.currentLocation}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Last Known Location</span>
                <span className="text-green-400 font-bold">{currentAnalysis.geoAnalysis.lastLocation}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Distance Traveled</span>
                <span className="text-orange-400 font-bold">{currentAnalysis.geoAnalysis.distanceTraveled}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Transit Time</span>
                <span className="text-blue-400 font-bold">{currentAnalysis.geoAnalysis.transitTime}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Avg Speed</span>
                <span className="text-red-400 font-bold">{currentAnalysis.geoAnalysis.avgSpeed}</span>
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-600">
                <div className="bg-red-900 border border-red-600 rounded-lg p-3">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-400 mr-2" />
                    <span className="text-red-300 text-sm font-semibold">Speed Alert</span>
                  </div>
                  <p className="text-red-200 text-xs mt-1">Unrealistic travel speed detected</p>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Risk Assessment</h3>
            <div className="space-y-3">
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" className="text-gray-600"></circle>
                    <circle 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      fill="none" 
                      strokeLinecap="round" 
                      className="text-red-500"
                      style={{ 
                        strokeDasharray: '63', 
                        strokeDashoffset: 63 - (currentAnalysis.riskAssessment.riskPercent / 100) * 63
                      }}
                    ></circle>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {currentAnalysis.riskAssessment.riskPercent}%
                    </span>
                  </div>
                </div>
                <p className="text-red-400 font-semibold text-lg">{currentAnalysis.riskAssessment.riskLevel}</p>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Counterfeit Probability</span>
                  <span className="text-red-400">{currentAnalysis.riskAssessment.counterFeitProb}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Movement Anomaly</span>
                  <span className="text-orange-400">{currentAnalysis.riskAssessment.movementAnomaly}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Identity Mismatch</span>
                  <span className="text-red-400">{currentAnalysis.riskAssessment.identityMismatch}</span>
                </div>
              </div>
              
                <div className="mt-4 pt-3 border-t border-gray-600">
                <button className="btn btn-primary w-full">
                <FontAwesomeIcon icon={faClipboardList} className="mr-2" />
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlertAnalysis;
