import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faTachometerAlt, 
  faSearch, 
  faExclamationTriangle,
  faChartLine,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';

function Navigation() {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', icon: faTachometerAlt, path: '/' },
    { name: 'Investigation', icon: faSearch, path: '/investigation' },
    { name: 'Alerts Center', icon: faExclamationTriangle, path: '/alerts' },
    { name: 'Analytics', icon: faChartLine, path: '/analytics' }
  ];

  // Function to determine if a nav item is active
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

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
            <Link 
              key={item.name}
              to={item.path}
              className={`nav-item p-3 rounded-lg flex items-center space-x-3 ${
                isActive(item.path) 
                ? 'active text-white' 
                : 'text-gray-300 hover:text-white'
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export default Navigation;
