/**
 * Telegram Mini App Wrapper for Construct 2 Games
 * Provides seamless integration with Telegram's Mini App API
 * and additional mobile optimizations
 */

class TelegramMiniAppWrapper {
    constructor() {
        this.telegram = null;
        this.isTelegram = false;
        this.optimizer = null;
        this.gameContainer = null;
        this.init();
    }

    /**
     * Initialize the wrapper
     */
    async init() {
        await this.detectTelegram();
        this.setupTelegramAPI();
        this.setupMobileOptimizations();
        this.setupEventHandlers();
    }

    /**
     * Detect if running in Telegram
     */
    async detectTelegram() {
        // Check if Telegram WebApp API is available
        if (window.Telegram && window.Telegram.WebApp) {
            this.telegram = window.Telegram.WebApp;
            this.isTelegram = true;
            this.telegram.ready();
            this.telegram.expand();
        } else {
            // Fallback for testing outside Telegram
            this.isTelegram = false;
            console.log('Running outside Telegram - using fallback mode');
        }
    }

    /**
     * Setup Telegram API integration
     */
    setupTelegramAPI() {
        if (!this.isTelegram) return;

        // Configure Telegram WebApp
        this.telegram.MainButton.setText('بازی را شروع کن');
        this.telegram.MainButton.show();
        
        // Set up theme
        this.applyTelegramTheme();
        
        // Handle back button
        this.telegram.BackButton.onClick(() => {
            this.handleBackButton();
        });
        
        // Handle main button
        this.telegram.MainButton.onClick(() => {
            this.handleMainButton();
        });
    }

    /**
     * Apply Telegram theme to the game
     */
    applyTelegramTheme() {
        if (!this.isTelegram) return;

        const theme = this.telegram.themeParams;
        const root = document.documentElement;
        
        // Apply Telegram colors
        if (theme.bg_color) {
            root.style.setProperty('--tg-bg-color', theme.bg_color);
        }
        if (theme.text_color) {
            root.style.setProperty('--tg-text-color', theme.text_color);
        }
        if (theme.button_color) {
            root.style.setProperty('--tg-button-color', theme.button_color);
        }
        if (theme.button_text_color) {
            root.style.setProperty('--tg-button-text-color', theme.button_text_color);
        }
    }

    /**
     * Setup mobile-specific optimizations
     */
    setupMobileOptimizations() {
        // Prevent zoom and scrolling
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        // Prevent context menu
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });

        // Handle visibility changes (app goes to background)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseGame();
            } else {
                this.resumeGame();
            }
        });
    }

    /**
     * Setup event handlers
     */
    setupEventHandlers() {
        // Handle game container setup
        this.setupGameContainer();
        
        // Handle performance monitoring
        this.setupPerformanceMonitoring();
    }

    /**
     * Setup game container with optimizations
     */
    setupGameContainer() {
        this.gameContainer = document.getElementById('game-container') || document.body;
        
        // Apply mobile-optimized styles
        this.gameContainer.style.touchAction = 'none';
        this.gameContainer.style.userSelect = 'none';
        this.gameContainer.style.webkitUserSelect = 'none';
        this.gameContainer.style.overflow = 'hidden';
        this.gameContainer.style.position = 'fixed';
        this.gameContainer.style.top = '0';
        this.gameContainer.style.left = '0';
        this.gameContainer.style.width = '100vw';
        this.gameContainer.style.height = '100vh';
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        // Monitor frame rate and adjust settings
        let frameCount = 0;
        let lastTime = performance.now();
        
        const monitor = () => {
            const now = performance.now();
            frameCount++;
            
            if (now - lastTime >= 1000) {
                const fps = frameCount;
                frameCount = 0;
                lastTime = now;
                
                // Adjust quality based on performance
                this.adjustQualityBasedOnFPS(fps);
            }
            
            requestAnimationFrame(monitor);
        };
        
        requestAnimationFrame(monitor);
    }

    /**
     * Adjust quality based on FPS
     */
    adjustQualityBasedOnFPS(fps) {
        if (this.optimizer) {
            const stats = this.optimizer.getPerformanceStats();
            
            if (fps < 25 && stats.performanceMode !== 'low') {
                this.optimizer.reduceQuality();
                this.showPerformanceWarning();
            } else if (fps > 50 && stats.performanceMode === 'low') {
                // Gradually improve quality if performance is good
                this.improveQuality();
            }
        }
    }

    /**
     * Show performance warning
     */
    showPerformanceWarning() {
        if (this.isTelegram) {
            this.telegram.showAlert('کیفیت بازی کاهش یافت تا عملکرد بهتری داشته باشید');
        } else {
            console.log('Performance warning: Quality reduced for better performance');
        }
    }

    /**
     * Handle back button
     */
    handleBackButton() {
        if (this.isTelegram) {
            this.telegram.close();
        } else {
            window.history.back();
        }
    }

    /**
     * Handle main button
     */
    handleMainButton() {
        if (this.isTelegram) {
            this.telegram.MainButton.setText('در حال بازی...');
            this.telegram.MainButton.disable();
            this.startGame();
        }
    }

    /**
     * Start the game
     */
    startGame() {
        // Initialize Construct 2 optimizer
        if (window.construct2Optimizer) {
            this.optimizer = window.construct2Optimizer;
        }
        
        // Start Construct 2 game
        if (window.cr_getC2Runtime) {
            const runtime = window.cr_getC2Runtime();
            if (runtime) {
                runtime.start();
            }
        }
    }

    /**
     * Pause the game
     */
    pauseGame() {
        if (window.cr_getC2Runtime) {
            const runtime = window.cr_getC2Runtime();
            if (runtime && runtime.pause) {
                runtime.pause();
            }
        }
    }

    /**
     * Resume the game
     */
    resumeGame() {
        if (window.cr_getC2Runtime) {
            const runtime = window.cr_getC2Runtime();
            if (runtime && runtime.resume) {
                runtime.resume();
            }
        }
    }

    /**
     * Handle orientation change
     */
    handleOrientationChange() {
        // Resize game to fit new orientation
        if (window.cr_getC2Runtime) {
            const runtime = window.cr_getC2Runtime();
            if (runtime && runtime.resize) {
                runtime.resize();
            }
        }
    }

    /**
     * Improve quality gradually
     */
    improveQuality() {
        if (this.optimizer) {
            const stats = this.optimizer.getPerformanceStats();
            
            if (stats.performanceMode === 'low') {
                this.optimizer.performanceMode = 'medium';
                this.optimizer.frameRate = 45;
            } else if (stats.performanceMode === 'medium') {
                this.optimizer.performanceMode = 'high';
                this.optimizer.frameRate = 60;
            }
        }
    }

    /**
     * Send data to Telegram
     */
    sendDataToTelegram(data) {
        if (this.isTelegram) {
            this.telegram.sendData(JSON.stringify(data));
        }
    }

    /**
     * Show popup in Telegram
     */
    showPopup(message, buttons = []) {
        if (this.isTelegram) {
            this.telegram.showPopup({
                title: 'بازی',
                message: message,
                buttons: buttons
            });
        } else {
            alert(message);
        }
    }

    /**
     * Get user data from Telegram
     */
    getUserData() {
        if (this.isTelegram) {
            return {
                id: this.telegram.initDataUnsafe.user?.id,
                username: this.telegram.initDataUnsafe.user?.username,
                firstName: this.telegram.initDataUnsafe.user?.first_name,
                lastName: this.telegram.initDataUnsafe.user?.last_name,
                languageCode: this.telegram.initDataUnsafe.user?.language_code
            };
        }
        return null;
    }

    /**
     * Get performance stats
     */
    getPerformanceStats() {
        if (this.optimizer) {
            return this.optimizer.getPerformanceStats();
        }
        return null;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.telegramMiniApp = new TelegramMiniAppWrapper();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TelegramMiniAppWrapper;
}