/**
 * Mobile Device Detector and Performance Classifier
 * تشخیص نوع دستگاه موبایل و طبقه بندی عملکرد
 * 
 * این ماژول برای تشخیص قدرت دستگاه و تنظیم خودکار بهینه سازی ها طراحی شده است
 */

class MobileDeviceDetector {
    constructor() {
        this.deviceInfo = null;
        this.performanceClass = null;
        this.benchmarkResults = null;
        
        // پایگاه داده دستگاه های شناخته شده
        this.knownDevices = {
            weak: [
                // گوشی های ضعیف شناخته شده
                'SM-J111F', 'SM-J120F', 'SM-J200F', 'SM-J210F', 'SM-J250F',
                'SM-A105F', 'SM-A205F', 'SM-A305F',
                'Redmi 4A', 'Redmi 5A', 'Redmi 6A', 'Redmi 7A', 'Redmi 8A',
                'POCOPHONE F1', 'Mi A1', 'Mi A2 Lite',
                'iPhone 6', 'iPhone 6 Plus', 'iPhone SE',
                'LG K8', 'LG K10', 'LG K20',
                'Moto E4', 'Moto E5', 'Moto G5',
                'Honor 7S', 'Honor 8A', 'Honor 9 Lite'
            ],
            medium: [
                // گوشی های متوسط
                'SM-A515F', 'SM-A715F', 'SM-M315F', 'SM-M405F',
                'Redmi Note 7', 'Redmi Note 8', 'Redmi Note 9',
                'Mi 9T', 'Mi 10T Lite', 'Mi 11 Lite',
                'iPhone 7', 'iPhone 8', 'iPhone XR',
                'Pixel 3a', 'Pixel 4a',
                'OnePlus Nord', 'OnePlus 7T'
            ],
            strong: [
                // گوشی های قوی
                'SM-G970F', 'SM-G973F', 'SM-G975F', 'SM-G980F', 'SM-G981B',
                'SM-G991B', 'SM-G996B', 'SM-G998B',
                'Mi 11', 'Mi 12', 'Mi 13', 'POCO F3', 'POCO F4',
                'iPhone 11', 'iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15',
                'Pixel 6', 'Pixel 7', 'Pixel 8',
                'OnePlus 8', 'OnePlus 9', 'OnePlus 10', 'OnePlus 11'
            ]
        };
        
        // تنظیمات بهینه سازی بر اساس کلاس عملکرد
        this.optimizationPresets = {
            weak: {
                maxFPS: 20,
                lowQualityMode: true,
                maxPhysicsObjects: 20,
                physicsIterations: 4,
                textureCompression: true,
                audioQuality: 'low',
                particleLimit: 50,
                shadowsEnabled: false,
                antiAliasing: false
            },
            medium: {
                maxFPS: 30,
                lowQualityMode: false,
                maxPhysicsObjects: 40,
                physicsIterations: 6,
                textureCompression: true,
                audioQuality: 'medium',
                particleLimit: 100,
                shadowsEnabled: false,
                antiAliasing: false
            },
            strong: {
                maxFPS: 60,
                lowQualityMode: false,
                maxPhysicsObjects: 80,
                physicsIterations: 8,
                textureCompression: false,
                audioQuality: 'high',
                particleLimit: 200,
                shadowsEnabled: true,
                antiAliasing: true
            }
        };
    }

    /**
     * تشخیص کامل دستگاه
     */
    async detectDevice() {
        console.log('🔍 شروع تشخیص دستگاه...');
        
        try {
            // جمع آوری اطلاعات پایه
            this.deviceInfo = await this.gatherDeviceInfo();
            
            // انجام benchmark سریع
            this.benchmarkResults = await this.performQuickBenchmark();
            
            // تعیین کلاس عملکرد
            this.performanceClass = this.classifyPerformance();
            
            console.log('📱 اطلاعات دستگاه:', this.deviceInfo);
            console.log('⚡ کلاس عملکرد:', this.performanceClass);
            
            return {
                deviceInfo: this.deviceInfo,
                performanceClass: this.performanceClass,
                benchmarkResults: this.benchmarkResults,
                optimizationPreset: this.getOptimizationPreset()
            };
            
        } catch (error) {
            console.error('❌ خطا در تشخیص دستگاه:', error);
            
            // بازگشت به تنظیمات ایمن
            return {
                deviceInfo: { isWeakDevice: true },
                performanceClass: 'weak',
                benchmarkResults: null,
                optimizationPreset: this.optimizationPresets.weak
            };
        }
    }

    /**
     * جمع آوری اطلاعات دستگاه
     */
    async gatherDeviceInfo() {
        const info = {
            // اطلاعات پایه
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            
            // اطلاعات سخت افزار
            cores: navigator.hardwareConcurrency || 2,
            memory: navigator.deviceMemory || 2,
            
            // اطلاعات نمایشگر
            screenWidth: screen.width,
            screenHeight: screen.height,
            pixelRatio: window.devicePixelRatio || 1,
            colorDepth: screen.colorDepth || 24,
            
            // اطلاعات شبکه
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                rtt: navigator.connection.rtt,
                saveData: navigator.connection.saveData
            } : null,
            
            // تشخیص نوع دستگاه
            isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            isAndroid: /Android/i.test(navigator.userAgent),
            isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
            
            // اطلاعات مرورگر
            isWebView: this.detectWebView(),
            isTelegram: this.detectTelegram(),
            
            // اطلاعات WebGL
            webglInfo: await this.getWebGLInfo(),
            
            // مدل دستگاه (اگر قابل تشخیص باشد)
            deviceModel: this.extractDeviceModel(),
            
            // تشخیص اولیه ضعف دستگاه
            isWeakDevice: false // محاسبه می‌شود بعداً
        };
        
        // محاسبه ضعف دستگاه بر اساس مشخصات
        info.isWeakDevice = this.calculateWeakDevice(info);
        
        return info;
    }

    /**
     * تشخیص WebView
     */
    detectWebView() {
        const ua = navigator.userAgent;
        
        // تشخیص Android WebView
        if (/Android/i.test(ua)) {
            return /wv|WebView/i.test(ua) || !/Chrome/i.test(ua);
        }
        
        // تشخیص iOS WebView
        if (/iPhone|iPad|iPod/i.test(ua)) {
            return !/Safari/i.test(ua) || /WebKit/i.test(ua) && !/Version/i.test(ua);
        }
        
        return false;
    }

    /**
     * تشخیص محیط تلگرام
     */
    detectTelegram() {
        return !!(window.Telegram && window.Telegram.WebApp);
    }

    /**
     * دریافت اطلاعات WebGL
     */
    async getWebGLInfo() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) {
                return { supported: false };
            }
            
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            
            return {
                supported: true,
                renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'Unknown',
                vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'Unknown',
                version: gl.getParameter(gl.VERSION),
                maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
                maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS)
            };
            
        } catch (error) {
            return { supported: false, error: error.message };
        }
    }

    /**
     * استخراج مدل دستگاه
     */
    extractDeviceModel() {
        const ua = navigator.userAgent;
        
        // Android
        const androidMatch = ua.match(/Android.*?;\s*([^)]+)/);
        if (androidMatch) {
            return androidMatch[1].trim();
        }
        
        // iOS
        const iosMatch = ua.match(/(iPhone|iPad|iPod).*?OS\s+([\d_]+)/);
        if (iosMatch) {
            return `${iosMatch[1]} iOS ${iosMatch[2].replace(/_/g, '.')}`;
        }
        
        return 'Unknown';
    }

    /**
     * محاسبه ضعف دستگاه
     */
    calculateWeakDevice(info) {
        let weaknessScore = 0;
        
        // بررسی CPU
        if (info.cores <= 4) weaknessScore += 2;
        if (info.cores <= 2) weaknessScore += 3;
        
        // بررسی RAM
        if (info.memory <= 2) weaknessScore += 3;
        if (info.memory <= 1) weaknessScore += 4;
        
        // بررسی نمایشگر
        if (info.screenWidth <= 720 || info.screenHeight <= 1280) weaknessScore += 1;
        if (info.pixelRatio >= 3) weaknessScore += 1; // نمایشگر پرتراکم
        
        // بررسی شبکه
        if (info.connection) {
            if (info.connection.effectiveType === '2g' || info.connection.effectiveType === 'slow-2g') {
                weaknessScore += 2;
            }
            if (info.connection.saveData) weaknessScore += 1;
        }
        
        // بررسی WebGL
        if (!info.webglInfo.supported) weaknessScore += 3;
        
        // بررسی مدل دستگاه
        const modelWeakness = this.checkKnownDeviceWeakness(info.deviceModel);
        if (modelWeakness !== null) {
            return modelWeakness;
        }
        
        return weaknessScore >= 5;
    }

    /**
     * بررسی ضعف دستگاه های شناخته شده
     */
    checkKnownDeviceWeakness(model) {
        if (!model || model === 'Unknown') return null;
        
        for (const device of this.knownDevices.weak) {
            if (model.includes(device)) return true;
        }
        
        for (const device of this.knownDevices.strong) {
            if (model.includes(device)) return false;
        }
        
        return null; // نامشخص
    }

    /**
     * انجام benchmark سریع
     */
    async performQuickBenchmark() {
        console.log('⏱️ شروع benchmark سریع...');
        
        const results = {
            cpuScore: 0,
            memoryScore: 0,
            renderScore: 0,
            totalScore: 0,
            duration: 0
        };
        
        const startTime = performance.now();
        
        try {
            // تست CPU
            results.cpuScore = await this.benchmarkCPU();
            
            // تست حافظه
            results.memoryScore = await this.benchmarkMemory();
            
            // تست رندرینگ
            results.renderScore = await this.benchmarkRendering();
            
            // محاسبه امتیاز کل
            results.totalScore = (results.cpuScore + results.memoryScore + results.renderScore) / 3;
            
        } catch (error) {
            console.warn('خطا در benchmark:', error);
        }
        
        results.duration = performance.now() - startTime;
        
        console.log('📊 نتایج benchmark:', results);
        return results;
    }

    /**
     * تست عملکرد CPU
     */
    async benchmarkCPU() {
        return new Promise((resolve) => {
            const startTime = performance.now();
            const iterations = 100000;
            
            // محاسبات ریاضی سنگین
            let result = 0;
            for (let i = 0; i < iterations; i++) {
                result += Math.sqrt(i) * Math.sin(i) * Math.cos(i);
            }
            
            const duration = performance.now() - startTime;
            
            // امتیاز بر اساس سرعت (کمتر بهتر)
            const score = Math.max(0, 100 - (duration / 10));
            
            setTimeout(() => resolve(score), 0);
        });
    }

    /**
     * تست عملکرد حافظه
     */
    async benchmarkMemory() {
        return new Promise((resolve) => {
            const startTime = performance.now();
            
            try {
                // ایجاد آرایه های بزرگ
                const arrays = [];
                const arraySize = 100000;
                
                for (let i = 0; i < 10; i++) {
                    arrays.push(new Array(arraySize).fill(Math.random()));
                }
                
                // عملیات روی آرایه ها
                let sum = 0;
                arrays.forEach(arr => {
                    sum += arr.reduce((a, b) => a + b, 0);
                });
                
                const duration = performance.now() - startTime;
                const score = Math.max(0, 100 - (duration / 20));
                
                // پاکسازی حافظه
                arrays.length = 0;
                
                setTimeout(() => resolve(score), 0);
                
            } catch (error) {
                resolve(20); // امتیاز پایین در صورت خطا
            }
        });
    }

    /**
     * تست عملکرد رندرینگ
     */
    async benchmarkRendering() {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                resolve(0);
                return;
            }
            
            const startTime = performance.now();
            
            // رسم اشکال مختلف
            for (let i = 0; i < 1000; i++) {
                ctx.fillStyle = `rgb(${i % 255}, ${(i * 2) % 255}, ${(i * 3) % 255})`;
                ctx.fillRect(i % 200, (i * 2) % 200, 10, 10);
                
                ctx.strokeStyle = `rgb(${(i * 4) % 255}, ${i % 255}, ${(i * 2) % 255})`;
                ctx.beginPath();
                ctx.arc(i % 200, (i * 3) % 200, 5, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            const duration = performance.now() - startTime;
            const score = Math.max(0, 100 - (duration / 5));
            
            setTimeout(() => resolve(score), 0);
        });
    }

    /**
     * طبقه بندی عملکرد
     */
    classifyPerformance() {
        // اگر دستگاه شناخته شده است
        if (this.deviceInfo.deviceModel !== 'Unknown') {
            for (const [className, devices] of Object.entries(this.knownDevices)) {
                for (const device of devices) {
                    if (this.deviceInfo.deviceModel.includes(device)) {
                        return className;
                    }
                }
            }
        }
        
        // طبقه بندی بر اساس benchmark
        if (this.benchmarkResults) {
            const score = this.benchmarkResults.totalScore;
            
            if (score >= 70) return 'strong';
            if (score >= 40) return 'medium';
            return 'weak';
        }
        
        // طبقه بندی بر اساس مشخصات سخت افزاری
        const info = this.deviceInfo;
        
        if (info.cores >= 8 && info.memory >= 6 && info.webglInfo.supported) {
            return 'strong';
        }
        
        if (info.cores >= 4 && info.memory >= 3) {
            return 'medium';
        }
        
        return 'weak';
    }

    /**
     * دریافت تنظیمات بهینه سازی
     */
    getOptimizationPreset() {
        return this.optimizationPresets[this.performanceClass] || this.optimizationPresets.weak;
    }

    /**
     * تشخیص تغییر عملکرد در زمان اجرا
     */
    startPerformanceMonitoring(callback) {
        let frameCount = 0;
        let lastTime = performance.now();
        let fpsHistory = [];
        
        const monitor = () => {
            const currentTime = performance.now();
            frameCount++;
            
            if (currentTime - lastTime >= 1000) {
                const fps = frameCount;
                fpsHistory.push(fps);
                
                if (fpsHistory.length > 10) {
                    fpsHistory.shift();
                }
                
                const avgFPS = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length;
                
                // بررسی تغییر عملکرد
                let newClass = this.performanceClass;
                
                if (avgFPS < 15 && this.performanceClass !== 'weak') {
                    newClass = 'weak';
                } else if (avgFPS > 45 && this.performanceClass === 'weak') {
                    newClass = 'medium';
                } else if (avgFPS > 55 && this.performanceClass === 'medium') {
                    newClass = 'strong';
                }
                
                if (newClass !== this.performanceClass) {
                    console.log(`📈 تغییر کلاس عملکرد: ${this.performanceClass} → ${newClass}`);
                    this.performanceClass = newClass;
                    
                    if (callback) {
                        callback({
                            oldClass: this.performanceClass,
                            newClass: newClass,
                            avgFPS: avgFPS,
                            preset: this.getOptimizationPreset()
                        });
                    }
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(monitor);
        };
        
        monitor();
    }

    /**
     * دریافت گزارش کامل دستگاه
     */
    getFullReport() {
        return {
            deviceInfo: this.deviceInfo,
            performanceClass: this.performanceClass,
            benchmarkResults: this.benchmarkResults,
            optimizationPreset: this.getOptimizationPreset(),
            recommendations: this.getRecommendations()
        };
    }

    /**
     * دریافت توصیه های بهینه سازی
     */
    getRecommendations() {
        const recommendations = [];
        
        if (this.performanceClass === 'weak') {
            recommendations.push('استفاده از حالت کیفیت پایین');
            recommendations.push('محدود کردن تعداد اجسام فیزیکی');
            recommendations.push('کاهش نرخ فریم به 20 FPS');
            recommendations.push('غیرفعال کردن جلوه های بصری');
        }
        
        if (this.deviceInfo.memory <= 2) {
            recommendations.push('پاکسازی مکرر حافظه');
            recommendations.push('محدود کردن تعداد texture ها');
        }
        
        if (this.deviceInfo.connection?.saveData) {
            recommendations.push('کاهش کیفیت صدا');
            recommendations.push('فشرده سازی بیشتر تصاویر');
        }
        
        if (this.deviceInfo.isTelegram) {
            recommendations.push('بهینه سازی برای viewport تلگرام');
            recommendations.push('استفاده از theme تلگرام');
        }
        
        return recommendations;
    }
}

// صادر کردن کلاس
window.MobileDeviceDetector = MobileDeviceDetector;

console.log('✅ تشخیص کننده دستگاه موبایل بارگذاری شد');