import React from 'react';

function ModelTrainingHistory({ versions }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Model Training History</h3>
      <div className="space-y-4">
        {versions.map((version, index) => (
          <div 
            key={index} 
            className={`border-l-4 ${
              version.status === 'current' ? 'border-green-500' : 'border-gray-500'
            } pl-4`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-white font-medium">{version.version}</span>
              <span className={`${
                version.status === 'current' ? 'text-green-400' : 'text-gray-400'
              } text-sm`}>
                {version.status.charAt(0).toUpperCase() + version.status.slice(1)}
              </span>
            </div>
            <p className="text-gray-400 text-sm">Deployed: {version.deploymentDate}</p>
            <p className="text-gray-400 text-sm">Training data: {version.trainingSamples} samples</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ModelTrainingHistory;
