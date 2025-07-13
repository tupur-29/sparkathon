// Chart options utility for consistent styling

export const getChartOptions = (type, title = '') => {
  // Base options for all chart types
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: false
      },
      legend: {
        labels: {
          color: '#D1D5DB'
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: '#374151'
        },
        ticks: {
          color: '#9CA3AF'
        }
      },
      y: {
        grid: {
          color: '#374151'
        },
        ticks: {
          color: '#9CA3AF'
        }
      }
    }
  };
  
  // Specific options based on chart type
  switch (type) {
    case 'doughnut':
    case 'pie':
      return {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          legend: {
            position: 'bottom',
            labels: {
              color: '#D1D5DB',
              padding: 20,
              font: {
                size: 12
              }
            }
          }
        },
        cutout: '60%'
      };
      
    case 'bar':
      return {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          legend: {
            display: false
          }
        },
        indexAxis: 'x'
      };
      
    case 'radar':
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          r: {
            angleLines: {
              color: '#374151'
            },
            grid: {
              color: '#374151'
            },
            pointLabels: {
              color: '#9CA3AF',
              font: {
                size: 12
              }
            },
            ticks: {
              backdropColor: 'transparent',
              color: '#9CA3AF'
            }
          }
        }
      };
      
    case 'scatter':
      return {
        ...baseOptions,
        plugins: {
          ...baseOptions.plugins,
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
