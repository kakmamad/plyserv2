/**
 * Physics Optimizer for Construct 2 Games
 * Reduces CPU usage and prevents overheating on mobile devices
 */

class PhysicsOptimizer {
    constructor(optimizer) {
        this.optimizer = optimizer;
        this.isLowEndDevice = optimizer.isLowEndDevice;
        this.physicsSettings = this.getOptimalPhysicsSettings();
        this.runtime = null;
        this.originalPhysicsMethods = {};
        
        this.init();
    }

    /**
     * Get optimal physics settings based on device capabilities
     */
    getOptimalPhysicsSettings() {
        const baseSettings = {
            // Box2D physics settings
            velocityIterations: this.isLowEndDevice ? 4 : 8,
            positionIterations: this.isLowEndDevice ? 2 : 4,
            timeStep: this.isLowEndDevice ? 1/30 : 1/60, // 30fps vs 60fps
            maxSubSteps: this.isLowEndDevice ? 1 : 3,
            
            // Collision detection
            enableContinuousCollision: !this.isLowEndDevice,
            enableSleeping: true,
            sleepThreshold: this.isLowEndDevice ? 0.1 : 0.05,
            
            // World settings
            gravity: { x: 0, y: 9.8 },
            allowSleep: true,
            warmStarting: !this.isLowEndDevice,
            continuousPhysics: !this.isLowEndDevice,
            
            // Performance limits
            maxBodies: this.isLowEndDevice ? 50 : 200,
            maxJoints: this.isLowEndDevice ? 20 : 100,
            maxContacts: this.isLowEndDevice ? 100 : 500,
            
            // Update frequency
            updateFrequency: this.isLowEndDevice ? 30 : 60,
            lastUpdateTime: 0
        };

        return baseSettings;
    }

    /**
     * Initialize physics optimization
     */
    init() {
        this.setupPhysicsOverrides();
        this.setupPerformanceMonitoring();
        this.setupAdaptiveQuality();
    }

    /**
     * Setup physics method overrides
     */
    setupPhysicsOverrides() {
        // Wait for Construct 2 runtime to be available
        const checkRuntime = () => {
            if (window.cr_getC2Runtime) {
                this.runtime = window.cr_getC2Runtime();
                if (this.runtime && this.runtime.physics) {
                    this.applyPhysicsOptimizations();
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
     * Apply physics optimizations to Construct 2 runtime
     */
    applyPhysicsOptimizations() {
        if (!this.runtime || !this.runtime.physics) return;

        // Override physics world settings
        this.overridePhysicsWorld();
        
        // Override body creation
        this.overrideBodyCreation();
        
        // Override joint creation
        this.overrideJointCreation();
        
        // Override collision detection
        this.overrideCollisionDetection();
        
        // Override physics update loop
        this.overridePhysicsUpdate();
    }

    /**
     * Override physics world settings
     */
    overridePhysicsWorld() {
        const physics = this.runtime.physics;
        
        if (physics.world) {
            // Store original methods
            this.originalPhysicsMethods.setVelocityIterations = physics.world.setVelocityIterations;
            this.originalPhysicsMethods.setPositionIterations = physics.world.setPositionIterations;
            
            // Apply optimized settings
            physics.world.setVelocityIterations(this.physicsSettings.velocityIterations);
            physics.world.setPositionIterations(this.physicsSettings.positionIterations);
            
            // Enable sleeping for better performance
            if (physics.world.setAllowSleeping) {
                physics.world.setAllowSleeping(this.physicsSettings.allowSleep);
            }
            
            // Set gravity
            if (physics.world.setGravity) {
                physics.world.setGravity(this.physicsSettings.gravity);
            }
        }
    }

    /**
     * Override body creation to limit body count
     */
    overrideBodyCreation() {
        const physics = this.runtime.physics;
        let bodyCount = 0;
        
        if (physics.world && physics.world.createBody) {
            const originalCreateBody = physics.world.createBody;
            physics.world.createBody = (def) => {
                if (bodyCount >= this.physicsSettings.maxBodies) {
                    console.warn('Maximum body count reached, skipping body creation');
                    return null;
                }
                
                const body = originalCreateBody.call(physics.world, def);
                if (body) {
                    bodyCount++;
                    
                    // Set body properties for optimization
                    if (body.setSleepingAllowed) {
                        body.setSleepingAllowed(true);
                    }
                    
                    // Reduce density for better performance
                    if (body.getFixtureList) {
                        const fixture = body.getFixtureList();
                        if (fixture && fixture.setDensity) {
                            fixture.setDensity(fixture.getDensity() * 0.8);
                        }
                    }
                }
                
                return body;
            };
        }
    }

    /**
     * Override joint creation to limit joint count
     */
    overrideJointCreation() {
        const physics = this.runtime.physics;
        let jointCount = 0;
        
        if (physics.world && physics.world.createJoint) {
            const originalCreateJoint = physics.world.createJoint;
            physics.world.createJoint = (def) => {
                if (jointCount >= this.physicsSettings.maxJoints) {
                    console.warn('Maximum joint count reached, skipping joint creation');
                    return null;
                }
                
                const joint = originalCreateJoint.call(physics.world, def);
                if (joint) {
                    jointCount++;
                }
                
                return joint;
            };
        }
    }

    /**
     * Override collision detection for better performance
     */
    overrideCollisionDetection() {
        const physics = this.runtime.physics;
        
        if (physics.world && physics.world.setContactListener) {
            const originalSetContactListener = physics.world.setContactListener;
            physics.world.setContactListener = (listener) => {
                // Create optimized contact listener
                const optimizedListener = {
                    beginContact: (contact) => {
                        if (this.physicsSettings.maxContacts > 0) {
                            this.physicsSettings.maxContacts--;
                            if (listener && listener.beginContact) {
                                listener.beginContact(contact);
                            }
                        }
                    },
                    endContact: (contact) => {
                        if (listener && listener.endContact) {
                            listener.endContact(contact);
                        }
                    },
                    preSolve: (contact, oldManifold) => {
                        if (listener && listener.preSolve) {
                            listener.preSolve(contact, oldManifold);
                        }
                    },
                    postSolve: (contact, impulse) => {
                        if (listener && listener.postSolve) {
                            listener.postSolve(contact, impulse);
                        }
                    }
                };
                
                return originalSetContactListener.call(physics.world, optimizedListener);
            };
        }
    }

    /**
     * Override physics update loop for better performance
     */
    overridePhysicsUpdate() {
        const physics = this.runtime.physics;
        
        if (physics.world && physics.world.step) {
            const originalStep = physics.world.step;
            physics.world.step = (timeStep, velocityIterations, positionIterations) => {
                const now = performance.now();
                const deltaTime = now - this.physicsSettings.lastUpdateTime;
                
                // Throttle physics updates
                if (deltaTime < (1000 / this.physicsSettings.updateFrequency)) {
                    return;
                }
                
                this.physicsSettings.lastUpdateTime = now;
                
                // Use optimized parameters
                const optimizedTimeStep = this.physicsSettings.timeStep;
                const optimizedVelocityIterations = this.physicsSettings.velocityIterations;
                const optimizedPositionIterations = this.physicsSettings.positionIterations;
                
                return originalStep.call(
                    physics.world,
                    optimizedTimeStep,
                    optimizedVelocityIterations,
                    optimizedPositionIterations
                );
            };
        }
    }

    /**
     * Setup performance monitoring for physics
     */
    setupPerformanceMonitoring() {
        setInterval(() => {
            this.monitorPhysicsPerformance();
        }, 2000); // Check every 2 seconds
    }

    /**
     * Monitor physics performance and adjust settings
     */
    monitorPhysicsPerformance() {
        if (!this.runtime || !this.runtime.physics) return;

        const stats = this.optimizer.getPerformanceStats();
        
        // Adjust physics settings based on performance
        if (stats && stats.fps < 25) {
            this.reducePhysicsQuality();
        } else if (stats && stats.fps > 50) {
            this.improvePhysicsQuality();
        }
        
        // Reset contact count periodically
        this.physicsSettings.maxContacts = this.isLowEndDevice ? 100 : 500;
    }

    /**
     * Reduce physics quality for better performance
     */
    reducePhysicsQuality() {
        this.physicsSettings.velocityIterations = Math.max(this.physicsSettings.velocityIterations - 1, 2);
        this.physicsSettings.positionIterations = Math.max(this.physicsSettings.positionIterations - 1, 1);
        this.physicsSettings.timeStep = Math.min(this.physicsSettings.timeStep * 1.1, 1/20); // Max 20fps
        this.physicsSettings.maxBodies = Math.max(this.physicsSettings.maxBodies - 10, 20);
        this.physicsSettings.maxJoints = Math.max(this.physicsSettings.maxJoints - 5, 10);
        
        this.applyPhysicsSettings();
    }

    /**
     * Improve physics quality when performance is good
     */
    improvePhysicsQuality() {
        this.physicsSettings.velocityIterations = Math.min(this.physicsSettings.velocityIterations + 1, 8);
        this.physicsSettings.positionIterations = Math.min(this.physicsSettings.positionIterations + 1, 4);
        this.physicsSettings.timeStep = Math.max(this.physicsSettings.timeStep * 0.95, 1/60); // Min 60fps
        this.physicsSettings.maxBodies = Math.min(this.physicsSettings.maxBodies + 5, 200);
        this.physicsSettings.maxJoints = Math.min(this.physicsSettings.maxJoints + 2, 100);
        
        this.applyPhysicsSettings();
    }

    /**
     * Apply current physics settings to the world
     */
    applyPhysicsSettings() {
        if (!this.runtime || !this.runtime.physics || !this.runtime.physics.world) return;

        const world = this.runtime.physics.world;
        
        if (world.setVelocityIterations) {
            world.setVelocityIterations(this.physicsSettings.velocityIterations);
        }
        
        if (world.setPositionIterations) {
            world.setPositionIterations(this.physicsSettings.positionIterations);
        }
    }

    /**
     * Setup adaptive quality system
     */
    setupAdaptiveQuality() {
        // Monitor device temperature (if available)
        if (navigator.getBattery) {
            navigator.getBattery().then(battery => {
                battery.addEventListener('levelchange', () => {
                    if (battery.level < 0.2) {
                        // Low battery - reduce physics quality
                        this.physicsSettings.velocityIterations = 2;
                        this.physicsSettings.positionIterations = 1;
                        this.physicsSettings.timeStep = 1/20;
                    }
                });
            });
        }
    }

    /**
     * Get current physics settings
     */
    getPhysicsSettings() {
        return { ...this.physicsSettings };
    }

    /**
     * Set custom physics settings
     */
    setPhysicsSettings(settings) {
        Object.assign(this.physicsSettings, settings);
        this.applyPhysicsSettings();
    }

    /**
     * Reset physics settings to default
     */
    resetPhysicsSettings() {
        this.physicsSettings = this.getOptimalPhysicsSettings();
        this.applyPhysicsSettings();
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PhysicsOptimizer;
}