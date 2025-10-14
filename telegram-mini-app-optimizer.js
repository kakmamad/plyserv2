/**
 * Telegram Mini App Optimizer for Construct 2 Games
 * بهینه ساز مخصوص مینی اپ تلگرام برای بازی های کانسترکت 2
 * 
 * این ماژول مخصوص بهینه سازی بازی ها برای محیط تلگرام طراحی شده است
 */

class TelegramMiniAppOptimizer {
    constructor(options = {}) {
        this.options = {
            // تنظیمات عمومی تلگرام
            autoExpand: options.autoExpand !== false,
            themeIntegration: options.themeIntegration !== false,
            hapticFeedback: options.hapticFeedback !== false,
            
            // تنظیمات عملکرد
            batteryOptimization: options.batteryOptimization !== false,
            backgroundBehavior: options.backgroundBehavior || 'pause',
            
            // تنظیمات UI
            hideScrollbars: options.hideScrollbars !== false,
            preventZoom: options.preventZoom !== false,
            fullscreenMode: options.fullscreenMode || false,
            
            // تنظیمات شبکه
            preloadOptimization: options.preloadOptimization !== false,
            compressionLevel: options.compressionLevel || 'medium',
            
            // تنظیمات ذخیره سازی
            localStorageOptimization: options.localStorageOptimization !== false,
            cloudStorageSync: options.cloudStorageSync || false
        };
        
        this.telegramWebApp = null;
        this.isInitialized = false;
        this.gameState = 'active';
        this.performanceMetrics = {};
        
        // تنظیمات theme
        this.currentTheme = null;
        this.themeColors = {};
        
        // مدیریت lifecycle
        this.lifecycleCallbacks = {
            onShow: [],
            onHide: [],
            onThemeChange: [],
            onViewportChange: []
        };
    }

    /**
     * راه اندازی بهینه ساز تلگرام
     */
    async initialize() {
        console.log('📱 شروع بهینه سازی برای تلگرام...');
        
        try {
            // بررسی وجود محیط تلگرام
            if (!this.detectTelegramEnvironment()) {
                console.warn('⚠️ محیط تلگرام تشخیص داده نشد');
                return false;
            }
            
            this.telegramWebApp = window.Telegram.WebApp;
            
            // تنظیمات اولیه
            await this.setupInitialConfiguration();
            
            // تنظیم UI
            this.setupUserInterface();
            
            // تنظیم theme
            if (this.options.themeIntegration) {
                this.setupThemeIntegration();
            }
            
            // تنظیم lifecycle management
            this.setupLifecycleManagement();
            
            // تنظیم بهینه سازی عملکرد
            this.setupPerformanceOptimizations();
            
            // تنظیم ذخیره سازی
            if (this.options.localStorageOptimization) {
                this.setupStorageOptimization();
            }
            
            this.isInitialized = true;
            console.log('✅ بهینه ساز تلگرام راه اندازی شد');
            
            return true;
            
        } catch (error) {
            console.error('❌ خطا در راه اندازی بهینه ساز تلگرام:', error);
            return false;
        }
    }

    /**
     * تشخیص محیط تلگرام
     */
    detectTelegramEnvironment() {
        return !!(window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData);
    }

    /**
     * تنظیمات اولیه
     */
    async setupInitialConfiguration() {
        // گسترش viewport
        if (this.options.autoExpand) {
            this.telegramWebApp.expand();
        }
        
        // تنظیم ready state
        this.telegramWebApp.ready();
        
        // دریافت اطلاعات کاربر
        this.userInfo = this.telegramWebApp.initDataUnsafe?.user || null;
        
        // تنظیم viewport
        this.setupViewport();
        
        console.log('⚙️ تنظیمات اولیه تلگرام اعمال شد');
    }

    /**
     * تنظیم viewport
     */
    setupViewport() {
        const viewport = {
            width: window.innerWidth,
            height: this.telegramWebApp.viewportHeight || window.innerHeight,
            stableHeight: this.telegramWebApp.viewportStableHeight || window.innerHeight
        };
        
        // تنظیم meta viewport
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            document.head.appendChild(viewportMeta);
        }
        
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
        
        // تنظیم اندازه بازی
        this.adjustGameSize(viewport);
        
        console.log('📐 Viewport تنظیم شد:', viewport);
    }

    /**
     * تنظیم اندازه بازی
     */
    adjustGameSize(viewport) {
        const gameCanvas = document.querySelector('#c2canvas') || 
                          document.querySelector('canvas') || 
                          document.querySelector('#cr-stage');
        
        if (gameCanvas) {
            // تنظیم اندازه canvas
            gameCanvas.style.width = viewport.width + 'px';
            gameCanvas.style.height = viewport.height + 'px';
            gameCanvas.style.maxWidth = '100%';
            gameCanvas.style.maxHeight = '100vh';
            
            // تنظیم container
            const container = gameCanvas.parentElement;
            if (container) {
                container.style.width = '100%';
                container.style.height = '100vh';
                container.style.overflow = 'hidden';
            }
        }
        
        // اطلاع به بازی در مورد تغییر اندازه
        if (window.cr && window.cr.runtime) {
            window.cr.runtime.trigger(cr.system_object.prototype.cnds.OnCanvasSnapshot, null);
        }
    }

    /**
     * تنظیم رابط کاربری
     */
    setupUserInterface() {
        // مخفی کردن scrollbar ها
        if (this.options.hideScrollbars) {
            this.hideScrollbars();
        }
        
        // جلوگیری از zoom
        if (this.options.preventZoom) {
            this.preventZoom();
        }
        
        // حالت تمام صفحه
        if (this.options.fullscreenMode) {
            this.enableFullscreenMode();
        }
        
        // تنظیم safe area
        this.setupSafeArea();
        
        console.log('🖼️ رابط کاربری تنظیم شد');
    }

    /**
     * مخفی کردن scrollbar ها
     */
    hideScrollbars() {
        const style = document.createElement('style');
        style.textContent = `
            body, html {
                overflow: hidden;
                -webkit-overflow-scrolling: touch;
            }
            
            ::-webkit-scrollbar {
                display: none;
            }
            
            * {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * جلوگیری از zoom
     */
    preventZoom() {
        // جلوگیری از zoom با touch
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // جلوگیری از double tap zoom
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
        
        // جلوگیری از keyboard zoom
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0')) {
                e.preventDefault();
            }
        });
    }

    /**
     * فعال کردن حالت تمام صفحه
     */
    enableFullscreenMode() {
        const style = document.createElement('style');
        style.textContent = `
            body, html {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100vh;
                position: fixed;
                top: 0;
                left: 0;
                background: #000;
            }
            
            #c2canvas, canvas {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * تنظیم safe area
     */
    setupSafeArea() {
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --safe-area-inset-top: env(safe-area-inset-top);
                --safe-area-inset-right: env(safe-area-inset-right);
                --safe-area-inset-bottom: env(safe-area-inset-bottom);
                --safe-area-inset-left: env(safe-area-inset-left);
            }
            
            .safe-area {
                padding-top: var(--safe-area-inset-top);
                padding-right: var(--safe-area-inset-right);
                padding-bottom: var(--safe-area-inset-bottom);
                padding-left: var(--safe-area-inset-left);
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * تنظیم theme تلگرام
     */
    setupThemeIntegration() {
        // دریافت theme فعلی
        this.currentTheme = this.telegramWebApp.colorScheme || 'light';
        this.themeColors = this.telegramWebApp.themeParams || {};
        
        // اعمال theme
        this.applyTelegramTheme();
        
        // گوش دادن به تغییرات theme
        this.telegramWebApp.onEvent('themeChanged', () => {
            this.currentTheme = this.telegramWebApp.colorScheme;
            this.themeColors = this.telegramWebApp.themeParams;
            this.applyTelegramTheme();
            this.triggerCallback('onThemeChange', { theme: this.currentTheme, colors: this.themeColors });
        });
        
        console.log('🎨 Theme تلگرام تنظیم شد:', this.currentTheme);
    }

    /**
     * اعمال theme تلگرام
     */
    applyTelegramTheme() {
        const colors = this.themeColors;
        
        // تنظیم CSS variables
        document.documentElement.style.setProperty('--tg-bg-color', colors.bg_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-text-color', colors.text_color || '#000000');
        document.documentElement.style.setProperty('--tg-hint-color', colors.hint_color || '#999999');
        document.documentElement.style.setProperty('--tg-link-color', colors.link_color || '#0088cc');
        document.documentElement.style.setProperty('--tg-button-color', colors.button_color || '#0088cc');
        document.documentElement.style.setProperty('--tg-button-text-color', colors.button_text_color || '#ffffff');
        
        // اعمال theme به body
        document.body.style.backgroundColor = colors.bg_color || '#ffffff';
        document.body.style.color = colors.text_color || '#000000';
        
        // اطلاع به بازی در مورد تغییر theme
        if (window.cr && window.cr.runtime) {
            // ارسال event سفارشی به بازی
            const themeEvent = new CustomEvent('telegramThemeChanged', {
                detail: { theme: this.currentTheme, colors: colors }
            });
            window.dispatchEvent(themeEvent);
        }
    }

    /**
     * تنظیم مدیریت lifecycle
     */
    setupLifecycleManagement() {
        // مدیریت نمایش/مخفی شدن اپ
        this.telegramWebApp.onEvent('viewportChanged', (data) => {
            this.handleViewportChange(data);
        });
        
        // مدیریت تغییر وضعیت صفحه
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handleAppHide();
            } else {
                this.handleAppShow();
            }
        });
        
        // مدیریت focus/blur
        window.addEventListener('focus', () => this.handleAppShow());
        window.addEventListener('blur', () => this.handleAppHide());
        
        // مدیریت بستن اپ
        this.telegramWebApp.onEvent('mainButtonClicked', () => {
            this.handleAppClose();
        });
        
        console.log('🔄 مدیریت lifecycle راه اندازی شد');
    }

    /**
     * مدیریت تغییر viewport
     */
    handleViewportChange(data) {
        console.log('📐 تغییر viewport:', data);
        
        // تنظیم مجدد اندازه بازی
        const viewport = {
            width: window.innerWidth,
            height: this.telegramWebApp.viewportHeight || window.innerHeight,
            stableHeight: this.telegramWebApp.viewportStableHeight || window.innerHeight
        };
        
        this.adjustGameSize(viewport);
        this.triggerCallback('onViewportChange', viewport);
    }

    /**
     * مدیریت مخفی شدن اپ
     */
    handleAppHide() {
        console.log('⏸️ اپ مخفی شد');
        
        this.gameState = 'hidden';
        
        // متوقف کردن بازی بر اساس تنظیمات
        if (this.options.backgroundBehavior === 'pause') {
            this.pauseGame();
        } else if (this.options.backgroundBehavior === 'reduce') {
            this.reduceGamePerformance();
        }
        
        this.triggerCallback('onHide');
    }

    /**
     * مدیریت نمایش اپ
     */
    handleAppShow() {
        console.log('▶️ اپ نمایش داده شد');
        
        this.gameState = 'active';
        
        // ادامه بازی
        if (this.options.backgroundBehavior === 'pause') {
            this.resumeGame();
        } else if (this.options.backgroundBehavior === 'reduce') {
            this.restoreGamePerformance();
        }
        
        this.triggerCallback('onShow');
    }

    /**
     * مدیریت بستن اپ
     */
    handleAppClose() {
        console.log('🔴 اپ بسته شد');
        
        // ذخیره وضعیت بازی
        this.saveGameState();
        
        // پاکسازی منابع
        this.cleanup();
    }

    /**
     * متوقف کردن بازی
     */
    pauseGame() {
        if (window.cr && window.cr.runtime) {
            window.cr.runtime.setSuspended(true);
        }
        
        // متوقف کردن صداها
        if (window.cr && window.cr.runtime && window.cr.runtime.audio) {
            window.cr.runtime.audio.suspend();
        }
    }

    /**
     * ادامه بازی
     */
    resumeGame() {
        if (window.cr && window.cr.runtime) {
            window.cr.runtime.setSuspended(false);
        }
        
        // ادامه صداها
        if (window.cr && window.cr.runtime && window.cr.runtime.audio) {
            window.cr.runtime.audio.resume();
        }
    }

    /**
     * کاهش عملکرد بازی
     */
    reduceGamePerformance() {
        // کاهش FPS
        if (window.cr && window.cr.runtime) {
            this.originalFPS = window.cr.runtime.fps;
            window.cr.runtime.fps = 10;
        }
        
        // کاهش کیفیت صدا
        this.reduceAudioQuality();
    }

    /**
     * بازگردانی عملکرد بازی
     */
    restoreGamePerformance() {
        // بازگردانی FPS
        if (window.cr && window.cr.runtime && this.originalFPS) {
            window.cr.runtime.fps = this.originalFPS;
        }
        
        // بازگردانی کیفیت صدا
        this.restoreAudioQuality();
    }

    /**
     * تنظیم بهینه سازی عملکرد
     */
    setupPerformanceOptimizations() {
        // بهینه سازی باتری
        if (this.options.batteryOptimization) {
            this.enableBatteryOptimization();
        }
        
        // بهینه سازی شبکه
        if (this.options.preloadOptimization) {
            this.setupNetworkOptimization();
        }
        
        console.log('⚡ بهینه سازی های عملکرد تنظیم شد');
    }

    /**
     * فعال کردن بهینه سازی باتری
     */
    enableBatteryOptimization() {
        // کاهش FPS در حالت کم باتری
        if (navigator.getBattery) {
            navigator.getBattery().then((battery) => {
                const checkBattery = () => {
                    if (battery.level < 0.2 && !battery.charging) {
                        this.enableLowPowerMode();
                    } else {
                        this.disableLowPowerMode();
                    }
                };
                
                battery.addEventListener('levelchange', checkBattery);
                battery.addEventListener('chargingchange', checkBattery);
                checkBattery();
            });
        }
    }

    /**
     * فعال کردن حالت کم مصرف
     */
    enableLowPowerMode() {
        console.log('🔋 حالت کم مصرف فعال شد');
        
        // کاهش FPS
        if (window.cr && window.cr.runtime) {
            this.originalFPS = window.cr.runtime.fps;
            window.cr.runtime.fps = 15;
        }
        
        // کاهش کیفیت گرافیک
        this.enableLowGraphicsMode();
        
        // کاهش حجم صدا
        this.reduceAudioQuality();
    }

    /**
     * غیرفعال کردن حالت کم مصرف
     */
    disableLowPowerMode() {
        console.log('⚡ حالت کم مصرف غیرفعال شد');
        
        // بازگردانی FPS
        if (window.cr && window.cr.runtime && this.originalFPS) {
            window.cr.runtime.fps = this.originalFPS;
        }
        
        // بازگردانی کیفیت گرافیک
        this.disableLowGraphicsMode();
        
        // بازگردانی کیفیت صدا
        this.restoreAudioQuality();
    }

    /**
     * فعال کردن حالت گرافیک کم
     */
    enableLowGraphicsMode() {
        const style = document.createElement('style');
        style.id = 'low-graphics-mode';
        style.textContent = `
            canvas {
                image-rendering: pixelated !important;
                image-rendering: -moz-crisp-edges !important;
                image-rendering: crisp-edges !important;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * غیرفعال کردن حالت گرافیک کم
     */
    disableLowGraphicsMode() {
        const style = document.getElementById('low-graphics-mode');
        if (style) {
            style.remove();
        }
    }

    /**
     * کاهش کیفیت صدا
     */
    reduceAudioQuality() {
        if (window.cr && window.cr.runtime && window.cr.runtime.audio) {
            // کاهش حجم کلی
            window.cr.runtime.audio.masterVolume *= 0.5;
        }
    }

    /**
     * بازگردانی کیفیت صدا
     */
    restoreAudioQuality() {
        if (window.cr && window.cr.runtime && window.cr.runtime.audio) {
            // بازگردانی حجم کلی
            window.cr.runtime.audio.masterVolume *= 2;
        }
    }

    /**
     * تنظیم بهینه سازی شبکه
     */
    setupNetworkOptimization() {
        // تنظیم compression
        this.setupResourceCompression();
        
        // تنظیم preloading
        this.setupResourcePreloading();
        
        console.log('🌐 بهینه سازی شبکه تنظیم شد');
    }

    /**
     * تنظیم فشرده سازی منابع
     */
    setupResourceCompression() {
        // اعمال فشرده سازی بر اساس سرعت شبکه
        if (navigator.connection) {
            const connection = navigator.connection;
            
            if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
                this.options.compressionLevel = 'high';
            } else if (connection.effectiveType === '3g') {
                this.options.compressionLevel = 'medium';
            } else {
                this.options.compressionLevel = 'low';
            }
        }
    }

    /**
     * تنظیم preloading منابع
     */
    setupResourcePreloading() {
        // preload منابع مهم
        const criticalResources = [
            'images/player.png',
            'sounds/background.ogg',
            'data/levels.json'
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            
            if (resource.endsWith('.png') || resource.endsWith('.jpg')) {
                link.as = 'image';
            } else if (resource.endsWith('.ogg') || resource.endsWith('.mp3')) {
                link.as = 'audio';
            } else if (resource.endsWith('.json')) {
                link.as = 'fetch';
                link.crossOrigin = 'anonymous';
            }
            
            document.head.appendChild(link);
        });
    }

    /**
     * تنظیم بهینه سازی ذخیره سازی
     */
    setupStorageOptimization() {
        // بهینه سازی localStorage
        this.optimizeLocalStorage();
        
        // تنظیم cloud storage
        if (this.options.cloudStorageSync) {
            this.setupCloudStorage();
        }
        
        console.log('💾 بهینه سازی ذخیره سازی تنظیم شد');
    }

    /**
     * بهینه سازی localStorage
     */
    optimizeLocalStorage() {
        // فشرده سازی داده ها قبل از ذخیره
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = function(key, value) {
            try {
                // فشرده سازی ساده
                const compressed = this.compressData(value);
                originalSetItem.call(localStorage, key, compressed);
            } catch (error) {
                console.warn('خطا در ذخیره داده:', error);
                originalSetItem.call(localStorage, key, value);
            }
        }.bind(this);
        
        // رمزگشایی هنگام خواندن
        const originalGetItem = localStorage.getItem;
        localStorage.getItem = function(key) {
            try {
                const value = originalGetItem.call(localStorage, key);
                return value ? this.decompressData(value) : value;
            } catch (error) {
                console.warn('خطا در خواندن داده:', error);
                return originalGetItem.call(localStorage, key);
            }
        }.bind(this);
    }

    /**
     * فشرده سازی ساده داده
     */
    compressData(data) {
        // فشرده سازی ساده با JSON
        try {
            return btoa(JSON.stringify(data));
        } catch (error) {
            return data;
        }
    }

    /**
     * رمزگشایی داده
     */
    decompressData(data) {
        try {
            return JSON.parse(atob(data));
        } catch (error) {
            return data;
        }
    }

    /**
     * تنظیم cloud storage
     */
    setupCloudStorage() {
        // استفاده از Telegram Cloud Storage
        if (this.telegramWebApp.CloudStorage) {
            this.cloudStorage = this.telegramWebApp.CloudStorage;
            console.log('☁️ Cloud storage تلگرام فعال شد');
        }
    }

    /**
     * ذخیره وضعیت بازی
     */
    saveGameState() {
        try {
            const gameState = {
                timestamp: Date.now(),
                level: this.getCurrentLevel(),
                score: this.getCurrentScore(),
                settings: this.getGameSettings()
            };
            
            // ذخیره محلی
            localStorage.setItem('telegram_game_state', JSON.stringify(gameState));
            
            // ذخیره در cloud (اگر فعال باشد)
            if (this.cloudStorage) {
                this.cloudStorage.setItem('game_state', JSON.stringify(gameState));
            }
            
            console.log('💾 وضعیت بازی ذخیره شد');
            
        } catch (error) {
            console.error('خطا در ذخیره وضعیت بازی:', error);
        }
    }

    /**
     * بازیابی وضعیت بازی
     */
    async loadGameState() {
        try {
            // تلاش برای بازیابی از cloud
            if (this.cloudStorage) {
                const cloudState = await new Promise((resolve) => {
                    this.cloudStorage.getItem('game_state', (error, data) => {
                        resolve(error ? null : data);
                    });
                });
                
                if (cloudState) {
                    return JSON.parse(cloudState);
                }
            }
            
            // بازیابی از localStorage
            const localState = localStorage.getItem('telegram_game_state');
            return localState ? JSON.parse(localState) : null;
            
        } catch (error) {
            console.error('خطا در بازیابی وضعیت بازی:', error);
            return null;
        }
    }

    /**
     * دریافت سطح فعلی بازی
     */
    getCurrentLevel() {
        // باید بر اساس ساختار بازی شما تنظیم شود
        if (window.cr && window.cr.runtime) {
            // مثال: دریافت از متغیر global
            return window.cr.runtime.getObjectByUID ? 1 : 1;
        }
        return 1;
    }

    /**
     * دریافت امتیاز فعلی
     */
    getCurrentScore() {
        // باید بر اساس ساختار بازی شما تنظیم شود
        return 0;
    }

    /**
     * دریافت تنظیمات بازی
     */
    getGameSettings() {
        return {
            soundEnabled: true,
            musicEnabled: true,
            difficulty: 'normal'
        };
    }

    /**
     * فعال کردن haptic feedback
     */
    enableHapticFeedback() {
        if (this.options.hapticFeedback && this.telegramWebApp.HapticFeedback) {
            return {
                light: () => this.telegramWebApp.HapticFeedback.impactOccurred('light'),
                medium: () => this.telegramWebApp.HapticFeedback.impactOccurred('medium'),
                heavy: () => this.telegramWebApp.HapticFeedback.impactOccurred('heavy'),
                success: () => this.telegramWebApp.HapticFeedback.notificationOccurred('success'),
                warning: () => this.telegramWebApp.HapticFeedback.notificationOccurred('warning'),
                error: () => this.telegramWebApp.HapticFeedback.notificationOccurred('error')
            };
        }
        
        return {
            light: () => {},
            medium: () => {},
            heavy: () => {},
            success: () => {},
            warning: () => {},
            error: () => {}
        };
    }

    /**
     * اضافه کردن callback برای lifecycle events
     */
    addLifecycleCallback(event, callback) {
        if (this.lifecycleCallbacks[event]) {
            this.lifecycleCallbacks[event].push(callback);
        }
    }

    /**
     * اجرای callback ها
     */
    triggerCallback(event, data = null) {
        if (this.lifecycleCallbacks[event]) {
            this.lifecycleCallbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`خطا در اجرای callback ${event}:`, error);
                }
            });
        }
    }

    /**
     * دریافت اطلاعات عملکرد
     */
    getPerformanceInfo() {
        return {
            gameState: this.gameState,
            theme: this.currentTheme,
            viewport: {
                width: window.innerWidth,
                height: this.telegramWebApp.viewportHeight || window.innerHeight
            },
            user: this.userInfo,
            isInitialized: this.isInitialized
        };
    }

    /**
     * پاکسازی منابع
     */
    cleanup() {
        console.log('🧹 پاکسازی منابع تلگرام...');
        
        // پاکسازی event listener ها
        this.lifecycleCallbacks = {
            onShow: [],
            onHide: [],
            onThemeChange: [],
            onViewportChange: []
        };
        
        this.isInitialized = false;
    }

    /**
     * خاموش کردن بهینه ساز
     */
    destroy() {
        this.cleanup();
        console.log('🔴 بهینه ساز تلگرام خاموش شد');
    }
}

// صادر کردن کلاس
window.TelegramMiniAppOptimizer = TelegramMiniAppOptimizer;

console.log('✅ بهینه ساز تلگرام بارگذاری شد');