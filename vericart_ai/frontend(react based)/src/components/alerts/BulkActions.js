import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTasks, faChevronDown } from '@fortawesome/free-solid-svg-icons';

function BulkActions({ selectedCount, onAction }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        className="btn btn-secondary"
        disabled={selectedCount === 0}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <FontAwesomeIcon icon={faTasks} className="mr-2" />
        Bulk Actions ({selectedCount})
        <FontAwesomeIcon icon={faChevronDown} className="ml-2" />
      </button>
      
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-700 rounded-lg shadow-lg z-10">
          <div className="py-1">
            <button 
              className="block w-full text-left px-4 py-2 text-white hover:bg-gray-600"
              onClick={() => {
                onAction('investigating');
                setMenuOpen(false);
              }}
            >
              Mark as Investigating
            </button>
            <button 
              className="block w-full text-left px-4 py-2 text-white hover:bg-gray-600"
              onClick={() => {
                onAction('resolved');
                setMenuOpen(false);
              }}
            >
              Mark as Resolved
            </button>
            <button 
              className="block w-full text-left px-4 py-2 text-white hover:bg-gray-600"
              onClick={() => {
                onAction('dismissed');
                setMenuOpen(false);
              }}
            >
              Dismiss Selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BulkActions;
