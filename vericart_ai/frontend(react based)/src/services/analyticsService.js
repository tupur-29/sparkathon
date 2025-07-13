// Generate time labels based on range
const generateTimeLabels = (timeRange) => {
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
};

// Generate trend data
const generateTrendData = (points, min, max) => {
  const data = [];
  let current = min + Math.random() * (max - min);
  
  for (let i = 0; i < points; i++) {
    const variation = (Math.random() - 0.5) * (max - min) * 0.1;
    current = Math.max(min, Math.min(max, current + variation));
    data.push(Math.round(current));
  }
  
  return data;
};

// Load business impact data
export const loadBusinessImpactData = async (timeRange) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate mock data
  const multiplier = timeRange === '7d' ? 0.25 : timeRange === '30d' ? 1 : timeRange === '90d' ? 3 : 12;
  
  return {
    lossesPrevented: {
      value: Math.round(2.4 * multiplier * 1000000),
      change: '+15.3%'
    },
    returnFraudReduction: {
      value: '67%',
      change: '+8.2%'
    },
    customerTrust: {
      value: '92.4%',
      change: '+3.1%'
    },
    supplyChainEfficiency: {
      value: '89.7%',
      change: '+5.7%'
    },
    chartData: {
      labels: generateTimeLabels(timeRange),
      datasets: [
        {
          label: 'Losses Prevented ($)',
          data: generateTrendData(30, 50000, 200000),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true
        },
        {
          label: 'Customer Trust Score',
          data: generateTrendData(30, 85, 95),
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true
        }
      ]
    }
  };
};

// Load ML performance data
export const loadMLPerformanceData = async (timeRange) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    modelPerformance: {
      labels: generateTimeLabels(timeRange),
      datasets: [
        {
          label: 'Accuracy',
          data: generateTrendData(30, 92, 96),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)'
        },
        {
          label: 'Precision',
          data: generateTrendData(30, 89, 94),
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)'
        },
        {
          label: 'Recall',
          data: generateTrendData(30, 87, 92),
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)'
        }
      ]
    }
  };
};

// Load predictive data
export const loadPredictiveData = async (timeRange) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    fraudPrediction: {
      labels: generateTimeLabels(timeRange),
      datasets: [
        {
          label: 'Predicted Fraud Cases',
          data: generateTrendData(30, 50, 150),
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true
        },
        {
          label: 'Actual Fraud Cases',
          data: generateTrendData(30, 40, 120),
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          fill: true
        }
      ]
    }
  };
};

// Load trends data
export const loadTrendsData = async (timeRange) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    fraudTrends: {
      labels: generateTimeLabels(timeRange),
      datasets: [
        {
          label: 'Velocity Fraud',
          data: generateTrendData(30, 20, 80),
          borderColor: '#EF4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)'
        },
        {
          label: 'Geographic Fraud',
          data: generateTrendData(30, 15, 60),
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)'
        },
        {
          label: 'Cluster Fraud',
          data: generateTrendData(30, 10, 40),
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)'
        }
      ]
    }
  };
};
