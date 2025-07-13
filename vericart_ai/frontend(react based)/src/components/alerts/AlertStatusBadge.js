import React from 'react';

function AlertStatusBadge({ status }) {
  const getStatusClass = (status) => {
    switch (status) {
      case 'new': return 'status-new';
      case 'investigating': return 'status-investigating';
      case 'resolved': return 'status-resolved';
      case 'dismissed': return 'status-dismissed';
      case 'escalated': return 'status-escalated';
      default: return 'status-new';
    }
  };
  
  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      {formatStatus(status)}
    </span>
  );
}

export default AlertStatusBadge;
