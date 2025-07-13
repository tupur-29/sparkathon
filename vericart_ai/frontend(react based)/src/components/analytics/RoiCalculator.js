import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator } from '@fortawesome/free-solid-svg-icons';
import { formatCurrency } from '../../utils/formatters';

function RoiCalculator({ monthlySavings }) {
  const [inputs, setInputs] = useState({
    implementationCost: 150000,
    operatingCost: 25000,
    timePeriod: 12
  });
  
  const [results, setResults] = useState({
    totalInvestment: 0,
    totalSavings: 0,
    netBenefit: 0,
    roiPercentage: 0
  });
  
  const [showResults, setShowResults] = useState(false);
  
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [id]: parseFloat(value) || 0
    }));
  };
  
  const calculateROI = () => {
    const { implementationCost, operatingCost, timePeriod } = inputs;
    
    if (implementationCost === 0 || operatingCost === 0 || timePeriod === 0) {
      setShowResults(false);
      return;
    }
    
    const monthlySavingsValue = monthlySavings || 200000; // Default if not provided
    const totalInvestment = implementationCost + (operatingCost * timePeriod);
    const totalSavings = monthlySavingsValue * timePeriod;
    const netBenefit = totalSavings - totalInvestment;
    const roiPercentage = ((netBenefit / totalInvestment) * 100).toFixed(1);
    
    setResults({
      totalInvestment,
      totalSavings,
      netBenefit,
      roiPercentage
    });
    
    setShowResults(true);
  };
  
  useEffect(() => {
    // Auto-calculate when inputs change
    const debounceTimer = setTimeout(() => {
      calculateROI();
    }, 500);
    
    return () => clearTimeout(debounceTimer);
  }, [inputs, monthlySavings]);
  
  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white mb-4">ROI Calculator</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="implementationCost" className="block text-sm font-medium text-gray-300 mb-2">
            Implementation Cost
          </label>
          <input 
            type="number" 
            id="implementationCost" 
            value={inputs.implementationCost} 
            onChange={handleInputChange}
            className="form-input" 
            placeholder="Enter cost"
          />
        </div>
        <div>
          <label htmlFor="operatingCost" className="block text-sm font-medium text-gray-300 mb-2">
            Monthly Operating Cost
          </label>
          <input 
            type="number" 
            id="operatingCost" 
            value={inputs.operatingCost} 
            onChange={handleInputChange}
            className="form-input" 
            placeholder="Enter monthly cost"
          />
        </div>
        <div>
          <label htmlFor="timePeriod" className="block text-sm font-medium text-gray-300 mb-2">
            Time Period (months)
          </label>
          <input 
            type="number" 
            id="timePeriod" 
            value={inputs.timePeriod} 
            onChange={handleInputChange}
            className="form
