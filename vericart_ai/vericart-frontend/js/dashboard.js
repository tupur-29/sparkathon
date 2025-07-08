// VeriCart AI Dashboard
class DashboardManager {
    constructor() {
        this.map = null;
        this.mapMarkers = [];
        this.charts = {};
        this.dashboardData = {};
        this.refreshInterval = null;
        this.realtimeEvents = [];
        
        this.init();
    }
    
    // Initialize dashboard
    init() {
        this.setupMap();
        this.setupEventListeners();
        this.setupWebSocket();
        this.loadInitialData();
        this.startPeriodicRefresh();
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Add event listeners for interactive elements if needed
        window.addEventListener('resize', this.debounce(() => {
            if (this.map) {
                this.map.invalidateSize();
            }
        }, 250));
    }
    
    // Setup WebSocket connection
    setupWebSocket() {
        if (typeof wsService !== 'undefined') {
            wsService.on('scanEvent', (data) => {
                this.handleRealtimeScan(data);
            });
            
            wsService.on('alertEvent', (data) => {
                this.handleRealtimeAlert(data);
            });
            
            wsService.on('statsUpdated', (data) => {
                this.updateDashboardStats(data);
            });
        }
        
        this.updateConnectionStatus('connected');
    }
    
    // Initialize map
    setupMap() {
        // Create map with dark theme
        this.map = L.map('map', {
            center: [20, 0],
            zoom: 2,
            minZoom: 2,
            maxZoom: 10,
            zoomControl: false,
            attributionControl: false
        });
        
        // Add custom dark theme tile layer
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(this.map);
        
        // Add zoom control to a specific position
        L.control.zoom({
            position: 'bottomright'
        }).addTo(this.map);
    }
    
    // Load initial dashboard data
    async loadInitialData() {
        try {
            await Promise.all([
                this.loadDashboardStats(),
                this.loadPriorityAlerts(),
                this.loadMapData(),
                this.loadChartData()
            ]);
            
            // Update last updated timestamp
            this.updateLastUpdatedTime();
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            this.showNotification('Failed to load dashboard data', 'error');
        }
    }
    
    // Load dashboard statistics
    async loadDashboardStats() {
        try {
            const response = await this.mockApiCall('/dashboard/stats');
            this.dashboardData.stats = response;
            this.updateDashboardStats(response);
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
        }
    }
    
    // Load priority alerts
    async loadPriorityAlerts() {
        try {
            const response = await this.mockApiCall('/dashboard/priority-alerts');
            this.dashboardData.alerts = response;
            this.renderPriorityAlerts(response);
        } catch (error) {
            console.error('Failed to load priority alerts:', error);
        }
    }
    
    // Load map data
    async loadMapData() {
        try {
            const response = await this.mockApiCall('/dashboard/map-data');
            this.dashboardData.mapData = response;
            this.renderMapData(response);
        } catch (error) {
            console.error('Failed to load map data:', error);
        }
    }
    
    // Load chart data
    async loadChartData() {
        try {
            const response = await this.mockApiCall('/dashboard/chart-data');
            this.dashboardData.chartData = response;
            this.renderCharts(response);
        } catch (error) {
            console.error('Failed to load chart data:', error);
        }
    }
    
    // Mock API call for demonstration
    async mockApiCall(endpoint) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Generate mock data based on endpoint
        switch (endpoint) {
            case '/dashboard/stats':
                return this.generateMockStats();
            case '/dashboard/priority-alerts':
                return this.generateMockAlerts();
            case '/dashboard/map-data':
                return this.generateMockMapData();
            case '/dashboard/chart-data':
                return this.generateMockChartData();
            default:
                throw new Error('Unknown endpoint');
        }
    }
    
    // Generate mock statistics
    generateMockStats() {
        return {
            total_scans: {
                value: 24873,
                change: '+12.3%'
            },
            total_anomalies: {
                value: 87,
                change: '-5.2%'
            },
            trust_score: {
                value: 94.7,
                change: '+0.8%'
            },
            threat_level: {
                value: 'MODERATE',
                percentage: 45
            }
        };
    }
    
    // Generate mock alerts
    generateMockAlerts() {
        return [
            {
                id: 'ALT-001',
                title: 'Velocity Fraud Detected',
                description: 'Product scanned in multiple locations within impossible timeframe',
                product_name: 'iPhone 14 Pro',
                risk_score: 95,
                timestamp: '2024-07-04T14:30:00Z',
                location: 'New York, NY'
            },
            {
                id: 'ALT-002',
                title: 'Geographic Anomaly',
                description: 'Product appeared in unexpected location',
                product_name: 'Samsung Galaxy S23',
                risk_score: 75,
                timestamp: '2024-07-04T13:15:00Z',
                location: 'Miami, FL'
            },
            {
                id: 'ALT-003',
                title: 'Cluster Fraud Pattern',
                description: 'Multiple failed verifications at single location',
                product_name: 'MacBook Pro',
                risk_score: 85,
                timestamp: '2024-07-04T12:00:00Z',
                location: 'Chicago, IL'
            }
        ];
    }
    
    // Generate mock map data
    generateMockMapData() {
        return {
            scans: this.generateRandomScans(100),
            anomalies: this.generateRandomScans(10, true)
        };
    }
    
    // Generate random scan events
    generateRandomScans(count, isAnomaly = false) {
        const scans = [];
        const cities = [
            { name: 'New York', lat: 40.7128, lng: -74.0060 },
            { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
            { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
            { name: 'Houston', lat: 29.7604, lng: -95.3698 },
            { name: 'Phoenix', lat: 33.4484, lng: -112.0740 },
            { name: 'Philadelphia', lat: 39.9526, lng: -75.1652 },
            { name: 'San Antonio', lat: 29.4241, lng: -98.4936 },
            { name: 'London', lat: 51.5074, lng: -0.1278 },
            { name: 'Paris', lat: 48.8566, lng: 2.3522 },
            { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
            { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
            { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
            { name: 'Beijing', lat: 39.9042, lng: 116.4074 },
            { name: 'Rio de Janeiro', lat: -22.9068, lng: -43.1729 }
        ];
        
        for (let i = 0; i < count; i++) {
            const cityIndex = Math.floor(Math.random() * cities.length);
            const city = cities[cityIndex];
            
            // Add slight randomness to coordinates
            const latOffset = (Math.random() - 0.5) * 0.5;
            const lngOffset = (Math.random() - 0.5) * 0.5;
            
            scans.push({
                id: `SCAN-${i.toString().padStart(5, '0')}`,
                location: city.name,
                lat: city.lat + latOffset,
                lng: city.lng + lngOffset,
                timestamp: this.getRandomTimestamp(),
                product: this.getRandomProduct(),
                is_anomaly: isAnomaly,
                scan_type: isAnomaly ? 'failed' : 'verified'
            });
        }
        
        return scans;
    }
    
    // Generate mock chart data
    generateMockChartData() {
        return {
            risky_products: {
                labels: ['iPhone 14 Pro', 'Samsung Galaxy S23', 'MacBook Pro', 'iPad Air', 'Galaxy Watch'],
                values: [85, 72, 65, 47, 38]
            },
            risky_regions: {
                labels: ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Houston'],
                values: [27, 23, 19, 16, 14]
            },
            fraud_trends: {
                labels: this.generateTimeLabels(7),
                datasets: [
                    {
                        label: 'Velocity Fraud',
                        data: [12, 15, 18, 14, 11, 19, 22]
                    },
                    {
                        label: 'Geographic Fraud',
                        data: [8, 10, 7, 13, 15, 12, 9]
                    },
                    {
                        label: 'Cluster Fraud',
                        data: [5, 7, 9, 8, 6, 10, 12]
                    }
                ]
            }
        };
    }
    
    // Get random timestamp in the last 24 hours
    getRandomTimestamp() {
        const now = new Date();
        const past24h = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000);
        return past24h.toISOString();
    }
    
    // Get random product
    getRandomProduct() {
        const products = [
            { id: 'PROD-12345', name: 'iPhone 14 Pro' },
            { id: 'PROD-67890', name: 'Samsung Galaxy S23' },
            { id: 'PROD-11111', name: 'MacBook Pro' },
            { id: 'PROD-22222', name: 'iPad Air' },
            { id: 'PROD-33333', name: 'Galaxy Watch' },
            { id: 'PROD-44444', name: 'Sony PlayStation 5' },
            { id: 'PROD-55555', name: 'Nintendo Switch' }
        ];
        
        return products[Math.floor(Math.random() * products.length)];
    }
    
    // Generate time labels for last N days
    generateTimeLabels(days) {
        const labels = [];
        const now = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        
        return labels;
    }
    
    // Update dashboard statistics
    updateDashboardStats(stats) {
        // Update KPI cards
        document.getElementById('totalScans').textContent = this.formatNumber(stats.total_scans.value);
        document.getElementById('scansChange').textContent = stats.total_scans.change;
        
        document.getElementById('totalAnomalies').textContent = this.formatNumber(stats.total_anomalies.value);
        document.getElementById('anomaliesChange').textContent = stats.total_anomalies.change;
        
        document.getElementById('trustScore').textContent = stats.trust_score.value.toFixed(1) + '%';
        document.getElementById('trustChange').textContent = stats.trust_score.change;
        
        document.getElementById('threatLevel').textContent = stats.threat_level.value;
        document.getElementById('threatBar').style.width = `${stats.threat_level.percentage}%`;
        
        // Set threat level color
        const threatBar = document.getElementById('threatBar');
        const threatLevel = document.getElementById('threatLevel');
        
        if (stats.threat_level.percentage < 30) {
            threatBar.className = 'bg-green-400 h-2 rounded-full';
            threatLevel.className = 'text-2xl font-bold text-green-400 mt-2';
        } else if (stats.threat_level.percentage < 60) {
            threatBar.className = 'bg-orange-400 h-2 rounded-full';
            threatLevel.className = 'text-2xl font-bold text-orange-400 mt-2';
        } else {
            threatBar.className = 'bg-red-400 h-2 rounded-full';
            threatLevel.className = 'text-2xl font-bold text-red-400 mt-2';
        }
    }
    
    // Render priority alerts
    renderPriorityAlerts(alerts) {
        const container = document.getElementById('alertsContainer');
        
        if (!alerts || alerts.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-400 py-8">
                    <i class="fas fa-check-circle text-4xl mb-3"></i>
                    <p>No priority alerts</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = alerts.map(alert => this.renderAlertCard(alert)).join('');
        
        // Add event listeners to alert cards
        document.querySelectorAll('.alert-card').forEach(card => {
            card.addEventListener('click', () => {
                window.location.href = `alerts.html?id=${card.dataset.alertId}`;
            });
        });
    }
    
    // Render individual alert card
    renderAlertCard(alert) {
        const riskLevel = this.getRiskLevel(alert.risk_score);
        
        return `
            <div class="alert-card bg-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-600 transition-colors" data-alert-id="${alert.id}">
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-${riskLevel.color}-600 rounded-lg flex items-center justify-center">
                            <i class="fas fa-exclamation-triangle text-white text-xs"></i>
                        </div>
                        <h4 class="text-white font-medium">${alert.title}</h4>
                    </div>
                    <span class="text-${riskLevel.color}-400 font-bold">${alert.risk_score}</span>
                </div>
                <p class="text-gray-400 text-sm mb-2">${alert.description}</p>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-blue-400">${alert.product_name}</span>
                    <span class="text-gray-400">${this.getRelativeTime(alert.timestamp)}</span>
                </div>
            </div>
        `;
    }
    
    // Render map data
    renderMapData(data) {
        // Clear existing markers
        this.clearMapMarkers();
        
        // Add normal scan markers
        data.scans.forEach(scan => {
            this.addScanMarker(scan, false);
        });
        
        // Add anomaly markers
        data.anomalies.forEach(anomaly => {
            this.addScanMarker(anomaly, true);
        });
    }
    
    // Add scan marker to map
    addScanMarker(scan, isAnomaly) {
        const markerColor = isAnomaly ? '#EF4444' : '#3B82F6';
        const markerSize = isAnomaly ? 12 : 8;
        const pulseEffect = isAnomaly;
        
        const marker = L.circleMarker([scan.lat, scan.lng], {
            radius: markerSize,
            fillColor: markerColor,
            color: markerColor,
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.7
        }).addTo(this.map);
        
        // Add pulse effect for anomalies
        if (pulseEffect) {
            this.addPulseEffect(scan);
        }
        
        // Add popup
        marker.bindTooltip(`
            <div class="map-tooltip">
                <div class="font-bold">${scan.product.name}</div>
                <div>${scan.location}</div>
                <div class="text-xs text-gray-500">${this.formatTimestamp(scan.timestamp)}</div>
                <div class="text-xs ${scan.scan_type === 'verified' ? 'text-green-500' : 'text-red-500'}">
                    ${scan.scan_type.toUpperCase()}
                </div>
            </div>
        `, {
            className: 'custom-tooltip'
        });
        
        this.mapMarkers.push(marker);
    }
    
    // Add pulse effect for anomalies
    addPulseEffect(scan) {
        // Create pulse circles
        for (let i = 1; i <= 3; i++) {
            const pulseCircle = L.circleMarker([scan.lat, scan.lng], {
                radius: 10,
                fillColor: '#EF4444',
                color: '#EF4444',
                weight: 1,
                opacity: 0.3,
                fillOpacity: 0.2
            }).addTo(this.map);
            
            this.mapMarkers.push(pulseCircle);
            
            // Animate pulse
            this.animatePulse(pulseCircle, i);
        }
    }
    
    // Animate pulse effect
    animatePulse(circle, delay) {
        let size = 10;
        const maxSize = 30;
        const growthRate = 0.3;
        
        setTimeout(() => {
            const interval = setInterval(() => {
                size += growthRate;
                circle.setRadius(size);
                
                if (size >= maxSize) {
                    size = 10;
                    circle.setRadius(size);
                }
            }, 30);
            
            // Store interval ID for cleanup
            circle.pulseInterval = interval;
        }, delay * 300);
    }
    
    // Clear map markers
    clearMapMarkers() {
        this.mapMarkers.forEach(marker => {
            // Clear any animations
            if (marker.pulseInterval) {
                clearInterval(marker.pulseInterval);
            }
            
            // Remove from map
            this.map.removeLayer(marker);
        });
        
        this.mapMarkers = [];
    }
    
    // Render charts
    renderCharts(data) {
        this.renderProductChart(data.risky_products);
        this.renderRegionChart(data.risky_regions);
        this.renderTrendsChart(data.fraud_trends);
    }
    
        // Render product risk chart
    renderProductChart(data) {
        const ctx = document.getElementById('productChart');
        
        if (this.charts.productChart) {
            this.charts.productChart.destroy();
        }
        
        this.charts.productChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Risk Score',
                    data: data.values,
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(139, 92, 246, 0.7)',
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(16, 185, 129, 0.7)'
                    ],
                    borderColor: [
                        'rgba(239, 68, 68, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(139, 92, 246, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(16, 185, 129, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
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
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: '#374151'
                        },
                        ticks: {
                            color: '#9CA3AF'
                        }
                    }
                }
            }
        });
    }
    
    // Render region risk chart
    renderRegionChart(data) {
        const ctx = document.getElementById('regionChart');
        
        if (this.charts.regionChart) {
            this.charts.regionChart.destroy();
        }
        
        this.charts.regionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: [
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(139, 92, 246, 0.7)',
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(16, 185, 129, 0.7)'
                    ],
                    borderColor: [
                        'rgba(239, 68, 68, 1)',
                        'rgba(245, 158, 11, 1)',
                        'rgba(139, 92, 246, 1)',
                        'rgba(59, 130, 246, 1)',
                        'rgba(16, 185, 129, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#D1D5DB',
                            padding: 10,
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Render fraud trends chart
    renderTrendsChart(data) {
        const ctx = document.getElementById('trendsChart');
        
        if (this.charts.trendsChart) {
            this.charts.trendsChart.destroy();
        }
        
        this.charts.trendsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: data.datasets[0].label,
                        data: data.datasets[0].data,
                        borderColor: '#EF4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: data.datasets[1].label,
                        data: data.datasets[1].data,
                        borderColor: '#F59E0B',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.3,
                        fill: true
                    },
                    {
                        label: data.datasets[2].label,
                        data: data.datasets[2].data,
                        borderColor: '#8B5CF6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        tension: 0.3,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#D1D5DB',
                            padding: 10,
                            font: {
                                size: 11
                            }
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
                        beginAtZero: true,
                        grid: {
                            color: '#374151'
                        },
                        ticks: {
                            color: '#9CA3AF'
                        }
                    }
                }
            }
        });
    }
    
    // Handle realtime scan
    handleRealtimeScan(scan) {
        // Add scan to map
        if (scan.is_anomaly) {
            this.addScanMarker(scan, true);
            this.showNotification(`Anomaly detected: ${scan.product.name} in ${scan.location}`, 'warning');
        } else {
            this.addScanMarker(scan, false);
        }
        
        // Limit the number of markers on the map to avoid performance issues
        if (this.mapMarkers.length > 200) {
            // Remove oldest markers that are not anomalies
            const normalMarkers = this.mapMarkers.filter(marker => !marker.options || marker.options.radius <= 8);
            if (normalMarkers.length > 0) {
                const oldestMarker = normalMarkers[0];
                this.map.removeLayer(oldestMarker);
                this.mapMarkers = this.mapMarkers.filter(marker => marker !== oldestMarker);
            }
        }
        
        // Update stats if needed
        if (this.dashboardData.stats) {
            const stats = this.dashboardData.stats;
            stats.total_scans.value++;
            
            if (scan.is_anomaly) {
                stats.total_anomalies.value++;
            }
            
            this.updateDashboardStats(stats);
        }
        
        // Update last updated time
        this.updateLastUpdatedTime();
    }
    
    // Handle realtime alert
    handleRealtimeAlert(alert) {
        // Add to priority alerts if it's high risk
        if (alert.risk_score >= 70 && this.dashboardData.alerts) {
            // Limit to top 3 alerts
            this.dashboardData.alerts.unshift(alert);
            this.dashboardData.alerts = this.dashboardData.alerts.slice(0, 3);
            this.renderPriorityAlerts(this.dashboardData.alerts);
        }
        
        // Show notification
        this.showNotification(`New alert: ${alert.title}`, 'warning');
        
        // Update last updated time
        this.updateLastUpdatedTime();
    }
    
    // Start periodic refresh
    startPeriodicRefresh() {
        // Refresh data every 30 seconds
        this.refreshInterval = setInterval(() => {
            this.simulateRealtimeData();
        }, 30000);
        
        // Simulate first realtime data in 5 seconds
        setTimeout(() => {
            this.simulateRealtimeData();
        }, 5000);
    }
    
    // Simulate realtime data for demonstration
    simulateRealtimeData() {
        // Simulate new scans
        if (Math.random() > 0.3) { // 70% chance to generate a new scan
            const scan = this.generateRandomScans(1)[0];
            this.handleRealtimeScan(scan);
        }
        
        // Simulate new anomalies with lower probability
        if (Math.random() > 0.8) { // 20% chance to generate a new anomaly
            const anomaly = this.generateRandomScans(1, true)[0];
            this.handleRealtimeScan(anomaly);
            
            // Chance to generate a new alert based on the anomaly
            if (Math.random() > 0.5) {
                const alert = this.generateAlertFromAnomaly(anomaly);
                this.handleRealtimeAlert(alert);
            }
        }
    }
    
    // Generate an alert from an anomaly scan
    generateAlertFromAnomaly(anomaly) {
        const alertTypes = ['velocity_fraud', 'geographic_fraud', 'cluster_fraud'];
        const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        
        return {
            id: `ALT-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            type,
            title: this.getAlertTitle(type),
            description: this.getAlertDescription(type),
            product_name: anomaly.product.name,
            risk_score: Math.floor(Math.random() * 20) + 75, // 75-95
            timestamp: new Date().toISOString(),
            location: anomaly.location
        };
    }
    
    // Get alert title based on type
    getAlertTitle(type) {
        switch (type) {
            case 'velocity_fraud':
                return 'Velocity Fraud Detected';
            case 'geographic_fraud':
                return 'Geographic Anomaly';
            case 'cluster_fraud':
                return 'Cluster Fraud Pattern';
            default:
                return 'Potential Fraud Detected';
        }
    }
    
    // Get alert description based on type
    getAlertDescription(type) {
        switch (type) {
            case 'velocity_fraud':
                return 'Product scanned in multiple locations within impossible timeframe';
            case 'geographic_fraud':
                return 'Product appeared in unexpected location';
            case 'cluster_fraud':
                return 'Multiple failed verifications at single location';
            default:
                return 'Suspicious activity detected with this product';
        }
    }
    
    // Update last updated timestamp
    updateLastUpdatedTime() {
        const now = new Date();
        document.getElementById('lastUpdated').textContent = now.toLocaleTimeString();
    }
    
    // Update connection status
    updateConnectionStatus(status) {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        statusIndicator.className = 'status-indicator';
        
        switch (status) {
            case 'connected':
                statusIndicator.classList.add('status-online');
                statusText.textContent = 'Connected';
                break;
            case 'disconnected':
                statusIndicator.classList.add('status-offline');
                statusText.textContent = 'Disconnected';
                break;
            case 'reconnecting':
                statusIndicator.classList.add('status-reconnecting');
                statusText.textContent = 'Reconnecting...';
                break;
            default:
                statusIndicator.classList.add('status-offline');
                statusText.textContent = 'Offline';
        }
    }
    
    // Format number with commas
    formatNumber(number) {
        return new Intl.NumberFormat('en-US').format(number);
    }
    
    // Format timestamp
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Get relative time
    getRelativeTime(timestamp) {
        const now = new Date();
        const date = new Date(timestamp);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }
    
    // Get risk level
    getRiskLevel(score) {
        if (score >= 86) {
            return { label: 'Critical', color: 'red' };
        } else if (score >= 71) {
            return { label: 'High', color: 'orange' };
        } else if (score >= 51) {
            return { label: 'Medium', color: 'yellow' };
        } else {
            return { label: 'Low', color: 'green' };
        }
    }
    
    // Show notification
    showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button class="ml-4 text-white hover:text-gray-300">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        container.appendChild(notification);
        
        // Auto remove
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, duration);
        
        // Manual close
        notification.querySelector('button').addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }
    
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Cleanup
    cleanup() {
        // Clear refresh interval
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Clear map markers
        this.clearMapMarkers();
        
        // Destroy charts
        for (const chartKey in this.charts) {
            if (this.charts[chartKey]) {
                this.charts[chartKey].destroy();
            }
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardManager = new DashboardManager();
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (window.dashboardManager) {
        window.dashboardManager.cleanup();
    }
});
                
