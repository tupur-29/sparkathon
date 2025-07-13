import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

function Notification({ message, type = 'info', duration = 4000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  const [transform, setTransform] = useState('translateX(400px)');
  
  useEffect(() => {
    // Animate in
    setTimeout(() => {
      setTransform('translateX(0)');
    }, 100);
    
    // Animate out after duration
    const timeout = setTimeout(() => {
      setTransform('translateX(400px)');
      setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, 300);
    }, duration);
    
    return () => clearTimeout(timeout);
  }, [duration, onClose]);
  
  if (!isVisible) return null;
  
  const getIcon = () => {
    switch (type) {
      case 'success': return faCheckCircle;
      case 'error': return faExclamationCircle;
      default: return faInfoCircle;
    }
  };
  
  const getBackgroundColor = () => {
    switch (type) {
      case 'success': return '#059669';
      case 'error': return '#DC2626';
      default: return '#3B82F6';
    }
  };
  
  const styles = {
    position: 'fixed',
    top: '80px',
    right: '20px',
    background: getBackgroundColor(),
    color: 'white',
    padding: '16px 20px',
    borderRadius: '8px',
    zIndex: 1001,
    transform,
    transition: 'transform 0.3s ease',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
  };
  
  return (
    <div style={styles}>
      <div className="flex items-center space-x-3">
        <FontAwesomeIcon icon={getIcon()} />
        <span>{message}</span>
      </div>
    </div>
  );
}

export default Notification;
