import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import Navigation from '../components/common/Navigation';
import ConnectionStatus from '../components/common/ConnectionStatus';
import Notification from '../components/common/Notification';
import AnalyticsTabs from '../components/analytics/AnalyticsTabs';
import TimeRangeSelector from '../components/analytics/TimeRangeSelector';
import BusinessImpactTab from '../components/analytics/BusinessImpactTab';
import MLPerformanceTab from '../components/analytics/MLPerformanceTab';
import PredictiveModelsTab from '../components/analytics/PredictiveModelsTab';
import TrendsAnalysisTab from '../components/analytics/TrendsAnalysisTab';
import { 
  loadBusinessImpactData, 
  loadMLPerformanceData,
  loadPredictiveData,
  loadTrendsData
} from '../services/analyticsService';
import { setupWebSocket } from '../services/websocketService';

function AnalyticsPage() {
  // State variables
  const [activeTab, setActiveTab] = useState('business-impact');
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState({
    businessImpact: null,
    mlPerformance: null,
    predictive: null,
    trends: null
  });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
    type: 'info'
  });
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const refreshIntervalRef = useRef(null);
  
  // Function to show notifications
  const showNotification = (message, type = 'info', duration = 5000) => {
    setNotification({
      visible: true,
      message,
      type
    });
    
    // Auto-hide notification
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, duration);
  };
  
  // Load data for the active tab
  const loadDataForActiveTab = useCallback(async () => {
    setLoading(true);
    
    try {
      switch (activeTab) {
        case 'business-impact':
          const businessData = await loadBusinessImpactData(timeRange);
          setAnalyticsData(prev => ({ ...prev, businessImpact: businessData }));
          break;
        case 'ml-performance':
          const mlData = await loadMLPerformanceData(timeRange);
          setAnalyticsData(prev => ({ ...prev, mlPerformance: mlData }));
          break;
        case 'predictive':
          const predictiveData = await loadPredictiveData(timeRange);
          setAnalyticsData(prev => ({ ...prev, predictive: predictiveData }));
          break;
        case 'trends':
          const trendsData = await loadTrendsData(timeRange);
          setAnalyticsData(prev => ({ ...prev, trends: trendsData }));
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Failed to load ${activeTab} data:`, error);
      showNotification(`Failed to load data for ${activeTab.replace('-', ' ')}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [activeTab, timeRange]);
  
  // Load all data
  const loadAllData = useCallback(async () => {
    setLoading(true);
    
    try {
      const [businessData, mlData, predictiveData, trendsData] = await Promise.all([
        loadBusinessImpactData(timeRange),
        loadMLPerformanceData(timeRange),
        loadPredictiveData(timeRange),
        loadTrendsData(timeRange)
      ]);
      
      setAnalyticsData({
        businessImpact: businessData,
        mlPerformance: mlData,
        predictive: predictiveData,
        trends: trendsData
      });
      
      showNotification('Data refreshed successfully', 'success');
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      showNotification('Failed to refresh data', 'error');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);
  
  // Initial data loading
  useEffect(() => {
    loadAllData();
    
    // Setup WebSocket connection
    const disconnect = setupWebSocket({
      onConnect: () => {
        setConnectionStatus('connected');
        showNotification('Connected to analytics service', 'success');
      },
      onDisconnect: () => {
        setConnectionStatus('disconnected');
        showNotification('Disconnected from analytics service', 'error');
      },
      onError: (error) => {
        setConnectionStatus('error');
        showNotification(`Connection error: ${error}`, 'error');
      },
      onData: (data) => {
        if (data.type === 'business_impact') {
          setAnalyticsData(prev => ({
            ...prev,
            businessImpact: { ...prev.businessImpact, ...data.payload }
          }));
        } else if (data.type === 'ml_performance') {
          setAnalyticsData(prev => ({
            ...prev,
            mlPerformance: { ...prev.mlPerformance, ...data.payload }
          }));
        }
      }
    });
    
    // Set up periodic refresh
    refreshIntervalRef.current = setInterval(loadAllData, 300000); // 5 minutes
    
    // Cleanup
    return () => {
      disconnect();
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [loadAllData]);
  
  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };
  
  // Handle time range change
  const handleTimeRangeChange = (newRange) => {
    setTimeRange(newRange);
  };
  
  // Handle refresh
  const handleRefresh = () => {
    loadAllData();
  };
  
  // Handle export
  const handleExportReport = async () => {
    try {
      showNotification('Generating report...', 'info');
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create and download file
      const reportData = {
        timeRange,
        generatedAt: new Date().toISOString(),
        businessImpact: analyticsData.businessImpact,
        mlPerformance: analyticsData.mlPerformance,
        predictive: analyticsData.predictive,
        trends: analyticsData.trends
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vericart-analytics-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      showNotification('Report exported successfully', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showNotification('Export failed', 'error');
    }
  };
  
  // Update data when tab or time range changes
  useEffect(() => {
    loadDataForActiveTab();
  }, [loadDataForActiveTab]);
  
  return (
    <div className="AnalyticsPage">
      <Navigation activePage="Analytics" />
      <ConnectionStatus status={connectionStatus} />
      
      {notification.visible && (
        <Notification 
          message={notification.message} 
          type={notification.type}
          onClose={() => setNotification(prev => ({ ...prev, visible: false }))}
        />
      )}
      
      {/* Main Content */}
      <div className="ml-64 min-h-screen p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Predictive Analytics</h1>
              <p className="text-gray-400 mt-2">AI-powered fraud prediction and business insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <TimeRangeSelector 
                value={timeRange} 
                onChange={handleTimeRangeChange} 
              />
              <button 
                className="btn btn-secondary"
                onClick={handleRefresh}
              >
                <FontAwesomeIcon icon={faSync} className="mr-2" />
                Refresh
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleExportReport}
              >
                <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Tabs */}
        <AnalyticsTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Tab Content */}
        {activeTab === 'business-impact' && (
          <BusinessImpactTab 
            data={analyticsData.businessImpact} 
            loading={loading} 
            timeRange={timeRange}
            onNotification={showNotification}
          />
        )}
        
        {activeTab === 'ml-performance' && (
          <MLPerformanceTab 
            data={analyticsData.mlPerformance} 
            loading={loading} 
          />
        )}
        
        {activeTab === 'predictive' && (
          <PredictiveModelsTab 
            data={analyticsData.predictive} 
            loading={loading} 
          />
        )}
        
        {activeTab === 'trends' && (
          <TrendsAnalysisTab 
            data={analyticsData.trends} 
            loading={loading} 
          />
        )}
      </div>
    </div>
  );
}

export default AnalyticsPage;
