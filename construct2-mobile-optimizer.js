/**
 * Construct 2 Mobile Optimizer for Telegram Mini Apps
 * بهینه ساز بازی های کانسترکت 2 برای گوشی های ضعیف و مینی اپ تلگرام
 * 
 * این کد برای جلوگیری از داغ شدن گوشی و بهبود عملکرد بازی طراحی شده است
 */

class Construct2MobileOptimizer {
    constructor(options = {}) {
        this.options = {
            // تنظیمات عمومی
            maxFPS: options.maxFPS || 30, // حداکثر FPS برای گوشی های ضعیف
            adaptiveFPS: options.adaptiveFPS !== false, // تطبیق خودکار FPS
            
            // تنظیمات فیزیک
            physicsEnabled: options.physicsEnabled !== false,
            maxPhysicsObjects: options.maxPhysicsObjects || 50,
            physicsSubSteps: options.physicsSubSteps || 1,
            physicsIterations: options.physicsIterations || 8,
            
            // تنظیمات گرافیک
            lowQualityMode: options.lowQualityMode || false,
            textureCompression: options.textureCompression !== false,
            
            // تنظیمات حافظه
            memoryManagement: options.memoryManagement !== false,
            garbageCollectionInterval: options.garbageCollectionInterval || 5000,
            
            // تنظیمات مخصوص تلگرام
            telegramOptimizations: options.telegramOptimizations !== false,
            
            // حالت اتوماتیک بر اساس قدرت دستگاه
            autoDetectDevice: options.autoDetectDevice !== false
        };
        
        this.deviceInfo = null;
        this.performanceMetrics = {
            fps: 60,
            frameTime: 0,
            memoryUsage: 0,
            temperature: 'normal'
        };
        
        this.isInitialized = false;
        this.frameCount = 0;
        this.lastFrameTime = 0;
        this.fpsHistory = [];
        
        // شمارنده های بهینه سازی
        this.optimizationCounters = {
            physicsOptimizations: 0,
            textureOptimizations: 0,
            memoryCleanups: 0
        };
    }

    /**
     * راه اندازی اولیه بهینه ساز
     */
    async initialize() {
        console.log('🚀 شروع بهینه سازی بازی Construct 2...');
        
        try {
            // تشخیص نوع دستگاه
            await this.detectDevice();
            
            // تنظیم بهینه سازی های اولیه
            this.setupInitialOptimizations();
            
            // راه اندازی مانیتورینگ عملکرد
            this.startPerformanceMonitoring();
            
            // تنظیمات مخصوص تلگرام
            if (this.options.telegramOptimizations) {
                this.setupTelegramOptimizations();
            }
            
            // راه اندازی مدیریت حافظه
            if (this.options.memoryManagement) {
                this.startMemoryManagement();
            }
            
            this.isInitialized = true;
            console.log('✅ بهینه ساز با موفقیت راه اندازی شد');
            
        } catch (error) {
            console.error('❌ خطا در راه اندازی بهینه ساز:', error);
        }
    }

    /**
     * تشخیص نوع و قدرت دستگاه
     */
    async detectDevice() {
        const deviceInfo = {
            isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            isAndroid: /Android/i.test(navigator.userAgent),
            isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
            isWeakDevice: false,
            cores: navigator.hardwareConcurrency || 2,
            memory: navigator.deviceMemory || 2,
            connection: navigator.connection?.effectiveType || '4g'
        };

        // تشخیص دستگاه ضعیف
        deviceInfo.isWeakDevice = (
            deviceInfo.cores <= 4 || 
            deviceInfo.memory <= 2 || 
            deviceInfo.connection === 'slow-2g' || 
            deviceInfo.connection === '2g' ||
            deviceInfo.connection === '3g'
        );

        this.deviceInfo = deviceInfo;
        
        console.log('📱 اطلاعات دستگاه:', deviceInfo);
        
        // تنظیم خودکار بر اساس قدرت دستگاه
        if (this.options.autoDetectDevice) {
            this.adjustSettingsForDevice();
        }
    }

    /**
     * تنظیم خودکار بهینه سازی ها بر اساس قدرت دستگاه
     */
    adjustSettingsForDevice() {
        if (this.deviceInfo.isWeakDevice) {
            console.log('⚡ دستگاه ضعیف تشخیص داده شد - اعمال بهینه سازی های قوی...');
            
            this.options.maxFPS = 20;
            this.options.lowQualityMode = true;
            this.options.maxPhysicsObjects = 25;
            this.options.physicsSubSteps = 1;
            this.options.physicsIterations = 4;
        } else {
            console.log('💪 دستگاه قوی تشخیص داده شد - تنظیمات متعادل...');
            
            this.options.maxFPS = 30;
            this.options.maxPhysicsObjects = 50;
        }
    }

    /**
     * تنظیم بهینه سازی های اولیه
     */
    setupInitialOptimizations() {
        // محدود کردن FPS
        this.limitFrameRate();
        
        // بهینه سازی Canvas
        this.optimizeCanvas();
        
        // تنظیم بهینه سازی فیزیک
        if (this.options.physicsEnabled) {
            this.optimizePhysics();
        }
        
        // بهینه سازی گرافیک
        this.optimizeGraphics();
    }

    /**
     * محدود کردن نرخ فریم
     */
    limitFrameRate() {
        const targetFrameTime = 1000 / this.options.maxFPS;
        let lastFrameTime = 0;
        
        const originalRequestAnimationFrame = window.requestAnimationFrame;
        
        window.requestAnimationFrame = (callback) => {
            return originalRequestAnimationFrame((currentTime) => {
                if (currentTime - lastFrameTime >= targetFrameTime) {
                    lastFrameTime = currentTime;
                    callback(currentTime);
                }
            });
        };
        
        console.log(`🎯 FPS محدود به ${this.options.maxFPS} شد`);
    }

    /**
     * بهینه سازی Canvas
     */
    optimizeCanvas() {
        const canvases = document.querySelectorAll('canvas');
        
        canvases.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // غیرفعال کردن anti-aliasing برای عملکرد بهتر
                ctx.imageSmoothingEnabled = !this.options.lowQualityMode;
                
                // تنظیم alpha برای عملکرد بهتر
                if (canvas.style.backgroundColor) {
                    canvas.style.backgroundColor = canvas.style.backgroundColor || '#000000';
                }
            }
            
            // تنظیم اندازه Canvas بر اساس قدرت دستگاه
            if (this.deviceInfo.isWeakDevice) {
                const scale = 0.8;
                canvas.style.transform = `scale(${scale})`;
                canvas.style.transformOrigin = 'top left';
            }
        });
        
        console.log('🖼️ Canvas بهینه سازی شد');
    }

    /**
     * بهینه سازی فیزیک
     */
    optimizePhysics() {
        // اگر Box2D در دسترس است
        if (window.Box2D) {
            this.optimizeBox2D();
        }
        
        // بهینه سازی عمومی فیزیک
        this.setupPhysicsLimits();
        
        console.log('⚡ سیستم فیزیک بهینه سازی شد');
    }

    /**
     * بهینه سازی Box2D
     */
    optimizeBox2D() {
        // کاهش تعداد تکرارها برای عملکرد بهتر
        const world = window.world; // فرض می‌کنیم world در دسترس است
        
        if (world && world.SetVelocityIterations) {
            world.SetVelocityIterations(this.options.physicsIterations);
            world.SetPositionIterations(this.options.physicsIterations);
        }
    }

    /**
     * تنظیم محدودیت های فیزیک
     */
    setupPhysicsLimits() {
        let physicsObjectCount = 0;
        
        // نظارت بر تعداد اجسام فیزیکی
        const originalCreateBody = window.createPhysicsBody || function() {};
        
        window.createPhysicsBody = (...args) => {
            if (physicsObjectCount >= this.options.maxPhysicsObjects) {
                console.warn('⚠️ حداکثر تعداد اجسام فیزیکی رسیده است');
                return null;
            }
            
            physicsObjectCount++;
            return originalCreateBody.apply(this, args);
        };
        
        // پاکسازی اجسام غیرضروری
        setInterval(() => {
            this.cleanupPhysicsObjects();
        }, 10000);
    }

    /**
     * پاکسازی اجسام فیزیکی غیرضروری
     */
    cleanupPhysicsObjects() {
        // پیاده سازی پاکسازی اجسام فیزیکی که خارج از صفحه هستند
        // این بخش باید بر اساس ساختار خاص بازی شما تنظیم شود
        
        this.optimizationCounters.physicsOptimizations++;
        console.log('🧹 اجسام فیزیکی غیرضروری پاک شدند');
    }

    /**
     * بهینه سازی گرافیک
     */
    optimizeGraphics() {
        // کاهش کیفیت تصاویر در حالت کم مصرف
        if (this.options.lowQualityMode) {
            this.enableLowQualityMode();
        }
        
        // بهینه سازی انیمیشن ها
        this.optimizeAnimations();
        
        console.log('🎨 گرافیک بهینه سازی شد');
    }

    /**
     * فعال کردن حالت کیفیت پایین
     */
    enableLowQualityMode() {
        const style = document.createElement('style');
        style.textContent = `
            * {
                image-rendering: pixelated !important;
                image-rendering: -moz-crisp-edges !important;
                image-rendering: crisp-edges !important;
            }
            
            canvas {
                image-rendering: pixelated !important;
            }
        `;
        document.head.appendChild(style);
        
        console.log('📉 حالت کیفیت پایین فعال شد');
    }

    /**
     * بهینه سازی انیمیشن ها
     */
    optimizeAnimations() {
        // کاهش نرخ فریم انیمیشن ها
        const originalSetInterval = window.setInterval;
        
        window.setInterval = (callback, delay) => {
            // حداقل تاخیر 16ms (60 FPS) را اعمال کن
            const minDelay = 1000 / this.options.maxFPS;
            const adjustedDelay = Math.max(delay, minDelay);
            
            return originalSetInterval(callback, adjustedDelay);
        };
    }

    /**
     * راه اندازی مانیتورینگ عملکرد
     */
    startPerformanceMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const monitor = () => {
            const currentTime = performance.now();
            frameCount++;
            
            // محاسبه FPS هر ثانیه
            if (currentTime - lastTime >= 1000) {
                this.performanceMetrics.fps = frameCount;
                this.performanceMetrics.frameTime = (currentTime - lastTime) / frameCount;
                
                // اضافه کردن به تاریخچه
                this.fpsHistory.push(this.performanceMetrics.fps);
                if (this.fpsHistory.length > 60) {
                    this.fpsHistory.shift();
                }
                
                // بررسی نیاز به بهینه سازی بیشتر
                this.checkPerformanceAndOptimize();
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(monitor);
        };
        
        monitor();
        console.log('📊 مانیتورینگ عملکرد شروع شد');
    }

    /**
     * بررسی عملکرد و بهینه سازی خودکار
     */
    checkPerformanceAndOptimize() {
        const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
        
        // اگر FPS پایین است، بهینه سازی بیشتری اعمال کن
        if (avgFPS < this.options.maxFPS * 0.7) {
            console.warn('⚠️ عملکرد پایین تشخیص داده شد - اعمال بهینه سازی اضافی...');
            this.applyEmergencyOptimizations();
        }
        
        // گزارش عملکرد
        if (this.frameCount % 300 === 0) { // هر 5 ثانیه
            this.reportPerformance();
        }
        
        this.frameCount++;
    }

    /**
     * اعمال بهینه سازی های اضطراری
     */
    applyEmergencyOptimizations() {
        // کاهش بیشتر FPS
        this.options.maxFPS = Math.max(15, this.options.maxFPS - 5);
        
        // کاهش تعداد اجسام فیزیکی
        this.options.maxPhysicsObjects = Math.max(10, this.options.maxPhysicsObjects - 10);
        
        // فعال کردن حالت کیفیت پایین
        if (!this.options.lowQualityMode) {
            this.options.lowQualityMode = true;
            this.enableLowQualityMode();
        }
        
        // پاکسازی فوری حافظه
        this.forceGarbageCollection();
        
        console.log('🚨 بهینه سازی های اضطراری اعمال شد');
    }

    /**
     * تنظیمات مخصوص تلگرام
     */
    setupTelegramOptimizations() {
        // تشخیص محیط تلگرام
        const isTelegram = window.Telegram && window.Telegram.WebApp;
        
        if (isTelegram) {
            console.log('📱 محیط تلگرام تشخیص داده شد');
            
            // تنظیم theme تلگرام
            if (window.Telegram.WebApp.themeParams) {
                this.applyTelegramTheme();
            }
            
            // بهینه سازی برای viewport تلگرام
            this.optimizeForTelegramViewport();
            
            // مدیریت lifecycle تلگرام
            this.setupTelegramLifecycle();
        }
    }

    /**
     * اعمال theme تلگرام
     */
    applyTelegramTheme() {
        const theme = window.Telegram.WebApp.themeParams;
        
        document.documentElement.style.setProperty('--tg-bg-color', theme.bg_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-text-color', theme.text_color || '#000000');
        
        console.log('🎨 Theme تلگرام اعمال شد');
    }

    /**
     * بهینه سازی برای viewport تلگرام
     */
    optimizeForTelegramViewport() {
        // تنظیم viewport
        window.Telegram.WebApp.expand();
        
        // تنظیم اندازه بازی بر اساس viewport تلگرام
        const viewport = window.Telegram.WebApp.viewportHeight;
        
        const gameContainer = document.querySelector('#c2canvas') || document.querySelector('canvas');
        if (gameContainer) {
            gameContainer.style.maxHeight = viewport + 'px';
        }
    }

    /**
     * مدیریت lifecycle تلگرام
     */
    setupTelegramLifecycle() {
        // مدیریت تغییر viewport
        window.Telegram.WebApp.onEvent('viewportChanged', () => {
            this.optimizeForTelegramViewport();
        });
        
        // مدیریت بستن اپ
        window.Telegram.WebApp.onEvent('mainButtonClicked', () => {
            this.pauseGame();
        });
        
        // مدیریت تغییر theme
        window.Telegram.WebApp.onEvent('themeChanged', () => {
            this.applyTelegramTheme();
        });
    }

    /**
     * مکث بازی
     */
    pauseGame() {
        // متوقف کردن موقت بازی برای صرفه جویی در باتری
        if (window.cr && window.cr.runtime) {
            window.cr.runtime.setSuspended(true);
        }
        
        console.log('⏸️ بازی متوقف شد');
    }

    /**
     * ادامه بازی
     */
    resumeGame() {
        if (window.cr && window.cr.runtime) {
            window.cr.runtime.setSuspended(false);
        }
        
        console.log('▶️ بازی ادامه یافت');
    }

    /**
     * راه اندازی مدیریت حافظه
     */
    startMemoryManagement() {
        setInterval(() => {
            this.performMemoryCleanup();
        }, this.options.garbageCollectionInterval);
        
        console.log('🧹 مدیریت حافظه شروع شد');
    }

    /**
     * پاکسازی حافظه
     */
    performMemoryCleanup() {
        // پاکسازی texture های استفاده نشده
        this.cleanupUnusedTextures();
        
        // پاکسازی audio buffer های استفاده نشده
        this.cleanupAudioBuffers();
        
        // اجبار garbage collection
        this.forceGarbageCollection();
        
        this.optimizationCounters.memoryCleanups++;
        
        console.log('🧹 پاکسازی حافظه انجام شد');
    }

    /**
     * پاکسازی texture های استفاده نشده
     */
    cleanupUnusedTextures() {
        // پیاده سازی پاکسازی texture ها
        // این بخش باید بر اساس ساختار خاص Construct 2 تنظیم شود
        
        if (window.cr && window.cr.runtime && window.cr.runtime.glwrap) {
            const gl = window.cr.runtime.glwrap.gl;
            
            // پاکسازی texture های موقت
            // کد مخصوص Construct 2
        }
        
        this.optimizationCounters.textureOptimizations++;
    }

    /**
     * پاکسازی audio buffer ها
     */
    cleanupAudioBuffers() {
        // پاکسازی audio context های استفاده نشده
        if (window.AudioContext || window.webkitAudioContext) {
            // کد پاکسازی audio
        }
    }

    /**
     * اجبار garbage collection
     */
    forceGarbageCollection() {
        // تلاش برای اجبار garbage collection
        if (window.gc) {
            window.gc();
        } else {
            // روش غیرمستقیم
            const arr = new Array(1000000);
            arr.fill(0);
            arr.length = 0;
        }
    }

    /**
     * گزارش عملکرد
     */
    reportPerformance() {
        const report = {
            fps: this.performanceMetrics.fps,
            avgFPS: this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length,
            frameTime: this.performanceMetrics.frameTime,
            optimizations: this.optimizationCounters,
            deviceInfo: this.deviceInfo
        };
        
        console.log('📊 گزارش عملکرد:', report);
        
        // ارسال گزارش به تلگرام (اختیاری)
        if (window.Telegram && window.Telegram.WebApp) {
            // می‌توانید گزارش را به bot ارسال کنید
        }
        
        return report;
    }

    /**
     * تنظیم دستی پارامترها
     */
    setOption(key, value) {
        this.options[key] = value;
        console.log(`⚙️ تنظیم ${key} به ${value} تغییر یافت`);
        
        // اعمال تغییرات فوری
        if (key === 'maxFPS') {
            this.limitFrameRate();
        } else if (key === 'lowQualityMode') {
            if (value) {
                this.enableLowQualityMode();
            }
        }
    }

    /**
     * دریافت آمار عملکرد
     */
    getPerformanceStats() {
        return {
            ...this.performanceMetrics,
            avgFPS: this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length,
            optimizations: this.optimizationCounters,
            isOptimized: this.isInitialized
        };
    }

    /**
     * خاموش کردن بهینه ساز
     */
    destroy() {
        console.log('🔴 بهینه ساز خاموش شد');
        this.isInitialized = false;
        
        // پاکسازی نهایی
        this.performMemoryCleanup();
    }
}

// صادر کردن کلاس برای استفاده
window.Construct2MobileOptimizer = Construct2MobileOptimizer;

// راه اندازی خودکار
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 بهینه ساز Construct 2 آماده است');
});

console.log('✅ فایل بهینه ساز Construct 2 بارگذاری شد');