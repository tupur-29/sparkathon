/*!
 * VeriCart API Service
 * Handles all API communications and data management
 * Version: 1.0.0
 */

// Configuration fallback if CONFIG is not defined
const API_CONFIG = {
    API_BASE_URL: 'https://api.vericart.com/v1',
    API_KEY: 'demo-key-12345',
    DEFAULT_PAGE_SIZE: 20,
    REQUEST_TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
};

// Merge with global CONFIG if available
const config = typeof CONFIG !== 'undefined' ? { ...API_CONFIG, ...CONFIG } : API_CONFIG;

class APIService {
    constructor() {
        this.baseURL = config.API_BASE_URL;
        this.apiKey = config.API_KEY;
        this.timeout = config.REQUEST_TIMEOUT || 30000;
        this.retryAttempts = config.RETRY_ATTEMPTS || 3;
        this.retryDelay = config.RETRY_DELAY || 1000;
        this.isOnline = true;
        this.headers = {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey,
            'X-Client-Version': '1.0.0'
        };
        
        // Initialize connection status checking
        this.checkConnectionStatus();
    }

    // Check connection status
    async checkConnectionStatus() {
        try {
            const isHealthy = await this.healthCheck();
            this.isOnline = isHealthy;
            this.updateConnectionStatus(isHealthy);
        } catch (error) {
            this.isOnline = false;
            this.updateConnectionStatus(false);
        }
    }

    // Update connection status in UI
    updateConnectionStatus(isOnline) {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        if (statusIndicator && statusText) {
            if (isOnline) {
                statusIndicator.className = 'status-indicator w-2 h-2 bg-green-500 rounded-full animate-pulse';
                statusText.textContent = 'System Online';
            } else {
                statusIndicator.className = 'status-indicator w-2 h-2 bg-red-500 rounded-full animate-pulse';
                statusText.textContent = 'System Offline';
            }
        }
    }

    // Generic API request method with retry logic
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.headers,
            timeout: this.timeout,
            ...options
        };

        let lastError;
        
        for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);
                
                const response = await fetch(url, {
                    ...config,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`API Error: ${response.status} - ${response.statusText}`);
                }

                const data = await response.json();
                
                // Update online status on successful request
                if (!this.isOnline) {
                    this.isOnline = true;
                    this.updateConnectionStatus(true);
                }
                
                return data;
            } catch (error) {
                lastError = error;
                console.warn(`API Request attempt ${attempt + 1} failed for ${endpoint}:`, error.message);
                
                // Update offline status
                if (this.isOnline) {
                    this.isOnline = false;
                    this.updateConnectionStatus(false);
                }
                
                // Don't retry on the last attempt
                if (attempt < this.retryAttempts) {
                    await this.sleep(this.retryDelay * Math.pow(2, attempt)); // Exponential backoff
                }
            }
        }
        
        console.error(`API Request failed after ${this.retryAttempts + 1} attempts for ${endpoint}:`, lastError);
        throw lastError;
    }

    // Sleep utility for retry delays
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Dashboard Statistics
    async getDashboardStats() {
        try {
            const stats = await this.request('/dashboard/stats');
            return stats;
        } catch (error) {
            console.warn('Using mock dashboard stats due to API failure');
            return this.getMockDashboardStats();
        }
    }

    // Get Product Details
    async getProduct(productId) {
        try {
            return await this.request(`/products/${productId}`);
        } catch (error) {
            console.warn(`Using mock product data for ${productId}`);
            return this.getMockProduct(productId);
        }
    }

    // Verify Product via NFC/QR Code
    async verifyProduct(productId, latitude, longitude, userId = null) {
        const payload = {
            id: productId,
            latitude: latitude,
            longitude: longitude,
            user_id: userId,
            timestamp: new Date().toISOString()
        };

        try {
            return await this.request('/verify', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.warn(`Using mock verification for product ${productId}`);
            return this.getMockVerification(productId);
        }
    }

    // Get Alerts
    async getAlerts(status = null, skip = 0, limit = config.DEFAULT_PAGE_SIZE) {
        let endpoint = `/alerts?skip=${skip}&limit=${limit}`;
        if (status && status !== 'all') {
            endpoint += `&status=${status}`;
        }

        try {
            return await this.request(endpoint);
        } catch (error) {
            console.warn('Using mock alerts data');
            return this.getMockAlerts();
        }
    }

    // Update Alert Status
    async updateAlertStatus(alertId, newStatus, notes = null) {
        const payload = {
            new_status: newStatus,
            notes: notes,
            updated_at: new Date().toISOString()
        };

        try {
            return await this.request(`/alerts/${alertId}/status`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.warn(`Mock update for alert ${alertId} to status ${newStatus}`);
            return { success: true, alert_id: alertId, new_status: newStatus };
        }
    }

    // Get Business Metrics
    async getBusinessMetrics() {
        try {
            return await this.request('/analytics/business-metrics');
        } catch (error) {
            console.warn('Using mock business metrics');
            return this.getMockBusinessMetrics();
        }
    }

    // Get Analytics Data
    async getAnalytics(timeRange = '7d', metric = 'all') {
        try {
            return await this.request(`/analytics?range=${timeRange}&metric=${metric}`);
        } catch (error) {
            console.warn('Using mock analytics data');
            return this.getMockAnalytics();
        }
    }

    // Get User Gamification Profile
    async getUserProfile(userId) {
        try {
            return await this.request(`/users/${userId}/profile`);
        } catch (error) {
            console.warn(`Using mock user profile for ${userId}`);
            return this.getMockUserProfile(userId);
        }
    }

    // Get Scan History
    async getScanHistory(productId, limit = 10) {
        try {
            return await this.request(`/products/${productId}/scans?limit=${limit}`);
        } catch (error) {
            console.warn(`Using mock scan history for ${productId}`);
            return this.getMockScanHistory(productId);
        }
    }

    // Get Suppliers
    async getSuppliers(skip = 0, limit = config.DEFAULT_PAGE_SIZE) {
        try {
            return await this.request(`/suppliers?skip=${skip}&limit=${limit}`);
        } catch (error) {
            console.warn('Using mock suppliers data');
            return this.getMockSuppliers();
        }
    }

    // Get Investigation Cases
    async getInvestigationCases(status = 'active') {
        try {
            return await this.request(`/investigations?status=${status}`);
        } catch (error) {
            console.warn('Using mock investigation cases');
            return this.getMockInvestigationCases();
        }
    }

    // Upload Image for Vision Verification
    async uploadImageForVerification(imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('timestamp', new Date().toISOString());

        try {
            const response = await fetch(`${this.baseURL}/verify/image`, {
                method: 'POST',
                headers: {
                    'X-API-Key': this.apiKey
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Image upload failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.warn('Using mock image verification');
            return this.getMockImageVerification();
        }
    }

    // Health Check
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/health`, {
                method: 'GET',
                headers: { 'X-API-Key': this.apiKey },
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // Batch Operations
    async batchUpdateAlerts(alertIds, newStatus) {
        const payload = {
            alert_ids: alertIds,
            new_status: newStatus,
            updated_at: new Date().toISOString()
        };

        try {
            return await this.request('/alerts/batch-update', {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        } catch (error) {
            console.warn('Using mock batch update');
            return { success: true, updated_count: alertIds.length };
        }
    }

    // Export Data
    async exportData(dataType, filters = {}) {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = `/export/${dataType}?${queryParams}`;

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`Export failed: ${response.status}`);
            }

            return await response.blob();
        } catch (error) {
            console.warn('Using mock export data');
            return this.getMockExportData(dataType);
        }
    }

    // === MOCK DATA METHODS ===

    getMockDashboardStats() {
        const now = new Date();
        const variations = [
            () => Math.floor(Math.random() * 10000) + 40000,
            () => Math.floor(Math.random() * 500) + 150,
            () => Math.floor(Math.random() * 10) + 85,
            () => ['LOW', 'NORMAL', 'ELEVATED', 'HIGH'][Math.floor(Math.random() * 4)]
        ];

        return {
            total_scans_24h: variations[0](),
            total_anomalies_24h: variations[1](),
            customer_trust_score: variations[2](),
            threat_level: variations[3](),
            threat_percentage: Math.floor(Math.random() * 100),
            highest_risk_products: [
                { name: 'iPhone 15 Pro', count: 45 },
                { name: 'Samsung Galaxy S24', count: 38 },
                { name: 'AirPods Pro', count: 32 },
                { name: 'MacBook Pro', count: 28 },
                { name: 'PlayStation 5', count: 25 }
            ],
            highest_risk_regions: [
                { name: 'New York', count: 89 },
                { name: 'Los Angeles', count: 67 },
                { name: 'Chicago', count: 54 },
                { name: 'Houston', count: 42 },
                { name: 'Phoenix', count: 38 }
            ],
            recent_scans: [
                { latitude: 40.7128, longitude: -74.0060, timestamp: new Date(now.getTime() - 60000) },
                { latitude: 34.0522, longitude: -118.2437, timestamp: new Date(now.getTime() - 120000) },
                { latitude: 41.8781, longitude: -87.6298, timestamp: new Date(now.getTime() - 180000) }
            ],
            timestamp: now.toISOString()
        };
    }

    getMockProduct(productId) {
        return {
            id: productId,
            name: `Product ${productId}`,
            category: 'Electronics',
            brand: 'VeriCart',
            description: 'High-quality verified product',
            manufacturing_date: '2024-01-15',
            batch_number: `B${Math.floor(Math.random() * 10000)}`,
            is_authentic: Math.random() > 0.2,
            verification_count: Math.floor(Math.random() * 100),
            risk_score: Math.floor(Math.random() * 100)
        };
    }

    getMockVerification(productId) {
        const isAuthentic = Math.random() > 0.3;
        return {
            product_id: productId,
            is_authentic: isAuthentic,
            confidence_score: Math.floor(Math.random() * 20) + 80,
            verification_time: new Date().toISOString(),
            risk_factors: isAuthentic ? [] : ['Location mismatch', 'Unusual scan pattern'],
            message: isAuthentic ? 'Product verified as authentic' : 'Product failed verification - potential counterfeit detected'
        };
    }

    getMockAlerts() {
        const now = new Date();
        return [
            {
                id: 1,
                title: 'High-Risk Product Activity',
                description: 'Product #WM-78394 scanned in NYC and London within 8 minutes',
                severity: 'critical',
                status: 'active',
                timestamp: new Date(now.getTime() - 300000).toISOString(),
                location: 'New York, NY',
                product_id: 'WM-78394',
                risk_score: 94
            },
            {
                id: 2,
                title: 'Suspicious Scan Cluster',
                description: '15 identical products scanned in same location within 1 hour',
                severity: 'high',
                status: 'active',
                timestamp: new Date(now.getTime() - 600000).toISOString(),
                location: 'Los Angeles, CA',
                product_id: 'WM-45612',
                risk_score: 78
            },
                        {
                id: 3,
                title: 'Batch Verification Anomaly',
                description: 'Multiple products from batch B-2024-001 showing unusual verification patterns',
                severity: 'high',
                status: 'acknowledged',
                timestamp: new Date(now.getTime() - 900000).toISOString(),
                location: 'Chicago, IL',
                product_id: 'WM-23456',
                risk_score: 85
            },
            {
                id: 4,
                title: 'Geolocation Mismatch',
                description: 'Product verified in multiple distant locations simultaneously',
                severity: 'medium',
                status: 'resolved',
                timestamp: new Date(now.getTime() - 1800000).toISOString(),
                location: 'Houston, TX',
                product_id: 'WM-67890',
                risk_score: 62
            },
            {
                id: 5,
                title: 'Unusual Scan Velocity',
                description: 'Single product scanned 50+ times in 24 hours',
                severity: 'low',
                status: 'active',
                timestamp: new Date(now.getTime() - 3600000).toISOString(),
                location: 'Phoenix, AZ',
                product_id: 'WM-11223',
                risk_score: 45
            }
        ];
    }

    getMockBusinessMetrics() {
        return {
            estimated_losses_prevented: 2800000,
            fraudulent_returns_reduction_index: 340000,
            supply_chain_efficiency_score: 87.5,
            customer_satisfaction_improvement: 12.3,
            brand_trust_improvement: 8.7,
            counterfeit_detection_rate: 94.2,
            false_positive_rate: 2.1,
            monthly_savings: 450000,
            roi_percentage: 325
        };
    }

    getMockAnalytics() {
        const generateTimeSeriesData = (days = 7) => {
            const data = [];
            const now = new Date();
            
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
                data.push({
                    date: date.toISOString().split('T')[0],
                    scans: Math.floor(Math.random() * 1000) + 500,
                    anomalies: Math.floor(Math.random() * 50) + 10,
                    authenticity_rate: Math.floor(Math.random() * 20) + 80
                });
            }
            return data;
        };

        return {
            time_series: generateTimeSeriesData(),
            top_categories: [
                { name: 'Electronics', percentage: 35, scans: 15420 },
                { name: 'Fashion', percentage: 28, scans: 12340 },
                { name: 'Automotive', percentage: 15, scans: 6610 },
                { name: 'Pharmaceuticals', percentage: 12, scans: 5290 },
                { name: 'Luxury Goods', percentage: 10, scans: 4400 }
            ],
            regional_breakdown: [
                { region: 'North America', percentage: 45, scans: 19800 },
                { region: 'Europe', percentage: 30, scans: 13200 },
                { region: 'Asia Pacific', percentage: 20, scans: 8800 },
                { region: 'Latin America', percentage: 3, scans: 1320 },
                { region: 'Middle East & Africa', percentage: 2, scans: 880 }
            ],
            performance_metrics: {
                avg_response_time: 1.2,
                uptime_percentage: 99.7,
                api_success_rate: 98.5,
                database_performance: 0.45
            }
        };
    }

    getMockUserProfile(userId) {
        return {
            user_id: userId,
            username: `User${userId}`,
            email: `user${userId}@example.com`,
            total_scans: Math.floor(Math.random() * 1000) + 100,
            successful_verifications: Math.floor(Math.random() * 800) + 80,
            points_earned: Math.floor(Math.random() * 5000) + 1000,
            level: Math.floor(Math.random() * 10) + 1,
            badges: ['First Scan', 'Fraud Fighter', 'Trusted Verifier'],
            join_date: '2024-01-01',
            last_active: new Date().toISOString(),
            reputation_score: Math.floor(Math.random() * 100) + 1
        };
    }

    getMockScanHistory(productId) {
        const history = [];
        const now = new Date();
        
        for (let i = 0; i < 10; i++) {
            history.push({
                id: i + 1,
                product_id: productId,
                timestamp: new Date(now.getTime() - (i * 3600000)).toISOString(),
                location: {
                    latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
                    longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
                    city: 'New York',
                    country: 'USA'
                },
                user_id: `user${Math.floor(Math.random() * 1000)}`,
                verification_result: Math.random() > 0.2 ? 'authentic' : 'suspicious',
                confidence_score: Math.floor(Math.random() * 40) + 60
            });
        }
        
        return history;
    }

    getMockSuppliers() {
        return [
            {
                id: 1,
                name: 'TechCorp Manufacturing',
                category: 'Electronics',
                country: 'China',
                verification_rate: 94.2,
                total_products: 15420,
                risk_score: 'Low',
                established: '2010'
            },
            {
                id: 2,
                name: 'Fashion Forward Ltd',
                category: 'Apparel',
                country: 'Vietnam',
                verification_rate: 87.5,
                total_products: 8930,
                risk_score: 'Medium',
                established: '2015'
            },
            {
                id: 3,
                name: 'Auto Parts Pro',
                category: 'Automotive',
                country: 'Germany',
                verification_rate: 98.1,
                total_products: 5670,
                risk_score: 'Low',
                established: '2008'
            }
        ];
    }

    getMockInvestigationCases() {
        return [
            {
                id: 'CASE-2024-001',
                title: 'Counterfeit Electronics Ring',
                description: 'Large-scale counterfeit electronics operation detected across multiple cities',
                status: 'active',
                priority: 'high',
                created_date: '2024-01-15',
                assigned_to: 'Investigation Team Alpha',
                products_involved: 45,
                estimated_loss: 2800000,
                leads_followed: 12,
                arrests_made: 0
            },
            {
                id: 'CASE-2024-002',
                title: 'Fashion Brand Forgery',
                description: 'Systematic forgery of luxury fashion items with sophisticated packaging',
                status: 'resolved',
                priority: 'medium',
                created_date: '2024-01-10',
                resolved_date: '2024-01-20',
                assigned_to: 'Investigation Team Beta',
                products_involved: 23,
                estimated_loss: 450000,
                leads_followed: 8,
                arrests_made: 3
            },
            {
                id: 'CASE-2024-003',
                title: 'Pharmaceutical Counterfeiting',
                description: 'Critical investigation into counterfeit pharmaceutical products',
                status: 'active',
                priority: 'critical',
                created_date: '2024-01-18',
                assigned_to: 'Investigation Team Gamma',
                products_involved: 12,
                estimated_loss: 1200000,
                leads_followed: 5,
                arrests_made: 0
            }
        ];
    }

    getMockImageVerification() {
        return {
            verification_id: `IMG-${Date.now()}`,
            is_authentic: Math.random() > 0.3,
            confidence_score: Math.floor(Math.random() * 30) + 70,
            detected_features: [
                'Logo authenticity',
                'Material texture',
                'Color accuracy',
                'Packaging quality'
            ],
            risk_factors: Math.random() > 0.7 ? ['Suspicious logo placement', 'Color variance'] : [],
            processing_time: Math.floor(Math.random() * 3) + 1,
            timestamp: new Date().toISOString()
        };
    }

    getMockExportData(dataType) {
        const csvData = `Type,Value,Date
${dataType},Sample Data 1,${new Date().toISOString()}
${dataType},Sample Data 2,${new Date().toISOString()}
${dataType},Sample Data 3,${new Date().toISOString()}`;
        
        return new Blob([csvData], { type: 'text/csv' });
    }

    // === UTILITY METHODS ===

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    // Format percentage
    formatPercentage(value) {
        return `${value.toFixed(1)}%`;
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Validate product ID format
    isValidProductId(productId) {
        return /^[A-Z0-9]{2,3}-[0-9]{5,8}$/.test(productId);
    }

    // Get risk level color
    getRiskLevelColor(riskScore) {
        if (riskScore >= 80) return '#ef4444'; // Red
        if (riskScore >= 60) return '#f59e0b'; // Orange
        if (riskScore >= 40) return '#eab308'; // Yellow
        return '#10b981'; // Green
    }

    // Cache management
    cache = new Map();
    
    setCache(key, data, ttl = 300000) { // 5 minutes default TTL
        const expiryTime = Date.now() + ttl;
        this.cache.set(key, { data, expiryTime });
    }
    
    getCache(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() < cached.expiryTime) {
            return cached.data;
        }
        this.cache.delete(key);
        return null;
    }
    
    clearCache() {
        this.cache.clear();
    }

    // Request with caching
    async requestWithCache(endpoint, options = {}, cacheTtl = 300000) {
        const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
        const cached = this.getCache(cacheKey);
        
        if (cached) {
            return cached;
        }
        
        try {
            const data = await this.request(endpoint, options);
            this.setCache(cacheKey, data, cacheTtl);
            return data;
        } catch (error) {
            throw error;
        }
    }

    // Debounced requests
    debounceTimers = new Map();
    
    debounce(func, delay, key) {
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }
        
        const timer = setTimeout(() => {
            func();
            this.debounceTimers.delete(key);
        }, delay);
        
        this.debounceTimers.set(key, timer);
    }

    // Event emitter for API status changes
    eventListeners = new Map();
    
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }
    
    emit(event, data) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => callback(data));
        }
    }
    
    off(event, callback) {
        if (this.eventListeners.has(event)) {
            const callbacks = this.eventListeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }
}

// Create global API instance
const apiService = new APIService();

// Auto-check connection status every 30 seconds
setInterval(() => {
    if (apiService) {
        apiService.checkConnectionStatus();
    }
}, 30000);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIService;
}
