import React from 'react';
import AnalyticsChart from './AnalyticsChart';
import ProductRiskCategories from './ProductRiskCategories';
import TimeBasedPatterns from './TimeBasedPatterns';
import EmergingThreats from './EmergingThreats';

function TrendsAnalysisTab({ data, loading }) {
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Fraud Trends */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Fraud Trends Analysis</h2>
          <AnalyticsChart
            id="fraudTrendsChart"
            type="line"
            data={data ? data.fraudTrends : null}
            title="Fraud Trends Analysis"
          />
        </div>

        {/* Geographic Heatmap */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Geographic Risk Distribution</h2>
          <AnalyticsChart
            id="geoHeatmapChart"
            type="scatter"
            data={{
              datasets: [{
                label: 'High Risk Areas',
                data: [
                  {x: 40.7128, y: -74.0060, r: 15}, // NYC
                  {x: 34.0522, y: -118.2437, r: 12}, // LA
                  {x: 41.8781, y: -87.6298, r: 10}, // Chicago
                  {x: 29.7604, y: -95.3698, r: 8}, // Houston
                  {x: 25.7617, y: -80.1918, r: 6}  // Miami
                ],
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                borderColor: '#EF4444'
              }]
            }}
            title="Geographic Risk Distribution"
            options={{
              scales: {
                x: {
                  type: 'linear',
                  position: 'bottom',
                  title: {
                    display: true,
                    text: 'Latitude',
                    color: '#9CA3AF'
                  }
                },
                y: {
                  title: {
                    display: true,
                    text: 'Longitude',
                    color: '#9CA3AF'
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Trend Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ProductRiskCategories 
          categories={[
            { name: 'Electronics', risk: 'High Risk', colorClass: 'text-red-400' },
            { name: 'Fashion', risk: 'Medium Risk', colorClass: 'text-yellow-400' },
            { name: 'Home & Garden', risk: 'Low Risk', colorClass: 'text-green-400' },
            { name: 'Health & Beauty', risk: 'High Risk', colorClass: 'text-red-400' },
            { name: 'Sports & Outdoors', risk: 'Low Risk', colorClass: 'text-green-400' }
          ]}
        />

        <TimeBasedPatterns 
          patterns={[
            { name: 'Peak Hours', value: '2PM - 6PM', colorClass: 'text-blue-400' },
            { name: 'High Risk Days', value: 'Fri - Sun', colorClass: 'text-red-400' },
            { name: 'Seasonal Peak', value: 'Q4 (Holiday)', colorClass: 'text-yellow-400' },
            { name: 'Low Risk Period', value: 'Q1', colorClass: 'text-green-400' }
          ]}
        />

        <EmergingThreats 
          threats={[
            { 
              title: 'QR Code Cloning', 
              increase: '+45%', 
              description: 'Sophisticated duplication of product QR codes',
              colorClass: 'bg-red-900 border-red-500 text-red-400'
            },
            { 
              title: 'Speed Manipulation', 
              increase: '+23%', 
              description: 'Attempts to bypass velocity detection algorithms',
              colorClass: 'bg-yellow-900 border-yellow-500 text-yellow-400'
            },
            { 
              title: 'GPS Spoofing', 
              increase: '+12%', 
              description: 'Fake location data to avoid geographic detection',
              colorClass: 'bg-orange-900 border-orange-500 text-orange-400'
            }
          ]}
        />
      </div>

      {/* Trend Summary */}
      <div className="mt-8 bg-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Trend Summary & Recommendations</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Key Insights</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <i className="fas fa-arrow-up text-red-400 mt-1"></i>
                <div>
                  <p className="text-white font-medium">Fraud attempts increased 34% during holiday season</p>
                  <p className="text-gray-400 text-sm">Peak activity observed between Black Friday and New Year</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <i className="fas fa-map-marker-alt text-yellow-400 mt-1"></i>
                <div>
                  <p className="text-white font-medium">Geographic clustering in major metropolitan areas</p>
                  <p className="text-gray-400 text-sm">NYC, LA, and Chicago account for 67% of all alerts</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <i className="fas fa-clock text-blue-400 mt-1"></i>
                <div>
                  <p className="text-white font-medium">Velocity attacks becoming more sophisticated</p>
                  <p className="text-gray-400 text-sm">Average time between scans decreased from 8min to 3min</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Recommended Actions</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <i className="fas fa-shield-alt text-green-400 mt-1"></i>
                <div>
                  <p className="text-white font-medium">Enhance model sensitivity during peak periods</p>
                  <p className="text-gray-400 text-sm">Implement seasonal risk adjustment algorithms</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <i className="fas fa-network-wired text-purple-400 mt-1"></i>
                <div>
                  <p className="text-white font-medium">Deploy additional monitoring in high-risk regions</p>
                  <p className="text-gray-400 text-sm">Increase sampling rate in metropolitan areas</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <i className="fas fa-brain text-orange-400 mt-1"></i>
                <div>
                  <p className="text-white font-medium">Update ML models with latest attack patterns</p>
                  <p className="text-gray-400 text-sm">Retrain models monthly with new fraud techniques</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrendsAnalysisTab;
