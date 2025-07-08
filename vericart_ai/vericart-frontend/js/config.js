/*!
 * VeriCart AI Frontend Configuration
 * Centralized configuration management for the VeriCart application
 * Version: 1.0.0
 */

const CONFIG = {
    // === API Configuration ===
    API_BASE_URL: 'http://localhost:8000',
    API_KEY: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    API_VERSION: 'v1',
    REQUEST_TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
    
    // === WebSocket Configuration ===
    WS_URL: 'ws://localhost:8000/ws/dashboard',
    WS_RECONNECT_INTERVAL: 5000, // 5 seconds
    WS_MAX_RECONNECT_ATTEMPTS: 10,
    WS_HEARTBEAT_INTERVAL: 30000, // 30 seconds
    
    // === Map Configuration ===
    MAP_CENTER: [39.8283, -98.5795], // Geographic center of US
    MAP_ZOOM: 5,
    MAP_MAX_ZOOM: 18,
    MAP_MIN_ZOOM: 2,
    MAP_TILE_URL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    MAP_ATTRIBUTION: '© OpenStreetMap contributors',
    MARKER_TIMEOUT: 300000, // 5 minutes
    
    // === Refresh Intervals (in milliseconds) ===
    DASHBOARD_REFRESH_INTERVAL: 30000, // 30 seconds
    ALERTS_REFRESH_INTERVAL: 15000,    // 15 seconds
    MAP_REFRESH_INTERVAL: 10000,       // 10 seconds
    STATS_REFRESH_INTERVAL: 60000,     // 1 minute
    CHARTS_REFRESH_INTERVAL: 120000,   // 2 minutes
    
    // === Pagination and Limits ===
    DEFAULT_PAGE_SIZE: 20,
    MAX_ALERTS_DISPLAY: 100,
    MAX_SCAN_HISTORY: 50,
    MAX_INVESTIGATION_CASES: 25,
    INFINITE_SCROLL_THRESHOLD: 200, // pixels from bottom
    
    // === UI Theme Configuration ===
    CHART_COLORS: {
        primary: '#3b82f6',
        secondary: '#6b7280',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#06b6d4',
        purple: '#8b5cf6',
        pink: '#ec4899',
        indigo: '#6366f1',
        teal: '#14b8a6',
        orange: '#f97316',
        gray: '#6b7280'
    },
    
    // === Risk Assessment Configuration ===
    RISK_THRESHOLDS: {
        CRITICAL: 90,
        HIGH: 70,
        MEDIUM: 40,
        LOW: 0
    },
    
    RISK_COLORS: {
        CRITICAL: '#dc2626',
        HIGH: '#ef4444',
        MEDIUM: '#f59e0b',
        LOW: '#10b981',
        UNKNOWN: '#6b7280'
    },
    
    // === Notification Settings ===
    NOTIFICATION_TIMEOUT: 5000, // 5 seconds
    NOTIFICATION_POSITION: 'top-right',
    MAX_NOTIFICATIONS: 3,
    NOTIFICATION_TYPES: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    },
    
    // === Animation and Transitions ===
    ANIMATION_DURATION: 300, // milliseconds
    LOADING_DELAY: 100, // milliseconds
    DEBOUNCE_DELAY: 300, // milliseconds
    FADE_DURATION: 200, // milliseconds
    
    // === Data Validation ===
    PRODUCT_ID_PATTERN: /^[A-Z0-9]{2,3}-[0-9]{5,8}$/,
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_PATTERN: /^\+?[\d\s\-$$$$]{10,}$/,
    
    // === Cache Configuration ===
    CACHE_TTL: 300000, // 5 minutes
    CACHE_SIZE_LIMIT: 100, // number of entries
    CACHE_CLEANUP_INTERVAL: 600000, // 10 minutes
    
    // === Security Configuration ===
    CSP_NONCE: null, // Set dynamically if needed
    ALLOWED_ORIGINS: [
        'http://localhost:3000',
        'http://localhost:8000',
        'https://vericart.com'
    ],
    
    // === Feature Flags ===
    FEATURES: {
        REAL_TIME_ALERTS: true,
        VISION_VERIFICATION: true,
        GAMIFICATION: true,
        ANALYTICS: true,
        MOBILE_SIMULATOR: true,
        DARK_MODE: true,
        OFFLINE_MODE: true,
        EXPORT_FUNCTIONALITY: true,
        BATCH_OPERATIONS: true,
        ADVANCED_FILTERING: true,
        CHART_ANIMATIONS: true,
        SOUND_NOTIFICATIONS: false,
        KEYBOARD_SHORTCUTS: true,
        AUTO_SAVE: true,
        COMPRESSION: true
    },
    
    // === Performance Configuration ===
    PERFORMANCE: {
        LAZY_LOADING: true,
        VIRTUAL_SCROLLING: true,
        IMAGE_OPTIMIZATION: true,
        BUNDLE_SPLITTING: true,
        PRELOAD_CRITICAL: true,
        PREFETCH_ROUTES: true
    },
    
    // === Development Configuration ===
    DEMO_MODE: false,
    DEBUG_MODE: false,
    MOCK_DELAY: 1000, // milliseconds for mock API responses
    LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
    
    // === Localization ===
    DEFAULT_LOCALE: 'en-US',
    SUPPORTED_LOCALES: ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP', 'zh-CN'],
    DATE_FORMAT: 'YYYY-MM-DD',
    TIME_FORMAT: 'HH:mm:ss',
    DATETIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
    
    // === File Upload Configuration ===
    UPLOAD: {
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        CHUNK_SIZE: 1024 * 1024, // 1MB chunks
        CONCURRENT_UPLOADS: 3
    },
    
    // === Export Configuration ===
    EXPORT: {
        FORMATS: ['csv', 'json', 'xlsx', 'pdf'],
        MAX_RECORDS: 10000,
        BATCH_SIZE: 1000,
        FILENAME_PREFIX: 'vericart_export_'
    },
    
    // === Analytics Configuration ===
    ANALYTICS: {
        TRACKING_ID: null, // Set if using Google Analytics
        COLLECT_PERFORMANCE: true,
        COLLECT_ERRORS: true,
        SAMPLE_RATE: 1.0,
        CUSTOM_DIMENSIONS: {
            USER_TYPE: 'dimension1',
            FEATURE_USAGE: 'dimension2',
            ERROR_TYPE: 'dimension3'
        }
    },
    
    // === Keyboard Shortcuts ===
    SHORTCUTS: {
        DASHBOARD: 'Ctrl+1',
        INVESTIGATION: 'Ctrl+2',
        ALERTS: 'Ctrl+3',
        ANALYTICS: 'Ctrl+4',
        MOBILE: 'Ctrl+5',
        REFRESH: 'Ctrl+R',
        SEARCH: 'Ctrl+K',
        HELP: 'F1',
        TOGGLE_DARK_MODE: 'Ctrl+D',
        EXPORT: 'Ctrl+E'
    },
    
    // === Error Messages ===
    ERROR_MESSAGES: {
        NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
        API_ERROR: 'Unable to connect to the server. Please try again later.',
        VALIDATION_ERROR: 'Please check your input and try again.',
        PERMISSION_ERROR: 'You do not have permission to perform this action.',
        TIMEOUT_ERROR: 'Request timed out. Please try again.',
        UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
    },
    
    // === Success Messages ===
    SUCCESS_MESSAGES: {
        PRODUCT_VERIFIED: 'Product verified successfully!',
        ALERT_ACKNOWLEDGED: 'Alert acknowledged.',
        DATA_EXPORTED: 'Data exported successfully.',
        SETTINGS_SAVED: 'Settings saved successfully.',
        CACHE_CLEARED: 'Cache cleared successfully.'
    },
    
    // === Storage Keys ===
    STORAGE_KEYS: {
        THEME: 'vericart_theme',
        LANGUAGE: 'vericart_language',
        USER_PREFERENCES: 'vericart_user_preferences',
        CACHE_PREFIX: 'vericart_cache_',
        SESSION_TOKEN: 'vericart_session_token',
        DASHBOARD_LAYOUT: 'vericart_dashboard_layout'
    },
    
    // === Environment Detection ===
    IS_DEVELOPMENT: location.hostname === 'localhost' || location.hostname === '127.0.0.1',
    IS_PRODUCTION: location.protocol === 'https:' && !location.hostname.includes('localhost'),
    IS_MOBILE: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    IS_TOUCH_DEVICE: 'ontouchstart' in window,
    
    // === Browser Compatibility ===
    BROWSER_SUPPORT: {
        CHROME: 70,
        FIREFOX: 65,
        SAFARI: 12,
        EDGE: 79,
        IE: null // Not supported
    },
    
    // === Utility Functions ===
    utils: {
        // Get environment-specific API URL
        getApiUrl() {
            return CONFIG.IS_PRODUCTION ? CONFIG.API_BASE_URL.replace('localhost:8000', 'api.vericart.com') : CONFIG.API_BASE_URL;
        },
        
        // Get WebSocket URL
        getWsUrl() {
            return CONFIG.IS_PRODUCTION ? CONFIG.WS_URL.replace('ws://localhost:8000', 'wss://api.vericart.com') : CONFIG.WS_URL;
        },
        
        // Check if feature is enabled
        isFeatureEnabled(feature) {
            return CONFIG.FEATURES[feature] === true;
        },
        
        // Get risk level from score
        getRiskLevel(score) {
            if (score >= CONFIG.RISK_THRESHOLDS.CRITICAL) return 'CRITICAL';
            if (score >= CONFIG.RISK_THRESHOLDS.HIGH) return 'HIGH';
            if (score >= CONFIG.RISK_THRESHOLDS.MEDIUM) return 'MEDIUM';
            return 'LOW';
        },
        
        // Get risk color from score
        getRiskColor(score) {
            const level = this.getRiskLevel(score);
            return CONFIG.RISK_COLORS[level];
        },
        
        // Format currency
        formatCurrency(amount, currency = 'USD') {
            return new Intl.NumberFormat(CONFIG.DEFAULT_LOCALE, {
                style: 'currency',
                currency: currency
            }).format(amount);
        },
        
        // Format date
        formatDate(date, format = CONFIG.DATETIME_FORMAT) {
            return new Date(date).toLocaleString(CONFIG.DEFAULT_LOCALE);
        },
        
        // Validate product ID
        isValidProductId(productId) {
            return CONFIG.PRODUCT_ID_PATTERN.test(productId);
        },
        
        // Get storage key
        getStorageKey(key) {
            return `${CONFIG.STORAGE_KEYS.CACHE_PREFIX}${key}`;
        },
        
        // Check browser compatibility
        isBrowserSupported() {
            const userAgent = navigator.userAgent;
            // Add browser detection logic here
            return true; // Simplified for now
        }
    }
};

// Freeze the configuration to prevent accidental modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.CHART_COLORS);
Object.freeze(CONFIG.RISK_THRESHOLDS);
Object.freeze(CONFIG.FEATURES);
Object.freeze(CONFIG.SHORTCUTS);

// Export for ES6 modules or make global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}

// Log configuration in development mode
if (CONFIG.IS_DEVELOPMENT && CONFIG.DEBUG_MODE) {
    console.log('VeriCart Configuration Loaded:', CONFIG);
}
