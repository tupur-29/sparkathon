import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBell, 
  faExclamationCircle, 
  faSearch, 
  faCheckCircle 
} from '@fortawesome/free-solid-svg-icons';

function AlertSummaryCards({ stats, loading }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="kpi-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Alerts</p>
            {loading ? (
              <div className="loading mt-2"></div>
            ) : (
              <>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.total_alerts.toLocaleString()}
                </p>
                <p className="text-blue-400 text-sm mt-2">All time</p>
              </>
            )}
          </div>
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faBell} className="text-white" />
          </div>
        </div>
      </div>

      <div className="kpi-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">New Alerts</p>
            {loading ? (
              <div className="loading mt-2"></div>
            ) : (
              <>
                <p className="text-3xl font-bold text-red-400 mt-2">
                  {stats.new_alerts.toLocaleString()}
                </p>
                <p className="text-red-400 text-sm mt-2">Needs attention</p>
              </>
            )}
          </div>
          <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faExclamationCircle} className="text-white" />
          </div>
        </div>
      </div>

      <div className="kpi-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Under Investigation</p>
            {loading ? (
              <div className="loading mt-2"></div>
            ) : (
              <>
                <p className="text-3xl font-bold text-yellow-400 mt-2">
                  {stats.investigating_alerts.toLocaleString()}
                </p>
                <p className="text-yellow-400 text-sm mt-2">In progress</p>
              </>
            )}
          </div>
          <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faSearch} className="text-white" />
          </div>
        </div>
      </div>

      <div className="kpi-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Resolved (24h)</p>
            {loading ? (
              <div className="loading mt-2"></div>
            ) : (
              <>
                <p className="text-3xl font-bold text-green-400 mt-2">
                  {stats.resolved_alerts_24h.toLocaleString()}
                </p>
                <p className="text-green-400 text-sm mt-2">Completed</p>
              </>
            )}
          </div>
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faCheckCircle} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlertSummaryCards;
