import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldCheck,
  faSearchPlus,
  faHistory,
  faFolderOpen
} from '@fortawesome/free-solid-svg-icons';
import Navigation from '../components/Navigation';
import ConnectionStatus from '../components/ConnectionStatus';
import ProductVerificationForm from '../components/investigation/ProductVerificationForm';
import VerificationResults from '../components/investigation/VerificationResults';
import ScanLocationMap from '../components/investigation/ScanLocationMap';
import AlertAnalysis from '../components/investigation/AlertAnalysis';
import ScanTimeline from '../components/investigation/ScanTimeline';
import CaseManagement from '../components/investigation/CaseManagement';
import Notification from '../components/Notification';

function InvestigationPage() {
  const [activeTab, setActiveTab] = useState('verification');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationConfig, setNotificationConfig] = useState({});

  const tabs = [
    { id: 'verification', icon: faShieldCheck, text: 'Product Verification' },
    { id: 'alert-analysis', icon: faSearchPlus, text: 'Alert Analysis' },
    { id: 'scan-timeline', icon: faHistory, text: 'Scan Timeline' },
    { id: 'case-management', icon: faFolderOpen, text: 'Case Management' }
  ];

  const displayNotification = (message, type = 'info') => {
    setNotificationConfig({ message, type });
    setShowNotification(true);
  };

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    displayNotification(`${tabs.find(tab => tab.id === tabId).text} loaded`, 'info');
  };

  return (
    <div className="InvestigationPage">
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Investigation Center</h1>
          <p className="text-gray-400 mt-2">Deep-dive analysis of fraudulent events and product verification</p>
        </div>

        {/* Investigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`investigation-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  <FontAwesomeIcon icon={tab.icon} className="mr-2" />
                  {tab.text}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Product Verification Tab */}
        {activeTab === 'verification' && (
          <div className="fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ProductVerificationForm 
                onVerify={() => displayNotification('Product verification in progress...', 'info')}
                onAnalyzeImage={() => displayNotification('AI Vision analysis in progress...', 'info')}
              />
              <VerificationResults />
            </div>
            <ScanLocationMap />
          </div>
        )}

        {/* Alert Analysis Tab */}
        {activeTab === 'alert-analysis' && (
          <AlertAnalysis 
            onAction={() => displayNotification('Action initiated successfully', 'success')}
          />
        )}

        {/* Scan Timeline Tab */}
        {activeTab === 'scan-timeline' && (
          <ScanTimeline 
            onLoadTimeline={() => displayNotification('Timeline loaded successfully', 'success')}
          />
        )}

        {/* Case Management Tab */}
        {activeTab === 'case-management' && (
          <CaseManagement 
            onCaseAction={() => displayNotification('Case action completed', 'success')}
          />
        )}
      </div>
    </div>
  );
}

export default InvestigationPage;
