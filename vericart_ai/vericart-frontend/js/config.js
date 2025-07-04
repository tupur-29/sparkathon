// Configuration file for VeriCart AI Frontend
const CONFIG = {
    // API Configuration
    API_BASE_URL: 'http://localhost:8000',
    API_KEY: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    
    // WebSocket Configuration
    WS_URL: 'ws://localhost:8000/ws/dashboard',
    
    // Map Configuration
    MAP_CENTER: [39.8283, -98.5795], // Geographic center of US
    MAP_ZOOM: 5,
    
    // Refresh Intervals (in milliseconds)
    DASHBOARD_REFRESH_INTERVAL: 30000, // 30 seconds
    ALERTS_REFRESH_INTERVAL: 15000,    // 15 seconds
    MAP_REFRESH_INTERVAL: 10000,       // 10 seconds
    
    // Pagination
    DEFAULT_PAGE_SIZE: 20,
    MAX_ALERTS_DISPLAY: 100,
    
    // Chart Colors
    CHART_COLORS: {
        primary: '#3b82f6',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#06b6d4',
        purple: '#8b5cf6'
    },
    
    // Notification Settings
    NOTIFICATION_TIMEOUT: 5000, // 5 seconds
    
    // Risk Score Thresholds
    RISK_THRESHOLDS: {
        HIGH: 70,
        MEDIUM: 40,
        LOW: 0
    },
    
    // Demo Mode (for testing without backend)
    DEMO_MODE: false,
    
    // Feature Flags
    FEATURES: {
        REAL_TIME_ALERTS: true,
        VISION_VERIFICATION: true,
        GAMIFICATION: true,
        ANALYTICS: true,
        MOBILE_SIMULATOR: true
    }
};

// Export for ES6 modules or make global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
