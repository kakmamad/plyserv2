# راهنمای استفاده از بهینه ساز Construct 2 برای تلگرام

این مجموعه ابزار برای بهینه سازی بازی های Construct 2 جهت اجرا روی گوشی های ضعیف و مینی اپ های تلگرام طراحی شده است.

## 📋 فهرست مطالب

1. [نصب و راه اندازی](#نصب-و-راه-اندازی)
2. [استفاده سریع](#استفاده-سریع)
3. [تنظیمات پیشرفته](#تنظیمات-پیشرفته)
4. [بهینه سازی فیزیک](#بهینه-سازی-فیزیک)
5. [تنظیمات تلگرام](#تنظیمات-تلگرام)
6. [نظارت بر عملکرد](#نظارت-بر-عملکرد)
7. [عیب یابی](#عیب-یابی)

## 🚀 نصب و راه اندازی

### مرحله 1: اضافه کردن فایل ها به پروژه

فایل های زیر را به پوشه پروژه Construct 2 خود اضافه کنید:

```
project/
├── construct2-mobile-optimizer.js
├── physics-optimizer.js
├── mobile-device-detector.js
├── telegram-mini-app-optimizer.js
└── optimization-config.json
```

### مرحله 2: اضافه کردن به HTML

در فایل `index.html` بازی خود، قبل از تگ `</body>` کدهای زیر را اضافه کنید:

```html
<!-- بهینه ساز اصلی -->
<script src="construct2-mobile-optimizer.js"></script>
<script src="physics-optimizer.js"></script>
<script src="mobile-device-detector.js"></script>
<script src="telegram-mini-app-optimizer.js"></script>

<script>
// راه اندازی خودکار بهینه ساز
document.addEventListener('DOMContentLoaded', async function() {
    await initializeOptimizers();
});

async function initializeOptimizers() {
    try {
        // تشخیص دستگاه
        const detector = new MobileDeviceDetector();
        const deviceInfo = await detector.detectDevice();
        
        console.log('نوع دستگاه:', deviceInfo.performanceClass);
        
        // راه اندازی بهینه ساز اصلی
        const optimizer = new Construct2MobileOptimizer(deviceInfo.optimizationPreset);
        await optimizer.initialize();
        
        // راه اندازی بهینه ساز فیزیک
        const physicsOptimizer = new PhysicsOptimizer(deviceInfo.optimizationPreset.physics);
        
        // راه اندازی بهینه ساز تلگرام (اگر در تلگرام است)
        if (window.Telegram && window.Telegram.WebApp) {
            const telegramOptimizer = new TelegramMiniAppOptimizer(deviceInfo.optimizationPreset.telegram);
            await telegramOptimizer.initialize();
            
            // ذخیره reference ها برای استفاده بعدی
            window.gameOptimizers = {
                main: optimizer,
                physics: physicsOptimizer,
                telegram: telegramOptimizer,
                detector: detector
            };
        } else {
            window.gameOptimizers = {
                main: optimizer,
                physics: physicsOptimizer,
                detector: detector
            };
        }
        
        console.log('✅ همه بهینه سازها راه اندازی شدند');
        
    } catch (error) {
        console.error('❌ خطا در راه اندازی بهینه سازها:', error);
    }
}
</script>
```

## ⚡ استفاده سریع

### راه اندازی ساده با تنظیمات پیش‌فرض:

```javascript
// تنها کافی است این کد را اضافه کنید
const optimizer = new Construct2MobileOptimizer();
await optimizer.initialize();
```

### راه اندازی با تنظیمات سفارشی:

```javascript
const customSettings = {
    maxFPS: 25,
    lowQualityMode: true,
    maxPhysicsObjects: 30,
    telegramOptimizations: true
};

const optimizer = new Construct2MobileOptimizer(customSettings);
await optimizer.initialize();
```

## ⚙️ تنظیمات پیشرفته

### تنظیمات عمومی:

```javascript
const advancedSettings = {
    // تنظیمات عملکرد
    maxFPS: 30,                    // حداکثر FPS
    adaptiveFPS: true,             // تطبیق خودکار FPS
    lowQualityMode: false,         // حالت کیفیت پایین
    
    // تنظیمات حافظه
    memoryManagement: true,        // مدیریت خودکار حافظه
    garbageCollectionInterval: 5000, // فاصله پاکسازی (میلی ثانیه)
    
    // تنظیمات فیزیک
    physicsEnabled: true,          // فعال بودن فیزیک
    maxPhysicsObjects: 50,         // حداکثر اجسام فیزیکی
    
    // تنظیمات تلگرام
    telegramOptimizations: true,   // بهینه سازی های تلگرام
    autoDetectDevice: true         // تشخیص خودکار دستگاه
};
```

### تنظیم دستی بر اساس نوع دستگاه:

```javascript
// برای گوشی های ضعیف
const weakDeviceSettings = {
    maxFPS: 20,
    lowQualityMode: true,
    maxPhysicsObjects: 25,
    physicsIterations: 4,
    textureCompression: true
};

// برای گوشی های متوسط
const mediumDeviceSettings = {
    maxFPS: 30,
    lowQualityMode: false,
    maxPhysicsObjects: 50,
    physicsIterations: 6,
    textureCompression: true
};

// برای گوشی های قوی
const strongDeviceSettings = {
    maxFPS: 60,
    lowQualityMode: false,
    maxPhysicsObjects: 80,
    physicsIterations: 8,
    textureCompression: false
};
```

## ⚡ بهینه سازی فیزیک

### راه اندازی بهینه ساز فیزیک:

```javascript
// در event "On start of layout" در Construct 2
const physicsOptimizer = new PhysicsOptimizer({
    maxObjects: 50,
    velocityIterations: 6,
    positionIterations: 2,
    sleepingEnabled: true,
    powerSaveMode: false
});

// راه اندازی با world فیزیک
if (window.world) { // world فیزیک Construct 2
    physicsOptimizer.initialize(window.world);
}
```

### کنترل دستی فیزیک:

```javascript
// فعال کردن حالت کم مصرف
physicsOptimizer.enablePowerSaveMode();

// تنظیم حداکثر سرعت
physicsOptimizer.setParameter('maxVelocity', 500);

// دریافت آمار عملکرد
const stats = physicsOptimizer.getStats();
console.log('اجسام فعال:', stats.activeObjects);
console.log('اجسام خواب:', stats.sleepingObjects);
```

## 📱 تنظیمات تلگرام

### راه اندازی برای مینی اپ تلگرام:

```javascript
// بررسی محیط تلگرام
if (window.Telegram && window.Telegram.WebApp) {
    const telegramOptimizer = new TelegramMiniAppOptimizer({
        autoExpand: true,           // گسترش خودکار viewport
        themeIntegration: true,     // ادغام با theme تلگرام
        hapticFeedback: true,       // فیدبک لمسی
        batteryOptimization: true,  // بهینه سازی باتری
        backgroundBehavior: 'pause' // رفتار در پس زمینه
    });
    
    await telegramOptimizer.initialize();
}
```

### استفاده از ویژگی های تلگرام:

```javascript
// دریافت اطلاعات کاربر
const userInfo = telegramOptimizer.userInfo;
console.log('نام کاربر:', userInfo?.first_name);

// استفاده از haptic feedback
const haptic = telegramOptimizer.enableHapticFeedback();
haptic.light();    // لرزش سبک
haptic.medium();   // لرزش متوسط
haptic.heavy();    // لرزش قوی
haptic.success();  // صدای موفقیت

// ذخیره و بازیابی وضعیت بازی
telegramOptimizer.saveGameState();
const savedState = await telegramOptimizer.loadGameState();
```

### مدیریت lifecycle تلگرام:

```javascript
// اضافه کردن listener برای تغییرات
telegramOptimizer.addLifecycleCallback('onShow', () => {
    console.log('بازی نمایش داده شد');
    // ادامه بازی
});

telegramOptimizer.addLifecycleCallback('onHide', () => {
    console.log('بازی مخفی شد');
    // متوقف کردن بازی
});

telegramOptimizer.addLifecycleCallback('onThemeChange', (themeData) => {
    console.log('theme تغییر کرد:', themeData.theme);
    // تطبیق رنگ های بازی
});
```

## 📊 نظارت بر عملکرد

### دریافت آمار عملکرد:

```javascript
// آمار بهینه ساز اصلی
const mainStats = optimizer.getPerformanceStats();
console.log('FPS فعلی:', mainStats.fps);
console.log('میانگین FPS:', mainStats.avgFPS);
console.log('زمان فریم:', mainStats.frameTime);

// آمار فیزیک
const physicsStats = physicsOptimizer.getStats();
console.log('اجسام فیزیکی فعال:', physicsStats.activeObjects);
console.log('بهینه سازی های اعمال شده:', physicsStats.optimizationsApplied);

// اطلاعات دستگاه
const deviceReport = detector.getFullReport();
console.log('کلاس عملکرد:', deviceReport.performanceClass);
console.log('توصیه ها:', deviceReport.recommendations);
```

### تنظیم نظارت خودکار:

```javascript
// نظارت بر تغییرات عملکرد
detector.startPerformanceMonitoring((data) => {
    if (data.newClass !== data.oldClass) {
        console.log(`عملکرد تغییر کرد: ${data.oldClass} → ${data.newClass}`);
        
        // تطبیق تنظیمات با عملکرد جدید
        const newPreset = detector.getOptimizationPreset();
        optimizer.setOption('maxFPS', newPreset.maxFPS);
        optimizer.setOption('lowQualityMode', newPreset.lowQualityMode);
    }
});
```

## 🎮 ادغام با Construct 2

### استفاده در Event Sheet:

```javascript
// در System -> On start of layout
// اضافه کردن JavaScript action:

if (typeof window.gameOptimizers !== 'undefined') {
    // بازی بهینه سازی شده است
    console.log('بهینه سازها فعال هستند');
    
    // تنظیم FPS بر اساس دستگاه
    const stats = window.gameOptimizers.main.getPerformanceStats();
    if (stats.avgFPS < 20) {
        // کاهش کیفیت بازی
        // مثال: کاهش تعداد دشمنان، غیرفعال کردن جلوه ها
    }
} else {
    console.log('بهینه سازها در دسترس نیستند');
}
```

### کنترل دینامیک عملکرد:

```javascript
// در طول بازی، می‌توانید عملکرد را کنترل کنید:

// Function برای بررسی عملکرد
function checkPerformance() {
    if (window.gameOptimizers) {
        const stats = window.gameOptimizers.main.getPerformanceStats();
        
        if (stats.fps < 15) {
            // عملکرد پایین - کاهش کیفیت
            reduceGameQuality();
        } else if (stats.fps > 50) {
            // عملکرد خوب - افزایش کیفیت
            increaseGameQuality();
        }
    }
}

function reduceGameQuality() {
    // کاهش تعداد پارتیکل ها
    // غیرفعال کردن جلوه های بصری
    // کاهش تعداد اجسام فیزیکی
    console.log('کیفیت بازی کاهش یافت');
}

function increaseGameQuality() {
    // افزایش جلوه های بصری
    // فعال کردن پارتیکل های بیشتر
    console.log('کیفیت بازی افزایش یافت');
}

// اجرای بررسی هر 5 ثانیه
setInterval(checkPerformance, 5000);
```

## 🔧 عیب یابی

### مشکلات رایج و راه حل ها:

#### 1. بازی همچنان کند است:

```javascript
// بررسی وضعیت بهینه سازها
if (window.gameOptimizers) {
    console.log('بهینه ساز اصلی:', window.gameOptimizers.main.isInitialized);
    console.log('بهینه ساز فیزیک:', window.gameOptimizers.physics.isInitialized);
    
    // اعمال بهینه سازی های اضطراری
    window.gameOptimizers.main.applyEmergencyOptimizations();
}
```

#### 2. فیزیک کار نمی‌کند:

```javascript
// بررسی وجود world فیزیک
if (typeof window.world !== 'undefined') {
    console.log('World فیزیک موجود است');
    
    // راه اندازی مجدد بهینه ساز فیزیک
    window.gameOptimizers.physics.initialize(window.world);
} else {
    console.log('World فیزیک یافت نشد - بازی باید Physics behavior داشته باشد');
}
```

#### 3. تلگرام تشخیص داده نمی‌شود:

```javascript
// بررسی محیط تلگرام
if (window.Telegram && window.Telegram.WebApp) {
    console.log('محیط تلگرام موجود است');
    console.log('اطلاعات تلگرام:', window.Telegram.WebApp.initData);
} else {
    console.log('محیط تلگرام تشخیص داده نشد');
    console.log('User Agent:', navigator.userAgent);
}
```

### فعال کردن حالت debug:

```javascript
// برای دیدن جزئیات بیشتر
window.DEBUG_OPTIMIZER = true;

// این باعث نمایش لاگ های بیشتر می‌شود
const optimizer = new Construct2MobileOptimizer({
    debug: true,
    verbose: true
});
```

### تست عملکرد:

```javascript
// تست سرعت دستگاه
async function testDevice() {
    const detector = new MobileDeviceDetector();
    const result = await detector.detectDevice();
    
    console.log('نتایج تست:');
    console.log('- کلاس عملکرد:', result.performanceClass);
    console.log('- امتیاز CPU:', result.benchmarkResults.cpuScore);
    console.log('- امتیاز حافظه:', result.benchmarkResults.memoryScore);
    console.log('- امتیاز رندرینگ:', result.benchmarkResults.renderScore);
    console.log('- توصیه ها:', result.recommendations);
}

testDevice();
```

## 📝 نکات مهم

### 1. ترتیب راه اندازی:
- ابتدا `MobileDeviceDetector` را اجرا کنید
- سپس `Construct2MobileOptimizer` را با تنظیمات تشخیص داده شده راه اندازی کنید
- در نهایت `PhysicsOptimizer` و `TelegramMiniAppOptimizer` را فعال کنید

### 2. تست روی دستگاه های مختلف:
- حتماً بازی را روی گوشی های ضعیف تست کنید
- از Chrome DevTools برای شبیه سازی دستگاه های مختلف استفاده کنید
- عملکرد را در حالت های مختلف شبکه بررسی کنید

### 3. بهینه سازی مداوم:
- آمار عملکرد را به طور مداوم نظارت کنید
- تنظیمات را بر اساس بازخورد کاربران تنظیم کنید
- از ابزارهای نظارت تلگرام برای جمع آوری داده استفاده کنید

### 4. تست در تلگرام:
- بازی را در محیط واقعی تلگرام تست کنید
- ویژگی های مختلف تلگرام مثل theme و haptic feedback را بررسی کنید
- عملکرد را در حالت های مختلف (روشن/تاریک، پورترت/لندسکیپ) تست کنید

## 🆘 پشتیبانی

اگر با مشکلی مواجه شدید:

1. کنسول مرورگر را بررسی کنید
2. مطمئن شوید که همه فایل ها به درستی بارگذاری شده اند
3. تنظیمات را با حالت پیش‌فرض تست کنید
4. از حالت debug برای دیدن جزئیات بیشتر استفاده کنید

---

**موفق باشید! 🎮✨**