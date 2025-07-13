import React from 'react';

function AlertFilters({ activeFilter, onFilterChange, filterCounts }) {
  const filters = [
    { id: 'all', label: 'All', count: Object.values(filterCounts).reduce((a, b) => a + b, 0) },
    { id: 'new', label: 'New', count: filterCounts.new || 0, className: 'bg-red-600' },
    { id: 'investigating', label: 'Investigating', count: filterCounts.investigating || 0, className: 'bg-yellow-600' },
    { id: 'resolved', label: 'Resolved', count: filterCounts.resolved || 0, className: 'bg-green-600' }
  ];

  return (
    <div className="flex items-center space-x-4 mb-4 lg:mb-0">
      <h2 className="text-xl font-bold text-white">Active Alerts</h2>
      <div className="flex space-x-2">
        {filters.map(filter => (
          <button
            key={filter.id}
            className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
            onClick={() => onFilterChange(filter.id)}
          >
            {filter.label}{' '}
            <span className={`ml-1 ${filter.className || 'bg-gray-600'} px-2 py-1 rounded-full text-xs`}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default AlertFilters;
