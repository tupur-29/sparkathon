// VeriCart AI Alerts Management
class AlertsManager {
    constructor() {
        this.currentPage = 1;
        this.currentFilters = {
            status: 'all',
            search: '',
            sortBy: 'timestamp',
            sortOrder: 'desc'
        };
        this.selectedAlerts = new Set();
        this.alerts = [];
        this.alertStats = {};
        this.totalPages = 1;
        this.totalAlerts = 0;
        this.currentAlertId = null;
        
        this.init();
    }
    
    // Initialize the alerts manager
    init() {
        this.setupEventListeners();
        this.setupWebSocket();
        this.loadInitialData();
        this.startPeriodicRefresh();
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Refresh button
        document.getElementById('refreshAlertsBtn').addEventListener('click', () => {
            this.loadAlerts();
            this.loadAlertStats();
        });
        
        // Export button
        document.getElementById('exportAlertsBtn').addEventListener('click', () => {
            this.exportAlerts();
        });
        
        // Search input
        const searchInput = document.getElementById('alertSearchInput');
        searchInput.addEventListener('input', this.debounce((e) => {
            this.currentFilters.search = e.target.value;
            this.currentPage = 1;
            this.loadAlerts();
        }, 300));
        
        // Sort dropdown
        document.getElementById('alertSortSelect').addEventListener('change', (e) => {
            const [sortBy, sortOrder] = e.target.value.split('_');
            this.currentFilters.sortBy = sortBy;
            this.currentFilters.sortOrder = sortOrder;
            this.loadAlerts();
        });
        
        // Status filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const status = e.target.closest('.filter-btn').dataset.status;
                this.setActiveFilter(status);
                this.currentFilters.status = status;
                this.currentPage = 1;
                this.loadAlerts();
            });
        });
        
        // Select all checkbox
        document.getElementById('selectAllAlerts').addEventListener('change', (e) => {
            this.toggleSelectAll(e.target.checked);
        });
        
        // Bulk actions
        this.setupBulkActions();
        
        // Modal event listeners
        this.setupModalListeners();
        
        // Pagination
        this.setupPagination();
    }
    
    // Setup pagination
    setupPagination() {
        document.getElementById('prevPageBtn').addEventListener('click', () => {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.loadAlerts();
            }
        });
        
        document.getElementById('nextPageBtn').addEventListener('click', () => {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
                this.loadAlerts();
            }
        });
    }
    
    // Setup modal listeners
    setupModalListeners() {
        // Alert modal
        document.getElementById('closeAlertModal').addEventListener('click', () => {
            document.getElementById('alertModal').classList.add('hidden');
        });
        
        // Status modal
        document.getElementById('closeStatusModal').addEventListener('click', () => {
            document.getElementById('statusModal').classList.add('hidden');
        });
        
        document.getElementById('cancelStatusUpdate').addEventListener('click', () => {
            document.getElementById('statusModal').classList.add('hidden');
        });
        
        // Status update form
        document.getElementById('statusUpdateForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleStatusUpdate();
        });
    }
    
    // Handle status update from form
    handleStatusUpdate() {
        if (!this.currentAlertId) return;
        
        const newStatus = document.getElementById('newStatusSelect').value;
        const notes = document.getElementById('statusNotes').value;
        
        if (!newStatus) {
            this.showNotification('Please select a status', 'error');
            return;
        }
        
        this.updateAlertStatus(this.currentAlertId, newStatus, notes);
        document.getElementById('statusModal').classList.add('hidden');
    }
    
    // Setup WebSocket connection (simplified)
    setupWebSocket() {
        // Simulate WebSocket connection
        this.connectWebSocket();
    }
    
    // Connect to WebSocket (mock implementation)
    connectWebSocket() {
        // Update connection status
        this.updateConnectionStatus('connected');
        
        // Simulate real-time updates
        setInterval(() => {
            this.simulateRealTimeUpdate();
        }, 30000); // Every 30 seconds
    }
    
    // Load initial data
    async loadInitialData() {
        try {
            await Promise.all([
                this.loadAlerts(),
                this.loadAlertStats()
            ]);
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showNotification('Failed to load alerts data', 'error');
        }
    }
    
    // Load alerts from API
    async loadAlerts() {
        try {
            this.showLoadingState();
            
            const params = {
                page: this.currentPage,
                limit: 25,
                status: this.currentFilters.status === 'all' ? null : this.currentFilters.status,
                search: this.currentFilters.search,
                sortBy: this.currentFilters.sortBy,
                sortOrder: this.currentFilters.sortOrder
            };
            
            // Simulate API call
            const response = await this.mockApiCall('/alerts', params);
            
            this.alerts = response.alerts;
            this.totalPages = response.totalPages;
            this.totalAlerts = response.totalAlerts;
            
            this.renderAlertsTable();
            this.updatePagination();
            this.updateFilterCounts();
            
            // Reset selection when loading new alerts
            this.selectedAlerts.clear();
            this.updateBulkActionsState();
            
        } catch (error) {
            console.error('Failed to load alerts:', error);
            this.showErrorState();
        }
    }
    
    // Load alert statistics
    async loadAlertStats() {
        try {
            const response = await this.mockApiCall('/alerts/stats');
            this.alertStats = response;
            this.updateStatsCards();
        } catch (error) {
            console.error('Failed to load alert stats:', error);
        }
    }
    
    // Mock API call for demonstration
    async mockApiCall(endpoint, params = {}) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data based on endpoint
        if (endpoint === '/alerts') {
            return this.generateMockAlerts(params);
        } else if (endpoint === '/alerts/stats') {
            return this.generateMockStats();
        } else if (endpoint.includes('/alerts/')) {
            // Single alert details
            const alertId = endpoint.split('/alerts/')[1];
            return this.generateMockAlertDetails(alertId);
        }
        
        throw new Error('Unknown endpoint');
    }
    
    // Generate mock alerts data
    generateMockAlerts(params) {
        const mockAlerts = [
            {
                id: 'ALT-001',
                type: 'velocity_fraud',
                title: 'Velocity Fraud Detected',
                description: 'Product scanned in multiple locations within impossible timeframe',
                product_id: 'PROD-12345',
                product_name: 'iPhone 14 Pro',
                risk_score: 95,
                status: 'new',
                timestamp: '2024-07-04T14:30:00Z',
                location: 'New York, NY',
                details: {
                    scan_locations: ['New York, NY', 'Los Angeles, CA'],
                    time_difference: '2 hours',
                    distance: '2,445 miles'
                }
            },
            {
                id: 'ALT-002',
                type: 'geographic_fraud',
                title: 'Geographic Anomaly',
                description: 'Product appeared in unexpected location',
                product_id: 'PROD-67890',
                product_name: 'Samsung Galaxy S23',
                risk_score: 75,
                status: 'investigating',
                timestamp: '2024-07-04T13:15:00Z',
                location: 'Miami, FL',
                details: {
                    expected_location: 'Atlanta, GA',
                    actual_location: 'Miami, FL',
                    supply_chain_deviation: true
                }
            },
            {
                id: 'ALT-003',
                type: 'cluster_fraud',
                title: 'Cluster Fraud Pattern',
                description: 'Multiple failed verifications at single location',
                product_id: 'PROD-11111',
                product_name: 'MacBook Pro',
                risk_score: 85,
                status: 'resolved',
                timestamp: '2024-07-04T12:00:00Z',
                location: 'Chicago, IL',
                details: {
                    failed_scans: 15,
                    store_id: 'WM-4567',
                    time_window: '2 hours'
                }
            }
        ];
        
        // Apply filters
        let filteredAlerts = mockAlerts;
        
        if (params.status && params.status !== 'all') {
            filteredAlerts = filteredAlerts.filter(alert => alert.status === params.status);
        }
        
        if (params.search) {
            const searchLower = params.search.toLowerCase();
            filteredAlerts = filteredAlerts.filter(alert => 
                alert.title.toLowerCase().includes(searchLower) ||
                alert.product_name.toLowerCase().includes(searchLower) ||
                alert.location.toLowerCase().includes(searchLower)
            );
        }
        
        return {
            alerts: filteredAlerts,
            totalAlerts: filteredAlerts.length,
            totalPages: Math.ceil(filteredAlerts.length / 25),
            currentPage: params.page || 1
        };
    }
    
    // Generate mock alert details
    generateMockAlertDetails(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) return null;
        
        return {
            ...alert,
            history: [
                {
                    timestamp: '2024-07-04T14:30:00Z',
                    action: 'created',
                    user: 'AI System',
                    notes: 'Alert automatically generated by VeriCart AI'
                },
                {
                    timestamp: '2024-07-04T14:35:12Z',
                    action: 'assigned',
                    user: 'John Smith',
                    notes: 'Assigned to Fraud Prevention Team'
                }
            ],
            related_scans: [
                {
                    id: 'SCAN-45678',
                    timestamp: '2024-07-04T10:30:00Z',
                    location: 'New York, NY',
                    device_id: 'DEV-123',
                    status: 'verified'
                },
                {
                    id: 'SCAN-45679',
                    timestamp: '2024-07-04T12:30:00Z',
                    location: 'Los Angeles, CA',
                    device_id: 'DEV-456',
                    status: 'failed'
                }
            ],
            analysis: {
                probability: 0.94,
                factors: [
                    'Impossible travel speed (725 mph)',
                    'Previously flagged device',
                    'Suspicious scan pattern'
                ],
                recommendation: 'Immediate investigation required'
            }
        };
    }
    
    // Generate mock statistics
    generateMockStats() {
        return {
            total_alerts: 127,
            new_alerts: 8,
            investigating_alerts: 15,
            resolved_alerts_24h: 23,
            by_status: {
                new: 8,
                investigating: 15,
                resolved: 89,
                dismissed: 15
            },
            by_type: {
                velocity_fraud: 45,
                geographic_fraud: 32,
                cluster_fraud: 28,
                anomaly_detection: 22
            }
        };
    }
    
    // Render alerts table
    renderAlertsTable() {
        const tbody = document.getElementById('alertsTableBody');
        
        if (this.alerts.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-16">
                        <div class="text-gray-400">
                            <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                            <p class="text-lg">No alerts found</p>
                            <p class="text-sm">Try adjusting your filters</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.alerts.map(alert => this.renderAlertRow(alert)).join('');
        
        // Add event listeners to new rows
        this.setupRowEventListeners();
    }
    
    // Render individual alert row
    renderAlertRow(alert) {
        const riskLevel = this.getRiskLevel(alert.risk_score);
        const statusClass = this.getStatusClass(alert.status);
        
        return `
            <tr class="border-b border-gray-700 hover:bg-gray-700" data-alert-id="${alert.id}">
                <td class="py-3 px-4">
                    <input type="checkbox" class="alert-checkbox rounded" value="${alert.id}">
                </td>
                <td class="py-3 px-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-${riskLevel.color}-600 rounded-lg flex items-center justify-center">
                            <i class="fas fa-exclamation-triangle text-white text-sm"></i>
                        </div>
                        <div>
                            <h4 class="text-white font-medium">${alert.title}</h4>
                            <p class="text-gray-400 text-sm">${alert.description}</p>
                        </div>
                    </div>
                </td>
                <td class="py-3 px-4">
                    <div>
                        <p class="text-white font-medium">${alert.product_name}</p>
                        <p class="text-gray-400 text-sm">${alert.product_id}</p>
                    </div>
                </td>
                <td class="py-3 px-4">
                    <div class="flex items-center space-x-2">
                        <div class="w-2 h-2 bg-${riskLevel.color}-500 rounded-full"></div>
                        <span class="text-${riskLevel.color}-400 font-medium">${alert.risk_score}</span>
                        <span class="text-gray-400 text-sm">(${riskLevel.label})</span>
                    </div>
                </td>
                <td class="py-3 px-4">
                    <span class="status-badge status-${alert.status}">${this.formatStatus(alert.status)}</span>
                </td>
                <td class="py-3 px-4">
                    <div>
                        <p class="text-white text-sm">${this.formatTimestamp(alert.timestamp)}</p>
                        <p class="text-gray-400 text-xs">${this.getRelativeTime(alert.timestamp)}</p>
                    </div>
                </td>
                <td class="py-3 px-4">
                    <div class="flex items-center space-x-2">
                        <button class="btn-icon view-alert-btn" data-alert-id="${alert.id}" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon update-status-btn" data-alert-id="${alert.id}" title="Update Status">
                            <i class="fas fa-edit"></i>
                        </button>
                        <div class="relative">
                            <button class="btn-icon dropdown-btn" data-alert-id="${alert.id}" title="More Actions">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <div class="dropdown-menu hidden" id="dropdown-${alert.id}">
                                <button class="dropdown-item investigate-btn" data-alert-id="${alert.id}">
                                    <i class="fas fa-search mr-2"></i>Investigate
                                </button>
                                <button class="dropdown-item resolve-btn" data-alert-id="${alert.id}">
                                    <i class="fas fa-check mr-2"></i>Resolve
                                </button>
                                <button class="dropdown-item dismiss-btn" data-alert-id="${alert.id}">
                                    <i class="fas fa-times mr-2"></i>Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                </td>
            </tr>
        `;
    }
    
    // Setup row event listeners
    setupRowEventListeners() {
        // Checkbox listeners
        document.querySelectorAll('.alert-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const alertId = e.target.value;
                if (e.target.checked) {
                    this.selectedAlerts.add(alertId);
                } else {
                    this.selectedAlerts.delete(alertId);
                }
                this.updateBulkActionsState();
            });
        });
        
        // View alert buttons
        document.querySelectorAll('.view-alert-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const alertId = e.currentTarget.dataset.alertId;
                this.showAlertDetails(alertId);
            });
        });
        
        // Update status buttons
        document.querySelectorAll('.update-status-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const alertId = e.currentTarget.dataset.alertId;
                this.showStatusUpdateModal(alertId);
            });
        });
        
        // Dropdown buttons
                // Dropdown buttons
        document.querySelectorAll('.dropdown-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const alertId = e.currentTarget.dataset.alertId;
                this.toggleDropdown(alertId);
                
                // Prevent event propagation to avoid immediate closing
                e.stopPropagation();
            });
        });
        
        // Action buttons
        document.querySelectorAll('.investigate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const alertId = e.currentTarget.dataset.alertId;
                this.updateAlertStatus(alertId, 'investigating');
                
                // Close dropdown after action
                document.getElementById(`dropdown-${alertId}`).classList.add('hidden');
            });
        });
        
        document.querySelectorAll('.resolve-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const alertId = e.currentTarget.dataset.alertId;
                this.updateAlertStatus(alertId, 'resolved');
                
                // Close dropdown after action
                document.getElementById(`dropdown-${alertId}`).classList.add('hidden');
            });
        });
        
        document.querySelectorAll('.dismiss-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const alertId = e.currentTarget.dataset.alertId;
                this.updateAlertStatus(alertId, 'dismissed');
                
                // Close dropdown after action
                document.getElementById(`dropdown-${alertId}`).classList.add('hidden');
            });
        });
        
        // Add row click handler for better UX
        document.querySelectorAll('tr[data-alert-id]').forEach(row => {
            // Exclude clicks on buttons and checkboxes
            row.addEventListener('click', (e) => {
                if (!e.target.closest('button') && !e.target.closest('input')) {
                    const alertId = row.dataset.alertId;
                    this.showAlertDetails(alertId);
                }
            });
            
            // Add hover effect for better UX
            row.classList.add('cursor-pointer');
        });
        
        // Add outside click handler to close all dropdowns
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown-btn') && !e.target.closest('.dropdown-menu')) {
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.classList.add('hidden');
                });
            }
        });
    }
}
