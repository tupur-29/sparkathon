import React, { useState, useEffect } from 'react';
import AlertItem from './AlertItem';

function AlertsPanel() {
  const initialAlerts = [
    {
      id: 1,
      type: 'HIGH',
      time: '2 min ago',
      title: 'Counterfeit Product Detected',
      description: 'Fake iPhone 15 Pro listing on marketplace'
    },
    {
      id: 2,
      type: 'MEDIUM',
      time: '5 min ago',
      title: 'Unauthorized Logo Usage',
      description: 'Brand logo found on unauthorized website'
    },
    {
      id: 3,
      type: 'HIGH',
      time: '8 min ago',
      title: 'Suspicious Domain Registration',
      description: 'Domain similar to brand registered'
    }
  ];

  const [alerts, setAlerts] = useState(initialAlerts);

  useEffect(() => {
    const alertTypes = [
      { type: 'HIGH', title: 'Counterfeit Product Detected', description: 'Fake luxury item found on marketplace' },
      { type: 'MEDIUM', title: 'Unauthorized Logo Usage', description: 'Brand logo misused on social media' },
      { type: 'HIGH', title: 'Suspicious Domain Registration', description: 'Typosquatting domain registered' },
      { type: 'MEDIUM', title: 'Price Manipulation', description: 'Unusual pricing patterns detected' },
      { type: 'LOW', title: 'Minor Brand Violation', description: 'Small trademark infringement found' }
    ];

    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        const randomAlert = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        const newAlert = {
          id: Date.now(),
          type: randomAlert.type,
          time: 'Just now',
          title: randomAlert.title,
          description: randomAlert.description
        };

        setAlerts(prevAlerts => [newAlert, ...prevAlerts.slice(0, 2)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="chart-container">
      <h2 className="text-xl font-bold text-white mb-4">Priority Alerts</h2>
      <input
        type="text"
        placeholder="Search alerts..."
        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-4"
      />
      <div className="space-y-4">
        {alerts.map(alert => (
          <AlertItem key={alert.id} alert={alert} />
        ))}
      </div>
      <div className="mt-4">
        <a href="#" className="btn btn-primary w-full text-center">
          View All Alerts
        </a>
      </div>
    </div>
  );
}

export default AlertsPanel;
