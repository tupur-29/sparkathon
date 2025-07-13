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
                                        <p className="text-gray-400 text-sm mb-1">Probability of Fraud</p>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-red-400 h-2 rounded-full" 
                        style={{ width: `${alertDetails.analysis.probability * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-sm text-white mt-1">
                      {(alertDetails.analysis.probability * 100).toFixed(1)}%
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-sm mb-2">Contributing Factors</p>
                    <ul className="space-y-1">
                      {alertDetails.analysis.factors.map((factor, index) => (
                        <li key={index} className="text-gray-300 flex items-start">
                          <span className="text-red-400 mr-2">•</span>
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-3 p-3 bg-red-900 bg-opacity-50 rounded-lg border border-red-700">
                    <p className="text-red-300 font-medium">Recommendation</p>
                    <p className="text-red-200 text-sm">{alertDetails.analysis.recommendation}</p>
                  </div>
                </div>
              )}

              {/* Related Scans */}
              {alertDetails.related_scans && alertDetails.related_scans.length > 0 && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-white mb-3">Related Scans</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-600">
                          <th className="text-left py-2 px-3 text-gray-400 font-medium">Scan ID</th>
                          <th className="text-left py-2 px-3 text-gray-400 font-medium">Time</th>
                          <th className="text-left py-2 px-3 text-gray-400 font-medium">Location</th>
                          <th className="text-left py-2 px-3 text-gray-400 font-medium">Device</th>
                          <th className="text-left py-2 px-3 text-gray-400 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alertDetails.related_scans.map(scan => (
                          <tr key={scan.id} className="border-b border-gray-600">
                            <td className="py-2 px-3 text-white">{scan.id}</td>
                            <td className="py-2 px-3 text-white">{formatTimestamp(scan.timestamp)}</td>
                            <td className="py-2 px-3 text-white">{scan.location}</td>
                            <td className="py-2 px-3 text-white">{scan.device_id}</td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                scan.status === 'verified' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                              }`}>
                                {scan.status.charAt(0).toUpperCase() + scan.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Alert History */}
              {alertDetails.history && alertDetails.history.length > 0 && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-white mb-3">Alert History</h3>
                  
                  <div className="space-y-3">
                    {alertDetails.history.map((event, index) => (
                      <div key={index} className="flex items-start border-b border-gray-600 pb-3 last:border-0">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mr-3">
                          <FontAwesomeIcon icon={getActionIcon(event.action)} className="text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="text-white font-medium">
                              {formatAction(event.action)}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {formatTimestamp(event.timestamp)}
                            </p>
                          </div>
                          <p className="text-gray-300 text-sm">By: {event.user}</p>
                          {event.notes && (
                            <p className="text-gray-400 text-sm mt-1">{event.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex space-x-3 pt-3 border-t border-gray-600">
                <button className="btn btn-primary">
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                  Mark as Resolved
                </button>
                <button className="btn btn-secondary">
                  <FontAwesomeIcon icon={faUserCircle} className="mr-2" />
                  Assign to Team
                </button>
                <button className="btn btn-warning">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="mr-2" />
                  Escalate Alert
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function getRiskBadge(riskScore) {
  const riskLevel = getRiskLevel(riskScore);
  return (
    <span className={`px-3 py-1 rounded-full text-sm bg-${riskLevel.color}-600 text-white`}>
      {riskLevel.label} Risk
    </span>
  );
}

function getActionIcon(action) {
  switch (action) {
    case 'created': return faExclamationTriangle;
    case 'assigned': return faUserCircle;
    case 'investigating': return faSearch;
    case 'resolved': return faCheckCircle;
    default: return faExclamationTriangle;
  }
}

function formatAction(action) {
  return action.charAt(0).toUpperCase() + action.slice(1);
}

export default AlertDetailsModal;
