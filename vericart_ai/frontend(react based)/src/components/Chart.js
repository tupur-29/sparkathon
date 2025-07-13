import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS } from 'chart.js/auto';

function Chart({ type, data, options, height }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  
  useEffect(() => {
    // Clean up any existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // Create new chart
    if (chartRef.current) {
      chartInstance.current = new ChartJS(chartRef.current, {
        type,
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          ...options
        }
      });
    }
    
    // Cleanup on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data, options]);
  
  return (
    <div style={{ height: height || '100%' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
}

export default Chart;
