/**
 * Physics Optimizer for Construct 2 Games
 * بهینه ساز فیزیک مخصوص بازی های کانسترکت 2
 * 
 * این ماژول مخصوص بهینه سازی سیستم فیزیک برای جلوگیری از داغ شدن گوشی طراحی شده است
 */

class PhysicsOptimizer {
    constructor(options = {}) {
        this.options = {
            // تنظیمات اصلی فیزیک
            enabled: options.enabled !== false,
            maxObjects: options.maxObjects || 50,
            maxVelocity: options.maxVelocity || 1000,
            
            // تنظیمات Box2D
            velocityIterations: options.velocityIterations || 6,
            positionIterations: options.positionIterations || 2,
            timeStep: options.timeStep || 1/60,
            
            // بهینه سازی های پیشرفته
            sleepingEnabled: options.sleepingEnabled !== false,
            continuousPhysics: options.continuousPhysics || false,
            warmStarting: options.warmStarting !== false,
            
            // مدیریت collision
            broadPhaseOptimization: options.broadPhaseOptimization !== false,
            collisionFiltering: options.collisionFiltering !== false,
            
            // حالت کم مصرف
            powerSaveMode: options.powerSaveMode || false,
            adaptiveQuality: options.adaptiveQuality !== false,
            
            // تنظیمات مخصوص گوشی های ضعیف
            weakDeviceMode: options.weakDeviceMode || false
        };
        
        this.world = null;
        this.physicsObjects = new Map();
        this.sleepingObjects = new Set();
        this.isInitialized = false;
        
        // آمار عملکرد
        this.stats = {
            activeObjects: 0,
            sleepingObjects: 0,
            collisionsPerFrame: 0,
            averageFrameTime: 0,
            optimizationsApplied: 0
        };
        
        // تایمر های بهینه سازی
        this.optimizationTimers = {
            cleanup: null,
            sleeping: null,
            collision: null
        };
    }

    /**
     * راه اندازی بهینه ساز فیزیک
     */
    initialize(world) {
        if (!world) {
            console.error('❌ World فیزیک یافت نشد');
            return false;
        }
        
        this.world = world;
        console.log('🔧 شروع بهینه سازی سیستم فیزیک...');
        
        try {
            // تنظیم پارامترهای اصلی
            this.setupWorldSettings();
            
            // راه اندازی مدیریت اجسام
            this.setupObjectManagement();
            
            // تنظیم بهینه سازی collision
            this.setupCollisionOptimization();
            
            // راه اندازی حالت خواب اجسام
            this.setupSleepingSystem();
            
            // شروع مانیتورینگ
            this.startMonitoring();
            
            this.isInitialized = true;
            console.log('✅ بهینه ساز فیزیک راه اندازی شد');
            
            return true;
            
        } catch (error) {
            console.error('❌ خطا در راه اندازی بهینه ساز فیزیک:', error);
            return false;
        }
    }

    /**
     * تنظیم پارامترهای اصلی world
     */
    setupWorldSettings() {
        if (!this.world) return;
        
        // تنظیم تعداد تکرارها
        if (this.world.SetVelocityIterations) {
            this.world.SetVelocityIterations(this.options.velocityIterations);
        }
        
        if (this.world.SetPositionIterations) {
            this.world.SetPositionIterations(this.options.positionIterations);
        }
        
        // تنظیم continuous physics
        if (this.world.SetContinuousPhysics) {
            this.world.SetContinuousPhysics(this.options.continuousPhysics);
        }
        
        // تنظیم warm starting
        if (this.world.SetWarmStarting) {
            this.world.SetWarmStarting(this.options.warmStarting);
        }
        
        // فعال کردن حالت خواب
        if (this.world.SetAllowSleeping) {
            this.world.SetAllowSleeping(this.options.sleepingEnabled);
        }
        
        console.log('⚙️ تنظیمات world اعمال شد');
    }

    /**
     * راه اندازی مدیریت اجسام فیزیکی
     */
    setupObjectManagement() {
        // محدود کردن تعداد اجسام
        this.setupObjectLimit();
        
        // مدیریت سرعت اجسام
        this.setupVelocityLimiting();
        
        // پاکسازی خودکار اجسام
        this.setupAutoCleanup();
        
        console.log('📦 مدیریت اجسام فیزیکی راه اندازی شد');
    }

    /**
     * محدود کردن تعداد اجسام فیزیکی
     */
    setupObjectLimit() {
        const originalCreateBody = this.createBodyProxy();
        
        // جایگزینی تابع ایجاد body
        if (window.cr && window.cr.plugins_ && window.cr.plugins_.Physics) {
            const physicsPlugin = window.cr.plugins_.Physics;
            
            if (physicsPlugin.prototype.CreateBody) {
                const originalCreate = physicsPlugin.prototype.CreateBody;
                
                physicsPlugin.prototype.CreateBody = function(...args) {
                    if (this.physicsObjects.size >= this.options.maxObjects) {
                        console.warn('⚠️ حداکثر تعداد اجسام فیزیکی رسیده است');
                        return null;
                    }
                    
                    const body = originalCreate.apply(this, args);
                    if (body) {
                        this.registerPhysicsObject(body);
                    }
                    
                    return body;
                }.bind(this);
            }
        }
    }

    /**
     * ثبت جسم فیزیکی جدید
     */
    registerPhysicsObject(body) {
        const id = this.generateObjectId();
        
        this.physicsObjects.set(id, {
            body: body,
            lastActive: Date.now(),
            isActive: true,
            velocity: { x: 0, y: 0 },
            position: { x: 0, y: 0 }
        });
        
        this.stats.activeObjects++;
    }

    /**
     * تولید ID منحصر به فرد برای اجسام
     */
    generateObjectId() {
        return 'physics_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * محدود کردن سرعت اجسام
     */
    setupVelocityLimiting() {
        setInterval(() => {
            this.limitObjectVelocities();
        }, 100); // هر 100ms
    }

    /**
     * اعمال محدودیت سرعت
     */
    limitObjectVelocities() {
        this.physicsObjects.forEach((obj, id) => {
            if (!obj.body || !obj.isActive) return;
            
            try {
                const velocity = obj.body.GetLinearVelocity();
                const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
                
                if (speed > this.options.maxVelocity) {
                    const scale = this.options.maxVelocity / speed;
                    obj.body.SetLinearVelocity({
                        x: velocity.x * scale,
                        y: velocity.y * scale
                    });
                    
                    this.stats.optimizationsApplied++;
                }
                
            } catch (error) {
                // حذف جسم معیوب
                this.removePhysicsObject(id);
            }
        });
    }

    /**
     * راه اندازی پاکسازی خودکار
     */
    setupAutoCleanup() {
        this.optimizationTimers.cleanup = setInterval(() => {
            this.cleanupInactiveObjects();
        }, 5000); // هر 5 ثانیه
    }

    /**
     * پاکسازی اجسام غیرفعال
     */
    cleanupInactiveObjects() {
        const now = Date.now();
        const inactiveThreshold = 10000; // 10 ثانیه
        
        this.physicsObjects.forEach((obj, id) => {
            if (!obj.isActive || (now - obj.lastActive) > inactiveThreshold) {
                this.removePhysicsObject(id);
            }
        });
        
        console.log(`🧹 ${this.stats.activeObjects} جسم فعال، ${this.stats.sleepingObjects} جسم خواب`);
    }

    /**
     * حذف جسم فیزیکی
     */
    removePhysicsObject(id) {
        const obj = this.physicsObjects.get(id);
        if (obj) {
            try {
                if (obj.body && this.world) {
                    this.world.DestroyBody(obj.body);
                }
            } catch (error) {
                console.warn('خطا در حذف جسم فیزیکی:', error);
            }
            
            this.physicsObjects.delete(id);
            this.sleepingObjects.delete(id);
            this.stats.activeObjects--;
        }
    }

    /**
     * تنظیم بهینه سازی collision
     */
    setupCollisionOptimization() {
        if (!this.options.collisionFiltering) return;
        
        // تنظیم فیلتر collision برای کاهش محاسبات
        this.setupCollisionFiltering();
        
        // بهینه سازی broad phase
        if (this.options.broadPhaseOptimization) {
            this.optimizeBroadPhase();
        }
        
        console.log('💥 بهینه سازی collision راه اندازی شد');
    }

    /**
     * تنظیم فیلتر collision
     */
    setupCollisionFiltering() {
        // تعریف گروه های collision
        this.collisionGroups = {
            PLAYER: 0x0001,
            ENEMY: 0x0002,
            PROJECTILE: 0x0004,
            ENVIRONMENT: 0x0008,
            PICKUP: 0x0010
        };
        
        // تنظیم ماسک های collision
        this.collisionMasks = {
            PLAYER: this.collisionGroups.ENEMY | this.collisionGroups.ENVIRONMENT | this.collisionGroups.PICKUP,
            ENEMY: this.collisionGroups.PLAYER | this.collisionGroups.PROJECTILE | this.collisionGroups.ENVIRONMENT,
            PROJECTILE: this.collisionGroups.ENEMY | this.collisionGroups.ENVIRONMENT,
            ENVIRONMENT: 0xFFFF, // با همه برخورد می‌کند
            PICKUP: this.collisionGroups.PLAYER
        };
    }

    /**
     * بهینه سازی broad phase
     */
    optimizeBroadPhase() {
        // تنظیم AABB برای بهینه سازی تشخیص collision
        if (this.world && this.world.SetBroadPhase) {
            // کد مخصوص بهینه سازی broad phase
        }
    }

    /**
     * راه اندازی سیستم خواب اجسام
     */
    setupSleepingSystem() {
        if (!this.options.sleepingEnabled) return;
        
        this.optimizationTimers.sleeping = setInterval(() => {
            this.manageSleepingObjects();
        }, 1000); // هر ثانیه
        
        console.log('😴 سیستم خواب اجسام راه اندازی شد');
    }

    /**
     * مدیریت اجسام خواب
     */
    manageSleepingObjects() {
        this.physicsObjects.forEach((obj, id) => {
            if (!obj.body) return;
            
            try {
                const isAwake = obj.body.IsAwake();
                
                if (!isAwake && !this.sleepingObjects.has(id)) {
                    // جسم به خواب رفت
                    this.sleepingObjects.add(id);
                    obj.isActive = false;
                    this.stats.sleepingObjects++;
                    this.stats.activeObjects--;
                    
                } else if (isAwake && this.sleepingObjects.has(id)) {
                    // جسم بیدار شد
                    this.sleepingObjects.delete(id);
                    obj.isActive = true;
                    obj.lastActive = Date.now();
                    this.stats.sleepingObjects--;
                    this.stats.activeObjects++;
                }
                
            } catch (error) {
                this.removePhysicsObject(id);
            }
        });
    }

    /**
     * شروع مانیتورینگ عملکرد
     */
    startMonitoring() {
        let lastTime = performance.now();
        let frameCount = 0;
        
        const monitor = () => {
            const currentTime = performance.now();
            frameCount++;
            
            if (currentTime - lastTime >= 1000) {
                this.stats.averageFrameTime = (currentTime - lastTime) / frameCount;
                
                // بررسی نیاز به بهینه سازی اضافی
                this.checkAndOptimize();
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(monitor);
        };
        
        monitor();
    }

    /**
     * بررسی و بهینه سازی خودکار
     */
    checkAndOptimize() {
        // اگر frame time بالا است
        if (this.stats.averageFrameTime > 20) { // بیش از 20ms
            this.applyEmergencyOptimizations();
        }
        
        // اگر تعداد اجسام زیاد است
        if (this.stats.activeObjects > this.options.maxObjects * 0.8) {
            this.forceObjectCleanup();
        }
    }

    /**
     * اعمال بهینه سازی های اضطراری
     */
    applyEmergencyOptimizations() {
        console.warn('🚨 اعمال بهینه سازی های اضطراری فیزیک...');
        
        // کاهش تعداد تکرارها
        this.options.velocityIterations = Math.max(2, this.options.velocityIterations - 1);
        this.options.positionIterations = Math.max(1, this.options.positionIterations - 1);
        
        if (this.world) {
            this.world.SetVelocityIterations(this.options.velocityIterations);
            this.world.SetPositionIterations(this.options.positionIterations);
        }
        
        // کاهش حداکثر سرعت
        this.options.maxVelocity *= 0.8;
        
        // اجبار به خواب رفتن اجسام کند
        this.forceSleepSlowObjects();
        
        this.stats.optimizationsApplied++;
    }

    /**
     * اجبار اجسام کند به خواب
     */
    forceSleepSlowObjects() {
        const slowThreshold = 10; // سرعت کمتر از 10 پیکسل در ثانیه
        
        this.physicsObjects.forEach((obj, id) => {
            if (!obj.body || !obj.isActive) return;
            
            try {
                const velocity = obj.body.GetLinearVelocity();
                const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
                
                if (speed < slowThreshold) {
                    obj.body.SetAwake(false);
                }
            } catch (error) {
                this.removePhysicsObject(id);
            }
        });
    }

    /**
     * پاکسازی اجباری اجسام
     */
    forceObjectCleanup() {
        console.warn('🧹 پاکسازی اجباری اجسام فیزیکی...');
        
        // حذف اجسام خارج از صفحه
        this.removeOffscreenObjects();
        
        // حذف اجسام قدیمی
        this.removeOldObjects();
    }

    /**
     * حذف اجسام خارج از صفحه
     */
    removeOffscreenObjects() {
        const screenBounds = this.getScreenBounds();
        const margin = 100; // حاشیه 100 پیکسل
        
        this.physicsObjects.forEach((obj, id) => {
            if (!obj.body) return;
            
            try {
                const position = obj.body.GetPosition();
                
                if (position.x < screenBounds.left - margin ||
                    position.x > screenBounds.right + margin ||
                    position.y < screenBounds.top - margin ||
                    position.y > screenBounds.bottom + margin) {
                    
                    this.removePhysicsObject(id);
                }
            } catch (error) {
                this.removePhysicsObject(id);
            }
        });
    }

    /**
     * دریافت محدوده صفحه
     */
    getScreenBounds() {
        // محدوده پیش‌فرض - باید بر اساس بازی تنظیم شود
        return {
            left: -100,
            right: window.innerWidth + 100,
            top: -100,
            bottom: window.innerHeight + 100
        };
    }

    /**
     * حذف اجسام قدیمی
     */
    removeOldObjects() {
        const now = Date.now();
        const oldThreshold = 30000; // 30 ثانیه
        
        this.physicsObjects.forEach((obj, id) => {
            if ((now - obj.lastActive) > oldThreshold) {
                this.removePhysicsObject(id);
            }
        });
    }

    /**
     * فعال کردن حالت کم مصرف
     */
    enablePowerSaveMode() {
        console.log('🔋 حالت کم مصرف فیزیک فعال شد');
        
        this.options.powerSaveMode = true;
        
        // کاهش کیفیت فیزیک
        this.options.velocityIterations = 3;
        this.options.positionIterations = 1;
        this.options.maxObjects = 25;
        this.options.maxVelocity = 500;
        
        // اعمال تنظیمات
        this.setupWorldSettings();
        
        // پاکسازی اجسام اضافی
        this.forceObjectCleanup();
    }

    /**
     * غیرفعال کردن حالت کم مصرف
     */
    disablePowerSaveMode() {
        console.log('⚡ حالت کم مصرف فیزیک غیرفعال شد');
        
        this.options.powerSaveMode = false;
        
        // بازگردانی تنظیمات عادی
        this.options.velocityIterations = 6;
        this.options.positionIterations = 2;
        this.options.maxObjects = 50;
        this.options.maxVelocity = 1000;
        
        this.setupWorldSettings();
    }

    /**
     * دریافت آمار عملکرد
     */
    getStats() {
        return {
            ...this.stats,
            totalObjects: this.physicsObjects.size,
            isOptimized: this.isInitialized,
            powerSaveMode: this.options.powerSaveMode
        };
    }

    /**
     * تنظیم پارامتر خاص
     */
    setParameter(key, value) {
        if (this.options.hasOwnProperty(key)) {
            this.options[key] = value;
            console.log(`⚙️ پارامتر ${key} به ${value} تنظیم شد`);
            
            // اعمال تغییرات فوری
            if (['velocityIterations', 'positionIterations'].includes(key)) {
                this.setupWorldSettings();
            }
        }
    }

    /**
     * خاموش کردن بهینه ساز
     */
    destroy() {
        console.log('🔴 بهینه ساز فیزیک خاموش شد');
        
        // پاک کردن تایمرها
        Object.values(this.optimizationTimers).forEach(timer => {
            if (timer) clearInterval(timer);
        });
        
        // پاک کردن اجسام
        this.physicsObjects.clear();
        this.sleepingObjects.clear();
        
        this.isInitialized = false;
    }
}

// صادر کردن کلاس
window.PhysicsOptimizer = PhysicsOptimizer;

console.log('✅ بهینه ساز فیزیک بارگذاری شد');