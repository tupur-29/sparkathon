import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faShieldCheck,
  faSearchPlus,
  faHistory,
  faFolderOpen,
  faLocationArrow,
  faCloudUploadAlt,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import Navigation from '../components/Navigation';
import ConnectionStatus from '../components/ConnectionStatus';
import InvestigationTabs from '../components/investigation/InvestigationTabs';
import ProductVerificationForm from '../components/investigation/ProductVerificationForm';
import VerificationResults from '../components/investigation/VerificationResults';
import ScanLocationMap from '../components/investigation/ScanLocationMap';
import AlertAnalysis from '../components/investigation/AlertAnalysis';
import ScanTimeline from '../components/investigation/ScanTimeline';
import CaseManagement from '../components/investigation/CaseManagement';

function InvestigationPage() {
  const [activeTab, setActiveTab] = useState('verification');

  const tabs = [
    { id: 'verification', icon: faShieldCheck, text: 'Product Verification' },
    { id: 'alert-analysis', icon: faSearchPlus, text: 'Alert Analysis' },
    { id: 'scan-timeline', icon: faHistory, text: 'Scan Timeline' },
    { id: 'case-management', icon: faFolderOpen, text: 'Case Management' }
  ];

  return (
    <div>
      <Navigation activePage="Investigation" />
      <ConnectionStatus />

      {/* Main Content */}
      <div className="ml-64 min-h-screen p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Investigation Center</h1>
          <p className="text-gray-400 mt-2">Deep-dive analysis of fraudulent events and product verification</p>
        </div>

        {/* Investigation Tabs */}
        <InvestigationTabs 
          tabs={tabs} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />

        {/* Product Verification Tab */}
        {activeTab === 'verification' && (
          <div className="fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ProductVerificationForm />
              <VerificationResults />
            </div>
            <ScanLocationMap />
          </div>
        )}

        {/* Alert Analysis Tab */}
        {activeTab === 'alert-analysis' && (
          <AlertAnalysis />
        )}

        {/* Scan Timeline Tab */}
        {activeTab === 'scan-timeline' && (
          <ScanTimeline />
        )}

        {/* Case Management Tab */}
        {activeTab === 'case-management' && (
          <CaseManagement />
        )}
      </div>
    </div>
  );
}

export default InvestigationPage;
