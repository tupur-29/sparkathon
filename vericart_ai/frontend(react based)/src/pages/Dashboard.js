import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faQrcode, 
  faExclamationTriangle, 
  faShieldAlt,
  faStar,
  faTrophy
} from '@fortawesome/free-solid-svg-icons';
import Navigation from '../components/Navigation';
import ConnectionStatus from '../components/ConnectionStatus';
import KpiCard from '../components/KpiCard';
import LiveMap from '../components/LiveMap';
import AlertsPanel from '../components/AlertsPanel';
import RiskCharts from '../components/RiskCharts';
import GamificationPanel from '../components/GamificationPanel';
import Notification from '../components/Notification';

function Dashboard() {
  const [lastUpdated, setLastUpdated] = useState('Just now');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationConfig, setNotificationConfig] = useState({});
  
  useEffect(() => {
    // Update last updated time every minute
    updateLastUpdated();
    const interval = setInterval(updateLastUpdated, 60000);
    
    // Show welcome notification after 2 seconds
    setTimeout(() => {
      displayNotification('VeriCart AI Dashboard loaded successfully!', 'success');
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  const updateLastUpdated = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
    setLastUpdated(timeString);
  };
  
  const displayNotification = (message, type = 'info') => {
    setNotificationConfig({ message, type });
    setShowNotification(true);
  };
  
  const exportData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      kpis: {
        totalScans: '142,847',
        totalAnomalies: '1,247',
        trustScore: '94.2%',
        threatLevel: 'MEDIUM'
      },
      alerts: [
        {
          priority: 'HIGH',
          title: 'Counterfeit Product Detected',
          description: 'Fake iPhone 15 Pro listing on marketplace',
          timestamp: '2 min ago'
        },
        {
          priority: 'MEDIUM',
          title: 'Unauthorized Logo Usage',
          description: 'Brand logo found on unauthorized website',
          timestamp: '5 min ago'
        }
      ]
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vericart-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    displayNotification('Data exported successfully!', 'success');
  };
  
  return (
    <div className="Dashboard">
      <Navigation />
      <ConnectionStatus />
      
      {showNotification && (
        <Notification 
          message={notificationConfig.message} 
          type={notificationConfig.type}
          onClose={() => setShowNotification(false)}
        />
      )}
      
      {/* Main Content */}
      <div className="ml-64 min-h-screen p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Global Fraud Overview</h1>
            <p className="text-gray-400 mt-2">Real-time brand protection monitoring</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-green-600 px-4 py-2 rounded-full text-sm">
              <i className="fas fa-circle animate-pulse mr-2"></i>
              System Online
            </div>
            
            <div className="bg-purple-600 px-4 py-2 rounded-full text-sm flex items-center">
              <FontAwesomeIcon icon={faStar} className="mr-2" />
              <span id="dailyXP">+127 XP today</span>
            </div>
            
            <div className="relative">
              <button className="bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-colors">
                <FontAwesomeIcon icon={faTrophy} className="text-yellow-400" />
              </button>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
            </div>
            
            <div className="text-gray-400 text-sm">
              Last updated: <span>{lastUpdated}</span>
            </div>
            
            <button 
              className="btn btn-primary"
              onClick={exportData}
            >
              Export Data
            </button>
          </div>
        </div>

        <GamificationPanel />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard
            title="Total Scans (24h)"
            value={142847}
            change="↑ 12.5% from yesterday"
            icon={faQrcode}
            iconBgColor="bg-blue-600"
          />
          
          <KpiCard
            title="AI Anomalies (24h)"
            value={1247}
            change="↑ 8.2% from yesterday"
            icon={faExclamationTriangle}
            iconBgColor="bg-red-600"
            isValueColored={true}
            valueColor="text-red-400"
          />
          
          <KpiCard
            title="Trust Score"
            value="94.2%"
            change="↑ 2.1% from yesterday"
            icon={faShieldAlt}
            iconBgColor="bg-green-600"
            isValueColored={true}
            valueColor="text-green-400"
          />
          
          <div className="kpi-card fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Threat Level</p>
                <p className="text-2xl font-bold text-orange-400 mt-2">MEDIUM</p>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                  <div className="bg-orange-400 h-2 rounded-full transition-all duration-1000" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faShieldAlt} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Live Map and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <LiveMap />
          </div>

          <div>
            <AlertsPanel />
          </div>
        </div>

        {/* Risk Charts */}
        <RiskCharts />
      </div>
    </div>
  );
}

export default Dashboard;
