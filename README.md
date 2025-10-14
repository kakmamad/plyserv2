# Construct 2 Telegram Mini App Optimizer

یک سیستم بهینه‌سازی کامل برای بازی‌های Construct 2 که روی مینی اپ تلگرام منتشر می‌شوند. این سیستم از داغ شدن گوشی جلوگیری می‌کند و بازی را روی گوشی‌های ضعیف هم اجرا می‌کند.

## ویژگی‌ها

### 🚀 بهینه‌سازی عملکرد
- **تشخیص خودکار قابلیت‌های دستگاه**: تشخیص GPU، CPU، حافظه و سایر قابلیت‌ها
- **کنترل نرخ فریم**: محدود کردن FPS برای جلوگیری از داغ شدن
- **کیفیت تطبیقی**: کاهش خودکار کیفیت در صورت افت عملکرد
- **بهینه‌سازی فیزیک**: کاهش تکرارهای فیزیک برای دستگاه‌های ضعیف

### 🧠 مدیریت حافظه
- **Object Pooling**: استفاده مجدد از اشیاء برای کاهش مصرف حافظه
- **Texture Caching**: کش کردن بافت‌ها برای کاهش بارگذاری
- **Garbage Collection**: پاکسازی خودکار حافظه
- **Memory Monitoring**: نظارت بر مصرف حافظه

### 📱 یکپارچگی تلگرام
- **Telegram WebApp API**: پشتیبانی کامل از API تلگرام
- **Theme Integration**: تطبیق با تم تلگرام
- **User Data**: دسترسی به اطلاعات کاربر
- **Popup & Alerts**: نمایش پیام‌ها در تلگرام

## نصب و راه‌اندازی

### 1. فایل‌های مورد نیاز

فایل‌های زیر را در پروژه Construct 2 خود قرار دهید:

```
your-game/
├── device-detector.js
├── construct2-optimization.js
├── physics-optimizer.js
├── memory-manager.js
├── telegram-mini-app-wrapper.js
├── construct2-telegram-optimizer.js
└── index.html
```

### 2. ادغام در HTML

فایل `index.html` خود را به صورت زیر تغییر دهید:

```html
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>بازی شما</title>
    
    <!-- Telegram WebApp API -->
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    
    <!-- Optimization Scripts -->
    <script src="device-detector.js"></script>
    <script src="construct2-optimization.js"></script>
    <script src="physics-optimizer.js"></script>
    <script src="memory-manager.js"></script>
    <script src="telegram-mini-app-wrapper.js"></script>
    <script src="construct2-telegram-optimizer.js"></script>
</head>
<body>
    <div id="game-container">
        <!-- Construct 2 game will be loaded here -->
    </div>
    
    <script>
        // Initialize optimizer
        const optimizer = new Construct2TelegramOptimizer();
        
        // Listen for ready event
        document.addEventListener('construct2OptimizerReady', (event) => {
            console.log('Optimizer ready!', event.detail);
        });
    </script>
</body>
</html>
```

### 3. تنظیمات پیشرفته

```javascript
const optimizer = new Construct2TelegramOptimizer({
    enablePhysicsOptimization: true,    // بهینه‌سازی فیزیک
    enableMemoryManagement: true,       // مدیریت حافظه
    enableDeviceDetection: true,        // تشخیص دستگاه
    enableTelegramIntegration: true,    // یکپارچگی تلگرام
    customSettings: {
        frameRate: 30,                  // نرخ فریم دلخواه
        physicsIterations: 4,           // تکرارهای فیزیک
        maxParticles: 50,               // حداکثر ذرات
        memoryThreshold: 50             // آستانه حافظه (MB)
    }
});
```

## استفاده

### دریافت اطلاعات دستگاه

```javascript
// دریافت مشخصات دستگاه
const deviceProfile = optimizer.getDeviceProfile();
console.log('Device Profile:', deviceProfile);

// دریافت قابلیت‌های دستگاه
const capabilities = optimizer.getDeviceCapabilities();
console.log('GPU:', capabilities.gpu);
console.log('CPU:', capabilities.cpu);
console.log('Memory:', capabilities.memory);
```

### نظارت بر عملکرد

```javascript
// دریافت آمار عملکرد
const perfStats = optimizer.getPerformanceStats();
console.log('FPS:', perfStats.fps);
console.log('Performance Mode:', perfStats.performanceMode);

// دریافت آمار حافظه
const memStats = optimizer.getMemoryStats();
console.log('Memory Usage:', memStats.memoryUsage);
```

### کنترل کیفیت

```javascript
// تغییر سطح بهینه‌سازی
optimizer.updateOptimizationLevel('low');    // پایین
optimizer.updateOptimizationLevel('medium'); // متوسط
optimizer.updateOptimizationLevel('high');   // بالا

// پاکسازی حافظه
optimizer.forceMemoryCleanup();
```

### یکپارچگی تلگرام

```javascript
// دریافت اطلاعات کاربر
const userData = optimizer.getUserData();
console.log('User ID:', userData.id);
console.log('Username:', userData.username);

// ارسال داده به تلگرام
optimizer.sendDataToTelegram({
    score: 1000,
    level: 5,
    time: Date.now()
});

// نمایش popup
optimizer.showPopup('بازی تمام شد!', [
    { text: 'دوباره بازی کن', callback_data: 'restart' },
    { text: 'بستن', callback_data: 'close' }
]);
```

## تنظیمات پیشنهادی برای Construct 2

### تنظیمات فیزیک

```javascript
// در Construct 2، این تنظیمات را اعمال کنید:
// - Velocity Iterations: 4-8 (بسته به قدرت دستگاه)
// - Position Iterations: 2-4
// - Time Step: 1/30 تا 1/60
// - Enable Sleeping: true
// - Warm Starting: false (برای دستگاه‌های ضعیف)
```

### تنظیمات رندرینگ

```javascript
// - Antialiasing: false (برای دستگاه‌های ضعیف)
// - Pixel Art: true (برای دستگاه‌های ضعیف)
// - Texture Quality: Low/Medium/High
// - Max Texture Size: 1024x1024 (برای دستگاه‌های ضعیف)
```

### تنظیمات صدا

```javascript
// - Audio Quality: Low (برای دستگاه‌های ضعیف)
// - Max Audio Channels: 8-16
// - Audio Compression: High
```

## مثال کامل

```html
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>بازی بهینه شده</title>
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
    <script src="construct2-telegram-optimizer.js"></script>
</head>
<body>
    <div id="game-container"></div>
    
    <script>
        // Initialize optimizer
        const optimizer = new Construct2TelegramOptimizer();
        
        // Wait for optimizer to be ready
        document.addEventListener('construct2OptimizerReady', (event) => {
            const { deviceProfile, performanceStats } = event.detail;
            
            console.log('Device Profile:', deviceProfile);
            console.log('Performance Stats:', performanceStats);
            
            // Start your Construct 2 game here
            startConstruct2Game();
        });
        
        function startConstruct2Game() {
            // Your Construct 2 game initialization code
            // The optimizer will automatically apply optimizations
        }
        
        // Monitor performance
        setInterval(() => {
            const stats = optimizer.getPerformanceStats();
            if (stats && stats.fps < 25) {
                console.warn('Low FPS detected:', stats.fps);
            }
        }, 5000);
    </script>
</body>
</html>
```

## عیب‌یابی

### مشکلات رایج

1. **بازی کند اجرا می‌شود**
   - سطح بهینه‌سازی را به 'low' تغییر دهید
   - تعداد ذرات و اشیاء فیزیک را کاهش دهید

2. **حافظه تمام می‌شود**
   - آستانه حافظه را کاهش دهید
   - پاکسازی حافظه را بیشتر انجام دهید

3. **تلگرام کار نمی‌کند**
   - مطمئن شوید که Telegram WebApp API بارگذاری شده
   - بررسی کنید که در محیط تلگرام اجرا می‌شود

### لاگ‌ها

```javascript
// فعال کردن لاگ‌های تفصیلی
console.log('Optimizer Status:', optimizer.getOptimizationStatus());
console.log('Device Capabilities:', optimizer.getDeviceCapabilities());
console.log('Performance Stats:', optimizer.getPerformanceStats());
```

## پشتیبانی

برای پشتیبانی و گزارش باگ، لطفاً با ما تماس بگیرید.

## مجوز

این پروژه تحت مجوز MIT منتشر شده است.