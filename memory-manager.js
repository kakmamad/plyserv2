/**
 * Memory Manager for Construct 2 Games
 * Prevents memory leaks and optimizes garbage collection
 */

class MemoryManager {
    constructor(optimizer) {
        this.optimizer = optimizer;
        this.isLowEndDevice = optimizer.isLowEndDevice;
        this.memoryThreshold = this.isLowEndDevice ? 50 : 100; // MB
        this.cleanupInterval = this.isLowEndDevice ? 5000 : 10000; // ms
        this.objectPool = new Map();
        this.textureCache = new Map();
        this.soundCache = new Map();
        this.lastCleanup = 0;
        this.memoryStats = {
            totalObjects: 0,
            pooledObjects: 0,
            cachedTextures: 0,
            cachedSounds: 0,
            memoryUsage: 0
        };
        
        this.init();
    }

    /**
     * Initialize memory management
     */
    init() {
        this.setupMemoryMonitoring();
        this.setupObjectPooling();
        this.setupTextureOptimization();
        this.setupSoundOptimization();
        this.setupGarbageCollection();
        this.setupMemoryCleanup();
    }

    /**
     * Setup memory usage monitoring
     */
    setupMemoryMonitoring() {
        // Monitor memory usage
        setInterval(() => {
            this.checkMemoryUsage();
        }, 2000);

        // Monitor performance memory
        if (performance.memory) {
            setInterval(() => {
                this.monitorPerformanceMemory();
            }, 5000);
        }
    }

    /**
     * Check current memory usage
     */
    checkMemoryUsage() {
        if (performance.memory) {
            const memoryInfo = performance.memory;
            const usedMemory = memoryInfo.usedJSHeapSize / (1024 * 1024); // MB
            
            this.memoryStats.memoryUsage = usedMemory;
            
            if (usedMemory > this.memoryThreshold) {
                this.triggerMemoryCleanup();
            }
        }
    }

    /**
     * Monitor performance memory
     */
    monitorPerformanceMemory() {
        if (performance.memory) {
            const memoryInfo = performance.memory;
            const totalMemory = memoryInfo.totalJSHeapSize / (1024 * 1024);
            const usedMemory = memoryInfo.usedJSHeapSize / (1024 * 1024);
            const limitMemory = memoryInfo.jsHeapSizeLimit / (1024 * 1024);
            
            console.log(`Memory Usage: ${usedMemory.toFixed(2)}MB / ${limitMemory.toFixed(2)}MB`);
            
            // If memory usage is high, trigger cleanup
            if (usedMemory / limitMemory > 0.8) {
                this.triggerMemoryCleanup();
            }
        }
    }

    /**
     * Setup object pooling system
     */
    setupObjectPooling() {
        // Override object creation to use pooling
        this.setupConstruct2ObjectPooling();
    }

    /**
     * Setup Construct 2 object pooling
     */
    setupConstruct2ObjectPooling() {
        // Wait for Construct 2 runtime
        const checkRuntime = () => {
            if (window.cr_getC2Runtime) {
                const runtime = window.cr_getC2Runtime();
                if (runtime && runtime.types) {
                    this.overrideObjectCreation(runtime);
                } else {
                    setTimeout(checkRuntime, 100);
                }
            } else {
                setTimeout(checkRuntime, 100);
            }
        };
        checkRuntime();
    }

    /**
     * Override object creation with pooling
     */
    overrideObjectCreation(runtime) {
        // Override common object types
        const objectTypes = ['Sprite', 'Text', 'Button', 'Particle'];
        
        objectTypes.forEach(typeName => {
            if (runtime.types[typeName]) {
                const originalCreate = runtime.types[typeName].prototype.create;
                const originalDestroy = runtime.types[typeName].prototype.destroy;
                
                // Override create method
                runtime.types[typeName].prototype.create = function() {
                    const pooledObject = this.getPooledObject(typeName);
                    if (pooledObject) {
                        this.memoryStats.pooledObjects++;
                        return pooledObject;
                    }
                    
                    const instance = originalCreate.call(this);
                    this.memoryStats.totalObjects++;
                    return instance;
                };
                
                // Override destroy method
                runtime.types[typeName].prototype.destroy = function() {
                    this.poolObject(typeName, this);
                    if (originalDestroy) {
                        originalDestroy.call(this);
                    }
                };
            }
        });
    }

    /**
     * Get pooled object
     */
    getPooledObject(typeName) {
        if (this.objectPool.has(typeName) && this.objectPool.get(typeName).length > 0) {
            return this.objectPool.get(typeName).pop();
        }
        return null;
    }

    /**
     * Pool object for reuse
     */
    poolObject(typeName, object) {
        if (!this.objectPool.has(typeName)) {
            this.objectPool.set(typeName, []);
        }
        
        const pool = this.objectPool.get(typeName);
        if (pool.length < 50) { // Limit pool size
            // Reset object state
            this.resetObjectState(object);
            pool.push(object);
        }
    }

    /**
     * Reset object state for pooling
     */
    resetObjectState(object) {
        // Reset common properties
        if (object.setVisible) object.setVisible(false);
        if (object.setPosition) object.setPosition(0, 0);
        if (object.setAngle) object.setAngle(0);
        if (object.setScale) object.setScale(1, 1);
        if (object.setOpacity) object.setOpacity(1);
    }

    /**
     * Setup texture optimization
     */
    setupTextureOptimization() {
        // Override image loading
        const originalImage = window.Image;
        window.Image = function() {
            const img = new originalImage();
            this.setupTextureCaching(img);
            return img;
        };
        
        // Copy Image constructor properties
        Object.setPrototypeOf(window.Image, originalImage);
        Object.defineProperty(window.Image, 'prototype', {
            value: originalImage.prototype,
            writable: false
        });
    }

    /**
     * Setup texture caching
     */
    setupTextureCaching(img) {
        const originalSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
        
        Object.defineProperty(img, 'src', {
            get: function() {
                return originalSrc.get.call(this);
            },
            set: function(value) {
                // Check cache first
                if (this.textureCache.has(value)) {
                    const cachedImg = this.textureCache.get(value);
                    this.copyImageData(cachedImg);
                    return;
                }
                
                // Load and cache
                originalSrc.set.call(this, value);
                this.textureCache.set(value, this.cloneNode());
                this.memoryStats.cachedTextures++;
            }
        });
    }

    /**
     * Copy image data
     */
    copyImageData(sourceImg) {
        // Copy image properties
        this.src = sourceImg.src;
        this.width = sourceImg.width;
        this.height = sourceImg.height;
        this.complete = sourceImg.complete;
        this.naturalWidth = sourceImg.naturalWidth;
        this.naturalHeight = sourceImg.naturalHeight;
    }

    /**
     * Setup sound optimization
     */
    setupSoundOptimization() {
        // Override audio creation
        const originalAudio = window.Audio;
        window.Audio = function(src) {
            const audio = new originalAudio();
            this.setupSoundCaching(audio, src);
            return audio;
        };
        
        // Copy Audio constructor properties
        Object.setPrototypeOf(window.Audio, originalAudio);
        Object.defineProperty(window.Audio, 'prototype', {
            value: originalAudio.prototype,
            writable: false
        });
    }

    /**
     * Setup sound caching
     */
    setupSoundCaching(audio, src) {
        if (src && this.soundCache.has(src)) {
            const cachedAudio = this.soundCache.get(src);
            audio.src = cachedAudio.src;
            audio.preload = cachedAudio.preload;
        } else if (src) {
            audio.src = src;
            audio.preload = 'metadata'; // Reduce memory usage
            this.soundCache.set(src, {
                src: src,
                preload: 'metadata'
            });
            this.memoryStats.cachedSounds++;
        }
    }

    /**
     * Setup garbage collection
     */
    setupGarbageCollection() {
        // Force garbage collection if available
        if (window.gc) {
            setInterval(() => {
                this.forceGarbageCollection();
            }, this.cleanupInterval);
        }
        
        // Clean up unused objects
        setInterval(() => {
            this.cleanupUnusedObjects();
        }, this.cleanupInterval);
    }

    /**
     * Force garbage collection
     */
    forceGarbageCollection() {
        if (window.gc) {
            window.gc();
        }
        
        // Clear unused textures
        this.cleanupUnusedTextures();
        
        // Clear unused sounds
        this.cleanupUnusedSounds();
    }

    /**
     * Cleanup unused textures
     */
    cleanupUnusedTextures() {
        const now = Date.now();
        const maxAge = 30000; // 30 seconds
        
        for (const [src, img] of this.textureCache) {
            if (now - img.timestamp > maxAge) {
                this.textureCache.delete(src);
                this.memoryStats.cachedTextures--;
            }
        }
    }

    /**
     * Cleanup unused sounds
     */
    cleanupUnusedSounds() {
        const now = Date.now();
        const maxAge = 60000; // 60 seconds
        
        for (const [src, sound] of this.soundCache) {
            if (now - sound.timestamp > maxAge) {
                this.soundCache.delete(src);
                this.memoryStats.cachedSounds--;
            }
        }
    }

    /**
     * Setup memory cleanup
     */
    setupMemoryCleanup() {
        // Clean up on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.triggerMemoryCleanup();
            }
        });
        
        // Clean up on page unload
        window.addEventListener('beforeunload', () => {
            this.cleanupAll();
        });
    }

    /**
     * Trigger memory cleanup
     */
    triggerMemoryCleanup() {
        const now = Date.now();
        if (now - this.lastCleanup < 1000) return; // Prevent too frequent cleanup
        
        this.lastCleanup = now;
        
        // Clear object pools
        this.clearObjectPools();
        
        // Clear texture cache
        this.clearTextureCache();
        
        // Clear sound cache
        this.clearSoundCache();
        
        // Force garbage collection
        this.forceGarbageCollection();
        
        console.log('Memory cleanup triggered');
    }

    /**
     * Clear object pools
     */
    clearObjectPools() {
        for (const [typeName, pool] of this.objectPool) {
            pool.length = 0;
        }
        this.memoryStats.pooledObjects = 0;
    }

    /**
     * Clear texture cache
     */
    clearTextureCache() {
        this.textureCache.clear();
        this.memoryStats.cachedTextures = 0;
    }

    /**
     * Clear sound cache
     */
    clearSoundCache() {
        this.soundCache.clear();
        this.memoryStats.cachedSounds = 0;
    }

    /**
     * Cleanup unused objects
     */
    cleanupUnusedObjects() {
        // Remove objects that are no longer referenced
        this.objectPool.forEach((pool, typeName) => {
            const filteredPool = pool.filter(obj => {
                // Check if object is still valid
                return obj && !obj.destroyed;
            });
            this.objectPool.set(typeName, filteredPool);
        });
    }

    /**
     * Cleanup all resources
     */
    cleanupAll() {
        this.clearObjectPools();
        this.clearTextureCache();
        this.clearSoundCache();
        this.forceGarbageCollection();
    }

    /**
     * Get memory statistics
     */
    getMemoryStats() {
        return { ...this.memoryStats };
    }

    /**
     * Set memory threshold
     */
    setMemoryThreshold(threshold) {
        this.memoryThreshold = threshold;
    }

    /**
     * Get memory usage percentage
     */
    getMemoryUsagePercentage() {
        if (performance.memory) {
            const used = performance.memory.usedJSHeapSize;
            const limit = performance.memory.jsHeapSizeLimit;
            return (used / limit) * 100;
        }
        return 0;
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MemoryManager;
}