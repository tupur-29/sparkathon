class WebSocketService {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.heartbeatInterval = null;
        this.messageHandlers = new Map();
        this.connectionStatusCallback = null;
    }

    // Connect to WebSocket
    connect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return;
        }

        try {
            this.ws = new WebSocket(CONFIG.WS_URL, [], {
                headers: {
                    'X-API-Key': CONFIG.API_KEY
                }
            });

            this.ws.onopen = this.onOpen.bind(this);
            this.ws.onmessage = this.onMessage.bind(this);
            this.ws.onclose = this.onClose.bind(this);
            this.ws.onerror = this.onError.bind(this);

            this.updateConnectionStatus('connecting');
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            this.updateConnectionStatus('offline');
            this.scheduleReconnect();
        }
    }

    // Handle WebSocket open
    onOpen() {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.updateConnectionStatus('online');
        this.startHeartbeat();
    }

    // Handle incoming messages
    onMessage(event) {
        try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
        }
    }

    // Handle WebSocket close
    onClose(event) {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.updateConnectionStatus('offline');
        this.stopHeartbeat();

        if (event.code !== 1000) { // Not a normal closure
            this.scheduleReconnect();
        }
    }

    // Handle WebSocket error
    onError(error) {
        console.error('WebSocket error:', error);
        this.updateConnectionStatus('offline');
    }

    // Handle different message types
    handleMessage(data) {
        const { type, payload } = data;

        switch (type) {
            case 'new_alert':
                this.handleNewAlert(payload);
                break;
            case 'scan_update':
                this.handleScanUpdate(payload);
                break;
            case 'dashboard_stats':
                this.handleDashboardStats(payload);
                break;
            case 'heartbeat':
                this.handleHeartbeat();
                break;
            default:
                console.warn('Unknown message type:', type);
        }

        // Call registered handlers
        if (this.messageHandlers.has(type)) {
            this.messageHandlers.get(type).forEach(handler => {
                try {
                    handler(payload);
                } catch (error) {
                    console.error('Message handler error:', error);
                }
            });
        }
    }

    // Handle new alert
    handleNewAlert(alert) {
        console.log('New alert received:', alert);
        
        // Add to alerts display
        if (window.app) {
            window.app.addNewAlert(alert);
        }

        // Show notification
        this.showNotification('New fraud alert detected!', 'warning');
        
        // Update dashboard stats
        if (window.app && window.app.currentPage === 'dashboard') {
            window.app.refreshDashboardStats();
        }
    }

    // Handle scan update
    handleScanUpdate(scan) {
        console.log('Scan update received:', scan);
        
        // Update map
        if (window.app && window.app.map) {
            window.app.addScanToMap(scan);
        }

        // Update counters
        if (window.app) {
            window.app.incrementScanCounter();
        }
    }

    // Handle dashboard stats update
    handleDashboardStats(stats) {
        console.log('Dashboard stats update received:', stats);
        
        if (window.app && window.app.currentPage === 'dashboard') {
            window.app.updateDashboardStats(stats);
        }
    }

    // Handle heartbeat
    handleHeartbeat() {
        // Send heartbeat response
        this.send({
            type: 'heartbeat_response',
            timestamp: new Date().toISOString()
        });
    }

    // Send message
    send(data) {
        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            console.warn('WebSocket not connected, message not sent:', data);
        }
    }

    // Subscribe to message type
    subscribe(messageType, handler) {
        if (!this.messageHandlers.has(messageType)) {
            this.messageHandlers.set(messageType, []);
        }
        this.messageHandlers.get(messageType).push(handler);
    }

    // Unsubscribe from message type
    unsubscribe(messageType, handler) {
        if (this.messageHandlers.has(messageType)) {
            const handlers = this.messageHandlers.get(messageType);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
    }

    // Start heartbeat
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            this.send({
                type: 'heartbeat',
                timestamp: new Date().toISOString()
            });
        }, 30000); // Send heartbeat every 30 seconds
    }

    // Stop heartbeat
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    // Schedule reconnect
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnection attempts reached');
            this.updateConnectionStatus('offline');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        
        console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
        
        setTimeout(() => {
            this.connect();
        }, delay);
    }

    // Update connection status
    updateConnectionStatus(status) {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');

        if (statusIndicator && statusText) {
            statusIndicator.className = `status-indicator status-${status}`;
            
            switch (status) {
                case 'online':
                    statusText.textContent = 'Connected';
                    break;
                case 'offline':
                    statusText.textContent = 'Disconnected';
                    break;
                case 'connecting':
                    statusText.textContent = 'Connecting...';
                    break;
                default:
                    statusText.textContent = 'Unknown';
            }
        }

        // Call callback if registered
        if (this.connectionStatusCallback) {
            this.connectionStatusCallback(status);
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        const container = document.getElementById('notificationContainer');
        container.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Hide notification after timeout
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                container.removeChild(notification);
            }, 300);
        }, CONFIG.NOTIFICATION_TIMEOUT);
    }

    // Disconnect
    disconnect() {
        if (this.ws) {
            this.ws.close(1000, 'Normal closure');
            this.ws = null;
        }
        this.isConnected = false;
        this.stopHeartbeat();
    }

    // Set connection status callback
    setConnectionStatusCallback(callback) {
        this.connectionStatusCallback = callback;
    }

    // Get connection status
    getConnectionStatus() {
        if (!this.ws) return 'offline';
        
        switch (this.ws.readyState) {
            case WebSocket.CONNECTING:
                return 'connecting';
            case WebSocket.OPEN:
                return 'online';
            case WebSocket.CLOSING:
            case WebSocket.CLOSED:
                return 'offline';
            default:
                return 'unknown';
        }
    }
}

// Create global WebSocket instance
const wsService = new WebSocketService();
