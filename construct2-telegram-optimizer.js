/**
 * Construct 2 Telegram Mini App Optimizer
 * Main integration file that combines all optimization modules
 * 
 * Usage:
 * 1. Include this file in your Construct 2 game's HTML
 * 2. Initialize with: new Construct2TelegramOptimizer()
 * 3. The optimizer will automatically detect device capabilities and apply optimizations
 */

class Construct2TelegramOptimizer {
    constructor(options = {}) {
        this.options = {
            enablePhysicsOptimization: true,
            enableMemoryManagement: true,
            enableDeviceDetection: true,
            enableTelegramIntegration: true,
            customSettings: null,
            ...options
        };
        
        this.modules = {
            deviceDetector: null,
            optimizer: null,
            physicsOptimizer: null,
            memoryManager: null,
            telegramWrapper: null
        };
        
        this.isInitialized = false;
        this.init();
    }

    /**
     * Initialize the optimizer
     */
    async init() {
        try {
            // Load device detector first
            if (this.options.enableDeviceDetection) {
                this.modules.deviceDetector = new DeviceDetector();
                await this.waitForDeviceDetection();
            }
            
            // Initialize main optimizer
            this.modules.optimizer = new Construct2Optimizer();
            
            // Initialize physics optimizer
            if (this.options.enablePhysicsOptimization) {
                this.modules.physicsOptimizer = new PhysicsOptimizer(this.modules.optimizer);
            }
            
            // Initialize memory manager
            if (this.options.enableMemoryManagement) {
                this.modules.memoryManager = new MemoryManager(this.modules.optimizer);
            }
            
            // Initialize Telegram wrapper
            if (this.options.enableTelegramIntegration) {
                this.modules.telegramWrapper = new TelegramMiniAppWrapper();
            }
            
            // Apply custom settings if provided
            if (this.options.customSettings) {
                this.applyCustomSettings(this.options.customSettings);
            }
            
            this.isInitialized = true;
            this.onInitialized();
            
        } catch (error) {
            console.error('Failed to initialize Construct2TelegramOptimizer:', error);
        }
    }

    /**
     * Wait for device detection to complete
     */
    async waitForDeviceDetection() {
        return new Promise((resolve) => {
            const checkDeviceDetection = () => {
                if (this.modules.deviceDetector && this.modules.deviceDetector.deviceProfile) {
                    resolve();
                } else {
                    setTimeout(checkDeviceDetection, 100);
                }
            };
            checkDeviceDetection();
        });
    }

    /**
     * Apply custom settings
     */
    applyCustomSettings(settings) {
        if (this.modules.optimizer) {
            Object.assign(this.modules.optimizer, settings);
        }
        
        if (this.modules.physicsOptimizer && settings.physics) {
            this.modules.physicsOptimizer.setPhysicsSettings(settings.physics);
        }
        
        if (this.modules.memoryManager && settings.memory) {
            this.modules.memoryManager.setMemoryThreshold(settings.memory.threshold);
        }
    }

    /**
     * Called when initialization is complete
     */
    onInitialized() {
        console.log('Construct2TelegramOptimizer initialized successfully');
        
        // Log device information
        if (this.modules.deviceDetector) {
            const profile = this.modules.deviceDetector.getDeviceProfile();
            console.log('Device Profile:', profile);
            console.log('Optimization Level:', this.modules.deviceDetector.getOptimizationLevel());
        }
        
        // Log performance stats
        if (this.modules.optimizer) {
            const stats = this.modules.optimizer.getPerformanceStats();
            console.log('Performance Stats:', stats);
        }
        
        // Trigger custom event
        const event = new CustomEvent('construct2OptimizerReady', {
            detail: {
                optimizer: this,
                deviceProfile: this.modules.deviceDetector?.getDeviceProfile(),
                performanceStats: this.modules.optimizer?.getPerformanceStats()
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Get device capabilities
     */
    getDeviceCapabilities() {
        return this.modules.deviceDetector?.getCapabilities() || null;
    }

    /**
     * Get device profile
     */
    getDeviceProfile() {
        return this.modules.deviceDetector?.getDeviceProfile() || null;
    }

    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        return this.modules.optimizer?.getPerformanceStats() || null;
    }

    /**
     * Get memory statistics
     */
    getMemoryStats() {
        return this.modules.memoryManager?.getMemoryStats() || null;
    }

    /**
     * Get physics settings
     */
    getPhysicsSettings() {
        return this.modules.physicsOptimizer?.getPhysicsSettings() || null;
    }

    /**
     * Get recommended settings for Construct 2
     */
    getRecommendedSettings() {
        if (this.modules.deviceDetector) {
            return this.modules.deviceDetector.getRecommendedSettings();
        }
        return null;
    }

    /**
     * Update optimization level
     */
    updateOptimizationLevel(level) {
        if (this.modules.optimizer) {
            this.modules.optimizer.performanceMode = level;
            
            // Update physics settings
            if (this.modules.physicsOptimizer) {
                const settings = this.getRecommendedSettings();
                if (settings) {
                    this.modules.physicsOptimizer.setPhysicsSettings({
                        velocityIterations: settings.physicsIterations,
                        positionIterations: settings.physicsIterations,
                        timeStep: 1 / settings.frameRate
                    });
                }
            }
        }
    }

    /**
     * Force memory cleanup
     */
    forceMemoryCleanup() {
        if (this.modules.memoryManager) {
            this.modules.memoryManager.triggerMemoryCleanup();
        }
    }

    /**
     * Get Telegram Mini App instance
     */
    getTelegramMiniApp() {
        return this.modules.telegramWrapper;
    }

    /**
     * Send data to Telegram
     */
    sendDataToTelegram(data) {
        if (this.modules.telegramWrapper) {
            this.modules.telegramWrapper.sendDataToTelegram(data);
        }
    }

    /**
     * Show popup in Telegram
     */
    showPopup(message, buttons = []) {
        if (this.modules.telegramWrapper) {
            this.modules.telegramWrapper.showPopup(message, buttons);
        }
    }

    /**
     * Get user data from Telegram
     */
    getUserData() {
        if (this.modules.telegramWrapper) {
            return this.modules.telegramWrapper.getUserData();
        }
        return null;
    }

    /**
     * Check if running in Telegram
     */
    isRunningInTelegram() {
        return this.modules.telegramWrapper?.isTelegram || false;
    }

    /**
     * Get optimization status
     */
    getOptimizationStatus() {
        return {
            isInitialized: this.isInitialized,
            deviceDetection: !!this.modules.deviceDetector,
            physicsOptimization: !!this.modules.physicsOptimizer,
            memoryManagement: !!this.modules.memoryManager,
            telegramIntegration: !!this.modules.telegramWrapper,
            deviceProfile: this.getDeviceProfile(),
            performanceStats: this.getPerformanceStats(),
            memoryStats: this.getMemoryStats(),
            physicsSettings: this.getPhysicsSettings()
        };
    }

    /**
     * Reset all optimizations to default
     */
    resetToDefault() {
        if (this.modules.optimizer) {
            this.modules.optimizer.performanceMode = 'medium';
        }
        
        if (this.modules.physicsOptimizer) {
            this.modules.physicsOptimizer.resetPhysicsSettings();
        }
        
        if (this.modules.memoryManager) {
            this.modules.memoryManager.cleanupAll();
        }
    }

    /**
     * Destroy the optimizer and clean up resources
     */
    destroy() {
        if (this.modules.memoryManager) {
            this.modules.memoryManager.cleanupAll();
        }
        
        this.modules = {};
        this.isInitialized = false;
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if auto-initialization is enabled
    if (window.construct2TelegramOptimizerAutoInit !== false) {
        window.construct2TelegramOptimizer = new Construct2TelegramOptimizer();
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Construct2TelegramOptimizer;
}