/*!
 * VeriCart WebSocket Service
 * Handles real-time communication with the VeriCart backend
 * Version: 1.0.0
 */

class WebSocketService {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = CONFIG.WS_MAX_RECONNECT_ATTEMPTS || 10;
        this.reconnectDelay = CONFIG.WS_RECONNECT_INTERVAL || 5000;
        this.heartbeatInterval = null;
        this.heartbeatTimeout = null;
        this.messageHandlers = new Map();
        this.connectionStatusCallback = null;
        this.messageQueue = [];
        this.isReconnecting = false;
        this.lastHeartbeat = null;
        this.connectionId = null;
        this.retryTimeouts = [];
        
        // Performance monitoring
        this.messageCount = 0;
        this.reconnectCount = 0;
        this.lastConnectionTime = null;
        
        // Bind methods to preserve context
        this.onOpen = this.onOpen.bind(this);
        this.onMessage = this.onMessage.bind(this);
        this.onClose = this.onClose.bind(this);
        this.onError = this.onError.bind(this);
        
        // Initialize connection if auto-connect is enabled
        if (CONFIG.FEATURES?.REAL_TIME_ALERTS) {
            this.connect();
        }
    }

    /**
     * Connect to WebSocket server
     */
    connect() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.log('Already connected to WebSocket');
            return Promise.resolve();
        }

        if (this.isReconnecting) {
            this.log('Reconnection already in progress');
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            try {
                this.log('Attempting to connect to WebSocket...');
                this.updateConnectionStatus('connecting');
                
                const wsUrl = this.getWebSocketUrl();
                this.ws = new WebSocket(wsUrl);

                this.ws.onopen = (event) => {
                    this.onOpen(event);
                    resolve();
                };
                
                this.ws.onmessage = this.onMessage;
                this.ws.onclose = this.onClose;
                this.ws.onerror = (error) => {
                    this.onError(error);
                    reject(error);
                };

                // Set connection timeout
                setTimeout(() => {
                    if (this.ws.readyState === WebSocket.CONNECTING) {
                        this.ws.close();
                        reject(new Error('WebSocket connection timeout'));
                    }
                }, CONFIG.REQUEST_TIMEOUT || 30000);

            } catch (error) {
                this.error('WebSocket connection failed:', error);
                this.updateConnectionStatus('offline');
                this.scheduleReconnect();
                reject(error);
            }
        });
    }

    /**
     * Get WebSocket URL with proper protocol and authentication
     */
    getWebSocketUrl() {
        let wsUrl = CONFIG.utils?.getWsUrl() || CONFIG.WS_URL;
        
        // Add authentication if API key is available
        if (CONFIG.API_KEY) {
            const separator = wsUrl.includes('?') ? '&' : '?';
            wsUrl += `${separator}api_key=${CONFIG.API_KEY}`;
        }
        
        // Add connection ID for tracking
        this.connectionId = this.generateConnectionId();
        const separator = wsUrl.includes('?') ? '&' : '?';
        wsUrl += `${separator}connection_id=${this.connectionId}`;
        
        return wsUrl;
    }

    /**
     * Generate unique connection ID
     */
    generateConnectionId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Handle WebSocket connection open
     */
    onOpen(event) {
        this.log('WebSocket connected successfully');
        this.isConnected = true;
        this.isReconnecting = false;
        this.reconnectAttempts = 0;
        this.lastConnectionTime = new Date();
        
        // Clear any pending reconnect timeouts
        this.clearReconnectTimeouts();
        
        this.updateConnectionStatus('online');
        this.startHeartbeat();
        
        // Send any queued messages
        this.processMessageQueue();
        
        // Send initial connection info
        this.send({
            type: 'connection_info',
            payload: {
                user_agent: navigator.userAgent,
                timestamp: new Date().toISOString(),
                connection_id: this.connectionId,
                features: Object.keys(CONFIG.FEATURES).filter(key => CONFIG.FEATURES[key])
            }
        });

        // Emit connection event
        this.emit('connected', { event, connectionId: this.connectionId });
    }

    /**
     * Handle incoming WebSocket messages
     */
    onMessage(event) {
        try {
            const data = JSON.parse(event.data);
            this.messageCount++;
            
            if (CONFIG.DEBUG_MODE) {
                this.log('Received message:', data);
            }
            
            this.handleMessage(data);
        } catch (error) {
            this.error('Failed to parse WebSocket message:', error, event.data);
        }
    }

    /**
     * Handle WebSocket connection close
     */
    onClose(event) {
        this.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.updateConnectionStatus('offline');
        this.stopHeartbeat();
        
        // Emit disconnection event
        this.emit('disconnected', { event, code: event.code, reason: event.reason });

        // Schedule reconnect unless it was a normal closure
        if (event.code !== 1000 && event.code !== 1001) {
            this.scheduleReconnect();
        }
    }

    /**
     * Handle WebSocket errors
     */
    onError(error) {
        this.error('WebSocket error:', error);
        this.updateConnectionStatus('offline');
        this.emit('error', { error });
    }

    /**
     * Handle different message types
     */
    handleMessage(data) {
        const { type, payload, timestamp } = data;

        // Update last message timestamp
        this.lastMessageTime = new Date();

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
            case 'system_notification':
                this.handleSystemNotification(payload);
                break;
            case 'heartbeat':
                this.handleHeartbeat(payload);
                break;
            case 'heartbeat_response':
                this.handleHeartbeatResponse(payload);
                break;
            case 'bulk_update':
                this.handleBulkUpdate(payload);
                break;
            case 'connection_acknowledged':
                this.handleConnectionAcknowledged(payload);
                break;
            case 'error':
                this.handleServerError(payload);
                break;
            default:
                this.warn('Unknown message type:', type);
        }

        // Call registered handlers
        this.emit(type, payload);
    }

    /**
     * Handle new alert messages
     */
    handleNewAlert(alert) {
        this.log('New alert received:', alert);
        
        // Add to alerts if app is available
        if (window.veriCartApp) {
            window.veriCartApp.handleNewAlert(alert);
        }

        // Show notification
        this.showNotification(
            alert.title || 'New fraud alert detected!', 
            this.getNotificationTypeFromSeverity(alert.severity)
        );
        
        // Play sound if enabled
        if (CONFIG.FEATURES?.SOUND_NOTIFICATIONS) {
            this.playNotificationSound(alert.severity);
        }
    }

    /**
     * Handle scan update messages
     */
    handleScanUpdate(scan) {
        this.log('Scan update received:', scan);
        
        if (window.veriCartApp) {
            window.veriCartApp.handleScanUpdate(scan);
        }
    }

    /**
     * Handle dashboard stats update
     */
    handleDashboardStats(stats) {
        this.log('Dashboard stats update received');
        
        if (window.veriCartApp) {
            window.veriCartApp.handleDashboardStats(stats);
        }
    }

    /**
     * Handle system notifications
     */
    handleSystemNotification(notification) {
        this.log('System notification received:', notification);
        
        this.showNotification(
            notification.message,
            notification.type || 'info',
            notification.timeout || CONFIG.NOTIFICATION_TIMEOUT
        );
    }

    /**
     * Handle heartbeat messages
     */
    handleHeartbeat(payload) {
        this.lastHeartbeat = new Date();
        
        // Send heartbeat response
        this.send({
            type: 'heartbeat_response',
            payload: {
                timestamp: new Date().toISOString(),
                connection_id: this.connectionId,
                message_count: this.messageCount
            }
        });
    }

    /**
     * Handle heartbeat response
     */
    handleHeartbeatResponse(payload) {
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }
        
        this.log('Heartbeat acknowledged');
    }

    /**
     * Handle bulk updates
     */
    handleBulkUpdate(updates) {
        this.log('Bulk update received:', updates);
        
        if (window.veriCartApp) {
            updates.forEach(update => {
                this.handleMessage(update);
            });
        }
    }

    /**
     * Handle connection acknowledged
     */
    handleConnectionAcknowledged(payload) {
        this.log('Connection acknowledged:', payload);
        this.emit('connection_acknowledged', payload);
    }

    /**
     * Handle server errors
     */
    handleServerError(error) {
        this.error('Server error received:', error);
        this.showNotification(
            error.message || 'Server error occurred',
            'error'
        );
    }

    /**
     * Send message to WebSocket server
     */
    send(data) {
        const message = {
            ...data,
            timestamp: new Date().toISOString(),
            connection_id: this.connectionId
        };

        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            try {
                this.ws.send(JSON.stringify(message));
                if (CONFIG.DEBUG_MODE) {
                    this.log('Message sent:', message);
                }
            } catch (error) {
                this.error('Failed to send message:', error);
                this.queueMessage(message);
            }
        } else {
            this.warn('WebSocket not connected, queueing message');
            this.queueMessage(message);
        }
    }

    /**
     * Queue message for later sending
     */
    queueMessage(message) {
        this.messageQueue.push(message);
        
        // Limit queue size
        if (this.messageQueue.length > 100) {
            this.messageQueue.shift();
        }
    }

    /**
     * Process queued messages
     */
    processMessageQueue() {
        if (this.messageQueue.length === 0) return;

        this.log(`Processing ${this.messageQueue.length} queued messages`);
        
        const messages = [...this.messageQueue];
        this.messageQueue = [];
        
        messages.forEach(message => {
            this.send(message);
        });
    }

    /**
     * Subscribe to message type
     */
    subscribe(messageType, handler) {
        if (!this.messageHandlers.has(messageType)) {
            this.messageHandlers.set(messageType, new Set());
        }
        this.messageHandlers.get(messageType).add(handler);
        
        this.log(`Subscribed to message type: ${messageType}`);
    }

    /**
     * Unsubscribe from message type
     */
    unsubscribe(messageType, handler) {
        if (this.messageHandlers.has(messageType)) {
            this.messageHandlers.get(messageType).delete(handler);
            
            if (this.messageHandlers.get(messageType).size === 0) {
                this.messageHandlers.delete(messageType);
            }
        }
    }

    /**
     * Emit event to registered handlers
     */
    emit(eventType, data) {
        if (this.messageHandlers.has(eventType)) {
            this.messageHandlers.get(eventType).forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    this.error('Message handler error:', error);
                }
            });
        }
    }

    /**
     * Start heartbeat mechanism
     */
    startHeartbeat() {
        const interval = CONFIG.WS_HEARTBEAT_INTERVAL || 30000;
        
        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected) {
                this.send({
                    type: 'heartbeat',
                    payload: {
                        timestamp: new Date().toISOString(),
                        connection_id: this.connectionId
                    }
                });
                
                // Set timeout for heartbeat response
                this.heartbeatTimeout = setTimeout(() => {
                    this.warn('Heartbeat timeout, connection may be lost');
                    this.disconnect();
                    this.scheduleReconnect();
                }, 10000);
            }
        }, interval);
    }

    /**
     * Stop heartbeat mechanism
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }
    }

    /**
     * Schedule reconnection with exponential backoff
     */
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.error('Max reconnection attempts reached');
            this.updateConnectionStatus('offline');
            this.showNotification('Unable to connect to real-time service', 'error');
            return;
        }

        if (this.isReconnecting) {
            return;
        }

        this.isReconnecting = true;
        this.reconnectAttempts++;
        this.reconnectCount++;
        
        const delay = Math.min(
            this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
            30000 // Max 30 seconds
        );
        
        this.log(`Scheduling reconnection in ${delay}ms (attempt ${this.reconnectAttempts})`);
        
        const timeoutId = setTimeout(() => {
            this.isReconnecting = false;
            this.connect().catch(error => {
                this.error('Reconnection failed:', error);
                this.scheduleReconnect();
            });
        }, delay);
        
        this.retryTimeouts.push(timeoutId);
    }

    /**
     * Clear all reconnect timeouts
     */
    clearReconnectTimeouts() {
        this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
        this.retryTimeouts = [];
    }

    /**
     * Update connection status in UI
     */
    updateConnectionStatus(status) {
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');

        if (statusIndicator && statusText) {
            // Remove existing status classes
            statusIndicator.className = statusIndicator.className.replace(/status-\w+/g, '');
            statusIndicator.classList.add(`status-${status}`);
            
            switch (status) {
                case 'online':
                    statusIndicator.classList.add('w-2', 'h-2', 'bg-green-500', 'rounded-full', 'animate-pulse');
                    statusText.textContent = 'Connected';
                    break;
                case 'offline':
                    statusIndicator.classList.add('w-2', 'h-2', 'bg-red-500', 'rounded-full', 'animate-pulse');
                    statusText.textContent = 'Disconnected';
                    break;
                case 'connecting':
                    statusIndicator.classList.add('w-2', 'h-2', 'bg-yellow-500', 'rounded-full', 'animate-pulse');
                    statusText.textContent = 'Connecting...';
                    break;
                case 'reconnecting':
                    statusIndicator.classList.add('w-2', 'h-2', 'bg-orange-500', 'rounded-full', 'animate-pulse');
                    statusText.textContent = `Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`;
                    break;
                default:
                    statusIndicator.classList.add('w-2', 'h-2', 'bg-gray-500', 'rounded-full');
                    statusText.textContent = 'Unknown';
            }
        }

        // Call registered callback if available
        if (this.connectionStatusCallback) {
            this.connectionStatusCallback(status);
        }

        // Emit status change event
        this.emit('status_change', { status, timestamp: new Date().toISOString() });
    }

    /**
     * Show notification with proper styling
     */
    showNotification(message, type = 'info', timeout = CONFIG.NOTIFICATION_TIMEOUT) {
        // Use the global notification system if available
        if (window.veriCartApp && typeof window.veriCartApp.showNotification === 'function') {
            window.veriCartApp.showNotification(message, type);
            return;
        }

        // Fallback notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm`;
        
        // Set background colors based on type
        switch (type) {
            case 'success':
                notification.classList.add('bg-green-600', 'text-white');
                break;
            case 'error':
                notification.classList.add('bg-red-600', 'text-white');
                break;
            case 'warning':
                notification.classList.add('bg-yellow-600', 'text-white');
                break;
            case 'info':
            default:
                notification.classList.add('bg-blue-600', 'text-white');
        }

        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="text-sm font-medium">${this.escapeHtml(message)}</span>
                <button class="ml-4 text-white hover:text-gray-200 focus:outline-none" onclick="this.parentElement.parentElement.remove()">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.add('animate-fade-in');
        }, 100);

        // Auto-remove after timeout
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.add('animate-fade-out');
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, timeout);
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Get notification type from alert severity
     */
    getNotificationTypeFromSeverity(severity) {
        switch (severity?.toLowerCase()) {
            case 'critical':
            case 'high':
                return 'error';
            case 'medium':
                return 'warning';
            case 'low':
                return 'info';
            default:
                return 'info';
        }
    }

    /**
     * Play notification sound based on severity
     */
    playNotificationSound(severity) {
        if (!CONFIG.FEATURES?.SOUND_NOTIFICATIONS) return;

        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Different frequencies for different severities
            switch (severity?.toLowerCase()) {
                case 'critical':
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    break;
                case 'high':
                    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                    break;
                case 'medium':
                    oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                    break;
                default:
                    oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
            }

            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            this.warn('Could not play notification sound:', error);
        }
    }

    /**
     * Disconnect from WebSocket
     */
    disconnect() {
        this.log('Disconnecting WebSocket...');
        
        if (this.ws) {
            this.ws.close(1000, 'Normal closure');
            this.ws = null;
        }
        
        this.isConnected = false;
        this.isReconnecting = false;
        this.stopHeartbeat();
        this.clearReconnectTimeouts();
        this.updateConnectionStatus('offline');
        
        this.emit('disconnected', { manual: true });
    }

    /**
     * Force reconnection
     */
    forceReconnect() {
        this.log('Forcing reconnection...');
        this.disconnect();
        this.reconnectAttempts = 0;
        this.connect();
    }

    /**
     * Set connection status callback
     */
    setConnectionStatusCallback(callback) {
        this.connectionStatusCallback = callback;
    }

    /**
     * Get current connection status
     */
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

    /**
     * Get connection statistics
     */
    getConnectionStats() {
        return {
            isConnected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
            reconnectCount: this.reconnectCount,
            messageCount: this.messageCount,
            queuedMessages: this.messageQueue.length,
            lastConnectionTime: this.lastConnectionTime,
            lastHeartbeat: this.lastHeartbeat,
            connectionId: this.connectionId,
            status: this.getConnectionStatus()
        };
    }

    /**
     * Send ping to test connection
     */
    ping() {
        const pingTime = Date.now();
        this.send({
            type: 'ping',
            payload: { timestamp: pingTime }
        });
        
        // Listen for pong response
        const pongHandler = (data) => {
            if (data.timestamp === pingTime) {
                const latency = Date.now() - pingTime;
                this.log(`Ping response received, latency: ${latency}ms`);
                this.unsubscribe('pong', pongHandler);
                this.emit('ping_response', { latency });
            }
        };
        
        this.subscribe('pong', pongHandler);
    }

    /**
     * Send custom message
     */
    sendMessage(type, payload) {
        this.send({
            type: type,
            payload: payload
        });
    }

    /**
     * Request data from server
     */
    requestData(dataType, parameters = {}) {
        const requestId = this.generateRequestId();
        
        this.send({
            type: 'data_request',
            payload: {
                request_id: requestId,
                data_type: dataType,
                parameters: parameters
            }
        });
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.unsubscribe('data_response', responseHandler);
                reject(new Error('Request timeout'));
            }, 30000);
            
            const responseHandler = (data) => {
                if (data.request_id === requestId) {
                    clearTimeout(timeout);
                    this.unsubscribe('data_response', responseHandler);
                    
                    if (data.success) {
                        resolve(data.data);
                    } else {
                        reject(new Error(data.error));
                    }
                }
            };
            
            this.subscribe('data_response', responseHandler);
        });
    }

    /**
     * Generate unique request ID
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Logging methods
     */
    log(message, ...args) {
        if (CONFIG.DEBUG_MODE || CONFIG.LOG_LEVEL === 'debug') {
            console.log(`[WS] ${message}`, ...args);
        }
    }

    warn(message, ...args) {
        if (CONFIG.LOG_LEVEL !== 'error') {
            console.warn(`[WS] ${message}`, ...args);
        }
    }

    error(message, ...args) {
        console.error(`[WS] ${message}`, ...args);
    }

    /**
     * Cleanup method
     */
    cleanup() {
        this.log('Cleaning up WebSocket service...');
        this.disconnect();
        this.messageHandlers.clear();
        this.messageQueue = [];
        this.connectionStatusCallback = null;
    }

    /**
     * Health check
     */
    healthCheck() {
        return {
            isHealthy: this.isConnected && this.ws?.readyState === WebSocket.OPEN,
            status: this.getConnectionStatus(),
            stats: this.getConnectionStats(),
            lastError: this.lastError
        };
    }
}

// Create global WebSocket instance
const wsService = new WebSocketService();

// Add cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (wsService) {
        wsService.cleanup();
    }
});

// Add visibility change handling to pause/resume connection
document.addEventListener('visibilitychange', () => {
    if (wsService) {
        if (document.hidden) {
            wsService.log('Page hidden, pausing heartbeat');
            wsService.stopHeartbeat();
        } else {
            wsService.log('Page visible, resuming heartbeat');
            if (wsService.isConnected) {
                wsService.startHeartbeat();
            } else {
                wsService.connect();
            }
        }
    }
});

// Add online/offline event handling
window.addEventListener('online', () => {
    wsService.log('Network back online, attempting to reconnect');
    if (!wsService.isConnected) {
        wsService.connect();
    }
});

window.addEventListener('offline', () => {
    wsService.log('Network offline detected');
    wsService.updateConnectionStatus('offline');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WebSocketService;
}
