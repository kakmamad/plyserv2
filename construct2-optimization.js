/**
 * Construct 2 Game Optimization for Telegram Mini Apps
 * Prevents overheating and ensures smooth performance on weak devices
 * 
 * Usage: Include this script in your Construct 2 game's HTML file
 * before the Construct 2 engine loads
 */

class Construct2Optimizer {
    constructor() {
        this.isLowEndDevice = this.detectLowEndDevice();
        this.performanceMode = this.isLowEndDevice ? 'low' : 'medium';
        this.frameRate = this.isLowEndDevice ? 30 : 60;
        this.physicsIterations = this.isLowEndDevice ? 4 : 8;
        this.maxParticles = this.isLowEndDevice ? 50 : 200;
        
        this.init();
    }

    /**
     * Detect if device is low-end based on hardware capabilities
     */
    detectLowEndDevice() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) return true; // No WebGL support = low-end
        
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
        
        // Check for low-end indicators
        const lowEndIndicators = [
            'mali-400', 'mali-450', 'mali-t720', 'mali-t830', 'mali-t860',
            'adreno 305', 'adreno 306', 'adreno 320', 'adreno 330',
            'powervr sgx540', 'powervr sgx544', 'powervr sgx554',
            'intel hd 4000', 'intel hd 3000'
        ];
        
        const isLowEnd = lowEndIndicators.some(indicator => 
            renderer.toLowerCase().includes(indicator)
        );
        
        // Additional checks
        const memory = navigator.deviceMemory || 4; // Default to 4GB if not available
        const cores = navigator.hardwareConcurrency || 4; // Default to 4 cores
        
        return isLowEnd || memory < 3 || cores < 4;
    }

    /**
     * Initialize optimization settings
     */
    init() {
        this.setupPerformanceMonitoring();
        this.optimizeCanvas();
        this.setupFrameRateControl();
        this.optimizePhysics();
        this.setupMemoryManagement();
        this.setupThermalThrottling();
    }

    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        this.performanceMonitor = {
            frameCount: 0,
            lastTime: performance.now(),
            fps: 0,
            frameDrops: 0,
            lastFrameTime: 0
        };

        const monitor = () => {
            const now = performance.now();
            const deltaTime = now - this.performanceMonitor.lastTime;
            
            this.performanceMonitor.frameCount++;
            this.performanceMonitor.fps = 1000 / deltaTime;
            
            // Detect frame drops
            if (deltaTime > (1000 / this.frameRate) * 1.5) {
                this.performanceMonitor.frameDrops++;
            }
            
            this.performanceMonitor.lastTime = now;
            this.performanceMonitor.lastFrameTime = deltaTime;
            
            // Auto-adjust quality if performance is poor
            if (this.performanceMonitor.fps < this.frameRate * 0.8) {
                this.reduceQuality();
            }
            
            requestAnimationFrame(monitor);
        };
        
        requestAnimationFrame(monitor);
    }

    /**
     * Optimize canvas settings
     */
    optimizeCanvas() {
        // Override canvas creation to use optimized settings
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName) {
            const element = originalCreateElement.call(this, tagName);
            
            if (tagName.toLowerCase() === 'canvas') {
                // Set optimal canvas settings
                element.style.imageRendering = 'pixelated';
                element.style.imageRendering = '-moz-crisp-edges';
                element.style.imageRendering = 'crisp-edges';
                
                // Disable context menu to prevent accidental interactions
                element.addEventListener('contextmenu', e => e.preventDefault());
                
                // Optimize for mobile
                element.style.touchAction = 'none';
                element.style.userSelect = 'none';
                element.style.webkitUserSelect = 'none';
            }
            
            return element;
        };
    }

    /**
     * Setup frame rate control
     */
    setupFrameRateControl() {
        // Override requestAnimationFrame to control frame rate
        const originalRAF = window.requestAnimationFrame;
        let lastTime = 0;
        const targetFrameTime = 1000 / this.frameRate;
        
        window.requestAnimationFrame = (callback) => {
            const now = performance.now();
            const deltaTime = now - lastTime;
            
            if (deltaTime >= targetFrameTime) {
                lastTime = now;
                return originalRAF(callback);
            } else {
                const remainingTime = targetFrameTime - deltaTime;
                return setTimeout(() => {
                    lastTime = performance.now();
                    originalRAF(callback);
                }, remainingTime);
            }
        };
    }

    /**
     * Optimize physics settings
     */
    optimizePhysics() {
        // Override physics settings when Construct 2 loads
        const originalSetTimeout = window.setTimeout;
        window.setTimeout = (callback, delay, ...args) => {
            if (typeof callback === 'function' && callback.toString().includes('physics')) {
                // Reduce physics update frequency for low-end devices
                delay = this.isLowEndDevice ? delay * 1.5 : delay;
            }
            return originalSetTimeout(callback, delay, ...args);
        };
    }

    /**
     * Setup memory management
     */
    setupMemoryManagement() {
        // Force garbage collection periodically
        setInterval(() => {
            if (window.gc) {
                window.gc();
            }
            
            // Clear unused textures and objects
            this.cleanupResources();
        }, 10000); // Every 10 seconds
    }

    /**
     * Setup thermal throttling protection
     */
    setupThermalThrottling() {
        let thermalThrottleLevel = 0;
        const maxThrottleLevel = 3;
        
        setInterval(() => {
            // Monitor performance and adjust accordingly
            const avgFps = this.performanceMonitor.fps;
            const frameDrops = this.performanceMonitor.frameDrops;
            
            if (avgFps < this.frameRate * 0.7 || frameDrops > 10) {
                thermalThrottleLevel = Math.min(thermalThrottleLevel + 1, maxThrottleLevel);
                this.applyThermalThrottling(thermalThrottleLevel);
            } else if (avgFps > this.frameRate * 0.9 && frameDrops < 5) {
                thermalThrottleLevel = Math.max(thermalThrottleLevel - 1, 0);
                this.applyThermalThrottling(thermalThrottleLevel);
            }
        }, 5000); // Check every 5 seconds
    }

    /**
     * Apply thermal throttling based on level
     */
    applyThermalThrottling(level) {
        switch (level) {
            case 1:
                this.frameRate = Math.min(this.frameRate, 30);
                this.physicsIterations = Math.max(this.physicsIterations - 2, 2);
                break;
            case 2:
                this.frameRate = Math.min(this.frameRate, 24);
                this.physicsIterations = Math.max(this.physicsIterations - 2, 1);
                this.maxParticles = Math.max(this.maxParticles - 50, 10);
                break;
            case 3:
                this.frameRate = 20;
                this.physicsIterations = 1;
                this.maxParticles = 5;
                break;
        }
    }

    /**
     * Reduce quality when performance is poor
     */
    reduceQuality() {
        if (this.performanceMode === 'high') {
            this.performanceMode = 'medium';
            this.frameRate = 45;
        } else if (this.performanceMode === 'medium') {
            this.performanceMode = 'low';
            this.frameRate = 30;
        }
        
        this.physicsIterations = Math.max(this.physicsIterations - 1, 1);
        this.maxParticles = Math.max(this.maxParticles - 25, 5);
    }

    /**
     * Cleanup unused resources
     */
    cleanupResources() {
        // Clear unused images from cache
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.complete || img.naturalWidth === 0) {
                img.src = '';
            }
        });
        
        // Clear unused canvas contexts
        const canvases = document.querySelectorAll('canvas');
        canvases.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        });
    }

    /**
     * Get current performance stats
     */
    getPerformanceStats() {
        return {
            fps: Math.round(this.performanceMonitor.fps),
            frameDrops: this.performanceMonitor.frameDrops,
            performanceMode: this.performanceMode,
            frameRate: this.frameRate,
            physicsIterations: this.physicsIterations,
            maxParticles: this.maxParticles,
            isLowEndDevice: this.isLowEndDevice
        };
    }

    /**
     * Apply Construct 2 specific optimizations
     */
    applyConstruct2Optimizations() {
        // Wait for Construct 2 to load
        const checkConstruct2 = () => {
            if (window.cr && window.cr_getC2Runtime) {
                const runtime = window.cr_getC2Runtime();
                if (runtime) {
                    this.optimizeConstruct2Runtime(runtime);
                    return;
                }
            }
            setTimeout(checkConstruct2, 100);
        };
        checkConstruct2();
    }

    /**
     * Optimize Construct 2 runtime
     */
    optimizeConstruct2Runtime(runtime) {
        // Reduce physics iterations
        if (runtime.physics && runtime.physics.world) {
            runtime.physics.world.setVelocityIterations(this.physicsIterations);
            runtime.physics.world.setPositionIterations(this.physicsIterations);
        }

        // Limit particle systems
        if (runtime.types && runtime.types.Particle) {
            const originalCreate = runtime.types.Particle.prototype.create;
            runtime.types.Particle.prototype.create = function() {
                const instance = originalCreate.call(this);
                if (instance && instance.maxCount) {
                    instance.maxCount = Math.min(instance.maxCount, this.maxParticles);
                }
                return instance;
            };
        }

        // Optimize rendering
        if (runtime.renderer) {
            runtime.renderer.setAntialias(!this.isLowEndDevice);
            runtime.renderer.setPixelArt(this.isLowEndDevice);
        }
    }
}

// Initialize optimizer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.construct2Optimizer = new Construct2Optimizer();
    window.construct2Optimizer.applyConstruct2Optimizations();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Construct2Optimizer;
}