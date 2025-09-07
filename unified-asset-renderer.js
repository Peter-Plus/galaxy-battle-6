class ShipRenderer {
    constructor() {
    this.images = new Map();
    this.loadingPromises = new Map();
    this.isReady = false;
    
    this.gameSize = { width: 40, height: 50 };
    
    // 扩展战舰图片配置，添加无垠的图片
    this.shipConfig = {
        'default': {
            path: 'assets/ships/default_ship.png',
            description: '诺亚默认战舰',
            glowColor: '#00ffff',
            glowIntensity: 20
        },
        'default2': {
            path: 'assets/ships/default_ship2.png',
            description: '无垠默认战舰',
            glowColor: '#00ffff',
            glowIntensity: 20
        },
        'asura': {
            path: 'assets/ships/blood_asura_ship.png',
            description: '诺亚血色·阿修罗战舰',
            glowColor: '#ff0000',
            glowIntensity: 18
        },
        'asura2': {
            path: 'assets/ships/blood_asura_ship2.png',
            description: '无垠血色·阿修罗战舰',
            glowColor: '#ff0000',
            glowIntensity: 18
        },
        'hades': {
            path: 'assets/ships/hades_ship.png',
            description: '诺亚冥王战舰',
            glowColor: '#000000',
            glowIntensity: 30
        },
        'hades2': {
            path: 'assets/ships/hades_ship2.png',
            description: '无垠冥王战舰',
            glowColor: '#000000',
            glowIntensity: 30
        },
        'titan': {
            path: 'assets/ships/titan_ship.png',
            description: '诺亚泰坦之心战舰',
            glowColor: '#ffaa00',
            glowIntensity: 28
        },
        'titan2': {
            path: 'assets/ships/titan_ship2.png',
            description: '无垠泰坦之心战舰',
            glowColor: '#ffaa00',
            glowIntensity: 28
        },
        'victory_swallow': {
            path: 'assets/equipment/victory_swallow.png',
            description: '诺亚胜利飞燕一号战舰',
            glowColor: '#00ff88',
            glowIntensity: 25
        },
        'victory_swallow2': {
            path: 'assets/equipment/victory_swallow2.png',
            description: '无垠胜利飞燕一号战舰',
            glowColor: '#00ff88',
            glowIntensity: 25
        }
    };
    
    this.preloadAllImages();
}
    
    // 预加载所有战舰图片
    async preloadAllImages() {
        console.log('🚀 开始加载战舰图片...');
        
        const loadPromises = Object.entries(this.shipConfig).map(([key, config]) => {
            return this.loadSingleImage(key, config.path);
        });
        
        try {
            await Promise.all(loadPromises);
            this.isReady = true;
            console.log('✅ 所有战舰图片加载完成!');
            this.logLoadedImages();
        } catch (error) {
            console.warn('⚠️ 部分战舰图片加载失败:', error);
            console.log('📋 将使用降级渲染模式');
        }
    }
    
    // 加载单个图片
    loadSingleImage(key, imagePath) {
        // 避免重复加载
        if (this.loadingPromises.has(key)) {
            return this.loadingPromises.get(key);
        }
        
        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.images.set(key, img);
                console.log(`📦 ${this.shipConfig[key].description} 加载成功 (${img.naturalWidth}x${img.naturalHeight})`);
                resolve(img);
            };
            
            img.onerror = () => {
                const errorMsg = `❌ ${this.shipConfig[key].description} 加载失败: ${imagePath}`;
                console.error(errorMsg);
                reject(new Error(errorMsg));
            };
            
            // 开始加载图片
            img.src = imagePath;
        });
        
        this.loadingPromises.set(key, promise);
        return promise;
    }
    
    // 根据当前游戏状态确定使用哪个战舰
    getCurrentShipType() {
    // 优先检查时装
    if (typeof inventory !== 'undefined' && inventory.costumeSlot?.name === '胜利飞燕一号') {
        return player.characterType === 'wuyin' ? 'victory_swallow2' : 'victory_swallow';
    }
    
    // 检查被动效果系统是否存在
    if (typeof passiveEffects === 'undefined') {
        return player.characterType === 'wuyin' ? 'default2' : 'default';
    }
    
    // 按优先级检查装备状态，根据角色类型选择对应图片
    if (passiveEffects.hasAsura) {
        return player.characterType === 'wuyin' ? 'asura2' : 'asura';
    }
    if (passiveEffects.hasHades) {
        return player.characterType === 'wuyin' ? 'hades2' : 'hades';
    }
    if (passiveEffects.hasTitan) {
        return player.characterType === 'wuyin' ? 'titan2' : 'titan';
    }
    
    return player.characterType === 'wuyin' ? 'default2' : 'default';
}
    
    // 主要的战舰绘制方法
    drawShip(ctx, x, y, options = {}) {
        const shipType = this.getCurrentShipType();
        const shipImage = this.images.get(shipType);
        
        // 如果图片未加载，返回false让调用方使用降级绘制
        if (!shipImage) {
            return false;
        }
        
        // 解析绘制选项
        const {
            width = this.gameSize.width,
            height = this.gameSize.height,
            rotation = 0,
            alpha = 1,
            scale = 1,
            enableGlow = true,
            enableEffects = true
        } = options;
        
        ctx.save();
        
        // 设置全局透明度
        ctx.globalAlpha = alpha;
        
        // 移动到战舰位置
        ctx.translate(x, y);
        
        // 应用旋转
        if (rotation !== 0) {
            ctx.rotate(rotation);
        }
        
        // 应用缩放
        if (scale !== 1) {
            ctx.scale(scale, scale);
        }
        
        // 应用发光效果
        if (enableGlow) {
            this.applyGlowEffect(ctx, shipType);
        }
        
        // 绘制战舰图片 (居中绘制)
        ctx.drawImage(
            shipImage,
            -width / 2,  // x偏移，使图片居中
            -height / 2, // y偏移，使图片居中
            width,       // 显示宽度
            height       // 显示高度
        );
        
        // 应用额外的视觉效果
        if (enableEffects) {
            this.applyShipEffects(ctx, shipType, { width, height });
        }
        
        ctx.restore();
        return true; // 成功绘制
    }
    
    // 应用战舰发光效果
    applyGlowEffect(ctx, shipType) {
        const config = this.shipConfig[shipType];
        if (!config) return;
        
        // 设置阴影效果
        ctx.shadowColor = config.glowColor;
        ctx.shadowBlur = config.glowIntensity;
        
        // 对于特殊战舰，添加额外的发光效果
        if (shipType === 'asura') {
            // 血色·阿修罗的脉动红光
            const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
            ctx.shadowBlur = config.glowIntensity * pulse;
        } else if (shipType === 'titan') {
            // 泰坦之心的心跳式发光
            const heartbeat = Math.abs(Math.sin(Date.now() * 0.015)) * 0.5 + 0.5;
            ctx.shadowBlur = config.glowIntensity * heartbeat;
        }
    }
    
    // 应用战舰特殊效果
    applyShipEffects(ctx, shipType, { width, height }) {
  const time = Date.now();
  
  switch (shipType) {
    case 'victory_swallow':
      // 胜利飞燕一号的绿色光环特效
      this.drawVictorySwallowEffects(ctx, width, height, time);
      break;
      
    case 'asura':
      // 血色·阿修罗的血雾效果
      this.drawBloodMist(ctx, width, height, time);
      break;
      
    case 'hades':
      // 冥王的暗影波纹
      this.drawShadowRipples(ctx, width, height, time);
      break;
      
    case 'titan':
      // 泰坦之心的能量脉冲
      this.drawEnergyPulse(ctx, width, height, time);
      break;
      
    case 'default':
      // 默认战舰的简单光晕
      this.drawBasicAura(ctx, width, height, time);
      break;
  }
}
    drawVictorySwallowEffects(ctx, width, height, time) {
  // 绿色能量光环
  const pulse = Math.sin(time * 0.008) * 0.5 + 0.5;
  const radius = Math.max(width, height) * 0.6 * (1 + pulse * 0.2);
  
  ctx.strokeStyle = `rgba(0, 255, 136, ${pulse * 0.6})`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();
  
  // 内层光晕
  ctx.strokeStyle = `rgba(0, 255, 136, ${pulse * 0.3})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.7, 0, Math.PI * 2);
  ctx.stroke();
}
    
    // 血雾效果
    drawBloodMist(ctx, width, height, time) {
        const alpha = (Math.sin(time * 0.008) + 1) * 0.03;  // 大幅降低透明度，让血圈更淡
        ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(width, height) * 0.8, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 暗影波纹效果
    drawShadowRipples(ctx, width, height, time) {
        for (let i = 0; i < 3; i++) {
            const offset = i * 800;
            const radius = ((time + offset) * 0.05) % 60 + 30;
            const alpha = 1 - (radius - 30) / 30;
            
            ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.3})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    // 能量脉冲效果
    drawEnergyPulse(ctx, width, height, time) {
        const pulse = Math.sin(time * 0.01) * 0.5 + 0.5;
        const radius = Math.max(width, height) * 0.6 * (1 + pulse * 0.3);
        
        ctx.strokeStyle = `rgba(255, 170, 0, ${pulse * 0.4})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // 基础光晕效果
    drawBasicAura(ctx, width, height, time) {
        const alpha = (Math.sin(time * 0.005) + 1) * 0.1 + 0.05;
        ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(width, height) * 0.7, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // 检查特定图片是否已加载
    isShipImageLoaded(shipType) {
        return this.images.has(shipType);
    }
    
    // 获取所有图片的加载状态
    getLoadingStatus() {
        const totalImages = Object.keys(this.shipConfig).length;
        const loadedImages = this.images.size;
        
        return {
            loaded: loadedImages,
            total: totalImages,
            percentage: Math.round((loadedImages / totalImages) * 100),
            isReady: this.isReady,
            loadedShips: Array.from(this.images.keys())
        };
    }
    
    // 动态添加新的战舰图片
    addShipType(key, config) {
        this.shipConfig[key] = {
            path: config.path,
            description: config.description || `${key}战舰`,
            glowColor: config.glowColor || '#ffffff',
            glowIntensity: config.glowIntensity || 20
        };
        
        // 立即开始加载新图片
        return this.loadSingleImage(key, config.path);
    }
    
    // 获取当前战舰配置信息
    getCurrentShipInfo() {
        const shipType = this.getCurrentShipType();
        return {
            type: shipType,
            config: this.shipConfig[shipType],
            isLoaded: this.isShipImageLoaded(shipType)
        };
    }
    
    // 输出已加载的图片信息
    logLoadedImages() {
        console.log('📊 已加载的战舰图片:');
        this.images.forEach((img, key) => {
            const config = this.shipConfig[key];
            console.log(`  • ${config.description}: ${img.naturalWidth}x${img.naturalHeight}px`);
        });
    }
    
    // 清理资源（可选）
    dispose() {
        this.images.clear();
        this.loadingPromises.clear();
        this.isReady = false;
        console.log('🧹 战舰渲染器资源已清理');
    }
}

class EnemyRenderer {
    constructor() {
        this.images = new Map();
        this.loadingPromises = new Map();
        this.isReady = false;
        this.enemyConfig = {
            'A': { path: 'assets/enemies/enemy_A.png', description: 'A型敌人', glowColor: '#00ff00', glowIntensity: 15 },
            'B': { path: 'assets/enemies/enemy_B.png', description: 'B型敌人', glowColor: '#ffff00', glowIntensity: 15 },
            'C': { path: 'assets/enemies/enemy_C.png', description: 'C型敌人', glowColor: '#ff6600', glowIntensity: 20 },
            'D': { path: 'assets/enemies/enemy_D.png', description: 'D型敌人', glowColor: '#ff00aa', glowIntensity: 25 },
            'E': { path: 'assets/enemies/enemy_E.png', description: 'E型敌人', glowColor: '#ff8800', glowIntensity: 20 },
            'F': { path: 'assets/enemies/enemy_F.png', description: 'F型敌人', glowColor: '#8800ff', glowIntensity: 18 },
            'BOSS': { path: 'assets/enemies/boss.png', description: 'Boss', glowColor: '#ff00ff', glowIntensity: 30 },
            'G': { path: 'assets/enemies/enemy_G.png', description: 'G型敌人', glowColor: '#00aa88', glowIntensity: 22 },
            'H': { path: 'assets/enemies/enemy_H.png', description: 'H型敌人', glowColor: '#cc2200', glowIntensity: 24 },
            'BOSS2': { path: 'assets/enemies/boss2.png', description: 'Boss2', glowColor: '#4444ff', glowIntensity: 30 },
        };
        this.preloadAllImages();
    }
    async preloadAllImages() {
        console.log('👾 开始加载敌人图片...');
        const loadPromises = Object.entries(this.enemyConfig).map(([key, config]) => this.loadSingleImage(key, config.path));
        try {
            await Promise.all(loadPromises);
            this.isReady = true;
            console.log('✅ 所有敌人图片加载完成!');
            this.logLoadedImages();
        } catch (error) {
        }
    }
    loadSingleImage(key, imagePath) {
        if (this.loadingPromises.has(key)) return this.loadingPromises.get(key);
        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images.set(key, img);
                console.log(`👾 ${this.enemyConfig[key].description} 加载成功 (${img.naturalWidth}x${img.naturalHeight})`);
                resolve(img);
            };
            img.onerror = () => {
                console.error(`❌ ${this.enemyConfig[key].description} 加载失败: ${imagePath}`);
                reject(new Error(`Enemy image load failed: ${imagePath}`));
            };
            img.src = imagePath;
        });
        this.loadingPromises.set(key, promise);
        return promise;
    }
    drawEnemy(ctx, enemyType, x, y, options = {}) {
        const enemyImage = this.images.get(enemyType);
        if (!enemyImage) return false;
        const config = this.enemyConfig[enemyType];
        const { width = 64, height = 64, rotation = Math.PI, alpha = 1, scale = 1, enableGlow = true, enableEffects = true, healthPercent = 1 } = options;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x, y);
        if (rotation !== 0) ctx.rotate(rotation);
        if (scale !== 1) ctx.scale(scale, scale);
        if (enableGlow && config.glowColor) { ctx.shadowColor = config.glowColor; ctx.shadowBlur = config.glowIntensity; }
        ctx.drawImage(enemyImage, -width/2, -height/2, width, height);
        if (enableEffects) this.applyEnemyEffects(ctx, enemyType, { width, height, healthPercent });
        ctx.restore();
        return true;
    }
    applyEnemyEffects(ctx, enemyType, { width, height, healthPercent }) {
        const time = Date.now();
        ctx.shadowBlur = 0;
        switch (enemyType) {
            case 'D': this.drawDTypeEffects(ctx, width, height, time); break;
            case 'C': this.drawCTypeEffects(ctx, width, height, time); break;
            case 'B': this.drawBTypeEffects(ctx, width, height, time); break;
            case 'A': this.drawATypeEffects(ctx, width, height, time); break;
            case 'E':
            case 'F':
                const glowAlpha = (Math.sin(time * 0.01) + 1) * 0.2;
                ctx.strokeStyle = enemyType === 'E' ? `rgba(255, 136, 0, ${glowAlpha})` : `rgba(136, 0, 255, ${glowAlpha})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(width, height) * 0.5, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'BOSS': this.drawBossEffects(ctx, width, height, time, healthPercent); break;
        }
    }
    drawDTypeEffects(ctx, width, height, time) {
        const pulseAlpha = (Math.sin(time * 0.02) + 1) * 0.3;
        ctx.strokeStyle = `rgba(255, 0, 170, ${pulseAlpha})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(width, height) * 0.6, 0, Math.PI * 2);
        ctx.stroke();
    }
    drawCTypeEffects(ctx, width, height, time) {
        const waveAlpha = (Math.sin(time * 0.005) + 1) * 0.2;
        ctx.strokeStyle = `rgba(255, 102, 0, ${waveAlpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 360; i += 30) {
            const angle = (i * Math.PI / 180) + time * 0.003;
            const radius = Math.max(width, height) * 0.4;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius * 0.3;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    drawBTypeEffects(ctx, width, height, time) {
        const trailAlpha = (Math.sin(time * 0.015) + 1) * 0.25;
        ctx.fillStyle = `rgba(255, 255, 0, ${trailAlpha})`;
        for (let i = -1; i <= 1; i += 2) {
            ctx.beginPath();
            ctx.arc(i * width * 0.4, 0, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    drawATypeEffects(ctx, width, height, time) {
        const pulseAlpha = (Math.sin(time * 0.01) + 1) * 0.15;
        ctx.fillStyle = `rgba(0, 255, 0, ${pulseAlpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00ff00';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    drawBossEffects(ctx, width, height, time, healthPercent) {
        const intensity = 0.4 + (1 - healthPercent) * 0.6;
        const pulseAlpha = (Math.sin(time * 0.03) + 1) * intensity;
        ctx.strokeStyle = `rgba(255, 0, 255, ${pulseAlpha})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(width, height) * 0.7, 0, Math.PI * 2);
        ctx.stroke();
    }
    // 在 EnemyRenderer 类中，将这些方法修改为：
isShipImageLoaded(enemyType) { 
    return this.images.has(enemyType); 
}

getLoadingStatus() {
    const totalImages = Object.keys(this.enemyConfig).length;  // 改为 enemyConfig
    const loadedImages = this.images.size;
    return { 
        loaded: loadedImages, 
        total: totalImages, 
        percentage: Math.round((loadedImages / totalImages) * 100), 
        isReady: this.isReady, 
        loadedEnemies: Array.from(this.images.keys())  // 改为 loadedEnemies
    };
}

addEnemyType(key, config) {  // 改为 addEnemyType
    this.enemyConfig[key] = {  // 改为 enemyConfig
        path: config.path, 
        description: config.description || `${key}敌人`, 
        glowColor: config.glowColor || '#ffffff', 
        glowIntensity: config.glowIntensity || 20 
    };
    return this.loadSingleImage(key, config.path);
}

getCurrentEnemyInfo() {  // 改为 getCurrentEnemyInfo
    // 这个方法在敌人渲染器中可能不需要，可以删除
    // 或者改为其他合适的逻辑
}
    logLoadedImages() {
        console.log('📊 已加载的战舰图片:');
        this.images.forEach((img, key) => {
            const config = this.shipConfig[key];
            console.log(`  • ${config.description}: ${img.naturalWidth}x${img.naturalHeight}px`);
        });
    }
    dispose() {
        this.images.clear();
        this.loadingPromises.clear();
        this.isReady = false;
        console.log('🧹 战舰渲染器资源已清理');
    }
}

class ItemIconRenderer {
    constructor() {
        this.images = new Map();
        this.loadingPromises = new Map();
        this.isReady = false;
        this.itemConfig = {
            '血瓶': { path: 'assets/items/health_potion.png', description: '治疗药水', category: 'consumable' },
            '能量瓶': { path: 'assets/items/energy_potion.png', description: '能量药水', category: 'consumable' },
            '宇宙晶核': { path: 'assets/items/cosmic_core.png', description: '神秘的宇宙能量结晶', category: 'consumable' },
            '强力药水': { path: 'assets/items/power_potion.png', description: '5秒内攻击力+20%', category: 'consumable' },
            '护体药水': { path: 'assets/items/shield_potion.png', description: '5秒内免伤+50%并提供霸体', category: 'consumable' },
            '随机史诗装备宝箱': { path: 'assets/items/epic_box.png', description: '史诗装备宝箱', category: 'container' },
            '随机珍稀装备宝箱': { path: 'assets/items/artifact_box.png', description: '珍稀装备宝箱', category: 'container' },
            '阿修罗之眼': { path: 'assets/items/asura_eye.png', description: '血色阿修罗的合成材料', category: 'material' },
            '冥王碎片': { path: 'assets/items/hades_fragment.png', description: '冥王的合成材料', category: 'material' },
            '泰坦结晶': { path: 'assets/items/titan_crystal.png', description: '泰坦之心的合成材料', category: 'material' },
            '扩充背包': { path: 'assets/items/backpack_expansion.png', description: '增加背包容量', category: 'special' },
            '孟婆汤': { path: 'assets/items/mengpo_soup.png', description: '重置晶核等级的神奇汤药', category: 'special' },
            '玄铁': { path: 'assets/items/玄铁.png', description: '稀有装备合成材料', category: 'material' },
            '炎晶': { path: 'assets/items/炎晶.png', description: '稀有装备合成材料', category: 'material' },
            '雷砂': { path: 'assets/items/雷砂.png', description: '稀有装备合成材料', category: 'material' },
            '神珍铁': { path: 'assets/items/神珍铁.png', description: '神珍装备的珍稀合成材料', category: 'material' },
            '不融雪': { path: 'assets/items/不融雪.png', description: '渺沧海，尽茫茫。铁骨不融，一念寒光裂九荒。夜无疆。', category: 'material' },
            '胜利飞燕一号': { path: 'assets/equipment/victory_swallow.png', description: '传说品质时装，改变角色外观', category: 'costume' },
            '刷新券': { path: 'assets/items/refresh_ticket.png', description: '刷新副本每日挑战次数的珍贵券证', category: 'special' },
            '新手宝箱': { path: 'assets/items/新手宝箱.png', description: '新手超级礼包！打开后获得神秘奖励！', category: 'container' }
        };
        this.preloadAllImages();
    }
    async preloadAllImages() {
        console.log('📦 开始加载物品图标...');
        const loadPromises = Object.entries(this.itemConfig).map(([key, config]) => this.loadSingleImage(key, config.path));
        try {
            await Promise.all(loadPromises);
            this.isReady = true;
            console.log('✅ 所有物品图标加载完成!');
            this.logLoadedImages();
        } catch (error) {
        }
    }
    loadSingleImage(key, imagePath) {
        if (this.loadingPromises.has(key)) return this.loadingPromises.get(key);
        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.images.set(key, img);
                console.log(`📦 ${this.itemConfig[key].description} 加载成功 (${img.naturalWidth}x${img.naturalHeight})`);
                resolve(img);
            };
            img.onerror = () => {
                reject(new Error(`Item icon load failed: ${imagePath}`));
            };
            img.src = imagePath;
        });
        this.loadingPromises.set(key, promise);
        return promise;
    }
    drawIcon(container, itemName) {
        const image = this.images.get(itemName);
        if (!image) { console.warn(`物品图标未找到或未加载: ${itemName}`); return false; }
        container.innerHTML = '';
        const imgElement = document.createElement('img');
        imgElement.src = image.src;
        imgElement.alt = itemName;
        imgElement.style.cssText = `width: 100%; height: 100%; object-fit: cover; border-radius: 4px; transition: transform 0.3s ease;`;
        imgElement.addEventListener('mouseenter', () => { imgElement.style.transform = 'scale(1.1)'; });
        imgElement.addEventListener('mouseleave', () => { imgElement.style.transform = 'scale(1)'; });
        container.appendChild(imgElement);
        return true;
    }
    getItemsByCategory(category) {
        const items = [];
        Object.entries(this.itemConfig).forEach(([name, config]) => {
            if (config.category === category) {
                items.push({ name: name, config: config, isLoaded: this.isItemIconLoaded(name) });
            }
        });
        return items;
    }
    isItemIconLoaded(itemName) { return this.images.has(itemName); }
    getLoadingStatus() {
        const totalImages = Object.keys(this.itemConfig).length;
        const loadedImages = this.images.size;
        return { loaded: loadedImages, total: totalImages, percentage: Math.round((loadedImages / totalImages) * 100), isReady: this.isReady, loadedItems: Array.from(this.images.keys()) };
    }
    logLoadedImages() {
        console.log('📊 已加载的物品图标:');
        const categories = ['consumable', 'container', 'material', 'special'];
        categories.forEach(category => {
            const categoryItems = this.getItemsByCategory(category);
            const loadedItems = categoryItems.filter(item => item.isLoaded);
            if (loadedItems.length > 0) {
                console.log(`  ${category.toUpperCase()}:`);
                loadedItems.forEach(item => {
                    const img = this.images.get(item.name);
                    console.log(`    • ${item.config.description}: ${img.naturalWidth}x${img.naturalHeight}px`);
                });
            }
        });
        console.log(`📈 总计加载: ${this.images.size}/${Object.keys(this.itemConfig).length} 张图片`);
    }
    async retryFailedImages() {
        const failedItems = [];
        Object.keys(this.itemConfig).forEach(itemName => {
            if (!this.isItemIconLoaded(itemName)) failedItems.push(itemName);
        });
        if (failedItems.length === 0) { console.log('📋 所有物品图标均已加载成功'); return true; }
        console.log(`🔄 尝试重新加载 ${failedItems.length} 个失败的图标...`);
        const retryPromises = failedItems.map(itemName => {
            const config = this.itemConfig[itemName];
            return this.loadSingleImage(itemName, config.path);
        });
        try {
            await Promise.all(retryPromises);
            console.log('✅ 重新加载完成!');
            return true;
        } catch (error) {
            console.warn('⚠️ 重新加载仍有部分失败:', error);
            return false;
        }
    }
    dispose() {
        this.images.clear();
        this.loadingPromises.clear();
        this.isReady = false;
        console.log('🧹 物品图标渲染器资源已清理');
    }
}

class EquipmentIconRenderer {
    constructor() {
        this.images = new Map();
        this.loadingPromises = new Map();
        this.isReady = false;
        
        // 装备图标配置
        this.iconConfig = {
            // 常见装备（品质0-4共用普通图片，品质5使用进化图片）
            '破甲弹': { 
                normal: 'assets/equipment/armor_piercing.png', 
                artifact: 'assets/equipment/silver_bullet.png' 
            },
            '原核炮': { 
                normal: 'assets/equipment/nuclear_cannon.png', 
                artifact: 'assets/equipment/infinite_laser.png' 
            },
            '钛金甲': { 
                normal: 'assets/equipment/titanium_armor.png', 
                artifact: 'assets/equipment/overlord_armor.png' 
            },
            
            // 稀有装备
            '反伤甲': { 
                normal: 'assets/equipment/reflect_armor.png', 
                artifact: 'assets/equipment/diamond.png' 
            },
            '毁灭之刃': { 
                normal: 'assets/equipment/destruction_blade.png', 
                artifact: 'assets/equipment/world_destroyer.png' 
            },
            '源流钢炮': { 
                normal: 'assets/equipment/source_cannon.png', 
                artifact: 'assets/equipment/infinite_flow.png' 
            },
            '逐日弓': { 
                normal: 'assets/equipment/sun_bow.png', 
                artifact: 'assets/equipment/dawn.png' 
            },
            
            // 神珍装备（品质固定为5）
            '血色·阿修罗': { 
                artifact: 'assets/equipment/blood_asura.png' 
            },
            '冥王': { 
                artifact: 'assets/equipment/hades.png' 
            },
            '泰坦之心': { 
                artifact: 'assets/equipment/titan_heart.png' 
            },
            '胜利飞燕一号': { 
  artifact: 'assets/ships/victory_swallow.png' 
}
        };
        
        // 开始预加载所有图片
        this.preloadAllImages();
    }
    
    // 预加载所有装备图片
    async preloadAllImages() {
        console.log('⚔️ 开始加载装备图标...');
        
        const loadPromises = [];
        
        // 遍历所有装备配置，加载图片
        Object.entries(this.iconConfig).forEach(([equipmentName, config]) => {
            if (config.normal) {
                loadPromises.push(this.loadSingleImage(`${equipmentName}_normal`, config.normal));
            }
            if (config.artifact) {
                loadPromises.push(this.loadSingleImage(`${equipmentName}_artifact`, config.artifact));
            }
        });
        
        try {
            await Promise.all(loadPromises);
            this.isReady = true;
            console.log('✅ 所有装备图标加载完成!');
            this.logLoadedImages();
        } catch (error) {
            console.warn('⚠️ 部分装备图标加载失败:', error);
            console.log('📋 将显示空白图标');
        }
    }
    
    // 加载单个图片
    loadSingleImage(key, imagePath) {
        // 避免重复加载
        if (this.loadingPromises.has(key)) {
            return this.loadingPromises.get(key);
        }
        
        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.images.set(key, img);
                console.log(`📦 ${key} 加载成功 (${img.naturalWidth}x${img.naturalHeight})`);
                resolve(img);
            };
            
            img.onerror = () => {
                const errorMsg = `❌ ${key} 加载失败: ${imagePath}`;
                console.error(errorMsg);
                reject(new Error(errorMsg));
            };
            
            // 开始加载图片
            img.src = imagePath;
        });
        
        this.loadingPromises.set(key, promise);
        return promise;
    }
    
    // 根据装备名称和品质获取对应的图片键名
    getImageKey(equipmentName, quality) {
        const config = this.iconConfig[equipmentName];
        if (!config) return null;
        
        // 神珍装备或品质5的装备使用artifact图片
        if (quality === 5 && config.artifact) {
            return `${equipmentName}_artifact`;
        }
        
        // 品质0-4的装备使用normal图片
        if (config.normal) {
            return `${equipmentName}_normal`;
        }
        
        return null;
    }
    
    // 主要的装备图标绘制方法
    drawIcon(container, equipmentName, quality = 0) {
        const imageKey = this.getImageKey(equipmentName, quality);
        if (!imageKey) {
            console.warn(`未找到装备图标配置: ${equipmentName}`);
            return false;
        }
        
        const image = this.images.get(imageKey);
        if (!image) {
            console.warn(`装备图标未加载: ${imageKey}`);
            return false;
        }
        
        // 清空容器
        container.innerHTML = '';
        
        // 创建图片元素
        const imgElement = document.createElement('img');
        imgElement.src = image.src;
        
        // 神器品质装备的特殊样式
        let filterStyle = '';
        let animationStyle = '';
        
        if (quality === 5) {
            // 神器装备：提高亮度、对比度和饱和度
            filterStyle = 'brightness(1.3) contrast(1.2) saturate(1.4) drop-shadow(0 0 3px rgba(255, 0, 0, 0.5));';
            // 添加微妙的脉动效果
            animationStyle = 'animation: artifactGlow 2s ease-in-out infinite alternate;';
        }
        
        imgElement.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 4px;
            ${filterStyle ? `filter: ${filterStyle}` : ''}
            ${animationStyle}
        `;
        
        // 添加到容器
        container.appendChild(imgElement);
        
        // 如果是神器装备且还没添加动画样式，则添加
        if (quality === 5 && !document.querySelector('#artifactGlowStyle')) {
            this.addArtifactGlowAnimation();
        }
        
        return true; // 成功绘制
    }
    
    // 添加神器装备的发光动画样式
    addArtifactGlowAnimation() {
        const style = document.createElement('style');
        style.id = 'artifactGlowStyle';
        style.textContent = `
            @keyframes artifactGlow {
                0% { 
                    filter: brightness(1.3) contrast(1.2) saturate(1.4) drop-shadow(0 0 3px rgba(255, 0, 0, 0.5));
                }
                100% { 
                    filter: brightness(1.5) contrast(1.3) saturate(1.6) drop-shadow(0 0 6px rgba(255, 100, 0, 0.8));
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 检查特定装备图标是否已加载
    isIconLoaded(equipmentName, quality = 0) {
        const imageKey = this.getImageKey(equipmentName, quality);
        return imageKey && this.images.has(imageKey);
    }
    
    // 获取所有图片的加载状态
    getLoadingStatus() {
        const totalImages = this.getTotalImageCount();
        const loadedImages = this.images.size;
        
        return {
            loaded: loadedImages,
            total: totalImages,
            percentage: Math.round((loadedImages / totalImages) * 100),
            isReady: this.isReady,
            loadedIcons: Array.from(this.images.keys())
        };
    }
    
    // 计算总图片数量
    getTotalImageCount() {
        let count = 0;
        Object.values(this.iconConfig).forEach(config => {
            if (config.normal) count++;
            if (config.artifact) count++;
        });
        return count;
    }
    
    // 动态添加新的装备图标配置
    addEquipmentIcon(equipmentName, config) {
        this.iconConfig[equipmentName] = {
            normal: config.normal || null,
            artifact: config.artifact || null
        };
        
        // 立即开始加载新图片
        const loadPromises = [];
        if (config.normal) {
            loadPromises.push(this.loadSingleImage(`${equipmentName}_normal`, config.normal));
        }
        if (config.artifact) {
            loadPromises.push(this.loadSingleImage(`${equipmentName}_artifact`, config.artifact));
        }
        
        return Promise.all(loadPromises);
    }
    
    // 获取装备的显示名称（处理神器进化）
    getDisplayName(equipmentName, quality = 0) {
        if (quality === 5) {
            // 神器品质装备的显示名称映射
            const artifactDisplayNames = {
                '破甲弹': '银色子弹',
                '原核炮': '无垠激光炮',
                '钛金甲': '霸王舰甲',
                '反伤甲': '金刚',
                '毁灭之刃': '灭世',
                '源流钢炮': '无流',
                '逐日弓': '破晓'
            };
            return artifactDisplayNames[equipmentName] || equipmentName;
        }
        return equipmentName;
    }
    
    // 检查装备是否有对应品质的图标
    hasIconForQuality(equipmentName, quality) {
        const config = this.iconConfig[equipmentName];
        if (!config) return false;
        
        if (quality === 5) {
            return !!config.artifact;
        } else {
            return !!config.normal;
        }
    }
    
    // 输出已加载的图片信息
    logLoadedImages() {
        console.log('📊 已加载的装备图标:');
        
        // 按装备分组显示
        Object.keys(this.iconConfig).forEach(equipmentName => {
            const normalKey = `${equipmentName}_normal`;
            const artifactKey = `${equipmentName}_artifact`;
            
            const loadedTypes = [];
            if (this.images.has(normalKey)) loadedTypes.push('普通');
            if (this.images.has(artifactKey)) loadedTypes.push('神器');
            
            if (loadedTypes.length > 0) {
                console.log(`  • ${equipmentName}: ${loadedTypes.join(', ')}`);
            }
        });
        
        console.log(`📈 总计加载: ${this.images.size}/${this.getTotalImageCount()} 张图片`);
    }
    
    // 清理资源（可选）
    dispose() {
        this.images.clear();
        this.loadingPromises.clear();
        this.isReady = false;
        console.log('🧹 装备图标渲染器资源已清理');
    }
}

class TreasureIconRenderer {
    constructor() {
        this.images = new Map();
        this.loadingPromises = new Map();
        this.isReady = false;
        
        // 法宝图标配置
        this.treasureConfig = {
            '寒霜': {
                path: 'assets/treasure/frost.png',
                description: '冰封万物的神秘法宝',
                glowColor: '#66ccff',
                glowIntensity: 20
            }
        };
        
        this.preloadAllImages();
    }
    
    async preloadAllImages() {
        console.log('🔮 开始加载法宝图标...');
        const loadPromises = Object.entries(this.treasureConfig).map(([key, config]) => {
            return this.loadSingleImage(key, config.path);
        });
        
        try {
            await Promise.all(loadPromises);
            this.isReady = true;
            console.log('✅ 所有法宝图标加载完成!');
            this.logLoadedImages();
        } catch (error) {
            console.warn('⚠️ 部分法宝图标加载失败:', error);
        }
    }
    
    loadSingleImage(key, imagePath) {
        if (this.loadingPromises.has(key)) {
            return this.loadingPromises.get(key);
        }
        
        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.images.set(key, img);
                console.log(`🔮 ${this.treasureConfig[key].description} 加载成功 (${img.naturalWidth}x${img.naturalHeight})`);
                resolve(img);
            };
            
            img.onerror = () => {
                const errorMsg = `❌ ${this.treasureConfig[key].description} 加载失败: ${imagePath}`;
                console.error(errorMsg);
                reject(new Error(errorMsg));
            };
            
            img.src = imagePath;
        });
        
        this.loadingPromises.set(key, promise);
        return promise;
    }
    
    drawIcon(container, treasureName) {
        const image = this.images.get(treasureName);
        if (!image) {
            console.warn(`法宝图标未找到或未加载: ${treasureName}`);
            return false;
        }
        
        container.innerHTML = '';
        
        const imgElement = document.createElement('img');
        imgElement.src = image.src;
        imgElement.alt = treasureName;
        imgElement.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 6px;
            filter: brightness(1.2) saturate(1.3) drop-shadow(0 0 4px rgba(102, 204, 255, 0.6));
            transition: all 0.3s ease;
        `;
        
        // 法宝特殊悬停效果
        imgElement.addEventListener('mouseenter', () => {
            imgElement.style.transform = 'scale(1.1)';
            imgElement.style.filter = 'brightness(1.4) saturate(1.5) drop-shadow(0 0 8px rgba(102, 204, 255, 0.9))';
        });
        
        imgElement.addEventListener('mouseleave', () => {
            imgElement.style.transform = 'scale(1)';
            imgElement.style.filter = 'brightness(1.2) saturate(1.3) drop-shadow(0 0 4px rgba(102, 204, 255, 0.6))';
        });
        
        container.appendChild(imgElement);
        return true;
    }
    
    isTreasureIconLoaded(treasureName) {
        return this.images.has(treasureName);
    }
    
    getLoadingStatus() {
        const totalImages = Object.keys(this.treasureConfig).length;
        const loadedImages = this.images.size;
        
        return {
            loaded: loadedImages,
            total: totalImages,
            percentage: Math.round((loadedImages / totalImages) * 100),
            isReady: this.isReady,
            loadedTreasures: Array.from(this.images.keys())
        };
    }
    
    addTreasureIcon(treasureName, config) {
        this.treasureConfig[treasureName] = {
            path: config.path,
            description: config.description || `${treasureName}法宝`,
            glowColor: config.glowColor || '#66ccff',
            glowIntensity: config.glowIntensity || 20
        };
        
        return this.loadSingleImage(treasureName, config.path);
    }
    
    logLoadedImages() {
        console.log('📊 已加载的法宝图标:');
        this.images.forEach((img, key) => {
            const config = this.treasureConfig[key];
            console.log(`  • ${config.description}: ${img.naturalWidth}x${img.naturalHeight}px`);
        });
        console.log(`📈 总计加载: ${this.images.size}/${Object.keys(this.treasureConfig).length} 张图片`);
    }
    
    dispose() {
        this.images.clear();
        this.loadingPromises.clear();
        this.isReady = false;
        console.log('🧹 法宝图标渲染器资源已清理');
    }
}

window.shipRenderer = new ShipRenderer();
window.enemyRenderer = new EnemyRenderer();
window.itemIconRenderer = new ItemIconRenderer();
window.equipmentIconRenderer = new EquipmentIconRenderer();
window.treasureIconRenderer = new TreasureIconRenderer();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ShipRenderer, EnemyRenderer, ItemIconRenderer, EquipmentIconRenderer };
}

console.log('🎮 统一渲染系统已初始化');