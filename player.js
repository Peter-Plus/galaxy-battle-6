
class Player {
    constructor() {
        // 角色配置
        this.characterType = 'noah'; // 默认诺亚
        this.CHARACTER_CONFIGS = {
            noah: {
                baseHealth: 400,
                baseEnergy: 100,
                baseEnergyRegen: 1.5,
                healthGrowth: 25,
                attackGrowth: 2.5,
                baseDefense: 10,       
                defenseGrowth: 0.8,  
                shipImages: ['default_ship.png', 'blood_asura_ship.png', 'hades_ship.png', 'titan_ship.png', 'victory_swallow.png']
            },
            wuyin: {
                baseHealth: 320,
                baseEnergy: 150,
                baseEnergyRegen: 2,
                healthGrowth: 20,
                attackGrowth: 3,
                baseDefense: 4,        
                defenseGrowth: 1,
                shipImages: ['default_ship2.png', 'blood_asura_ship2.png', 'hades_ship2.png', 'titan_ship2.png', 'victory_swallow2.png']
            }
        };
        
        this.x = canvas.width / 2;
        this.y = canvas.height - 100;
        this.width = 88;
        this.height = 104;
        this.speed = 8;
        this.frozen = false;
        this.frozenTime = 0;
        this.frozenEffect = null;
        
        // 基础属性 - 使用配置初始化
        const config = this.CHARACTER_CONFIGS[this.characterType];
        this.health = config.baseHealth;
        this.maxHealth = config.baseHealth;
        this.energy = config.baseEnergy;
        this.maxEnergy = config.baseEnergy;
        this.energyRegen = config.baseEnergyRegen;
        this.defense=config.baseDefense;
        
        this.canMove = true;
        this.shield = false;
        this.shieldTime = 0;
        this.stunned = false;
        this.stunTime = 0;
        this.invincible = false;
        this.invincibleTime = 0;
        this.energyRegenTimer = 0;
        this.autoAttackTimer = 0;
        this.autoAttackInterval = 20;
        this.autoAttackEnabled = true;
        this.powerBoostActive = false;
        this.powerBoostMultiplier = 1.0;
        this.powerBoostEndTime = 0;
        this.shieldBoostActive = false;
        this.shieldBoostReduction = 0;
        this.shieldBoostEndTime = 0;
        this.hasHyperArmor = false;
        this.lastInvincibleNotification = 0;
    }

    initializeForCharacter(characterType) {
    this.characterType = characterType;
    const config = this.CHARACTER_CONFIGS[characterType];
    
    this.health = config.baseHealth;
    this.maxHealth = config.baseHealth;
    this.energy = config.baseEnergy;
    this.maxEnergy = config.baseEnergy;
    this.energyRegen = config.baseEnergyRegen;
    this.defense=config.baseDefense;
    
    // 重置其他状态
    this.shield = false;
    this.shieldTime = 0;
    this.stunned = false;
    this.stunTime = 0;
    this.invincible = false;
    this.invincibleTime = 0;
    this.powerBoostActive = false;
    this.shieldBoostActive = false;
    this.hasHyperArmor = false;
}

    getCharacterConfig() {
    return this.CHARACTER_CONFIGS[this.characterType];
}

    update() {
    if (this.invincible) {
        this.invincibleTime--;
        if (this.invincibleTime <= 0) {
            this.invincible = false;
        }
    }
    
    this.updateBuffs();
    
    if (this.stunned) {
        if (passiveEffects.isImmuneToControl()) {
            this.stunned = false;
            this.stunTime = 0;
            
            for (let i = 0; i < 10; i++) {
                particles.push(new Particle(this.x, this.y, '#000000'));
            }
        } else if (this.hasHyperArmor) {
            this.stunned = false;
            this.stunTime = 0;
            
            for (let i = 0; i < 8; i++) {
                particles.push(new Particle(this.x, this.y, '#ffaa00'));
            }
        } else {
            this.stunTime--;
            if (this.stunTime <= 0) {
                this.stunned = false;
            }
            return;
        }
    }
    
    if (this.frozen) {
        this.frozenTime--;
        if (this.frozenTime <= 0) {
            this.frozen = false;
            this.frozenEffect = null;
        } else {
            return;
        }
    }

    if (this.canMove) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        this.x += dx * 0.1;
        this.y += dy * 0.1;

        this.x = Math.max(20, Math.min(canvas.width - 20, this.x));
        this.y = Math.max(20, Math.min(canvas.height - 20, this.y));
    }

    if (this.shield && this.shieldTime > 0) {
        this.shieldTime--;
        if (this.shieldTime <= 0) {
            this.shield = false;
        }
    }

    this.energyRegenTimer++;
    if (this.energyRegenTimer >= 20) {
        this.energyRegenTimer = 0;
        this.restoreEnergy(1);
    }
    
    if (this.autoAttackEnabled && !this.stunned) {
        this.autoAttackTimer++;
        if (this.autoAttackTimer >= this.autoAttackInterval) {
            this.autoAttackTimer = 0;
            this.performAutoAttack();
        }
    }
}
    
    // 新增：更新药水buff状态（静默处理，无通知）
    updateBuffs() {
        const currentTime = Date.now();
        
        // 检查强力药水是否过期
        if (this.powerBoostActive && currentTime >= this.powerBoostEndTime) {
            this.powerBoostActive = false;
            this.powerBoostMultiplier = 1.0;
            // 重新计算攻击力
            if (typeof window.updatePlayerStats === 'function') {
                window.updatePlayerStats(equipmentStats);
            }
        }
        
        // 检查护体药水是否过期
        if (this.shieldBoostActive && currentTime >= this.shieldBoostEndTime) {
            this.shieldBoostActive = false;
            this.shieldBoostReduction = 0;
            this.hasHyperArmor = false;
        }
    }
    
    // 新增：应用强力药水buff（静默版）
    applyPowerBoost(multiplier, duration) {
        this.powerBoostActive = true;
        this.powerBoostMultiplier = 1 + multiplier;
        this.powerBoostEndTime = Date.now() + duration;
        
        // 重新计算攻击力
        if (typeof window.updatePlayerStats === 'function') {
            window.updatePlayerStats(equipmentStats);
        }
        
        // 保留视觉特效但移除通知
        for (let i = 0; i < 15; i++) {
            particles.push(new Particle(this.x, this.y, '#ff6600'));
        }
    }
    
    // 新增：应用护体药水buff（静默版）
    applyShieldBoost(damageReduction, duration) {
        this.shieldBoostActive = true;
        this.shieldBoostReduction = damageReduction;
        this.shieldBoostEndTime = Date.now() + duration;
        this.hasHyperArmor = true; // 霸体状态
        
        // 保留视觉特效但移除通知
        for (let i = 0; i < 20; i++) {
            particles.push(new Particle(this.x, this.y, '#00aaff'));
        }
    }
    
    // 新增：获取当前攻击力（包含强力药水加成）
    getCurrentAttackPower() {
        let baseAttack = attackPower;
        if (this.powerBoostActive) {
            baseAttack = Math.floor(baseAttack * this.powerBoostMultiplier);
        }
        return baseAttack;
    }
    
    performAutoAttack() {
    const currentAttack = this.getCurrentAttackPower();
    
    if (this.characterType === 'wuyin' && window.tripleShotMode && window.tripleShotFired < window.tripleShotCount) {
        const skill3Damage = Math.floor(currentAttack * 0.4);
        for (let i = -1; i <= 1; i++) {
            const offsetX = i * 15;
            bullets.push(new Bullet(
                this.x + offsetX, 
                this.y, 
                -Math.PI/2, 
                15, 
                skill3Damage, 
                '#ffff00', 
                false, 
                null, 
                10
            ));
        }
        
        window.tripleShotFired++;
        
        if (window.tripleShotFired >= window.tripleShotCount) {
            window.tripleShotMode = false;
            this.invincible = false;
            this.setAttackSpeed(3);
        }
        return;
    }
    
    if (passiveEffects.hasAsura) {
        if (passiveEffects.handleAsuraAttack(this.x, this.y, currentAttack, getTotalLifeSteal())) {
            return;
        }
    }
    
    bullets.push(new Bullet(this.x, this.y, -Math.PI/2, 15, currentAttack, '#ffff00', false, null, 10));
}
    
    setAutoAttack(enabled) {
        this.autoAttackEnabled = enabled;
        if (!enabled) {
            this.autoAttackTimer = 0; // 重置计时器
        }
    }
    
    // 新增：设置攻击速度（每秒攻击次数）
    setAttackSpeed(attacksPerSecond) {
        this.autoAttackInterval = Math.max(1, Math.floor(60 / attacksPerSecond)); // 60帧 = 1秒
    }

    draw() {
        // 眩晕星星效果（在战舰之前绘制）
        if (this.stunned) {
            this.drawStunEffect();
        }
        
        // 无敌状态特效（在战舰之前绘制）
        if (this.invincible) {
            this.drawInvincibilityEffect();
        }
        
        // 新增：药水buff视觉效果（保留但简化）
        this.drawBuffEffects();
        
        // 尝试使用战舰图片渲染系统
        const shipOptions = {
            width: this.width,
            height: this.height,
            alpha: this.stunned ? 0.7 : 1,
            scale: this.invincible ? 1 + Math.sin(Date.now() * 0.02) * 0.1 : 1,
            enableGlow: true,
            enableEffects: true
        };
        
        let shipDrawn = false;
        
        // 检查战舰渲染器是否存在并可用
        if (typeof window.shipRenderer !== 'undefined' && window.shipRenderer.isReady) {
            shipDrawn = window.shipRenderer.drawShip(ctx, this.x, this.y, shipOptions);
        }
        
        // 如果图片渲染失败，使用降级绘制
        if (!shipDrawn) {
            this.drawFallbackShip();
        }
        
        // 引擎尾焰效果（无论使用哪种渲染方式都绘制）
        this.drawEngineFlame();
        
        // 护盾效果
        if (this.shield) {
            this.drawShieldEffect();
        }
        
        // 神珍装备特殊光环效果（补充战舰渲染器的效果）
        this.drawEquipmentAuras();
        
        // 显示无敌时间倒计时
        if (this.invincible) {
            this.drawInvincibilityTimer();
        }
        
        // 新增：显示buff状态指示器（简化版，只显示剩余时间）
        this.drawBuffIndicators();

        if (this.frozen && this.frozenEffect) {
        this.drawFrozenEffect();
    }
    }
    
    // 新增：绘制药水buff效果（保留视觉效果）
    drawBuffEffects() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // 强力药水效果
        if (this.powerBoostActive) {
            const powerAlpha = 0.4 + Math.sin(Date.now() * 0.02) * 0.3;
            ctx.strokeStyle = `rgba(255, 102, 0, ${powerAlpha})`;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ff6600';
            ctx.beginPath();
            ctx.arc(0, 0, 45 + Math.sin(Date.now() * 0.015) * 5, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // 护体药水效果
        if (this.shieldBoostActive) {
            const shieldAlpha = 0.5 + Math.sin(Date.now() * 0.025) * 0.3;
            ctx.strokeStyle = `rgba(0, 170, 255, ${shieldAlpha})`;
            ctx.lineWidth = 4;
            ctx.shadowBlur = 25;
            ctx.shadowColor = '#00aaff';
            ctx.beginPath();
            ctx.arc(0, 0, 50 + Math.sin(Date.now() * 0.01) * 8, 0, Math.PI * 2);
            ctx.stroke();
            
            // 霸体护甲外环
            if (this.hasHyperArmor) {
                ctx.strokeStyle = `rgba(255, 170, 0, ${shieldAlpha * 0.8})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(0, 0, 60 + Math.sin(Date.now() * 0.02) * 6, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        ctx.restore();
    }
    
    // 新增：绘制buff状态指示器（简化版）
    drawBuffIndicators() {
        const indicators = [];
        
        if (this.powerBoostActive) {
            const timeLeft = Math.ceil((this.powerBoostEndTime - Date.now()) / 1000);
            indicators.push({
                text: `💪 ${timeLeft}s`,
                color: '#ff6600'
            });
        }
        
        if (this.shieldBoostActive) {
            const timeLeft = Math.ceil((this.shieldBoostEndTime - Date.now()) / 1000);
            indicators.push({
                text: `🛡️ ${timeLeft}s`,
                color: '#00aaff'
            });
        }
        
        // 绘制指示器
        indicators.forEach((indicator, index) => {
            ctx.save();
            ctx.fillStyle = indicator.color;
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 3;
            ctx.shadowColor = '#000000';
            
            const x = this.x;
            const y = this.y - 70 - (index * 16);
            
            // 背景
            const textWidth = ctx.measureText(indicator.text).width;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(x - textWidth/2 - 4, y - 12, textWidth + 8, 16);
            
            // 文字
            ctx.fillStyle = indicator.color;
            ctx.fillText(indicator.text, x, y);
            
            ctx.restore();
        });
    }

    drawFrozenEffect() {
    if (!this.frozenEffect) return;
    
    const elapsed = Date.now() - this.frozenEffect.startTime;
    
    // 绘制冰环
    ctx.save();
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.8 + Math.sin(elapsed * 0.01) * 0.2})`;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ffff';
    
    const ringRadius = 40 + Math.sin(elapsed * 0.008) * 8;
    ctx.beginPath();
    ctx.arc(this.x, this.y, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    
    // 绘制围绕玩家的冰晶
    this.frozenEffect.crystals.forEach((crystal, index) => {
        ctx.save();
        
        const floatY = Math.sin(elapsed * 0.005 + crystal.floatOffset) * 4;
        const currentRotation = crystal.rotation + crystal.rotSpeed * elapsed * 0.1;
        
        ctx.translate(crystal.x, crystal.y + floatY);
        ctx.rotate(currentRotation * Math.PI / 180);
        
        const alpha = 0.9 + Math.sin(elapsed * 0.008 + index) * 0.1;
        ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#00ffff';
        
        const size = crystal.size;
        ctx.beginPath();
        ctx.moveTo(0, -size/2);
        ctx.lineTo(size/3, 0);
        ctx.lineTo(0, size/2);
        ctx.lineTo(-size/3, 0);
        ctx.closePath();
        ctx.fill();
        
        // 高亮边缘
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    });
}
    
    // 降级绘制方法（原来的三角形战舰）
    drawFallbackShip() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // 根据装备状态设置颜色和发光效果
        if (typeof passiveEffects !== 'undefined') {
            if (passiveEffects.hasAsura) {
                ctx.fillStyle = '#ff4444'; // 血色·阿修罗红色
                ctx.shadowBlur = 18;
                ctx.shadowColor = '#ff0000';
            } else if (passiveEffects.hasHades) {
                ctx.fillStyle = '#333333'; // 冥王黑色
                ctx.shadowBlur = 25;
                ctx.shadowColor = '#000000';
            } else if (passiveEffects.hasTitan) {
                ctx.fillStyle = '#ffaa00'; // 泰坦之心金色
                ctx.shadowBlur = 25;
                ctx.shadowColor = '#ff6600';
            } else {
                ctx.fillStyle = '#00ffff'; // 默认青色
                ctx.shadowBlur = 20;
                ctx.shadowColor = '#00ffff';
            }
        } else {
            ctx.fillStyle = '#00ffff';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00ffff';
        }
        
        // 眩晕状态的红色调
        if (this.stunned) {
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#ff0000';
            ctx.fillStyle = '#ff4444';
        }
        
        // 绘制三角形战舰
        ctx.beginPath();
        ctx.moveTo(0, -25);
        ctx.lineTo(-15, 25);
        ctx.lineTo(0, 15);
        ctx.lineTo(15, 25);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
    
    // 引擎尾焰效果
    drawEngineFlame() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // 根据装备状态调整尾焰颜色
        let flameColor = '#ff6600';
        if (typeof passiveEffects !== 'undefined') {
            if (passiveEffects.hasAsura) flameColor = '#ff0000';
            else if (passiveEffects.hasHades) flameColor = '#440044';
            else if (passiveEffects.hasTitan) flameColor = '#ffaa00';
        }
        
        // 强力药水增强尾焰
        if (this.powerBoostActive) {
            flameColor = '#ff3300'; // 更红的火焰
        }
        
        ctx.fillStyle = flameColor;
        ctx.shadowColor = flameColor;
        ctx.shadowBlur = 15;
        
        // 动态尾焰效果
        const flameLength = 10 + Math.random() * 15;
        ctx.beginPath();
        ctx.moveTo(-8, 25);
        ctx.lineTo(0, 35 + flameLength);
        ctx.lineTo(8, 25);
        ctx.closePath();
        ctx.fill();
        
        // 额外的火花效果
        if (Math.random() < 0.3) {
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(
                (Math.random() - 0.5) * 16, 
                28 + Math.random() * 15, 
                1 + Math.random() * 2, 
                0, Math.PI * 2
            );
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    // 眩晕效果
    drawStunEffect() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // 旋转的眩晕星星
        for (let i = 0; i < 3; i++) {
            const angle = (Date.now() * 0.01 + i * Math.PI * 2 / 3);
            const radius = 40;
            const starX = Math.cos(angle) * radius;
            const starY = Math.sin(angle) * radius;
            
            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ffff00';
            ctx.fillText('★', starX, starY);
        }
        
        ctx.restore();
    }
    
    // 无敌状态视觉效果
    drawInvincibilityEffect() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        const alpha = 0.3 + Math.sin(Date.now() * 0.02) * 0.4;
        
        // 无敌光环
        ctx.strokeStyle = `rgba(255, 170, 0, ${alpha})`;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 40;
        ctx.shadowColor = '#ffaa00';
        ctx.beginPath();
        ctx.arc(0, 0, 60 + Math.sin(Date.now() * 0.01) * 10, 0, Math.PI * 2);
        ctx.stroke();
        
        // 内圈脉冲
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(0, 0, 35 + Math.sin(Date.now() * 0.015) * 5, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    // 护盾效果
    drawShieldEffect() {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        const shieldAlpha = 0.3 + Math.sin(Date.now() * 0.01) * 0.2;
        ctx.strokeStyle = `rgba(0, 255, 255, ${shieldAlpha})`;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#00ffff';
        
        // 主护盾圈
        ctx.beginPath();
        ctx.arc(0, 0, 40, 0, Math.PI * 2);
        ctx.stroke();
        
        // 护盾能量波纹
        const ripple = (Date.now() * 0.005) % (Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 255, ${shieldAlpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 40 + Math.sin(ripple) * 8, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    // 装备光环效果（补充战舰渲染器未覆盖的特效）
    drawEquipmentAuras() {
        if (typeof passiveEffects === 'undefined') return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        if (passiveEffects.hasAsura) {
            // 血色·阿修罗的血雾效果（提高透明度，让效果更淡）
            const bloodAlpha = (Math.sin(Date.now() * 0.008) + 1) * 0.02;
            ctx.strokeStyle = `rgba(255, 0, 0, ${0.08 + Math.sin(Date.now() * 0.015) * 0.05})`;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#ff0000';
            ctx.beginPath();
            ctx.arc(0, 0, 50, 0, Math.PI * 2);
            ctx.stroke();
            
            // 血滴效果（降低透明度）
            if (Math.random() < 0.06) {
                const dropX = (Math.random() - 0.5) * 60;
                const dropY = (Math.random() - 0.5) * 60;
                ctx.fillStyle = `rgba(255, 0, 0, ${bloodAlpha + 0.15})`;
                ctx.beginPath();
                ctx.arc(dropX, dropY, 1 + Math.random() * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        if (passiveEffects.hasHades) {
            // 冥王的暗影触手效果
            const shadowAlpha = 0.4 + Math.sin(Date.now() * 0.01) * 0.2;
            ctx.strokeStyle = `rgba(0, 0, 0, ${shadowAlpha})`;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 25;
            ctx.shadowColor = '#000000';
            ctx.beginPath();
            ctx.arc(0, 0, 45, 0, Math.PI * 2);
            ctx.stroke();
            
            // 暗影粒子
            for (let i = 0; i < 3; i++) {
                const angle = Date.now() * 0.003 + i * Math.PI * 2 / 3;
                const radius = 30 + Math.sin(Date.now() * 0.01 + i) * 10;
                const particleX = Math.cos(angle) * radius;
                const particleY = Math.sin(angle) * radius;
                
                ctx.fillStyle = `rgba(0, 0, 0, ${shadowAlpha * 0.8})`;
                ctx.beginPath();
                ctx.arc(particleX, particleY, 2 + Math.sin(Date.now() * 0.02 + i) * 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        if (passiveEffects.hasTitan) {
            // 泰坦之心的能量脉冲环
            const pulse = Math.sin(Date.now() * 0.02) * 0.3 + 0.7;
            ctx.strokeStyle = `rgba(255, 170, 0, ${pulse * 0.4})`;
            ctx.lineWidth = 4;
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#ffaa00';
            ctx.beginPath();
            ctx.arc(0, 0, 55 * pulse, 0, Math.PI * 2);
            ctx.stroke();
            
            // 能量核心脉动
            ctx.fillStyle = `rgba(255, 170, 0, ${pulse * 0.3})`;
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(0, 0, 8 * pulse, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
    
    // 无敌时间显示
    drawInvincibilityTimer() {
        const timeLeft = Math.ceil(this.invincibleTime / 60);
        ctx.save();
        
        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#000000';
        
        // 添加背景
        const text = `无敌: ${timeLeft}s`;
        const textWidth = ctx.measureText(text).width;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(this.x - textWidth/2 - 8, this.y - 50, textWidth + 16, 20);
        
        ctx.fillStyle = '#ffaa00';
        ctx.fillText(text, this.x, this.y - 35);
        
        ctx.restore();
    }

    takeDamage(amount) {
    // 无敌状态下不受伤害
    if (this.invincible) {
        this.showInvincibleNotification();
        return;
    }
    
    if (!this.shield) {
        let actualDamage = amount;
        
        // 新增：护体药水免伤计算
        if (this.shieldBoostActive) {
            actualDamage *= (1 - this.shieldBoostReduction);
            // 保留视觉特效但移除通知
            for (let i = 0; i < 8; i++) {
                particles.push(new Particle(this.x, this.y, '#00aaff'));
            }
        }
        
        // 防御值减少伤害
        actualDamage = Math.max(1, actualDamage - this.defense);
        
        this.health -= actualDamage;
        this.health = Math.max(0, this.health);
        updateHealthBar();
        
        if (this.health <= 0) {
    // 泰坦之心被动：死亡复活
    if (passiveEffects.handleTitanRevive()) {
        return; // 复活成功，不执行游戏结束
    }
    
    // 【关键修改】检查是否在能源之眼副本中
    if (gameStateManager.isInEnergyEye()) {
        // 在能源之眼副本中，主动调用副本的结束方法
        if (typeof energyEyeDungeon !== 'undefined' && energyEyeDungeon.isActive) {
            energyEyeDungeon.end(); // 主动调用副本结束，这会触发奖励计算
        }
        return;
    }
    
    // 其他情况才调用通用的 gameOver
    gameOver();
}
    }
}

    // 给予无敌时间
    grantInvincibility(frames) {
        this.invincible = true;
        this.invincibleTime = frames;
        
        // 无敌特效
        for (let i = 0; i < 30; i++) {
            particles.push(new Particle(this.x, this.y, '#ffaa00'));
        }
    }
    
    // 显示无敌提示（保留，但减少频率）
    showInvincibleNotification() {
        if (!this.lastInvincibleNotification || Date.now() - this.lastInvincibleNotification > 500) {
            this.lastInvincibleNotification = Date.now();
            
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 60%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: #ffaa00;
                font-size: 18px;
                font-weight: bold;
                text-shadow: 0 0 10px #ffaa00;
                z-index: 999;
                animation: invinciblePopup 0.8s ease-out forwards;
                background: rgba(0, 0, 0, 0.7);
                padding: 8px 16px;
                border-radius: 8px;
                border: 2px solid #ffaa00;
            `;
            notification.textContent = '无敌状态！';
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 800);
        }
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        updateHealthBar();
    }

    // 消耗能量
    consumeEnergy(amount) {
        if (this.energy >= amount) {
            this.energy -= amount;
            this.energy = Math.max(0, this.energy);
            updateEnergyBar();
            return true;
        }
        return false;
    }

    // 恢复能量（考虑装备加成）
    restoreEnergy(amount) {
        // 基础恢复 + 装备加成
        const totalRegen = amount + (this.energyRegen - 3) / 3; // 每1/3秒的额外恢复
        this.energy = Math.min(this.maxEnergy, this.energy + totalRegen);
        updateEnergyBar();
    }

    // 检查能量是否足够
    hasEnoughEnergy(amount) {
        return this.energy >= amount;
    }

    // 眩晕函数（简化版）
    stun(duration) {
    if (this.invincible) {
        this.showInvincibleNotification();
        return;
    }
    
    if (this.hasHyperArmor) {
        for (let i = 0; i < 8; i++) {
            particles.push(new Particle(this.x, this.y, '#ffaa00'));
        }
        return;
    }
    
    if (passiveEffects.isImmuneToControl()) {
        return;
    }
    
    this.stunned = true;
    this.stunTime = duration;
}

    // 检查是否可以使用技能（眩晕时不能使用）
    canUseSkills() {
        return !this.stunned;
    }

    // 增加最大生命值
    increaseMaxHealth(amount) {
        const oldMaxHealth = this.maxHealth;
        this.maxHealth += amount;
        // 按比例增加当前生命值
        const healthPercent = this.health / oldMaxHealth;
        this.health = this.maxHealth * healthPercent;
        updateHealthBar();
    }

    // 增加最大能量值
    increaseMaxEnergy(amount) {
        const oldMaxEnergy = this.maxEnergy;
        this.maxEnergy += amount;
        // 按比例增加当前能量值
        const energyPercent = this.energy / oldMaxEnergy;
        this.energy = this.maxEnergy * energyPercent;
        updateEnergyBar();
    }

    // 增加防御值
    addDefense(amount) {
        this.defense += amount;
        updateDefenseDisplay();
    }

    // 增加能量恢复速度
    increaseEnergyRegen(amount) {
        this.energyRegen += amount;
    }

    // 重置玩家状态（用于新游戏）
    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height - 100;
        this.health = this.maxHealth;
        this.energy = this.maxEnergy;
        this.shield = false;
        this.shieldTime = 0;
        this.stunned = false;
        this.stunTime = 0;
        this.invincible = false;
        this.invincibleTime = 0;
        this.energyRegenTimer = 0;
        // 重置自动攻击
        this.autoAttackTimer = 0;
        this.autoAttackEnabled = true;
        
        // 新增：重置药水buff状态
        this.powerBoostActive = false;
        this.powerBoostMultiplier = 1.0;
        this.powerBoostEndTime = 0;
        this.shieldBoostActive = false;
        this.shieldBoostReduction = 0;
        this.shieldBoostEndTime = 0;
        this.hasHyperArmor = false;
        
        // 重置防抖计时器
        this.lastInvincibleNotification = 0;
    }
}

class PassiveEffectManager {
    constructor() {
        this.hasAsura = false;
        this.hasHades = false;
        this.hasTitan = false;
        this.titanReviveUsed = false;
        this.invincibilityEndTime = 0;
    }
    
    updatePassiveEffects(equipmentStats) {
        this.hasAsura = equipmentStats.hasAsura || false;
        this.hasHades = equipmentStats.hasHades || false;
        this.hasTitan = equipmentStats.hasTitan || false;
    }
    
    resetBattleState() {
        this.titanReviveUsed = false;
    }
    
    handleAsuraAttack(playerX, playerY, baseAttackPower, totalLifeSteal) {
        if (!this.hasAsura) return false;
        
        const angles = [-0.2, 0, 0.2];
        const damage = baseAttackPower;
        
        angles.forEach(angleOffset => {
            const angle = -Math.PI / 2 + angleOffset;
            const bullet = new Bullet(playerX, playerY, angle, 15, damage, '#ff0000', false, null, 8);
            bullet.isAsuraBullet = true;
            bullets.push(bullet);
        });
        
        return true;
    }
    
    handleAsuraLifeSteal(damage, totalLifeSteal) {
    if (!this.hasAsura) return;
    
    const finalLifeSteal = getTotalLifeSteal();
    const healAmount = damage * finalLifeSteal;
    player.heal(healAmount);
    
    for (let i = 0; i < 3; i++) {
        particles.push(new Particle(player.x, player.y, '#ff4444'));
    }
}
    
    isImmuneToControl() {
        return this.hasHades;
    }
    
    handleHadesExecute(enemy) {
        if (!this.hasHades) return false;
        
        const healthPercent = enemy.health / enemy.maxHealth;
        if (healthPercent <= 0.2) {
            const overkillDamage = enemy.health + 9999;
            enemy.takeDamage(overkillDamage);
            
            for (let i = 0; i < 20; i++) {
                particles.push(new Particle(enemy.x, enemy.y, '#000000'));
            }
            
            return true;
        }
        
        return false;
    }
    
    handleTitanRevive() {
        if (!this.hasTitan || this.titanReviveUsed) return false;
        
        this.titanReviveUsed = true;
        
        player.health = player.maxHealth;
        updateHealthBar();
        
        player.grantInvincibility(120);
        
        for (let i = 0; i < 50; i++) {
            particles.push(new Particle(player.x, player.y, '#ffaa00'));
        }
        
        this.showReviveNotification();
        
        return true;
    }
    
    showReviveNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 170, 0, 0.9);
            border: 3px solid #ffaa00;
            border-radius: 15px;
            padding: 20px;
            color: #ffffff;
            font-size: 24px;
            font-weight: bold;
            text-shadow: 0 0 10px #000000;
            z-index: 1000;
            animation: reviveEffect 3s ease-out forwards;
            text-align: center;
        `;
        
        notification.innerHTML = `
            <div>🔥 泰坦之心激活！ 🔥</div>
            <div style="font-size: 18px; margin-top: 10px;">你已复活并获得2秒无敌时间！</div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    hasAnyPassive() {
        return this.hasAsura || this.hasHades || this.hasTitan;
    }
    
    getActivePassives() {
        const actives = [];
        if (this.hasAsura) actives.push('血色·阿修罗: 三发散射 + 平A吸血');
        if (this.hasHades) actives.push('冥王: 免疫控制 + 处决敌人');
        if (this.hasTitan) {
            const status = this.titanReviveUsed ? '已使用' : '可用';
            actives.push(`泰坦之心: 死亡复活 (${status})`);
        }
        return actives;
    }
}

window.passiveEffects = new PassiveEffectManager();

if (typeof gameStateManager !== 'undefined') {
    const originalStartWave = gameStateManager.startWave || function() {};
    gameStateManager.startWave = function() {
        passiveEffects.resetBattleState();
        return originalStartWave.apply(this, arguments);
    };
}

if (typeof energyEyeDungeon !== 'undefined') {
    const originalStart = energyEyeDungeon.start || function() {};
    energyEyeDungeon.start = function() {
        passiveEffects.resetBattleState();
        return originalStart.apply(this, arguments);
    };
}

if (typeof window !== 'undefined') {
    const originalWaveStart = window.startWave || function() {};
    window.startWave = function() {
        passiveEffects.resetBattleState();
        return originalWaveStart.apply(this, arguments);
    };
}

const passiveStyle = document.createElement('style');
passiveStyle.textContent = `
    @keyframes reviveEffect {
        0% { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(0.5); 
        }
        20% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1.2); 
        }
        80% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1); 
        }
        100% { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(1); 
        }
    }
    
    .passive-indicator {
        position: absolute;
        top: 150px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        border: 2px solid #ffaa00;
        border-radius: 10px;
        padding: 10px;
        color: #ffaa00;
        font-size: 12px;
        max-width: 200px;
        z-index: 10;
    }
    
    .passive-item {
        margin: 5px 0;
        text-shadow: 0 0 5px #ffaa00;
    }
    
    @keyframes invincibilityGlow {
        0%, 100% { 
            opacity: 0.3; 
            box-shadow: 0 0 20px #ffaa00;
        }
        50% { 
            opacity: 0.8; 
            box-shadow: 0 0 40px #ffaa00, 0 0 60px #ff6600;
        }
    }
    
    .invincible-effect {
        animation: invincibilityGlow 0.3s infinite;
    }
`;
document.head.appendChild(passiveStyle);
const playerStyles = document.createElement('style');
playerStyles.textContent = `
    @keyframes invinciblePopup {
        0% { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(0.8); 
        }
        20% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1.1); 
        }
        80% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1); 
        }
        100% { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(1); 
        }
    }
    
    @keyframes immunityEffect {
        0% { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(0.7); 
        }
        25% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1.15); 
        }
        75% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1); 
        }
        100% { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(1); 
        }
    }
`;
function freezePlayer(duration) {
    if (player.frozen) return;
    
    if (player.invincible) {
        player.showInvincibleNotification();
        return;
    }
    
    if (player.hasHyperArmor) {
        for (let i = 0; i < 8; i++) {
            particles.push(new Particle(player.x, player.y, '#ffaa00'));
        }
        return;
    }
    
    if (passiveEffects.isImmuneToControl()) {
        return;
    }
    
    player.frozen = true;
    player.frozenTime = Math.floor(duration / 16.67);
    
    player.frozenEffect = {
        startTime: Date.now(),
        duration: duration,
        crystals: []
    };
    
    for (let i = 0; i < 8; i++) {
        const angle = (i * 45) * Math.PI / 180;
        const distance = 50 + Math.random() * 15;
        player.frozenEffect.crystals.push({
            x: player.x + Math.cos(angle) * distance,
            y: player.y + Math.sin(angle) * distance,
            size: 10 + Math.random() * 8,
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 2,
            floatOffset: Math.random() * Math.PI * 2
        });
    }
}
document.head.appendChild(playerStyles);