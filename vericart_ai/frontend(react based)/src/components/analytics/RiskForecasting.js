import React from 'react';

function RiskForecasting({ forecasts }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">Risk Level Forecasting</h2>
      <div className="space-y-4">
        {forecasts.map((forecast, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
            <div>
              <span className="text-white font-medium">{forecast.period}</span>
              <p className="text-gray-400 text-sm">Predicted risk level</p>
            </div>
            <div className="text-right">
              <span className={`${forecast.colorClass} font-bold text-xl`}>{forecast.riskLevel}</span>
              <p className={`${forecast.colorClass} text-sm`}>{forecast.confidence} confidence</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RiskForecasting;
