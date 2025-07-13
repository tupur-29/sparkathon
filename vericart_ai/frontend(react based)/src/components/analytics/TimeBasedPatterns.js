import React from 'react';

function TimeBasedPatterns({ patterns }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Time-based Patterns</h3>
      <div className="space-y-3">
        {patterns.map((pattern, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-gray-300">{pattern.name}</span>
            <span className={`${pattern.colorClass} font-bold`}>{pattern.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TimeBasedPatterns;
