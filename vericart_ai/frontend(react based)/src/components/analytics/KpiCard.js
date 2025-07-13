import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function KpiCard({ title, value, change, icon, iconBgColor, valueColor, loading }) {
  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          {loading ? (
            <div className="loading mt-2"></div>
          ) : (
            <>
              <p className={`text-3xl font-bold ${valueColor} mt-2`}>{value}</p>
              <p className={`${valueColor} text-sm mt-2`}>{change}</p>
            </>
          )}
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          <FontAwesomeIcon icon={icon} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export default KpiCard;
