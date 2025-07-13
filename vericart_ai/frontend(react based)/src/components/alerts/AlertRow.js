import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, 
  faEdit,
  faEllipsisV,
  faSearch,
  faCheck,
  faTimes,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import AlertStatusBadge from './AlertStatusBadge';
import { formatTimestamp, getRelativeTime, getRiskLevel } from '../../utils/formatters';

function AlertRow({ alert, selected, onSelect, onView, onUpdateStatus, onStatusChange }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Get risk level styling
  const riskLevel = getRiskLevel(alert.risk_score);
  
  return (
    <tr className="border-b border-gray-700 hover:bg-gray-700">
      <td className="py-3 px-4">
        <input 
          type="checkbox" 
          className="rounded" 
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
        />
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 bg-${riskLevel.color}-600 rounded-lg flex items-center justify-center`}>
            <FontAwesomeIcon icon={faExclamationTriangle} className="text-white text-sm" />
          </div>
          <div>
            <h4 className="text-white font-medium">{alert.title}</h4>
            <p className="text-gray-400 text-sm">{alert.description}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div>
          <p className="text-white font-medium">{alert.product_name}</p>
          <p className="text-gray-400 text-sm">{alert.product_id}</p>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 bg-${riskLevel.color}-500 rounded-full`}></div>
          <span className={`text-${riskLevel.color}-400 font-medium`}>{alert.risk_score}</span>
          <span className="text-gray-400 text-sm">({riskLevel.label})</span>
        </div>
      </td>
      <td className="py-3 px-4">
        <AlertStatusBadge status={alert.status} />
      </td>
      <td className="py-3 px-4">
        <div>
          <p className="text-white text-sm">{formatTimestamp(alert.timestamp)}</p>
          <p className="text-gray-400 text-xs">{getRelativeTime(alert.timestamp)}</p>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center space-x-2">
          <button 
            className="btn-icon" 
            title="View Details"
            onClick={onView}
          >
            <FontAwesomeIcon icon={faEye} />
          </button>
          <button 
            className="btn-icon" 
            title="Update Status"
            onClick={onUpdateStatus}
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <div className="relative">
            <button 
              className="btn-icon" 
              title="More Actions"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              <FontAwesomeIcon icon={faEllipsisV} />
            </button>
            {dropdownOpen && (
              <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button 
                    className="block w-full text-left px-4 py-2 text-white hover:bg-gray-600"
                    onClick={() => {
                      onStatusChange('investigating');
                      setDropdownOpen(false);
                    }}
                  >
                    <FontAwesomeIcon icon={faSearch} className="mr-2" />
                    Investigate
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 text-white hover:bg-gray-600"
                    onClick={() => {
                      onStatusChange('resolved');
                      setDropdownOpen(false);
                    }}
                  >
                    <FontAwesomeIcon icon={faCheck} className="mr-2" />
                    Resolve
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 text-white hover:bg-gray-600"
                    onClick={() => {
                      onStatusChange('dismissed');
                      setDropdownOpen(false);
                    }}
                  >
                    <FontAwesomeIcon icon={faTimes} className="mr-2" />
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

export default AlertRow;
