/*!
 * VeriCart Application
 * Product Verification and Anti-Counterfeiting System
 * Version: 1.0.0
 */

// Configuration object
const CONFIG = {
    MAP_CENTER: [51.505, -0.09], // Default to London
    MAP_ZOOM: 13,
    DASHBOARD_REFRESH_INTERVAL: 30000,
    ALERTS_REFRESH_INTERVAL: 60000,
    NOTIFICATION_TIMEOUT: 3000,
    MARKER_TIMEOUT: 300000
};

/**
 * VeriCart Application Class
 * Main application controller for the VeriCart system
 */
class VeriCartApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.map = null;
        this.charts = {};
        this.alerts = [];
        this.refreshIntervals = {};
        this.currentAlertFilter = 'all';
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        try {
            this.setupEventListeners();
            this.initializeMap();
            this.loadInitialData();
            this.setupWebSocket();
            this.setupRefreshIntervals();
            this.showPage('dashboard');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showNotification('Failed to initialize application', 'error');
        }
    }

    /**
     * Setup event listeners for navigation and interactions
     */
    setupEventListeners() {
        try {
            // Navigation
            document.querySelectorAll('.nav-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const page = e.currentTarget.dataset.page;
                    if (page) {
                        this.showPage(page);
                    }
                });
            });

            // Product verification
            const verifyBtn = document.getElementById('verifyProductBtn');
            if (verifyBtn) {
                verifyBtn.addEventListener('click', this.verifyProduct.bind(this));
            }

            // Alert filters
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const status = e.currentTarget.dataset.status;
                    if (status) {
                        this.filterAlerts(status);
                    }
                });
            });

            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    switch (e.key) {
                        case '1':
                            e.preventDefault();
                            this.showPage('dashboard');
                            break;
                        case '2':
                            e.preventDefault();
                            this.showPage('investigation');
                            break;
                        case '3':
                            e.preventDefault();
                            this.showPage('alerts');
                            break;
                        case 'r':
                            e.preventDefault();
                            this.refreshCurrentPage();
                            break;
                    }
                }
            });

            // Window cleanup
            window.addEventListener('beforeunload', () => {
                this.cleanup();
            });
        } catch (error) {
            console.error('Failed to setup event listeners:', error);
        }
    }

    /**
     * Initialize the map using Leaflet
     */
    initializeMap() {
        try {
            const mapElement = document.getElementById('map');
            if (!mapElement) return;

            // Check if Leaflet is available
            if (typeof L === 'undefined') {
                console.error('Leaflet library not loaded. Include: <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>');
                return;
            }

            this.map = L.map('map').setView(CONFIG.MAP_CENTER, CONFIG.MAP_ZOOM);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 18
            }).addTo(this.map);

            // Load location data and add markers
            this.loadLocationData();
        } catch (error) {
            console.error('Failed to initialize map:', error);
        }
    }

    /**
     * Load location data for map markers
     */
    async loadLocationData() {
        try {
            const response = await fetch('assets/locations.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const locations = await response.json();
            if (!Array.isArray(locations)) {
                throw new Error('Invalid location data format');
            }

            locations.forEach(location => {
                if (this.isValidLocation(location)) {
                    this.addLocationMarker(location);
                }
            });
        } catch (error) {
            console.error('Failed to load location data:', error);
            // Fallback to dummy data
            this.loadDummyLocationData();
        }
    }

    /**
     * Load dummy location data as fallback
     */
    loadDummyLocationData() {
        const dummyLocations = [
            { name: 'New York', country: 'USA', latitude: 40.7128, longitude: -74.0060 },
            { name: 'London', country: 'UK', latitude: 51.5074, longitude: -0.1278 },
            { name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
            { name: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093 }
        ];

        dummyLocations.forEach(location => {
            this.addLocationMarker(location);
        });
    }

    /**
     * Validate location data structure
     */
    isValidLocation(location) {
        return location && 
               typeof location.latitude === 'number' && 
               typeof location.longitude === 'number' &&
               location.name && 
               location.country;
    }

    /**
     * Add location marker to the map
     */
    addLocationMarker(location) {
        try {
            if (!this.map) return;

            const marker = L.circleMarker([location.latitude, location.longitude], {
                radius: 4,
                fillColor: '#10b981',
                color: '#fff',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(this.map);

            marker.bindPopup(`
                <div>
                    <strong>${this.escapeHtml(location.name)}</strong><br>
                    ${this.escapeHtml(location.country)}<br>
                    <small>Lat: ${location.latitude}, Lng: ${location.longitude}</small>
                </div>
            `);
        } catch (error) {
            console.error('Failed to add location marker:', error);
        }
    }

    /**
     * Escape HTML to prevent XSS attacks
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Add scan result to map
     */
    addScanToMap(scan) {
        if (!this.map || !this.isValidScan(scan)) return;

        try {
            const color = scan.is_authentic ? '#10b981' : '#ef4444';
            const marker = L.circleMarker([scan.latitude, scan.longitude], {
                radius: 6,
                fillColor: color,
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(this.map);

            marker.bindPopup(`
                <div>
                    <strong>${scan.is_authentic ? 'Authentic Scan' : 'Anomaly Detected'}</strong><br>
                    Product: ${this.escapeHtml(scan.product_id)}<br>
                    Time: ${new Date(scan.timestamp).toLocaleString()}<br>
                    Location: ${scan.latitude.toFixed(4)}, ${scan.longitude.toFixed(4)}
                </div>
            `);

            // Remove marker after 5 minutes
            setTimeout(() => {
                if (this.map && this.map.hasLayer(marker)) {
                    this.map.removeLayer(marker);
                }
            }, CONFIG.MARKER_TIMEOUT);
        } catch (error) {
            console.error('Failed to add scan to map:', error);
        }
    }

    /**
     * Validate scan data structure
     */
    isValidScan(scan) {
        return scan && 
               typeof scan.latitude === 'number' && 
               typeof scan.longitude === 'number' &&
               scan.product_id && 
               scan.timestamp &&
               typeof scan.is_authentic === 'boolean';
    }

    /**
     * Setup WebSocket connection for real-time updates
     */
    setupWebSocket() {
        try {
            if (typeof wsService === 'undefined') {
                console.warn('WebSocket service not available');
                return;
            }

            wsService.connect();
            // Subscribe to relevant events
            wsService.subscribe('new_alert', this.handleNewAlert.bind(this));
            wsService.subscribe('scan_update', this.handleScanUpdate.bind(this));
            wsService.subscribe('dashboard_stats', this.handleDashboardStats.bind(this));
        } catch (error) {
            console.error('Failed to setup WebSocket:', error);
        }
    }

    /**
     * Handle new alert from WebSocket
     */
    handleNewAlert(alert) {
        try {
            this.alerts.unshift(alert);
            this.renderAlerts();
            this.showNotification('New alert received', 'info');
        } catch (error) {
            console.error('Failed to handle new alert:', error);
        }
    }

        /**
     * Handle scan update from WebSocket
     */
    handleScanUpdate(scan) {
        try {
            this.addScanToMap(scan);
            if (this.currentPage === 'dashboard') {
                this.refreshDashboardStats();
            }
        } catch (error) {
            console.error('Failed to handle scan update:', error);
        }
    }

    /**
     * Handle dashboard stats update from WebSocket
     */
    handleDashboardStats(stats) {
        try {
            this.updateDashboardStats(stats);
        } catch (error) {
            console.error('Failed to handle dashboard stats:', error);
        }
    }

    /**
     * Setup automatic refresh intervals
     */
    setupRefreshIntervals() {
        // Clear existing intervals
        this.clearRefreshIntervals();

        try {
            this.refreshIntervals.dashboard = setInterval(() => {
                if (this.currentPage === 'dashboard') {
                    this.refreshDashboardStats();
                }
            }, CONFIG.DASHBOARD_REFRESH_INTERVAL);

            this.refreshIntervals.alerts = setInterval(() => {
                if (this.currentPage === 'alerts') {
                    this.loadAlerts();
                }
            }, CONFIG.ALERTS_REFRESH_INTERVAL);
        } catch (error) {
            console.error('Failed to setup refresh intervals:', error);
        }
    }

    /**
     * Clear all refresh intervals
     */
    clearRefreshIntervals() {
        Object.values(this.refreshIntervals).forEach(interval => {
            if (interval) {
                clearInterval(interval);
            }
        });
        this.refreshIntervals = {};
    }

    /**
     * Show specific page and update navigation
     */
    showPage(pageId) {
        try {
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });

            // Show selected page
            const page = document.getElementById(pageId);
            if (!page) {
                console.error(`Page not found: ${pageId}`);
                return;
            }

            page.classList.add('active');
            this.currentPage = pageId;

            // Update navigation
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.page === pageId) {
                    item.classList.add('active');
                }
            });

            // Load page-specific data
            this.loadPageData(pageId);
        } catch (error) {
            console.error('Failed to show page:', error);
        }
    }

    /**
     * Load data specific to the current page
     */
    loadPageData(pageId) {
        try {
            switch (pageId) {
                case 'dashboard':
                    this.refreshDashboardStats();
                    this.loadDashboardCharts();
                    break;
                case 'investigation':
                    this.loadInvestigationData();
                    break;
                case 'alerts':
                    this.loadAlerts();
                    break;
                case 'analytics':
                    this.loadAnalytics();
                    break;
                case 'mobile':
                    this.loadMobileData();
                    break;
                default:
                    console.warn(`Unknown page: ${pageId}`);
            }
        } catch (error) {
            console.error(`Failed to load data for page ${pageId}:`, error);
        }
    }

    /**
     * Load initial application data
     */
    async loadInitialData() {
        try {
            await Promise.all([
                this.refreshDashboardStats(),
                this.loadAlerts()
            ]);
            this.updateLastUpdated();
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showNotification('Failed to load initial data', 'error');
        }
    }

    /**
     * Refresh dashboard statistics
     */
    async refreshDashboardStats() {
        try {
            if (typeof apiService === 'undefined') {
                console.warn('API service not available, using dummy data');
                this.updateDashboardStats(this.getDummyStats());
                return;
            }

            const stats = await apiService.getDashboardStats();
            this.updateDashboardStats(stats);
        } catch (error) {
            console.error('Failed to refresh dashboard stats:', error);
            // Fallback to dummy data
            this.updateDashboardStats(this.getDummyStats());
        }
    }

    /**
     * Generate dummy statistics for fallback
     */
    getDummyStats() {
        return {
            total_scans_24h: Math.floor(Math.random() * 10000) + 5000,
            total_anomalies_24h: Math.floor(Math.random() * 100) + 20,
            customer_trust_score: Math.floor(Math.random() * 20) + 80,
            threat_level: ['LOW', 'NORMAL', 'HIGH'][Math.floor(Math.random() * 3)],
            threat_percentage: Math.floor(Math.random() * 100)
        };
    }

    /**
     * Update dashboard statistics display
     */
    updateDashboardStats(stats) {
        try {
            if (!stats) return;

            // Update KPI cards with null checks
            this.updateElementText('totalScans', stats.total_scans_24h?.toLocaleString() || '0');
            this.updateElementText('totalAnomalies', stats.total_anomalies_24h?.toLocaleString() || '0');
            this.updateElementText('trustScore', `${stats.customer_trust_score || 0}%`);
            this.updateElementText('threatLevel', stats.threat_level || 'NORMAL');

            // Update threat bar
            const threatBar = document.getElementById('threatBar');
            if (threatBar) {
                threatBar.style.width = `${stats.threat_percentage || 0}%`;
                
                // Update color based on threat level
                const level = stats.threat_level || 'NORMAL';
                threatBar.className = `threat-bar threat-${level.toLowerCase()}`;
            }

            // Update change indicators
            this.updateElementText('scansChange', '+12.5% from yesterday');
            this.updateElementText('anomaliesChange', '+8.2% from yesterday');
            this.updateElementText('trustChange', '+2.1% from yesterday');

            this.updateLastUpdated();
        } catch (error) {
            console.error('Failed to update dashboard stats:', error);
        }
    }

    /**
     * Helper method to update element text content
     */
    updateElementText(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * Update last updated timestamp
     */
    updateLastUpdated() {
        try {
            const element = document.getElementById('lastUpdated');
            if (element) {
                element.textContent = `Last updated: ${new Date().toLocaleString()}`;
            }
        } catch (error) {
            console.error('Failed to update last updated time:', error);
        }
    }

    /**
     * Load all dashboard charts
     */
    loadDashboardCharts() {
        try {
            this.createProductChart();
            this.createRegionChart();
            this.createTrendsChart();
        } catch (error) {
            console.error('Failed to load dashboard charts:', error);
        }
    }

    /**
     * Create product distribution chart
     */
    createProductChart() {
        try {
            const ctx = document.getElementById('productChart');
            if (!ctx) return;

            if (this.charts.product) {
                this.charts.product.destroy();
            }

            // Check if Chart.js is available
            if (typeof Chart === 'undefined') {
                console.warn('Chart.js not loaded');
                return;
            }

            this.charts.product = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Electronics', 'Fashion', 'Food', 'Healthcare', 'Other'],
                    datasets: [{
                        data: [35, 25, 20, 15, 5],
                        backgroundColor: [
                            '#10b981',
                            '#3b82f6',
                            '#f59e0b',
                            '#ef4444',
                            '#6b7280'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Failed to create product chart:', error);
        }
    }

    /**
     * Create regional distribution chart
     */
    createRegionChart() {
        try {
            const ctx = document.getElementById('regionChart');
            if (!ctx) return;

            if (this.charts.region) {
                this.charts.region.destroy();
            }

            if (typeof Chart === 'undefined') {
                console.warn('Chart.js not loaded');
                return;
            }

            this.charts.region = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['North America', 'Europe', 'Asia', 'South America', 'Africa'],
                    datasets: [{
                        label: 'Scans',
                        data: [1200, 1900, 3000, 500, 200],
                        backgroundColor: '#10b981'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Failed to create region chart:', error);
        }
    }

    /**
     * Create trends chart
     */
    createTrendsChart() {
        try {
            const ctx = document.getElementById('trendsChart');
            if (!ctx) return;

            if (this.charts.trends) {
                this.charts.trends.destroy();
            }

            if (typeof Chart === 'undefined') {
                console.warn('Chart.js not loaded');
                return;
            }

            // Generate dummy data for the last 7 days
            const labels = [];
            const data = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(date.toLocaleDateString());
                data.push(Math.floor(Math.random() * 1000) + 500);
            }

            this.charts.trends = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Daily Scans',
                        data: data,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Failed to create trends chart:', error);
        }
    }

    /**
     * Load alerts from API or fallback to dummy data
     */
    async loadAlerts() {
        try {
            if (typeof apiService === 'undefined') {
                console.warn('API service not available, using dummy alerts');
                this.alerts = this.getDummyAlerts();
                this.renderAlerts();
                return;
            }

            const alerts = await apiService.getAlerts();
            if (!Array.isArray(alerts)) {
                console.warn('Invalid alerts data format');
                return;
            }

            this.alerts = alerts;
            this.renderAlerts();
        } catch (error) {
            console.error('Failed to load alerts:', error);
            this.showNotification('Failed to load alerts', 'error');
            // Fallback to dummy data
            this.alerts = this.getDummyAlerts();
            this.renderAlerts();
        }
    }

    /**
     * Generate dummy alerts for fallback
     */
    getDummyAlerts() {
        return [
            {
                id: 1,
                title: 'Suspicious Activity Detected',
                description: 'Multiple failed verification attempts from IP 192.168.1.100',
                severity: 'high',
                status: 'active',
                timestamp: new Date(Date.now() - 300000).toISOString(),
                location: 'New York, USA'
            },
            {
                id: 2,
                title: 'Counterfeit Product Alert',
                description: 'Product ID ABC123 showing anomalous patterns',
                severity: 'critical',
                status: 'active',
                timestamp: new Date(Date.now() - 600000).toISOString(),
                location: 'London, UK'
            },
            {
                id: 3,
                title: 'System Maintenance',
                description: 'Scheduled maintenance completed successfully',
                severity: 'low',
                status: 'resolved',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                location: 'Server Farm'
            }
        ];
    }

    /**
     * Render alerts in the UI
     */
    renderAlerts() {
        try {
            const alertsContainer = document.getElementById('alertsContainer');
            if (!alertsContainer) return;

            let filteredAlerts = this.alerts;
            if (this.currentAlertFilter !== 'all') {
                filteredAlerts = this.alerts.filter(alert => 
                    alert.status === this.currentAlertFilter
                );
            }

            if (filteredAlerts.length === 0) {
                alertsContainer.innerHTML = '<div class="no-alerts">No alerts found</div>';
                return;
            }

            alertsContainer.innerHTML = filteredAlerts.map(alert => `
                <div class="alert-item alert-${alert.severity}" data-alert-id="${alert.id}">
                    <div class="alert-header">
                        <h4>${this.escapeHtml(alert.title)}</h4>
                        <span class="alert-status status-${alert.status}">${alert.status.toUpperCase()}</span>
                    </div>
                    <p class="alert-description">${this.escapeHtml(alert.description)}</p>
                    <div class="alert-meta">
                        <span class="alert-time">${new Date(alert.timestamp).toLocaleString()}</span>
                        <span class="alert-location">${this.escapeHtml(alert.location)}</span>
                    </div>
                    <div class="alert-actions">
                        <button class="btn btn-sm btn-primary" onclick="veriCartApp.viewAlert(${alert.id})">View</button>
                        <button class="btn btn-sm btn-secondary" onclick="veriCartApp.acknowledgeAlert(${alert.id})">Acknowledge</button>
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Failed to render alerts:', error);
        }
    }

    /**
     * Filter alerts by status
     */
    filterAlerts(status) {
        try {
            this.currentAlertFilter = status;
            
            // Update filter button states
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.status === status) {
                    btn.classList.add('active');
                }
            });

            this.renderAlerts();
        } catch (error) {
            console.error('Failed to filter alerts:', error);
        }
    }

    /**
     * View alert details
     */
    viewAlert(alertId) {
        try {
            const alert = this.alerts.find(a => a.id === alertId);
            if (!alert) {
                this.showNotification('Alert not found', 'error');
                return;
            }

            // Create modal or navigate to detail view
            this.showNotification(`Viewing alert: ${alert.title}`, 'info');
        } catch (error) {
            console.error('Failed to view alert:', error);
        }
    }

    /**
     * Acknowledge an alert
     */
    acknowledgeAlert(alertId) {
        try {
            const alertIndex = this.alerts.findIndex(a => a.id === alertId);
            if (alertIndex === -1) {
                this.showNotification('Alert not found', 'error');
                return;
            }

            this.alerts[alertIndex].status = 'acknowledged';
            this.renderAlerts();
            this.showNotification('Alert acknowledged', 'success');
        } catch (error) {
            console.error('Failed to acknowledge alert:', error);
        }
    }

    /**
     * Verify a product
     */
    verifyProduct() {
        try {
            const productId = document.getElementById('productIdInput')?.value;
            if (!productId) {
                this.showNotification('Please enter a product ID', 'warning');
                return;
            }

            // Simulate verification process
            this.showNotification('Verifying product...', 'info');
            
            setTimeout(() => {
                const isAuthentic = Math.random() > 0.3; // 70% chance of authentic
                const result = isAuthentic ? 'Product verified as authentic' : 'Product verification failed - potential counterfeit';
                const type = isAuthentic ? 'success' : 'error';
                
                this.showNotification(result, type);
                
                // Add to map if coordinates available
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const scan = {
                                product_id: productId,
                                is_authentic: isAuthentic,
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                                timestamp: new Date().toISOString()
                            };
                            this.addScanToMap(scan);
                        },
                        (error) => {
                            console.warn('Geolocation not available:', error);
                        }
                    );
                }
            }, 2000);
        } catch (error) {
            console.error('Failed to verify product:', error);
            this.showNotification('Verification failed', 'error');
        }
    }

    /**
     * Refresh the current page
     */
    refreshCurrentPage() {
        try {
            this.loadPageData(this.currentPage);
            this.showNotification('Page refreshed', 'success');
        } catch (error) {
            console.error('Failed to refresh current page:', error);
        }
    }

    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        try {
            // Remove existing notifications
            document.querySelectorAll('.notification').forEach(n => n.remove());

            // Create notification element
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-message">${this.escapeHtml(message)}</span>
                    <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            `;
            
            // Add to DOM
            document.body.appendChild(notification);
            
            // Auto-remove after timeout
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, CONFIG.NOTIFICATION_TIMEOUT);
        } catch (error) {
            console.error('Failed to show notification:', error);
        }
    }

    /**
     * Load analytics data
     */
    loadAnalytics() {
        try {
            console.log('Loading analytics data...');
            this.showNotification('Analytics data loaded', 'info');
        } catch (error) {
            console.error('Failed to load analytics:', error);
        }
    }

    /**
     * 
     *     /**
     * Load investigation data
     */
    loadInvestigationData() {
        try {
            console.log('Loading investigation data...');
            this.showNotification('Investigation data loaded', 'info');
        } catch (error) {
            console.error('Failed to load investigation data:', error);
        }
    }

    /**
     * Load mobile data
     */
    loadMobileData() {
        try {
            console.log('Loading mobile data...');
            this.showNotification('Mobile data loaded', 'info');
        } catch (error) {
            console.error('Failed to load mobile data:', error);
        }
    }

    /**
     * Cleanup application resources
     */
    cleanup() {
        try {
            this.clearRefreshIntervals();
            
            // Destroy charts
            Object.values(this.charts).forEach(chart => {
                if (chart && typeof chart.destroy === 'function') {
                    chart.destroy();
                }
            });
            this.charts = {};
            
            // Remove map
            if (this.map) {
                this.map.remove();
                this.map = null;
            }
            
            // Disconnect WebSocket
            if (typeof wsService !== 'undefined') {
                wsService.disconnect();
            }
            
            console.log('Application cleaned up successfully');
        } catch (error) {
            console.error('Failed to cleanup application:', error);
        }
    }

    /**
     * Get application status
     */
    getStatus() {
        return {
            currentPage: this.currentPage,
            mapInitialized: !!this.map,
            chartsCount: Object.keys(this.charts).length,
            alertsCount: this.alerts.length,
            refreshIntervals: Object.keys(this.refreshIntervals).length
        };
    }

    /**
     * Export data for backup or analysis
     */
    exportData() {
        try {
            const data = {
                alerts: this.alerts,
                currentFilter: this.currentAlertFilter,
                timestamp: new Date().toISOString(),
                stats: this.getDummyStats()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `vericart-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Data exported successfully', 'success');
        } catch (error) {
            console.error('Failed to export data:', error);
            this.showNotification('Export failed', 'error');
        }
    }

    /**
     * Toggle dark mode
     */
    toggleDarkMode() {
        try {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
            this.showNotification(`${isDark ? 'Dark' : 'Light'} mode enabled`, 'info');
        } catch (error) {
            console.error('Failed to toggle dark mode:', error);
        }
    }

    /**
     * Initialize dark mode from localStorage
     */
    initializeDarkMode() {
        try {
            const darkMode = localStorage.getItem('darkMode');
            if (darkMode === 'true') {
                document.body.classList.add('dark-mode');
            }
        } catch (error) {
            console.error('Failed to initialize dark mode:', error);
        }
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.veriCartApp = new VeriCartApp();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VeriCartApp;
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.veriCartApp) {
        window.veriCartApp.showNotification('An unexpected error occurred', 'error');
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    if (window.veriCartApp) {
        window.veriCartApp.showNotification('An unexpected error occurred', 'error');
    }
});

