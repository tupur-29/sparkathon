import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTachometerAlt, 
  faSearch, 
  faExclamationTriangle,
  faChartLine,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';

function Navigation() {
  const [activeItem, setActiveItem] = useState('Dashboard');

  const navItems = [
    { name: 'Dashboard', icon: faTachometerAlt },
    { name: 'Investigation', icon: faSearch },
    { name: 'Alerts Center', icon: faExclamationTriangle },
    { name: 'Analytics', icon: faChartLine }
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gray-900 shadow-2xl z-50">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <FontAwesomeIcon icon={faShieldAlt} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">VeriCart AI</h1>
            <p className="text-gray-400 text-sm">Brand Protection</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        <div className="px-4 space-y-2">
          {navItems.map((item) => (
            <a 
              key={item.name}
              href="#"
              className={`nav-item p-3 rounded-lg flex items-center space-x-3 ${
                activeItem === item.name 
                ? 'active text-white' 
                : 'text-gray-300 hover:text-white'
              }`}
              onClick={(e) => {
                e.preventDefault();
                setActiveItem(item.name);
              }}
            >
              <FontAwesomeIcon icon={item.icon} className="w-5" />
              <span>{item.name}</span>
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default Navigation;
