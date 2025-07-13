import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChartBar, 
  faBrain, 
  faMagic, 
  faTrendingUp
} from '@fortawesome/free-solid-svg-icons';

function AnalyticsTabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'business-impact', label: 'Business Impact', icon: faChartBar },
    { id: 'ml-performance', label: 'ML Performance', icon: faBrain },
    { id: 'predictive', label: 'Predictive Models', icon: faMagic },
    { id: 'trends', label: 'Trends Analysis', icon: faTrendingUp }
  ];
  
  return (
    <div className="mb-6">
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`analytics-tab py-2 px-1 border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 font-medium text-sm text-white'
                  : 'border-transparent font-medium text-sm text-gray-400 hover:text-white'
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <FontAwesomeIcon icon={tab.icon} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default AnalyticsTabs;
