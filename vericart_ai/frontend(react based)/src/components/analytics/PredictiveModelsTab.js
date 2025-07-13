import React from 'react';
import AnalyticsChart from './AnalyticsChart';
import RiskForecasting from './RiskForecasting';
import ThreatIntelligence from './ThreatIntelligence';

function PredictiveModelsTab({ data, loading }) {
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Fraud Prediction */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Fraud Prediction Timeline</h2>
          <AnalyticsChart
            id="fraudPredictionChart"
            type="line"
            data={data ? data.fraudPrediction : null}
            title="Fraud Prediction vs Actual"
          />
        </div>

        {/* Risk Forecasting */}
        <RiskForecasting 
          forecasts={[
            {
              period: 'Next 7 Days',
              riskLevel: 'MODERATE',
              confidence: '65%',
              colorClass: 'text-yellow-400'
            },
            {
              period: 'Next 30 Days',
              riskLevel: 'HIGH',
              confidence: '78%',
              colorClass: 'text-red-400'
            },
            {
              period: 'Holiday Season',
              riskLevel: 'CRITICAL',
              confidence: '89%',
              colorClass: 'text-red-400'
            }
          ]}
        />
      </div>

      {/* Anomaly Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Anomaly Patterns</h3>
          <AnalyticsChart
            id="anomalyPatternsChart"
            type="radar"
            data={{
              labels: ['Velocity', 'Geographic', 'Cluster', 'Timing', 'Pattern', 'Behavior'],
              datasets: [{
                label: 'Anomaly Detection',
                data: [85, 72, 68, 91, 77, 83],
                borderColor: '#8B5CF6',
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                pointBackgroundColor: '#8B5CF6',
                pointBorderColor: '#8B5CF6'
              }]
            }}
            title="Anomaly Detection Patterns"
          />
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Seasonal Trends</h3>
          <AnalyticsChart
            id="seasonalTrendsChart"
            type="line"
            data={{
              labels: ['Q1', 'Q2', 'Q3', 'Q4'],
              datasets: [{
                label: 'Fraud Risk Level',
                data: [45, 32, 67, 89],
                borderColor: '#F59E0B',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                fill: true
              }]
            }}
            title="Seasonal Fraud Trends"
          />
        </div>

        <ThreatIntelligence 
          threats={[
            { label: 'High-risk products', count: 12, colorClass: 'bg-red-900 border-red-500 text-red-400' },
            { label: 'Emerging threats', count: 5, colorClass: 'bg-yellow-900 border-yellow-500 text-yellow-400' },
            { label: 'New attack vectors', count: 3, colorClass: 'bg-blue-900 border-blue-500 text-blue-400' }
          ]}
        />
      </div>
    </div>
  );
}

export default PredictiveModelsTab;
