// 时空漩涡副本性能优化器
// 专门针对能量之眼和星尘轨道两个副本进行性能优化

class TimeVortexPerformanceOptimizer {
    constructor() {
        this.isEnabled = false;
        this.originalSettings = {
            maxParticles: 500,
            particleLifetime: 1000,
            maxEnemies: 100,
            enemySpawnInterval: 1000
        };
        
        this.optimizedSettings = {
            maxParticles: 150,        // 粒子效果减少 70%
            particleLifetime: 500,    // 粒子生存时间减半
            maxEnemies: 30,          // 敌人数量限制30个
            enemySpawnInterval: 1500  // 生成间隔略增加
        };
        
        this.enemyPool = [];        // 敌人对象池
        this.particlePool = [];     // 粒子对象池
        this.bulletPool = [];       // 子弹对象池
        
        this.poolSizes = {
            enemies: 50,
            particles: 200,
            bullets: 100
        };
        
        this.isInTimeVortex = false;
        this.keydownHandler = null;
        
        this.initObjectPools();
        this.setupEventListeners();
    }
    
    // 初始化对象池
    initObjectPools() {
        // 初始化敌人对象池
        for (let i = 0; i < this.poolSizes.enemies; i++) {
            this.enemyPool.push({
                active: false,
                x: 0, y: 0,
                health: 0, maxHealth: 0,
                speed: 0, damage: 0,
                type: 'A',
                reset: function() {
                    this.active = false;
                    this.x = 0;
                    this.y = 0;
                    this.health = 0;
                    this.maxHealth = 0;
                }
            });
        }
        
        // 初始化粒子对象池
        for (let i = 0; i < this.poolSizes.particles; i++) {
            this.particlePool.push({
                active: false,
                x: 0, y: 0,
                vx: 0, vy: 0,
                life: 0, maxLife: 0,
                color: '#ffffff',
                reset: function() {
                    this.active = false;
                    this.x = 0;
                    this.y = 0;
                    this.vx = 0;
                    this.vy = 0;
                    this.life = 0;
                }
            });
        }
        
        // 初始化子弹对象池
        for (let i = 0; i < this.poolSizes.bullets; i++) {
            this.bulletPool.push({
                active: false,
                x: 0, y: 0,
                vx: 0, vy: 0,
                damage: 0,
                radius: 5,
                reset: function() {
                    this.active = false;
                    this.x = 0;
                    this.y = 0;
                    this.vx = 0;
                    this.vy = 0;
                }
            });
        }
        
        console.log('对象池初始化完成');
    }
    
    // 设置事件监听器
    setupEventListeners() {
        this.keydownHandler = (e) => {
            // 在时空漩涡副本中按E键开启/关闭优化
            if (this.isInTimeVortex && e.key.toLowerCase() === 'e') {
                this.toggle();
                e.preventDefault();
            }
        };
        
        document.addEventListener('keydown', this.keydownHandler);
    }
    
    // 检测是否在时空漩涡副本中
    checkTimeVortexState() {
        const wasInTimeVortex = this.isInTimeVortex;
        
        // 检查当前游戏状态
        if (typeof gameStateManager !== 'undefined') {
            this.isInTimeVortex = gameStateManager.isInEnergyEye() || gameStateManager.isInStardustOrbit();
        } else if (typeof energyEyeDungeon !== 'undefined' && typeof stardustOrbitDungeon !== 'undefined') {
            this.isInTimeVortex = energyEyeDungeon.isActive || stardustOrbitDungeon.isActive;
        }
        
        // 如果刚进入时空漩涡副本，显示提示
        if (this.isInTimeVortex && !wasInTimeVortex) {
            this.showOptimizationHint();
        }
        
        // 如果离开时空漩涡副本，自动关闭优化
        if (!this.isInTimeVortex && wasInTimeVortex && this.isEnabled) {
            this.disable();
        }
    }
    
    // 显示优化提示
    showOptimizationHint() {
        // 创建提示元素
        const hint = document.createElement('div');
        hint.id = 'performance-hint';
        hint.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            z-index: 1000;
            border: 2px solid #00ff00;
            box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
            animation: fadeInOut 5s ease-in-out;
        `;
        hint.innerHTML = `
            <div>🚀 时空漩涡性能优化可用</div>
            <div>按 <strong>E</strong> 键开启/关闭优化</div>
            <div>• 减少粒子效果</div>
            <div>• 限制敌人数量</div>
            <div>• 启用对象池</div>
        `;
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateX(100%); }
                15% { opacity: 1; transform: translateX(0); }
                85% { opacity: 1; transform: translateX(0); }
                100% { opacity: 0; transform: translateX(100%); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(hint);
        
        // 5秒后自动移除提示
        setTimeout(() => {
            if (hint.parentNode) {
                hint.parentNode.removeChild(hint);
            }
        }, 5000);
    }
    
    // 开启/关闭优化
    toggle() {
        if (this.isEnabled) {
            this.disable();
        } else {
            this.enable();
        }
    }
    
    // 启用优化
    enable() {
        if (this.isEnabled) return;
        
        this.isEnabled = true;
        
        // 应用优化设置
        this.applyOptimizations();
        
        // 显示状态通知
        this.showNotification('⚡ 性能优化已启用', '#00ff00');
        
        console.log('时空漩涡性能优化已启用');
    }
    
    // 禁用优化
    disable() {
        if (!this.isEnabled) return;
        
        this.isEnabled = false;
        
        // 恢复原始设置
        this.restoreOriginalSettings();
        
        // 显示状态通知
        this.showNotification('🎮 性能优化已关闭', '#ffaa00');
        
        console.log('时空漩涡性能优化已关闭');
    }
    
    // 应用优化设置
    applyOptimizations() {
        // 重写粒子生成函数
        this.hookParticleGeneration();
        
        // 重写敌人生成函数
        this.hookEnemyGeneration();
        
        // 启用对象池
        this.enableObjectPools();
    }
    
    // 恢复原始设置
    restoreOriginalSettings() {
        // 恢复原始的粒子和敌人生成逻辑
        this.restoreOriginalFunctions();
    }
    
    // 拦截粒子生成
    hookParticleGeneration() {
        if (typeof window.Particle !== 'undefined' && !this.originalParticleConstructor) {
            this.originalParticleConstructor = window.Particle;
            const optimizer = this;
            
            window.Particle = function(x, y, color) {
                // 在优化模式下减少粒子生成
                if (optimizer.isEnabled) {
                    // 30% 概率生成粒子（减少70%）
                    if (Math.random() > 0.3) return null;
                    
                    // 使用对象池
                    const particle = optimizer.getParticleFromPool();
                    if (particle) {
                        particle.x = x;
                        particle.y = y;
                        particle.color = color || '#ffffff';
                        particle.vx = (Math.random() - 0.5) * 4;
                        particle.vy = (Math.random() - 0.5) * 4;
                        particle.life = optimizer.optimizedSettings.particleLifetime;
                        particle.maxLife = particle.life;
                        particle.active = true;
                        return particle;
                    }
                }
                
                // 使用原始构造函数
                return new optimizer.originalParticleConstructor(x, y, color);
            };
        }
        
        // 拦截全局 particles 数组的 push 方法
        if (typeof window.particles !== 'undefined' && Array.isArray(window.particles)) {
            if (!this.originalParticlesPush) {
                this.originalParticlesPush = window.particles.push;
                const optimizer = this;
                
                window.particles.push = function(...items) {
                    if (optimizer.isEnabled) {
                        // 限制粒子数量
                        const currentCount = this.filter(p => p && p.life > 0).length;
                        if (currentCount >= optimizer.optimizedSettings.maxParticles) {
                            return this.length;
                        }
                        
                        // 只添加部分粒子
                        const filteredItems = items.filter(() => Math.random() < 0.3);
                        return optimizer.originalParticlesPush.call(this, ...filteredItems);
                    }
                    
                    return optimizer.originalParticlesPush.call(this, ...items);
                };
            }
        }
    }
    
    // 拦截敌人生成
    hookEnemyGeneration() {
        if (typeof window.enemies !== 'undefined' && Array.isArray(window.enemies)) {
            if (!this.originalEnemiesMonitoring) {
                this.originalEnemiesMonitoring = true;
                const optimizer = this;
                
                // 重写敌人数组的管理
                const originalPush = window.enemies.push;
                window.enemies.push = function(...newEnemies) {
                    if (optimizer.isEnabled) {
                        // 检查当前敌人数量
                        const currentCount = this.length;
                        if (currentCount >= optimizer.optimizedSettings.maxEnemies) {
                            // 移除最早生成的敌人
                            const excessCount = currentCount + newEnemies.length - optimizer.optimizedSettings.maxEnemies;
                            for (let i = 0; i < excessCount; i++) {
                                const removedEnemy = this.shift();
                                if (removedEnemy && removedEnemy.isDead !== undefined) {
                                    removedEnemy.isDead = true;
                                }
                            }
                        }
                    }
                    
                    return originalPush.call(this, ...newEnemies);
                };
            }
        }
    }
    
    // 从对象池获取粒子
    getParticleFromPool() {
        for (let i = 0; i < this.particlePool.length; i++) {
            if (!this.particlePool[i].active) {
                return this.particlePool[i];
            }
        }
        return null;
    }
    
    // 从对象池获取敌人
    getEnemyFromPool() {
        for (let i = 0; i < this.enemyPool.length; i++) {
            if (!this.enemyPool[i].active) {
                return this.enemyPool[i];
            }
        }
        return null;
    }
    
    // 启用对象池
    enableObjectPools() {
        // 对象池更新逻辑将在游戏循环中调用
        console.log('对象池已启用');
    }
    
    // 更新对象池状态
    updateObjectPools() {
        if (!this.isEnabled) return;
        
        // 更新粒子池
        for (let i = 0; i < this.particlePool.length; i++) {
            const particle = this.particlePool[i];
            if (particle.active) {
                particle.life -= 16; // 假设60FPS
                if (particle.life <= 0) {
                    particle.reset();
                }
            }
        }
    }
    
    // 恢复原始函数
    restoreOriginalFunctions() {
        if (this.originalParticleConstructor) {
            window.Particle = this.originalParticleConstructor;
        }
        
        if (this.originalParticlesPush && typeof window.particles !== 'undefined') {
            window.particles.push = this.originalParticlesPush;
        }
    }
    
    // 显示状态通知
    showNotification(message, color = '#ffffff') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: ${color};
            padding: 20px 30px;
            border-radius: 10px;
            font-family: 'Courier New', monospace;
            font-size: 18px;
            font-weight: bold;
            z-index: 10000;
            border: 2px solid ${color};
            box-shadow: 0 0 20px rgba(${color === '#00ff00' ? '0, 255, 0' : '255, 170, 0'}, 0.5);
            animation: popInOut 2s ease-in-out;
        `;
        notification.textContent = message;
        
        // 添加动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes popInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1.1); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        if (!document.head.querySelector('style[data-optimizer="true"]')) {
            style.setAttribute('data-optimizer', 'true');
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 2000);
    }
    
    // 获取优化状态
    getStatus() {
        return {
            enabled: this.isEnabled,
            inTimeVortex: this.isInTimeVortex,
            settings: this.isEnabled ? this.optimizedSettings : this.originalSettings,
            poolStats: {
                activeParticles: this.particlePool.filter(p => p.active).length,
                activeEnemies: this.enemyPool.filter(e => e.active).length,
                activeBullets: this.bulletPool.filter(b => b.active).length
            }
        };
    }
    
    // 更新函数 - 需要在游戏循环中调用
    update() {
        this.checkTimeVortexState();
        this.updateObjectPools();
    }
    
    // 清理函数
    cleanup() {
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
        }
        
        this.restoreOriginalFunctions();
        
        // 清理对象池
        this.enemyPool.forEach(enemy => enemy.reset());
        this.particlePool.forEach(particle => particle.reset());
        this.bulletPool.forEach(bullet => bullet.reset());
    }
}

// 创建全局优化器实例
const timeVortexOptimizer = new TimeVortexPerformanceOptimizer();

// 如果存在游戏循环，集成到更新函数中
if (typeof window !== 'undefined') {
    // 尝试集成到现有的游戏循环中
    const originalGameLoop = window.gameLoop;
    if (typeof originalGameLoop === 'function') {
        window.gameLoop = function() {
            timeVortexOptimizer.update();
            return originalGameLoop.apply(this, arguments);
        };
    }
    
    // 页面卸载时清理
    window.addEventListener('beforeunload', () => {
        timeVortexOptimizer.cleanup();
    });
}

// 导出优化器供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimeVortexPerformanceOptimizer;
} else {
    window.TimeVortexPerformanceOptimizer = TimeVortexPerformanceOptimizer;
    window.timeVortexOptimizer = timeVortexOptimizer;
}

console.log('时空漩涡性能优化器已加载');
console.log('在能量之眼或星尘轨道副本中按 E 键开启/关闭优化');