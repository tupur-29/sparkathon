import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function InvestigationTabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="mb-6">
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`investigation-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <FontAwesomeIcon icon={tab.icon} className="mr-2" />
              {tab.text}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default InvestigationTabs;
