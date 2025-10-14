/**
 * Device Capability Detector for Construct 2 Games
 * Automatically detects device capabilities and adjusts game settings
 */

class DeviceDetector {
    constructor() {
        this.capabilities = {
            gpu: null,
            cpu: null,
            memory: null,
            screen: null,
            network: null,
            battery: null,
            thermal: null
        };
        
        this.deviceProfile = null;
        this.optimizationLevel = 'medium';
        
        this.init();
    }

    /**
     * Initialize device detection
     */
    async init() {
        await this.detectGPUCapabilities();
        await this.detectCPUCapabilities();
        await this.detectMemoryCapabilities();
        await this.detectScreenCapabilities();
        await this.detectNetworkCapabilities();
        await this.detectBatteryCapabilities();
        await this.detectThermalCapabilities();
        
        this.generateDeviceProfile();
        this.setOptimizationLevel();
    }

    /**
     * Detect GPU capabilities
     */
    async detectGPUCapabilities() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!gl) {
            this.capabilities.gpu = {
                type: 'none',
                vendor: 'unknown',
                renderer: 'unknown',
                version: 'unknown',
                maxTextureSize: 0,
                maxVertexAttribs: 0,
                maxVaryingVectors: 0,
                maxFragmentUniforms: 0,
                maxVertexUniforms: 0,
                maxTextureImageUnits: 0,
                maxCombinedTextureImageUnits: 0,
                maxVertexTextureImageUnits: 0,
                maxRenderBufferSize: 0,
                maxViewportDims: [0, 0],
                aliasedLineWidthRange: [0, 0],
                aliasedPointSizeRange: [0, 0],
                maxAnisotropy: 0,
                maxCubeMapTextureSize: 0,
                maxTextureSize: 0,
                maxVertexAttribs: 0,
                maxVaryingVectors: 0,
                maxFragmentUniforms: 0,
                maxVertexUniforms: 0,
                maxTextureImageUnits: 0,
                maxCombinedTextureImageUnits: 0,
                maxVertexTextureImageUnits: 0,
                maxRenderBufferSize: 0,
                maxViewportDims: [0, 0],
                aliasedLineWidthRange: [0, 0],
                aliasedPointSizeRange: [0, 0],
                maxAnisotropy: 0,
                maxCubeMapTextureSize: 0,
                extensions: [],
                isLowEnd: true
            };
            return;
        }

        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        const vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown';
        const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
        
        this.capabilities.gpu = {
            type: 'webgl',
            vendor: vendor,
            renderer: renderer,
            version: gl.getParameter(gl.VERSION),
            maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
            maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
            maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
            maxFragmentUniforms: gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
            maxVertexUniforms: gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
            maxTextureImageUnits: gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
            maxCombinedTextureImageUnits: gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS),
            maxVertexTextureImageUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
            maxRenderBufferSize: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
            maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
            aliasedLineWidthRange: gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE),
            aliasedPointSizeRange: gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE),
            maxAnisotropy: this.getMaxAnisotropy(gl),
            maxCubeMapTextureSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
            extensions: gl.getSupportedExtensions() || [],
            isLowEnd: this.isLowEndGPU(vendor, renderer)
        };
    }

    /**
     * Get maximum anisotropy
     */
    getMaxAnisotropy(gl) {
        const ext = gl.getExtension('EXT_texture_filter_anisotropic') ||
                   gl.getExtension('MOZ_EXT_texture_filter_anisotropic') ||
                   gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
        
        if (ext) {
            return gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
        }
        return 0;
    }

    /**
     * Check if GPU is low-end
     */
    isLowEndGPU(vendor, renderer) {
        const lowEndGPUs = [
            // Mali GPUs
            'mali-400', 'mali-450', 'mali-t720', 'mali-t830', 'mali-t860',
            // Adreno GPUs
            'adreno 305', 'adreno 306', 'adreno 320', 'adreno 330',
            // PowerVR GPUs
            'powervr sgx540', 'powervr sgx544', 'powervr sgx554',
            // Intel GPUs
            'intel hd 4000', 'intel hd 3000', 'intel hd 2000',
            // Other low-end GPUs
            'geforce 610', 'geforce 620', 'geforce 630',
            'radeon hd 4000', 'radeon hd 3000'
        ];
        
        const rendererLower = renderer.toLowerCase();
        return lowEndGPUs.some(gpu => rendererLower.includes(gpu));
    }

    /**
     * Detect CPU capabilities
     */
    async detectCPUCapabilities() {
        const cores = navigator.hardwareConcurrency || 4;
        const userAgent = navigator.userAgent;
        
        // Detect CPU architecture
        let architecture = 'unknown';
        if (userAgent.includes('x86_64') || userAgent.includes('x64')) {
            architecture = 'x64';
        } else if (userAgent.includes('x86') || userAgent.includes('i386')) {
            architecture = 'x86';
        } else if (userAgent.includes('arm64') || userAgent.includes('aarch64')) {
            architecture = 'arm64';
        } else if (userAgent.includes('arm')) {
            architecture = 'arm';
        }
        
        this.capabilities.cpu = {
            cores: cores,
            architecture: architecture,
            isLowEnd: cores < 4 || architecture === 'arm'
        };
    }

    /**
     * Detect memory capabilities
     */
    async detectMemoryCapabilities() {
        const memory = navigator.deviceMemory || 4; // Default to 4GB if not available
        
        this.capabilities.memory = {
            total: memory,
            isLowEnd: memory < 3
        };
    }

    /**
     * Detect screen capabilities
     */
    async detectScreenCapabilities() {
        const width = screen.width;
        const height = screen.height;
        const pixelRatio = window.devicePixelRatio || 1;
        const colorDepth = screen.colorDepth;
        const orientation = screen.orientation ? screen.orientation.type : 'unknown';
        
        this.capabilities.screen = {
            width: width,
            height: height,
            pixelRatio: pixelRatio,
            colorDepth: colorDepth,
            orientation: orientation,
            isLowEnd: width < 800 || height < 600 || pixelRatio > 2
        };
    }

    /**
     * Detect network capabilities
     */
    async detectNetworkCapabilities() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection) {
            this.capabilities.network = {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                rtt: connection.rtt,
                saveData: connection.saveData,
                isLowEnd: connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g'
            };
        } else {
            this.capabilities.network = {
                effectiveType: 'unknown',
                downlink: 0,
                rtt: 0,
                saveData: false,
                isLowEnd: true
            };
        }
    }

    /**
     * Detect battery capabilities
     */
    async detectBatteryCapabilities() {
        if (navigator.getBattery) {
            try {
                const battery = await navigator.getBattery();
                this.capabilities.battery = {
                    level: battery.level,
                    charging: battery.charging,
                    chargingTime: battery.chargingTime,
                    dischargingTime: battery.dischargingTime,
                    isLowEnd: battery.level < 0.2
                };
            } catch (error) {
                this.capabilities.battery = {
                    level: 1,
                    charging: true,
                    chargingTime: 0,
                    dischargingTime: 0,
                    isLowEnd: false
                };
            }
        } else {
            this.capabilities.battery = {
                level: 1,
                charging: true,
                chargingTime: 0,
                dischargingTime: 0,
                isLowEnd: false
            };
        }
    }

    /**
     * Detect thermal capabilities
     */
    async detectThermalCapabilities() {
        // Thermal API is not widely supported, so we'll use heuristics
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isLowEnd = this.capabilities.gpu?.isLowEnd || this.capabilities.cpu?.isLowEnd || this.capabilities.memory?.isLowEnd;
        
        this.capabilities.thermal = {
            isMobile: isMobile,
            isLowEnd: isLowEnd,
            thermalState: 'unknown' // Would be 'nominal', 'fair', 'serious', 'critical' if supported
        };
    }

    /**
     * Generate device profile
     */
    generateDeviceProfile() {
        const gpuScore = this.calculateGPUScore();
        const cpuScore = this.calculateCPUScore();
        const memoryScore = this.calculateMemoryScore();
        const screenScore = this.calculateScreenScore();
        const networkScore = this.calculateNetworkScore();
        const batteryScore = this.calculateBatteryScore();
        
        const totalScore = (gpuScore + cpuScore + memoryScore + screenScore + networkScore + batteryScore) / 6;
        
        this.deviceProfile = {
            score: totalScore,
            gpuScore: gpuScore,
            cpuScore: cpuScore,
            memoryScore: memoryScore,
            screenScore: screenScore,
            networkScore: networkScore,
            batteryScore: batteryScore,
            isLowEnd: totalScore < 0.5,
            isMidRange: totalScore >= 0.5 && totalScore < 0.8,
            isHighEnd: totalScore >= 0.8
        };
    }

    /**
     * Calculate GPU score
     */
    calculateGPUScore() {
        if (!this.capabilities.gpu || this.capabilities.gpu.type === 'none') return 0;
        
        const gpu = this.capabilities.gpu;
        let score = 0.5; // Base score
        
        // Adjust based on max texture size
        if (gpu.maxTextureSize >= 4096) score += 0.3;
        else if (gpu.maxTextureSize >= 2048) score += 0.2;
        else if (gpu.maxTextureSize >= 1024) score += 0.1;
        
        // Adjust based on extensions
        if (gpu.extensions.includes('OES_texture_float')) score += 0.1;
        if (gpu.extensions.includes('OES_texture_half_float')) score += 0.1;
        if (gpu.extensions.includes('EXT_texture_filter_anisotropic')) score += 0.1;
        
        // Penalty for low-end GPUs
        if (gpu.isLowEnd) score -= 0.3;
        
        return Math.max(0, Math.min(1, score));
    }

    /**
     * Calculate CPU score
     */
    calculateCPUScore() {
        if (!this.capabilities.cpu) return 0.5;
        
        const cpu = this.capabilities.cpu;
        let score = 0.5; // Base score
        
        // Adjust based on core count
        if (cpu.cores >= 8) score += 0.3;
        else if (cpu.cores >= 4) score += 0.2;
        else if (cpu.cores >= 2) score += 0.1;
        
        // Adjust based on architecture
        if (cpu.architecture === 'x64') score += 0.2;
        else if (cpu.architecture === 'arm64') score += 0.1;
        else if (cpu.architecture === 'x86') score += 0.1;
        
        // Penalty for low-end CPUs
        if (cpu.isLowEnd) score -= 0.3;
        
        return Math.max(0, Math.min(1, score));
    }

    /**
     * Calculate memory score
     */
    calculateMemoryScore() {
        if (!this.capabilities.memory) return 0.5;
        
        const memory = this.capabilities.memory;
        let score = 0.5; // Base score
        
        // Adjust based on total memory
        if (memory.total >= 8) score += 0.3;
        else if (memory.total >= 4) score += 0.2;
        else if (memory.total >= 2) score += 0.1;
        
        // Penalty for low memory
        if (memory.isLowEnd) score -= 0.3;
        
        return Math.max(0, Math.min(1, score));
    }

    /**
     * Calculate screen score
     */
    calculateScreenScore() {
        if (!this.capabilities.screen) return 0.5;
        
        const screen = this.capabilities.screen;
        let score = 0.5; // Base score
        
        // Adjust based on resolution
        const totalPixels = screen.width * screen.height;
        if (totalPixels >= 2073600) score += 0.3; // 1920x1080+
        else if (totalPixels >= 921600) score += 0.2; // 1280x720+
        else if (totalPixels >= 480000) score += 0.1; // 800x600+
        
        // Adjust based on pixel ratio
        if (screen.pixelRatio <= 1) score += 0.1;
        else if (screen.pixelRatio <= 2) score += 0.05;
        
        // Penalty for low-end screens
        if (screen.isLowEnd) score -= 0.3;
        
        return Math.max(0, Math.min(1, score));
    }

    /**
     * Calculate network score
     */
    calculateNetworkScore() {
        if (!this.capabilities.network) return 0.5;
        
        const network = this.capabilities.network;
        let score = 0.5; // Base score
        
        // Adjust based on effective type
        switch (network.effectiveType) {
            case '4g': score += 0.3; break;
            case '3g': score += 0.2; break;
            case '2g': score += 0.1; break;
            case 'slow-2g': score += 0.05; break;
        }
        
        // Adjust based on downlink
        if (network.downlink >= 10) score += 0.1;
        else if (network.downlink >= 5) score += 0.05;
        
        // Penalty for low-end networks
        if (network.isLowEnd) score -= 0.3;
        
        return Math.max(0, Math.min(1, score));
    }

    /**
     * Calculate battery score
     */
    calculateBatteryScore() {
        if (!this.capabilities.battery) return 0.5;
        
        const battery = this.capabilities.battery;
        let score = 0.5; // Base score
        
        // Adjust based on battery level
        if (battery.level >= 0.8) score += 0.2;
        else if (battery.level >= 0.5) score += 0.1;
        else if (battery.level >= 0.2) score += 0.05;
        
        // Adjust based on charging status
        if (battery.charging) score += 0.1;
        
        // Penalty for low battery
        if (battery.isLowEnd) score -= 0.3;
        
        return Math.max(0, Math.min(1, score));
    }

    /**
     * Set optimization level based on device profile
     */
    setOptimizationLevel() {
        if (this.deviceProfile.isLowEnd) {
            this.optimizationLevel = 'low';
        } else if (this.deviceProfile.isMidRange) {
            this.optimizationLevel = 'medium';
        } else {
            this.optimizationLevel = 'high';
        }
    }

    /**
     * Get device capabilities
     */
    getCapabilities() {
        return { ...this.capabilities };
    }

    /**
     * Get device profile
     */
    getDeviceProfile() {
        return { ...this.deviceProfile };
    }

    /**
     * Get optimization level
     */
    getOptimizationLevel() {
        return this.optimizationLevel;
    }

    /**
     * Get recommended settings for Construct 2
     */
    getRecommendedSettings() {
        const profile = this.deviceProfile;
        
        return {
            frameRate: profile.isLowEnd ? 30 : (profile.isMidRange ? 45 : 60),
            physicsIterations: profile.isLowEnd ? 4 : (profile.isMidRange ? 6 : 8),
            maxParticles: profile.isLowEnd ? 50 : (profile.isMidRange ? 150 : 300),
            maxBodies: profile.isLowEnd ? 50 : (profile.isMidRange ? 150 : 300),
            maxJoints: profile.isLowEnd ? 20 : (profile.isMidRange ? 60 : 120),
            textureQuality: profile.isLowEnd ? 'low' : (profile.isMidRange ? 'medium' : 'high'),
            antialiasing: !profile.isLowEnd,
            pixelArt: profile.isLowEnd,
            enableSleeping: true,
            warmStarting: !profile.isLowEnd,
            continuousPhysics: !profile.isLowEnd
        };
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeviceDetector;
}