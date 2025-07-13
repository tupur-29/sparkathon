import React from 'react';
import Chart from './Chart';

function RiskCharts() {
  // Product Risk Chart Config
  const productChartData = {
    labels: ['Electronics', 'Clothing', 'Accessories', 'Cosmetics', 'Others'],
    datasets: [{
      data: [35, 25, 20, 15, 5],
      backgroundColor: ['#DC2626', '#D97706', '#059669', '#3B82F6', '#6B7280'],
      borderColor: '#1E293B',
      borderWidth: 2
    }]
  };
  
  const productChartOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#F1F5F9',
          padding: 15,
          font: { size: 11 }
        }
      }
    }
  };
  
  // Region Risk Chart Config
  const regionChartData = {
    labels: ['Asia', 'North America', 'Europe', 'South America', 'Africa'],
    datasets: [{
      label: 'Risk Score',
      data: [85, 72, 45, 38, 29],
      backgroundColor: ['#DC2626', '#D97706', '#059669', '#3B82F6', '#6B7280'],
      borderColor: '#1E293B',
      borderWidth: 1
    }]
  };
  
  const regionChartOptions = {
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#374151' },
        ticks: { color: '#9CA3AF' }
      },
      x: {
        grid: { color: '#374151' },
        ticks: { color: '#9CA3AF' }
      }
    }
  };
  
  // Trends Chart Config
  const generateTrendsData = () => {
    const dates = [];
    const scansData = [];
    const anomaliesData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      scansData.push(Math.floor(Math.random() * 50000) + 100000);
      anomaliesData.push(Math.floor(Math.random() * 500) + 800);
    }
    
    return {
      labels: dates,
      datasets: [{
        label: 'Total Scans',
        data: scansData,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }, {
        label: 'Anomalies',
        data: anomaliesData,
        borderColor: '#DC2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        tension: 0.4,
        fill: true,
        yAxisID: 'y1'
      }]
    };
  };
  
  const trendsChartOptions = {
    plugins: {
      legend: {
        labels: {
          color: '#F1F5F9',
          font: { size: 11 }
        }
      }
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        grid: { color: '#374151' },
        ticks: { color: '#9CA3AF' }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { color: '#9CA3AF' }
      },
      x: {
        grid: { color: '#374151' },
        ticks: { color: '#9CA3AF' }
      }
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="chart-container bottom-chart-container">
        <h3 className="text-lg font-bold text-white">Top Risky Products</h3>
        <div className="chart-wrapper">
          <Chart 
            type="doughnut" 
            data={productChartData} 
            options={productChartOptions} 
          />
        </div>
      </div>

      <div className="chart-container bottom-chart-container">
        <h3 className="text-lg font-bold text-white">Top Risky Regions</h3>
        <div className="chart-wrapper">
          <Chart 
            type="bar" 
            data={regionChartData} 
            options={regionChartOptions} 
          />
        </div>
      </div>

      <div className="chart-container bottom-chart-container">
        <h3 className="text-lg font-bold text-white">Fraud Trends</h3>
        <div className="chart-wrapper">
          <Chart 
            type="line" 
            data={generateTrendsData()} 
            options={trendsChartOptions} 
          />
        </div>
      </div>
    </div>
  );
}

export default RiskCharts;
