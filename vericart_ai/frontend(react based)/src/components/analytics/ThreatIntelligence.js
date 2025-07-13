import React from 'react';

function ThreatIntelligence({ threats }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Threat Intelligence</h3>
      <div className="space-y-3">
        {threats.map((threat, index) => (
          <div 
            key={index} 
            className={`flex items-center justify-between p-3 ${threat.colorClass} bg-opacity-30 rounded-lg`}
          >
            <span className={threat.colorClass.split(' ').pop()}>{threat.label}</span>
            <span className="text-white font-bold">{threat.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ThreatIntelligence;
