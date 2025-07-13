import React from 'react';
import { 
  faBullseye, 
  faCrosshairs, 
  faSearchPlus, 
  faBalanceScale 
} from '@fortawesome/free-solid-svg-icons';
import KpiCard from './KpiCard';
import AnalyticsChart from './AnalyticsChart';
import FeatureImportance from './FeatureImportance';
import ModelTrainingHistory from './ModelTrainingHistory';
import ConfusionMatrix from './ConfusionMatrix';

function MLPerformanceTab({ data, loading }) {
  return (
    <div>
      {/* Model Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Model Accuracy"
          value="94.2%"
          change="+0.8% this week"
          icon={faBullseye}
          iconBgColor="bg-green-600"
          valueColor="text-green-400"
          loading={loading}
        />
        
        <KpiCard
          title="Precision"
          value="91.8%"
          change="+1.2% this week"
          icon={faCrosshairs}
          iconBgColor="bg-blue-600"
          valueColor="text-blue-400"
          loading={loading}
        />
        
        <KpiCard
          title="Recall"
          value="89.5%"
          change="+0.5% this week"
          icon={faSearchPlus}
          iconBgColor="bg-purple-600"
          valueColor="text-purple-400"
          loading={loading}
        />
        
        <KpiCard
          title="F1-Score"
          value="90.6%"
          change="+0.9% this week"
          icon={faBalanceScale}
          iconBgColor="bg-yellow-600"
          valueColor="text-yellow-400"
          loading={loading}
        />
      </div>

      {/* Model Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Model Performance Over Time</h2>
          <AnalyticsChart
            id="modelPerformanceChart"
            type="line"
            data={data ? data.modelPerformance : null}
            title="Model Performance Over Time"
          />
        </div>

        <ConfusionMatrix 
          truePositives={8742}
          falsePositives={567}
          falseNegatives={892}
          trueNegatives={45231}
        />
      </div>

      {/* Feature Importance and Model Training History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <FeatureImportance 
          features={[
            { name: 'Speed (km/h)', value: 0.85, color: 'blue' },
            { name: 'Time Difference', value: 0.72, color: 'green' },
            { name: 'Distance', value: 0.68, color: 'purple' },
            { name: 'Scan Order', value: 0.45, color: 'yellow' },
            { name: 'Geographic Region', value: 0.32, color: 'red' }
          ]}
        />

        <ModelTrainingHistory 
          versions={[
            { 
              version: 'v2.1.3', 
              status: 'current', 
              deploymentDate: 'Dec 15, 2023', 
              trainingSamples: '2.3M' 
            },
            { 
              version: 'v2.1.2', 
              status: 'previous', 
              deploymentDate: 'Nov 28, 2023', 
              trainingSamples: '2.1M' 
            },
            { 
              version: 'v2.1.1', 
              status: 'archive', 
              deploymentDate: 'Nov 10, 2023', 
              trainingSamples: '1.9M' 
            }
          ]}
        />
      </div>
    </div>
  );
}

export default MLPerformanceTab;
