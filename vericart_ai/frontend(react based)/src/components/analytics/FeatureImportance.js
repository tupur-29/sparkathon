import React from 'react';

function FeatureImportance({ features }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Feature Importance</h3>
      <div className="space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-gray-300">{feature.name}</span>
            <div className="flex items-center space-x-2">
              <div className="w-24 bg-gray-600 rounded-full h-2">
                <div 
                  className={`bg-${feature.color}-400 h-2 rounded-full`} 
                  style={{ width: `${feature.value * 100}%` }}
                ></div>
              </div>
              <span className={`text-${feature.color}-400 text-sm font-medium`}>
                {feature.value.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeatureImportance;
