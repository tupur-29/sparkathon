import React from 'react';

function EmergingThreats({ threats }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Emerging Threats</h3>
      <div className="space-y-3">
        {threats.map((threat, index) => (
          <div 
            key={index} 
            className={`p-3 ${threat.colorClass} bg-opacity-30 rounded-lg`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={threat.colorClass.split(' ').pop() + ' font-semibold'}>
                {threat.title}
              </span>
              <span className={threat.colorClass.split(' ').pop() + ' text-sm'}>
                {threat.increase}
              </span>
            </div>
            <p className="text-gray-300 text-sm">{threat.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmergingThreats;
