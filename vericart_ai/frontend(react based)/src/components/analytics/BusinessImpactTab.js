import React from 'react';
import { 
  faShieldCheck, 
  faUndo, 
  faHeart, 
  faTruck 
} from '@fortawesome/free-solid-svg-icons';
import KpiCard from './KpiCard';
import RoiCalculator from './RoiCalculator';
import AnalyticsChart from './AnalyticsChart';

function BusinessImpactTab({ data, loading, timeRange, onNotification }) {
  // Extract monthly savings for ROI calculator
  const monthlySavings = data ? data.lossesPrevented.value / 12 : 200000;
  
  return (
    <div>
      {/* Business Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Losses Prevented"
          value={data ? data.lossesPrevented.value.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
          }) : ''}
          change={data ? data.lossesPrevented.change : 'Loading...'}
          icon={faShieldCheck}
          iconBgColor="bg-green-600"
          valueColor="text-green-400"
          loading={loading || !data}
        />
        
        <KpiCard
          title="Return Fraud Reduction"
          value={data ? data.returnFraudReduction.value : ''}
          change={data ? data.returnFraudReduction.change : 'Loading...'}
          icon={faUndo}
          iconBgColor="bg-blue-600"
          valueColor="text-blue-400"
          loading={loading || !data}
        />
        
        <KpiCard
          title="Customer Trust Score"
          value={data ? data.customerTrust.value : ''}
          change={data ? data.customerTrust.change : 'Loading...'}
          icon={faHeart}
          iconBgColor="bg-purple-600"
          valueColor="text-purple-400"
          loading={loading || !data}
        />
        
        <KpiCard
          title="Supply Chain Efficiency"
          value={data ? data.supplyChainEfficiency.value : ''}
          change={data ? data.supplyChainEfficiency.change : 'Loading...'}
          icon={faTruck}
          iconBgColor="bg-yellow-600"
          valueColor="text-yellow-400"
          loading={loading || !data}
        />
      </div>

      {/* ROI Calculator and Business Impact Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <RoiCalculator monthlySavings={monthlySavings} />
        
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Business Impact Over Time</h2>
          <AnalyticsChart
            id="businessImpactChart"
            type="line"
            data={data ? data.chartData : null}
            title="Business Impact Over Time"
          />
        </div>
      </div>

      {/* Cost Breakdown and Other Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Cost Breakdown</h3>
          <AnalyticsChart
            id="costBreakdownChart"
            type="doughnut"
            data={{
              labels: ['Implementation', 'Operations', 'Training', 'Maintenance'],
              datasets: [{
                data: [35, 30, 20, 15],
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
              }]
            }}
            title="Cost Breakdown"
          />
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Fraud Prevention by Category</h3>
          <AnalyticsChart
            id="fraudCategoryChart"
            type="bar"
            data={{
              labels: ['Velocity', 'Geographic', 'Cluster', 'Anomaly'],
              datasets: [{
                label: 'Cases Prevented',
                data: [145, 98, 67, 34],
                backgroundColor: ['#EF4444', '#F59E0B', '#8B5CF6', '#10B981']
              }]
            }}
            title="Fraud Prevention by Category"
          />
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Monthly Savings Trend</h3>
          <AnalyticsChart
            id="savingsTrendChart"
            type="line"
            data={data ? {
              labels: generateTimeLabels(timeRange),
              datasets: [{
                label: 'Monthly Savings ($)',
                data: generateTrendData(30, 180000, 250000),
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true
              }]
            } : null}
            title="Monthly Savings Trend"
          />
        </div>
      </div>
    </div>
  );
}

// Helper functions
function generateTimeLabels(timeRange) {
  const labels = [];
  const now = new Date();
  let days = 30;
  
  switch (timeRange) {
    case '7d': days = 7; break;
    case '30d': days = 30; break;
    case '90d': days = 90; break;
    case '1y': days = 365; break;
    default: days = 30;
  }
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  
  return labels;
}

function generateTrendData(points, min, max) {
  const data = [];
  let current = min + Math.random() * (max - min);
  
  for (let i = 0; i < points; i++) {
    const variation = (Math.random() - 0.5) * (max - min) * 0.1;
    current = Math.max(min, Math.min(max, current + variation));
    data.push(Math.round(current));
  }
  
  return data;
}

export default BusinessImpactTab;
