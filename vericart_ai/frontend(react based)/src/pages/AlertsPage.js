import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSync, 
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import Navigation from '../components/common/Navigation';
import ConnectionStatus from '../components/common/ConnectionStatus';
import Notification from '../components/common/Notification';
import AlertSummaryCards from '../components/alerts/AlertSummaryCards';
import AlertsTable from '../components/alerts/AlertsTable';
import AlertDetailsModal from '../components/alerts/AlertDetailsModal';
import StatusUpdateModal from '../components/alerts/StatusUpdateModal';
import { loadAlerts, loadAlertStats, getAlertDetails, updateAlert } from '../services/alertsService';
import { setupWebSocketConnection } from '../services/websocketService';

function AlertsPage() {
  // State variables
  const [alerts, setAlerts] = useState([]);
  const [alertStats, setAlertStats] = useState({
    total_alerts: 0,
    new_alerts: 0,
    investigating_alerts: 0,
    resolved_alerts_24h: 0,
    by_status: { new: 0, investigating: 0, resolved: 0, dismissed: 0 }
  });
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    sortBy: 'timestamp',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalAlerts: 0
  });
  const [selectedAlerts, setSelectedAlerts] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [alertDetailsModal, setAlertDetailsModal] = useState({
    visible: false,
    alertId: null,
    alertDetails: null,
    loading: false
  });
  const [statusUpdateModal, setStatusUpdateModal] = useState({
    visible: false,
    alertId: null
  });
  const [notification, setNotification] = useState({
    visible: false,
    message: '',
    type: 'info'
  });
  
  // Load alerts based on current filters and pagination
  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await loadAlerts({
        page: pagination.currentPage,
        limit: 25,
        status: filters.status === 'all' ? null : filters.status,
        search: filters.search,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });
      
      setAlerts(response.alerts);
      setPagination({
        ...pagination,
        totalPages: response.totalPages,
        totalAlerts: response.totalAlerts
      });
      setError(null);
    } catch (err) {
      setError('Failed to load alerts');
      showNotification('Failed to load alerts', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage]);
  
  // Load alert statistics
  const fetchAlertStats = useCallback(async () => {
    try {
      const stats = await loadAlertStats();
      setAlertStats(stats);
    } catch (err) {
      console.error('Failed to load alert statistics:', err);
    }
  }, []);
  
  // Initial data loading
  useEffect(() => {
    fetchAlerts();
    fetchAlertStats();
    
    // Setup WebSocket connection
    const disconnect = setupWebSocketConnection({
      onConnect: () => showNotification('Connected to real-time alerts', 'success'),
      onDisconnect: () => showNotification('Disconnected from alerts service', 'error'),
      onNewAlert: () => {
        fetchAlertStats();
        if (filters.status === 'all' || filters.status === 'new') {
          fetchAlerts();
        }
        showNotification('New alert received', 'info');
      }
    });
    
    // Set up refresh interval (every 2 minutes)
    const refreshInterval = setInterval(() => {
      fetchAlertStats();
    }, 120000);
    
    // Cleanup on unmount
    return () => {
      clearInterval(refreshInterval);
      disconnect();
    };
  }, []);
  
  // Refetch alerts when filters or pagination change
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);
  
  // Notification helper
  const showNotification = (message, type = 'info') => {
    setNotification({
      visible: true,
      message,
      type
    });
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 5000);
  };
  
  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page on filter change
  };
  
  // Handle page changes
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };
  
  // Handle selection changes
  const handleSelectionChange = (selection) => {
    setSelectedAlerts(selection);
  };
  
  // Handle bulk actions
  const handleBulkAction = async (action) => {
    if (selectedAlerts.size === 0) return;
    
    try {
      // In a real app, you'd make an API call here
      const alertIds = Array.from(selectedAlerts);
      
      // Update alerts locally for demo
      const updatedAlerts = alerts.map(alert => {
        if (alertIds.includes(alert.id)) {
          return { ...alert, status: action };
        }
        return alert;
      });
      
      setAlerts(updatedAlerts);
      setSelectedAlerts(new Set());
      
      // Update stats
      fetchAlertStats();
      
      showNotification(`Updated ${alertIds.length} alerts to ${action}`, 'success');
    } catch (err) {
      showNotification('Failed to update alerts', 'error');
    }
  };
  
  // Handle view alert details
  const handleViewAlert = async (alertId) => {
    setAlertDetailsModal({
      visible: true,
      alertId,
      alertDetails: null,
      loading: true
    });
    
    try {
      const details = await getAlertDetails(alertId);
      setAlertDetailsModal(prev => ({
        ...prev,
        alertDetails: details,
        loading: false
      }));
    } catch (err) {
      showNotification('Failed to load alert details', 'error');
      setAlertDetailsModal(prev => ({
        ...prev,
        loading: false
      }));
    }
  };
  
  // Handle status update
  const handleStatusUpdate = async (alertId, newStatus, notes) => {
    try {
      // In a real app, you'd make an API call here
      // const result = await updateAlert(alertId, newStatus, notes);
      
      // Update locally for demo
      const updatedAlerts = alerts.map(alert => {
        if (alert.id === alertId) {
          return { ...alert, status: newStatus };
        }
        return alert;
      });
      
      setAlerts(updatedAlerts);
      setStatusUpdateModal({ visible: false, alertId: null });
      
      // Refresh stats
      fetchAlertStats();
      
      showNotification(`Alert status updated to ${newStatus}`, 'success');
    } catch (err) {
      showNotification('Failed to update alert status', 'error');
    }
  };
  
  // Handle export
  const handleExport = () => {
    // In a real app, you'd generate and download a file
    // For demo, we'll just show a notification
    showNotification('Alerts data exported successfully', 'success');
  };
  
  return (
    <div className="AlertsPage">
      <Navigation activePage="Alerts Center" />
      <ConnectionStatus />
      
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
              <h1 className="text-3xl font-bold text-white">Alerts Center</h1>
              <p className="text-gray-400 mt-2">Manage and investigate fraud alerts</p>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className="btn btn-secondary"
                onClick={fetchAlerts}
              >
                <FontAwesomeIcon icon={faSync} className="mr-2" />
                Refresh
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleExport}
              >
                <FontAwesomeIcon icon={faDownload} className="mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <AlertSummaryCards stats={alertStats} loading={loading} />

        {/* Alerts Table */}
        <AlertsTable 
          alerts={alerts}
          loading={loading}
          error={error}
          filters={filters}
          onFilterChange={handleFilterChange}
          pagination={pagination}
          onPageChange={handlePageChange}
          selectedAlerts={selectedAlerts}
          onSelectionChange={handleSelectionChange}
          onBulkAction={handleBulkAction}
          onViewAlert={handleViewAlert}
          onUpdateStatus={(alertId) => setStatusUpdateModal({ visible: true, alertId })}
          filterCounts={alertStats.by_status}
        />
        
        {/* Modals */}
        <AlertDetailsModal 
          visible={alertDetailsModal.visible}
          alertDetails={alertDetailsModal.alertDetails}
          loading={alertDetailsModal.loading}
          onClose={() => setAlertDetailsModal(prev => ({ ...prev, visible: false }))}
        />
        
        <StatusUpdateModal 
          visible={statusUpdateModal.visible}
          alertId={statusUpdateModal.alertId}
          onClose={() => setStatusUpdateModal({ visible: false, alertId: null })}
          onUpdate={handleStatusUpdate}
        />
      </div>
    </div>
  );
}

export default AlertsPage;
