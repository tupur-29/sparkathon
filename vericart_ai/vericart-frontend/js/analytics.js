// VeriCart AI Analytics Management
class AnalyticsManager {
    constructor() {
        this.currentTab = 'business-impact';
        this.currentTimeRange = '30d';
        this.charts = {};
        this.analyticsData = {};
        this.refreshInterval = null;
        
        this.init();
    }
    
    // Initialize analytics manager
    init() {
        this.setupEventListeners();
        this.setupWebSocket();
        this.loadInitialData();
        this.startPeriodicRefresh();
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.analytics-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });
        
        // Time range selection
        document.getElementById('timeRangeSelect').addEventListener('change', (e) => {
            this.currentTimeRange = e.target.value;
            this.refreshAllData();
        });
        
        // Refresh button
        document.getElementById('refreshAnalyticsBtn').addEventListener('click', () => {
            this.refreshAllData();
        });
        
        // Export button
        document.getElementById('exportReportBtn').addEventListener('click', () => {
            this.exportReport();
        });
        
        // ROI Calculator
        document.getElementById('calculateROIBtn').addEventListener('click', () => {
            this.calculateROI();
        });
        
        // ROI input changes
        ['implementationCost', 'operatingCost', 'timePeriod'].forEach(id => {
            document.getElementById(id).addEventListener('input', this.debounce(() => {
                this.calculateROI();
            }, 500));
        });
    }
    
    // Setup WebSocket connection
    setupWebSocket() {
        if (typeof wsService !== 'undefined') {
            wsService.on('analyticsUpdated', (data) => {
                this.handleRealTimeUpdate(data);
            });
        }
        
        this.updateConnectionStatus('connected');
    }
    
    // Switch between tabs
    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.analytics-tab').forEach(tab => {
            tab.classList.remove('active');
            tab.classList.add('border-transparent', 'text-gray-400');
            tab.classList.remove('border-blue-500', 'text-white');
        });
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.remove('border-transparent', 'text-gray-400');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('border-blue-500', 'text-white');
        
        // Show/hide tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
            content.classList.remove('active');
        });
        
        document.getElementById(tabName).classList.remove('hidden');
        document.getElementById(tabName).classList.add('active');
        
        this.currentTab = tabName;
        
        // Initialize charts for the active tab
        setTimeout(() => {
            this.initializeChartsForTab(tabName);
        }, 100);
    }
    
    // Load initial data
    async loadInitialData() {
        try {
            await Promise.all([
                this.loadBusinessImpactData(),
                this.loadMLPerformanceData(),
                this.loadPredictiveData(),
                this.loadTrendsData()
            ]);
            
            // Initialize charts for the current tab
            this.initializeChartsForTab(this.currentTab);
            
        } catch (error) {
            console.error('Failed to load analytics data:', error);
            this.showNotification('Failed to load analytics data', 'error');
        }
    }
    
    // Load business impact data
    async loadBusinessImpactData() {
        try {
            const response = await this.mockApiCall('/analytics/business-impact', {
                timeRange: this.currentTimeRange
            });
            
            this.analyticsData.businessImpact = response;
            this.updateBusinessImpactUI();
            
        } catch (error) {
            console.error('Failed to load business impact data:', error);
        }
    }
    
    // Load ML performance data
    async loadMLPerformanceData() {
        try {
            const response = await this.mockApiCall('/analytics/ml-performance', {
                timeRange: this.currentTimeRange
            });
            
            this.analyticsData.mlPerformance = response;
            
        } catch (error) {
            console.error('Failed to load ML performance data:', error);
        }
    }
    
    // Load predictive data
    async loadPredictiveData() {
        try {
            const response = await this.mockApiCall('/analytics/predictive', {
                timeRange: this.currentTimeRange
            });
            
            this.analyticsData.predictive = response;
            
        } catch (error) {
            console.error('Failed to load predictive data:', error);
        }
    }
    
    // Load trends data
    async loadTrendsData() {
        try {
            const response = await this.mockApiCall('/analytics/trends', {
                timeRange: this.currentTimeRange
            });
            
            this.analyticsData.trends = response;
            
        } catch (error) {
            console.error('Failed to load trends data:', error);
        }
    }
    
    // Mock API call for demonstration
    async mockApiCall(endpoint, params = {}) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Generate mock data based on endpoint
        switch (endpoint) {
            case '/analytics/business-impact':
                return this.generateBusinessImpactData(params);
            case '/analytics/ml-performance':
                return this.generateMLPerformanceData(params);
            case '/analytics/predictive':
                return this.generatePredictiveData(params);
            case '/analytics/trends':
                return this.generateTrendsData(params);
            default:
                throw new Error('Unknown endpoint');
        }
    }
    
    // Generate business impact mock data
    generateBusinessImpactData(params) {
        const timeRange = params.timeRange || '30d';
        const multiplier = timeRange === '7d' ? 0.25 : timeRange === '30d' ? 1 : timeRange === '90d' ? 3 : 12;
        
        return {
            lossesPrevented: {
                value: Math.round(2.4 * multiplier * 1000000), // $2.4M base
                change: '+15.3%'
            },
            returnFraudReduction: {
                value: '67%',
                change: '+8.2%'
            },
            customerTrust: {
                value: '92.4%',
                change: '+3.1%'
            },
            supplyChainEfficiency: {
                value: '89.7%',
                change: '+5.7%'
            },
            chartData: {
                labels: this.generateTimeLabels(timeRange),
                datasets: [
                    {
                        label: 'Losses Prevented ($)',
                        data: this.generateTrendData(30, 50000, 200000),
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true
                    },
                    {
                        label: 'Customer Trust Score',
                        data: this.generateTrendData(30, 85, 95),
                        borderColor: '#8B5CF6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        fill: true
                    }
                ]
            }
        };
    }
    
    // Generate ML performance mock data
    generateMLPerformanceData(params) {
        return {
            modelPerformance: {
                labels: this.generateTimeLabels('30d'),
                datasets: [
                    {
                        label: 'Accuracy',
                        data: this.generateTrendData(30, 92, 96),
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)'
                    },
                    {
                        label: 'Precision',
                        data: this.generateTrendData(30, 89, 94),
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)'
                    },
                    {
                        label: 'Recall',
                        data: this.generateTrendData(30, 87, 92),
                        borderColor: '#8B5CF6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)'
                    }
                ]
            }
        };
    }
    
    // Generate predictive mock data
    generatePredictiveData(params) {
        return {
            fraudPrediction: {
                labels: this.generateTimeLabels('30d'),
                datasets: [
                    {
                        label: 'Predicted Fraud Cases',
                        data: this.generateTrendData(30, 50, 150),
                        borderColor: '#EF4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true
                    },
                    {
                        label: 'Actual Fraud Cases',
                        data: this.generateTrendData(30, 40, 120),
                        borderColor: '#F59E0B',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: true
                    }
                ]
            }
        };
    }
    
    // Generate trends mock data
    generateTrendsData(params) {
        return {
            fraudTrends: {
                labels: this.generateTimeLabels('90d'),
                datasets: [
                    {
                        label: 'Velocity Fraud',
                        data: this.generateTrendData(90, 20, 80),
                        borderColor: '#EF4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)'
                    },
                    {
                        label: 'Geographic Fraud',
                        data: this.generateTrendData(90, 15, 60),
                        borderColor: '#F59E0B',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)'
                    },
                    {
                        label: 'Cluster Fraud',
                        data: this.generateTrendData(90, 10, 40),
                        borderColor: '#8B5CF6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)'
                    }
                ]
            }
        };
    }
    
    // Generate time labels based on range
    generateTimeLabels(timeRange) {
        const labels = [];
        const now = new Date();
        let days = 30;
        
        switch (timeRange) {
            case '7d': days = 7; break;
            case '30d': days = 30; break;
            case '90d': days = 90; break;
            case '1y': days = 365; break;
        }
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        
        return labels;
    }
    
    // Generate trend data
    generateTrendData(points, min, max) {
        const data = [];
        let current = min + Math.random() * (max - min);
        
        for (let i = 0; i < points; i++) {
            const variation = (Math.random() - 0.5) * (max - min) * 0.1;
            current = Math.max(min, Math.min(max, current + variation));
            data.push(Math.round(current));
        }
        
        return data;
    }
    
    // Update business impact UI
    updateBusinessImpactUI() {
        const data = this.analyticsData.businessImpact;
        if (!data) return;
        
        // Update KPI cards
        document.getElementById('lossesPrevented').textContent = this.formatCurrency(data.lossesPrevented.value);
        document.getElementById('lossesPreventedChange').textContent = data.lossesPrevented.change;
        
        document.getElementById('returnFraudReduction').textContent = data.returnFraudReduction.value;
        document.getElementById('returnFraudChange').textContent = data.returnFraudReduction.change;
        
        document.getElementById('customerTrust').textContent = data.customerTrust.value;
        document.getElementById('customerTrustChange').textContent = data.customerTrust.change;
        
        document.getElementById('supplyChainEfficiency').textContent = data.supplyChainEfficiency.value;
        document.getElementById('supplyChainChange').textContent = data.supplyChainEfficiency.change;
    }
    
    // Initialize charts for specific tab
    initializeChartsForTab(tabName) {
        switch (tabName) {
            case 'business-impact':
                this.initBusinessImpactCharts();
                break;
            case 'ml-performance':
                this.initMLPerformanceCharts();
                break;
            case 'predictive':
                this.initPredictiveCharts();
                break;
            case 'trends':
                this.initTrendsCharts();
                break;
        }
    }
    
    // Initialize business impact charts
    initBusinessImpactCharts() {
        // Business Impact Chart
        const businessImpactCtx = document.getElementById('businessImpactChart');
        if (businessImpactCtx && this.analyticsData.businessImpact) {
            this.destroyChart('businessImpactChart');
            this.charts.businessImpactChart = new Chart(businessImpactCtx, {
                type: 'line',
                data: this.analyticsData.businessImpact.chartData,
                options: this.getChartOptions('Business Impact Over Time')
            });
        }
        
        // Cost Breakdown Chart
        const costBreakdownCtx = document.getElementById('costBreakdownChart');
        if (costBreakdownCtx) {
            this.destroyChart('costBreakdownChart');
            this.charts.costBreakdownChart = new Chart(costBreakdownCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Implementation', 'Operations', 'Training', 'Maintenance'],
                    datasets: [{
                        data: [35, 30, 20, 15],
                        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
                    }]
                },
                options: this.getDoughnutChartOptions()
            });
        }
        
        // Fraud Category Chart
        const fraudCategoryCtx = document.getElementById('fraudCategoryChart');
        if (fraudCategoryCtx) {
            this.destroyChart('fraudCategoryChart');
            this.charts.fraudCategoryChart = new Chart(fraudCategoryCtx, {
                type: 'bar',
                data: {
                    labels: ['Velocity', 'Geographic', 'Cluster', 'Anomaly'],
                    datasets: [{
                        label: 'Cases Prevented',
                        data: [145, 98, 67, 34],
                        backgroundColor: ['#EF4444', '#F59E0B', '#8B5CF6', '#10B981']
                    }]
                },
                options: this.getBarChartOptions('Fraud Prevention by Category')
            });
        }
        
                // Savings Trend Chart
        const savingsTrendCtx = document.getElementById('savingsTrendChart');
        if (savingsTrendCtx) {
            this.destroyChart('savingsTrendChart');
            this.charts.savingsTrendChart = new Chart(savingsTrendCtx, {
                type: 'line',
                data: {
                    labels: this.generateTimeLabels('30d'),
                    datasets: [{
                        label: 'Monthly Savings ($)',
                        data: this.generateTrendData(30, 180000, 250000),
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true
                    }]
                },
                options: this.getChartOptions('Monthly Savings Trend')
            });
        }
    }
    
    // Initialize ML performance charts
    initMLPerformanceCharts() {
        const modelPerformanceCtx = document.getElementById('modelPerformanceChart');
        if (modelPerformanceCtx && this.analyticsData.mlPerformance) {
            this.destroyChart('modelPerformanceChart');
            this.charts.modelPerformanceChart = new Chart(modelPerformanceCtx, {
                type: 'line',
                data: this.analyticsData.mlPerformance.modelPerformance,
                options: this.getChartOptions('Model Performance Over Time')
            });
        }
    }
    
    // Initialize predictive charts
    initPredictiveCharts() {
        // Fraud Prediction Chart
        const fraudPredictionCtx = document.getElementById('fraudPredictionChart');
        if (fraudPredictionCtx && this.analyticsData.predictive) {
            this.destroyChart('fraudPredictionChart');
            this.charts.fraudPredictionChart = new Chart(fraudPredictionCtx, {
                type: 'line',
                data: this.analyticsData.predictive.fraudPrediction,
                options: this.getChartOptions('Fraud Prediction vs Actual')
            });
        }
        
        // Anomaly Patterns Chart
        const anomalyPatternsCtx = document.getElementById('anomalyPatternsChart');
        if (anomalyPatternsCtx) {
            this.destroyChart('anomalyPatternsChart');
            this.charts.anomalyPatternsChart = new Chart(anomalyPatternsCtx, {
                type: 'radar',
                data: {
                    labels: ['Velocity', 'Geographic', 'Cluster', 'Timing', 'Pattern', 'Behavior'],
                    datasets: [{
                        label: 'Anomaly Detection',
                        data: [85, 72, 68, 91, 77, 83],
                        borderColor: '#8B5CF6',
                        backgroundColor: 'rgba(139, 92, 246, 0.2)',
                        pointBackgroundColor: '#8B5CF6',
                        pointBorderColor: '#8B5CF6'
                    }]
                },
                options: this.getRadarChartOptions()
            });
        }
        
        // Seasonal Trends Chart
        const seasonalTrendsCtx = document.getElementById('seasonalTrendsChart');
        if (seasonalTrendsCtx) {
            this.destroyChart('seasonalTrendsChart');
            this.charts.seasonalTrendsChart = new Chart(seasonalTrendsCtx, {
                type: 'line',
                data: {
                    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                    datasets: [{
                        label: 'Fraud Risk Level',
                        data: [45, 32, 67, 89],
                        borderColor: '#F59E0B',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: true
                    }]
                },
                options: this.getChartOptions('Seasonal Fraud Trends')
            });
        }
    }
    
    // Initialize trends charts
    initTrendsCharts() {
        // Fraud Trends Chart
        const fraudTrendsCtx = document.getElementById('fraudTrendsChart');
        if (fraudTrendsCtx && this.analyticsData.trends) {
            this.destroyChart('fraudTrendsChart');
            this.charts.fraudTrendsChart = new Chart(fraudTrendsCtx, {
                type: 'line',
                data: this.analyticsData.trends.fraudTrends,
                options: this.getChartOptions('Fraud Trends Analysis')
            });
        }
        
        // Geographic Heatmap Chart
        const geoHeatmapCtx = document.getElementById('geoHeatmapChart');
        if (geoHeatmapCtx) {
            this.destroyChart('geoHeatmapChart');
            this.charts.geoHeatmapChart = new Chart(geoHeatmapCtx, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'High Risk Areas',
                        data: [
                            {x: 40.7128, y: -74.0060, r: 15}, // NYC
                            {x: 34.0522, y: -118.2437, r: 12}, // LA
                            {x: 41.8781, y: -87.6298, r: 10}, // Chicago
                            {x: 29.7604, y: -95.3698, r: 8}, // Houston
                            {x: 25.7617, y: -80.1918, r: 6}  // Miami
                        ],
                        backgroundColor: 'rgba(239, 68, 68, 0.6)',
                        borderColor: '#EF4444'
                    }]
                },
                options: this.getScatterChartOptions('Geographic Risk Distribution')
            });
        }
    }
    
    // Get chart options
    getChartOptions(title) {
        return {
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
    }
    
    // Get doughnut chart options
    getDoughnutChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#D1D5DB',
                        padding: 20
                    }
                }
            }
        };
    }
    
    // Get bar chart options
    getBarChartOptions(title) {
        return {
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
                    grid: {
                        color: '#374151'
                    },
                    ticks: {
                        color: '#9CA3AF'
                    }
                }
            }
        };
    }
    
    // Get radar chart options
    getRadarChartOptions() {
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
                    grid: {
                        color: '#374151'
                    },
                    angleLines: {
                        color: '#374151'
                    },
                    pointLabels: {
                        color: '#9CA3AF'
                    },
                    ticks: {
                        color: '#9CA3AF',
                        backdropColor: 'transparent'
                    }
                }
            }
        };
    }
    
    // Get scatter chart options
    getScatterChartOptions(title) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Latitude',
                        color: '#9CA3AF'
                    },
                    grid: {
                        color: '#374151'
                    },
                    ticks: {
                        color: '#9CA3AF'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Longitude',
                        color: '#9CA3AF'
                    },
                    grid: {
                        color: '#374151'
                    },
                    ticks: {
                        color: '#9CA3AF'
                    }
                }
            }
        };
    }
    
    // Calculate ROI
    calculateROI() {
        const implementationCost = parseFloat(document.getElementById('implementationCost').value) || 0;
        const operatingCost = parseFloat(document.getElementById('operatingCost').value) || 0;
        const timePeriod = parseFloat(document.getElementById('timePeriod').value) || 0;
        
        if (implementationCost === 0 || operatingCost === 0 || timePeriod === 0) {
            document.getElementById('roiResults').classList.add('hidden');
            return;
        }
        
        // Calculate based on current analytics data
        const data = this.analyticsData.businessImpact;
        const monthlySavings = data ? (data.lossesPrevented.value / 12) : 200000; // Default $200k/month
        
        const totalInvestment = implementationCost + (operatingCost * timePeriod);
        const totalSavings = monthlySavings * timePeriod;
        const netBenefit = totalSavings - totalInvestment;
        const roiPercentage = ((netBenefit / totalInvestment) * 100).toFixed(1);
        
        // Update UI
        document.getElementById('totalInvestment').textContent = this.formatCurrency(totalInvestment);
        document.getElementById('totalSavings').textContent = this.formatCurrency(totalSavings);
        document.getElementById('netBenefit').textContent = this.formatCurrency(netBenefit);
        document.getElementById('roiPercentage').textContent = `${roiPercentage}%`;
        
        // Show results
        document.getElementById('roiResults').classList.remove('hidden');
    }
    
    // Export report
    async exportReport() {
        try {
            this.showNotification('Generating report...', 'info');
            
            // Simulate report generation
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Create and download file
            const reportData = {
                timeRange: this.currentTimeRange,
                generatedAt: new Date().toISOString(),
                businessImpact: this.analyticsData.businessImpact,
                mlPerformance: this.analyticsData.mlPerformance,
                predictive: this.analyticsData.predictive,
                trends: this.analyticsData.trends
            };
            
            const blob = new Blob([JSON.stringify(reportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `vericart-analytics-report-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Report exported successfully', 'success');
            
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Export failed', 'error');
        }
    }
    
    // Refresh all data
    async refreshAllData() {
        try {
            this.showNotification('Refreshing analytics data...', 'info');
            await this.loadInitialData();
            this.showNotification('Data refreshed successfully', 'success');
        } catch (error) {
            console.error('Refresh failed:', error);
            this.showNotification('Refresh failed', 'error');
        }
    }
    
    // Handle real-time updates
    handleRealTimeUpdate(data) {
        if (data.type === 'business_impact') {
            this.analyticsData.businessImpact = { ...this.analyticsData.businessImpact, ...data.payload };
            this.updateBusinessImpactUI();
        } else if (data.type === 'ml_performance') {
            this.analyticsData.mlPerformance = { ...this.analyticsData.mlPerformance, ...data.payload };
        }
        
        // Refresh charts if needed
        if (this.charts[data.chartId]) {
            this.charts[data.chartId].data = data.chartData;
            this.charts[data.chartId].update();
        }
    }
    
    // Start periodic refresh
    startPeriodicRefresh() {
        this.refreshInterval = setInterval(() => {
            this.refreshAllData();
        }, 300000); // Refresh every 5 minutes
    }
    
    // Stop periodic refresh
    stopPeriodicRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
    
    // Destroy chart
    destroyChart(chartId) {
        if (this.charts[chartId]) {
            this.charts[chartId].destroy();
            delete this.charts[chartId];
        }
    }
    
    // Update connection status
    updateConnectionStatus(status) {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        if (!statusIndicator || !statusText) return;
        
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
            case 'error':
                statusIndicator.classList.add('status-error');
                statusText.textContent = 'Connection Error';
                break;
        }
    }
    
    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
    
    // Show notification
    showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;
        
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
    
    // Cleanup on page unload
    cleanup() {
        this.stopPeriodicRefresh();
        
        // Destroy all charts
        Object.keys(this.charts).forEach(chartId => {
            this.destroyChart(chartId);
        });
        
        // Disconnect WebSocket
        if (typeof wsService !== 'undefined') {
            wsService.disconnect();
        }
    }
}

// Initialize analytics manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsManager = new AnalyticsManager();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.analyticsManager) {
        window.analyticsManager.cleanup();
    }
});

        
