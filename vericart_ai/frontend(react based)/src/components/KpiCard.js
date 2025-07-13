import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function KpiCard({ title, value, change, icon, iconBgColor, isValueColored, valueColor }) {
  const [currentValue, setCurrentValue] = useState(value);
  const [currentChange, setCurrentChange] = useState(change);
  const [changeColor, setChangeColor] = useState('text-green-400');

  useEffect(() => {
    // Simulate random changes for the demo
    const interval = setInterval(() => {
      if (typeof value === 'number') {
        const newValue = value + Math.floor(Math.random() * 100) - 50;
        setCurrentValue(newValue);
      } else if (typeof value === 'string' && value.includes('%')) {
        const numValue = parseFloat(value);
        const newValue = Math.min(100, Math.max(0, numValue + (Math.random() - 0.5) * 2));
        setCurrentValue(newValue.toFixed(1) + '%');
      }

      // Update change indicator
      const newChange = Math.random() * 15 - 5;
      const isPositive = newChange > 0;
      const arrow = isPositive ? '↑' : '↓';
      setCurrentChange(`${arrow} ${Math.abs(newChange).toFixed(1)}% from yesterday`);
      setChangeColor(isPositive ? 'text-green-400' : 'text-red-400');
    }, 5000);

    return () => clearInterval(interval);
  }, [value]);

  // Format numbers with commas
  const formatValue = (val) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <div className="kpi-card fade-in">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className={`text-3xl font-bold mt-2 ${isValueColored ? valueColor : 'text-white'}`}>
            {formatValue(currentValue)}
          </p>
          <p className={`${changeColor} text-sm mt-2`}>{currentChange}</p>
        </div>
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          <FontAwesomeIcon icon={icon} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export default KpiCard;
