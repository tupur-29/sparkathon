import React, { useState, useEffect } from 'react';

function ConnectionStatus() {
  const [status, setStatus] = useState({ text: 'System Online', color: '#10B981' });

  useEffect(() => {
    const statuses = [
      { text: 'System Online', color: '#10B981' },
      { text: 'High Activity', color: '#D97706' },
      { text: 'Processing...', color: '#3B82F6' }
    ];

    const interval = setInterval(() => {
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setStatus(randomStatus);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="connection-status">
      <span 
        className="status-indicator" 
        style={{ backgroundColor: status.color }}
      ></span>
      <span id="statusText">{status.text}</span>
    </div>
  );
}

export default ConnectionStatus;
