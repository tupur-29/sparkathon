import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faChevronDown, 
  faTasks,
  faChevronLeft,
  faChevronRight,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import AlertRow from './AlertRow';
import AlertFilters from './AlertFilters';
import AlertPagination from './AlertPagination';
import BulkActions from './BulkActions';

function AlertsTable({ 
  alerts, 
  loading, 
  error, 
  filters, 
  onFilterChange, 
  pagination, 
  onPageChange, 
  selectedAlerts, 
  onSelectionChange, 
  onBulkAction, 
  onViewAlert, 
  onUpdateStatus,
  filterCounts
}) {
  // Toggle select all
  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = new Set(alerts.map(alert => alert.id));
      onSelectionChange(allIds);
    } else {
      onSelectionChange(new Set());
    }
  };
  
  // Handle individual alert selection
  const handleSelectAlert = (alertId, checked) => {
    const newSelection = new Set(selectedAlerts);
    
    if (checked) {
      newSelection.add(alertId);
    } else {
      newSelection.delete(alertId);
    }
    
    onSelectionChange(newSelection);
  };
  
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      {/* Filters and Controls */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <AlertFilters 
          activeFilter={filters.status}
          onFilterChange={(status) => onFilterChange({ status })}
          filterCounts={filterCounts || {}}
        />

        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search alerts..." 
              className="form-input pl-10 w-64"
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
            />
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            />
          </div>

          {/* Sort */}
          <select 
            className="form-input"
            value={`${filters.sortBy}_${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('_');
              onFilterChange({ sortBy, sortOrder });
            }}
          >
            <option value="timestamp_desc">Newest First</option>
            <option value="timestamp_asc">Oldest First</option>
            <option value="risk_score_desc">Highest Risk</option>
            <option value="risk_score_asc">Lowest Risk</option>
          </select>

          {/* Bulk Actions */}
          <BulkActions 
            selectedCount={selectedAlerts.size}
            onAction={onBulkAction}
          />
        </div>
      </div>

      {/* Alerts Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left py-3 px-4">
                <input 
                  type="checkbox" 
                  className="rounded"
                  checked={selectedAlerts.size > 0 && selectedAlerts.size === alerts.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Alert</th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Product</th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Risk Score</th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Timestamp</th>
              <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
