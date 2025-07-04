class APIService {
    constructor() {
        this.baseURL = CONFIG.API_BASE_URL;
        this.apiKey = CONFIG.API_KEY;
        this.headers = {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey
        };
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.headers,
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`API Request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    // Dashboard Statistics
    async getDashboardStats() {
        try {
            const stats = await this.request('/dashboard/stats');
            return stats;
        } catch (error) {
            // Return mock data if API fails
            return this.getMockDashboardStats();
        }
    }

    // Get Product Details
    async getProduct(productId) {
        try {
            return await this.request(`/products/${productId}`);
        } catch (error) {
            throw new Error(`Failed to get product ${productId}: ${error.message}`);
        }
    }

    // Verify Product via NFC
    async verifyProduct(productId, latitude, longitude, userId = null) {
        const payload = {
            id: productId,
            latitude: latitude,
            longitude: longitude,
            user_id: userId
        };

        try {
            return await this.request('/verify', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        } catch (error) {
            throw new Error(`Product verification failed: ${error.message}`);
        }
    }

    // Get Alerts
    async getAlerts(status = null, skip = 0, limit = CONFIG.DEFAULT_PAGE_SIZE) {
        let endpoint = `/alerts?skip=${skip}&limit=${limit}`;
        if (status && status !== 'all') {
            endpoint += `&status=${status}`;
        }

        try {
            return await this.request(endpoint);
        } catch (error) {
            console.error('Failed to fetch alerts:', error);
            return [];
        }
    }

    // Update Alert Status
    async updateAlertStatus(alertId, newStatus, notes = null) {
        const payload = {
            new_status: newStatus,
            notes: notes
        };

        try {
            return await this.request(`/alerts/${alertId}/status`, {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        } catch (error) {
            throw new Error(`Failed to update alert status: ${error.message}`);
        }
    }

    // Get Business Metrics
    async getBusinessMetrics() {
        try {
            return await this.request('/analytics/business-metrics');
        } catch (error) {
            console.error('Failed to fetch business metrics:', error);
            return this.getMockBusinessMetrics();
        }
    }

    // Get User Gamification Profile
    async getUserProfile(userId) {
        try {
            return await this.request(`/users/${userId}/profile`);
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            return null;
        }
    }

    // Get Scan History
    async getScanHistory(productId, limit = 10) {
        try {
            return await this.request(`/products/${productId}/scans?limit=${limit}`);
        } catch (error) {
            console.error('Failed to fetch scan history:', error);
            return [];
        }
    }

    // Get Suppliers
    async getSuppliers(skip = 0, limit = CONFIG.DEFAULT_PAGE_SIZE) {
        try {
            return await this.request(`/suppliers?skip=${skip}&limit=${limit}`);
        } catch (error) {
            console.error('Failed to fetch suppliers:', error);
            return [];
        }
    }

    // Get Educational Content
    async getEducationalContent(category = null) {
        let endpoint = '/educational-content';
        if (category) {
            endpoint += `?category=${category}`;
        }

        try {
            return await this.request(endpoint);
        } catch (error) {
            console.error('Failed to fetch educational content:', error);
            return [];
        }
    }

    // Upload Image for Vision Verification
    async uploadImageForVerification(imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);

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
            throw new Error(`Image verification failed: ${error.message}`);
        }
    }

    // Mock Data Methods (for demo/fallback)
    getMockDashboardStats() {
        return {
            total_scans_24h: 47382,
            total_anomalies_24h: 234,
            customer_trust_score: 94.2,
            threat_level: 'ELEVATED',
            threat_percentage: 65,
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
                { latitude: 40.7128, longitude: -74.0060, timestamp: new Date() },
                { latitude: 34.0522, longitude: -118.2437, timestamp: new Date() },
                { latitude: 41.8781, longitude: -87.6298, timestamp: new Date() }
            ]
        };
    }

    getMockBusinessMetrics() {
        return {
            estimated_losses_prevented: 2800000,
            fraudulent_returns_reduction_index: 340000,
            supply_chain_efficiency_score: 87.5,
            customer_satisfaction_improvement: 12.3
        };
    }

    getMockAlerts() {
        return [
            {
                id: 1,
                timestamp: new Date(),
                alert_type: 'VELOCITY',
                message: 'Product #WM-78394 scanned in NYC and London within 8 minutes',
                risk_score: 94,
                status: 'new',
                product: {
                    id: 'WM-78394',
                    name: 'iPhone 15 Pro Max',
                    category: 'Electronics'
                }
            },
            {
                id: 2,
                timestamp: new Date(),
                alert_type: 'CLUSTER',
                message: '15 identical products scanned in same location',
                risk_score: 78,
                status: 'investigating',
                product: {
                    id: 'WM-45612',
                    name: 'AirPods Pro',
                    category: 'Electronics'
                }
            }
        ];
    }

    // Health Check
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseURL}/health`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    // Batch Operations
    async batchUpdateAlerts(alertIds, newStatus) {
        const payload = {
            alert_ids: alertIds,
            new_status: newStatus
        };

        try {
            return await this.request('/alerts/batch-update', {
                method: 'PUT',
                body: JSON.stringify(payload)
            });
        } catch (error) {
            throw new Error(`Batch update failed: ${error.message}`);
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
            throw new Error(`Data export failed: ${error.message}`);
        }
    }
}

// Create global API instance
const apiService = new APIService();
