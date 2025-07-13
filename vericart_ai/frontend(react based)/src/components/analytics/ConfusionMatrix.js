import React from 'react';

function ConfusionMatrix({ truePositives, falsePositives, falseNegatives, trueNegatives }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Confusion Matrix</h2>
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-green-900 bg-opacity-50 border border-green-500 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{truePositives.toLocaleString()}</div>
          <div className="text-sm text-green-300">True Positives</div>
        </div>
        <div className="bg-red-900 bg-opacity-50 border border-red-500 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-400">{falsePositives.toLocaleString()}</div>
          <div className="text-sm text-red-300">False Positives</div>
        </div>
        <div className="bg-red-900 bg-opacity-50 border border-red-500 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-400">{falseNegatives.toLocaleString()}</div>
          <div className="text-sm text-red-300">False Negatives</div>
        </div>
        <div className="bg-green-900 bg-opacity-50 border border-green-500 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{trueNegatives.toLocaleString()}</div>
          <div className="text-sm text-green-300">True Negatives</div>
        </div>
      </div>
    </div>
  );
}

export default ConfusionMatrix;
