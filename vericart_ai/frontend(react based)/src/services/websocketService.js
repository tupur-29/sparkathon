// Mock WebSocket service for analytics real-time updates

export const setupWebSocket = ({ onConnect, onDisconnect, onError, onData }) => {
  // Simulate connecting
  setTimeout(() => {
    onConnect();
    
    // Simulate occasional data updates
    const dataInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const updateTypes = ['business_impact', 'ml_performance'];
        const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
        
        let payload = {};
        if (randomType === 'business_impact') {
          payload = {
            lossesPrevented: {
              value: Math.round(2.4 * (1 + (Math.random() * 0.1 - 0.05)) * 1000000),
              change: `+${(15.3 + (Math.random() * 2 - 1)).toFixed(1)}%`
            }
          };
        } else {
          // ML performance update
          payload = {
            // Add payload as needed
          };
        }
        
        onData({
          type: randomType,
          timestamp: new Date().toISOString(),
          payload
        });
      }
    }, 15000); // Every 15 seconds
    
    // Simulate occasional disconnects (very rare)
    const disconnectInterval = setInterval(() => {
      if (Math.random() > 0.95) {
        clearInterval(dataInterval);
        clearInterval(disconnectInterval);
        onDisconnect();
        
        // Reconnect after a short delay
        setTimeout(() => {
          setupWebSocket({ onConnect, onDisconnect, onError, onData });
        }, 5000);
      }
    }, 60000); // Check every minute
    
    // Return cleanup function
    return () => {
      clearInterval(dataInterval);
      clearInterval(disconnectInterval);
    };
  }, 1500);
  
  // Return dummy disconnect function for initial setup
  return () => {};
};
