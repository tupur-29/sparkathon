import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTimes, 
  faExclamationTriangle, 
  faCheckCircle, 
  faUserCircle 
} from '@fortawesome/free-solid-svg-icons';
import AlertStatusBadge from './AlertStatusBadge';
import { formatTimestamp, getRelativeTime, getRiskLevel } from '../../utils/formatters';

function AlertDetailsModal({ visible, alertDetails, loading, onClose }) {
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Alert Details</h2>
            <button 
              className="text-gray-400 hover:text-white"
              onClick={onClose}
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </button>
          </div>
          
          {loading ? (
            <div className="text-center text-gray-400 py-8">
              <div className="loading mx-auto mb-3"></div>
              <p>Loading alert details...</p>
            </div>
          ) : !alertDetails ? (
            <div className="text-center text-gray-400 py-8">
              <FontAwesomeIcon icon={faExclamationTriangle} className="text-4xl mb-3" />
              <p>Alert details not found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Alert Header */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    {getRiskBadge(alertDetails.risk_score)}
                    <h3 className="text-xl font-bold text-white ml-3">{alertDetails.title}</h3>
                  </div>
                  <AlertStatusBadge status={alertDetails.status} />
                </div>
                
                <p className="text-gray-300 mb-3">{alertDetails.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-gray-400 text-sm">Product</p>
                    <p className="text-white">{alertDetails.product_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Location</p>
                    <p className="text-white">{alertDetails.location}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Time</p>
                    <p className="text-white">{formatTimestamp(alertDetails.timestamp)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Risk Score</p>
                    <p className={`text-${getRiskLevel(alertDetails.risk_score).color}-400 font-bold`}>
                      {alertDetails.risk_score}/100
                    </p>
                  </div>
                </div>
              </div>

              {/* Alert Analysis */}
              {alertDetails.analysis && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-white mb-3">AI Analysis</h3>
                  
                  <div className="mb-3">
                    <p className="
