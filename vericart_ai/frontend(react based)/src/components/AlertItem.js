import React from 'react';

function AlertItem({ alert }) {
  return (
    <div className="alert-item">
      <div className="flex items-center justify-between mb-2">
        <span className={`metric-badge metric-${alert.type.toLowerCase()}`}>
          {alert.type}
        </span>
        <span className="text-xs text-gray-400">{alert.time}</span>
      </div>
      <p className="text-white font-medium">{alert.title}</p>
      <p className="text-gray-400 text-sm">{alert.description}</p>
    </div>
  );
}

export default AlertItem;
