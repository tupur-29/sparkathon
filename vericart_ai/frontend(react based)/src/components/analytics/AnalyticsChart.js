import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { getChartOptions } from '../../utils/chartOptions';

function AnalyticsChart({ id, type, data, title, height = 300, options = {} }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
  useEffect(() => {
    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Skip if no data or canvas element
    if (!data || !chartRef.current) return;
    
    // Create chart
    const ctx = chartRef.current.getContext('2d');
    const defaultOptions = getChartOptions(type, title);
    
    chartInstance.current = new Chart(ctx, {
      type,
      data,
      options: { ...defaultOptions, ...options }
    });
    
    // Cleanup
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, type, title, options]);
  
  return (
    <div style={{ height: `${height}px`, position: 'relative' }}>
      <canvas 
        ref={chartRef} 
        id={id} 
        width="400" 
        height={height}
      ></canvas>
      {!data && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="loading mx-auto"></div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsChart;
