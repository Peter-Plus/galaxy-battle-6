class Enemy {
    constructor(type) {
        this.type = type;
        this.x = Math.random() * canvas.width;
        this.y = -50;
        this.isDead = false;
        this.shootTimer = 0;
        this.aimingTimer = 0;
        this.isAiming = false;
        this.aimLine = null;
        this.id = Date.now() + Math.random();
        
        const healthMultiplier = 1 + (currentWave - 1) * 0.2;
        const damageMultiplier = 1 + (currentWave - 1) * 0.1;
        
        switch(type) {
            case 'A':
                this.width = 80;
                this.height = 80;
                this.speed = 0.8;
                this.health = 50 * healthMultiplier;
                this.maxHealth = this.health;
                this.color = '#00ff00';
                this.shootInterval = 120;
                this.damage = 10 * damageMultiplier;
                this.expValue = 5;
                break;
            case 'B':
                this.width = 72;
                this.height = 72;
                this.speed = 1.5;
                this.health = 35 * healthMultiplier;
                this.maxHealth = this.health;
                this.color = '#ffff00';
                this.shootInterval = 75;
                this.horizontalSpeed = 2;
                this.moveDirection = Math.random() > 0.5 ? 1 : -1;
                this.damage = 12 * damageMultiplier;
                this.expValue = 10;
                break;
            case 'C':
                this.width = 184;
                this.height = 184;
                this.speed = 3;
                this.health = 50 * healthMultiplier;
                this.maxHealth = this.health;
                this.color = '#ff6600';
                this.shootInterval = 60;
                this.damage = 10 * damageMultiplier;
                this.expValue = 15;
                break;
            case 'D':
                this.width = 128;
                this.height = 128;
                this.speed = 0.6;
                this.health = 80 * healthMultiplier;
                this.maxHealth = this.health;
                this.color = '#ff00aa';
                this.shootInterval = 180;
                this.damage = 20 * damageMultiplier;
                this.expValue = 25;
                this.chargeTime = 60;
                this.attackState = 'idle';
                this.oscillationSpeed = 0.001;
                this.targetY = 150;            
                this.aimingTimer = 0;           // 新增
                this.lockedAngle = 0;   
                break;
            case 'BOSS':
                this.x = canvas.width / 2;
                this.width = 144;
                this.height = 144;
                this.speed = 0.8;
                this.health = 650 * healthMultiplier;
                this.maxHealth = this.health;
                this.color = '#ff00ff';
                this.shootInterval = 30;
                this.specialAttackTimer = 0;
                this.specialAttackInterval = 180;
                this.isCharging = false;
                this.chargeTarget = { x: 0, y: 0 };
                this.damage = 15 * damageMultiplier;
                this.expValue = 100;
                this.blackHoleTimer = 0;
                this.blackHoleInterval = 360;
                this.blackHoleCooldown = 0;
                this.normalY = 150;
                this.isReturning = false;
                this.chargeDistance = 0;
                this.maxChargeDistance = 0;
                this.chargeDirection = { x: 0, y: 0 };
                this.lastCollisionTime = 0;
                this.collisionCooldown = 1000;
                break;
        }
    }

    update() {
        if (this.frozen) {
    return; // 被冰冻时不移动
    }
    if (this.type === 'BOSS') {
        if (this.isReturning) {
            const returnSpeed = 6;
            const dy = this.normalY - this.y;
            
            if (Math.abs(dy) < 3) {
                this.y = this.normalY;
                this.isReturning = false;
            } else {
                this.y += dy > 0 ? returnSpeed : -returnSpeed;
            }
            
            this.x += Math.sin(Date.now() * 0.001) * 2;
            
        } else if (!this.isCharging) {
            this.x += Math.sin(Date.now() * 0.001) * 2;
            this.y = Math.min(this.y + this.speed, this.normalY);
            
        } else {
            if (this.chargeDistance >= this.maxChargeDistance) {
                this.isCharging = false;
                this.isReturning = true;
                this.chargeDistance = 0;
            } else {
                const chargeSpeed = 8;
                this.x += this.chargeDirection.x * chargeSpeed;
                this.y += this.chargeDirection.y * chargeSpeed;
                this.chargeDistance += chargeSpeed;
            }
        }

        this.specialAttackTimer++;
        if (this.specialAttackTimer >= this.specialAttackInterval) {
            this.specialAttackTimer = 0;
            if (Math.random() > 0.5) {
                for (let i = 0; i < 12; i++) {
                    const angle = (Math.PI * 2 / 12) * i;
                    enemyBullets.push(new Bullet(this.x, this.y, angle, 4, this.damage, '#ff00ff', false, null, 20, this));
                }
            } else {
                this.isCharging = true;
                this.chargeTarget = { x: player.x, y: player.y };
                
                const dx = this.chargeTarget.x - this.x;
                const dy = this.chargeTarget.y - this.y;
                const distToTarget = Math.sqrt(dx * dx + dy * dy);
                
                this.chargeDirection.x = dx / distToTarget;
                this.chargeDirection.y = dy / distToTarget;
                
                this.maxChargeDistance = distToTarget + 100;
                this.chargeDistance = 0;
            }
        }

        this.blackHoleTimer++;
        if (this.blackHoleTimer >= this.blackHoleInterval && this.blackHoleCooldown <= 0) {
            this.blackHoleTimer = 0;
            this.createBlackHoles();
        }
    } else if (this.type === 'D') {
        // 【关键修复】完整的敌人D攻击状态逻辑
        if (this.attackState === 'idle') {
            // 移动到目标位置并摆动
            this.y = Math.min(this.y + this.speed, this.targetY);
            this.x += Math.sin(Date.now() * this.oscillationSpeed) * 1.5;
            
            // 保持在屏幕范围内
            this.x = Math.max(this.width/2, Math.min(canvas.width - this.width/2, this.x));
            
            // 攻击计时器
            this.shootTimer++;
            if (this.shootTimer >= this.shootInterval) {
                this.shootTimer = 0;
                this.startAiming(); // 开始瞄准
            }
        } else if (this.attackState === 'aiming') {
            // 瞄准阶段
            this.aimingTimer++;
            
            if (this.aimingTimer === 1) {
                // 锁定玩家位置
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                this.lockedAngle = Math.atan2(dy, dx);
            }
            
            if (this.aimingTimer >= this.chargeTime) {
                // 发射冲击波
                this.fireShockWave();
                this.attackState = 'firing';
                this.aimingTimer = 0;
            }
        } else if (this.attackState === 'firing') {
            // 等待冲击波结束
            let hasActiveShockWave = false;
            if (typeof shockWaves !== 'undefined') {
                shockWaves.forEach(shockWave => {
                    const dx = shockWave.startX - this.x;
                    const dy = shockWave.startY - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 10) {
                        hasActiveShockWave = true;
                    }
                });
            }
            
            if (!hasActiveShockWave) {
                this.attackState = 'idle'; // 回到空闲状态
            }
        }
    } else {
        // 其他敌人类型（A, B, C）的移动逻辑
        this.y += this.speed;
        
        if (this.type === 'B') {
            this.x += this.horizontalSpeed * this.moveDirection;
            if (this.x <= 30 || this.x >= canvas.width - 30) {
                this.moveDirection *= -1;
            }
        } else if (this.type === 'C') {
            this.x += Math.sin(this.y * 0.02) * 2;
        }
    }

    // 普通射击逻辑（排除D型和BOSS）
    if (this.type !== 'D' && this.type !== 'BOSS') {
        this.shootTimer++;
        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;
            this.shoot();
        }
    }
}

    startAiming() {
        this.attackState = 'aiming';
        this.aimingTimer = 0;
    }

    

    createBlackHoles() {
        for (let i = 0; i < 3; i++) {
            const x = 100 + Math.random() * (canvas.width - 200);
            const y = 100 + Math.random() * (canvas.height - 200);
            blackHoles.push(new BlackHole(x, y));
        }
    }

    shoot() {
        if (this.type === 'A' || this.type === 'B') {
            enemyBullets.push(new Bullet(this.x, this.y, Math.PI / 2, 5, this.damage, '#ff0000', false, null, 4, this));
        } else if (this.type === 'C' || this.type === 'BOSS') {
            const angle = Math.atan2(player.y - this.y, player.x - this.x);
            enemyBullets.push(new Bullet(this.x, this.y, angle, 6, this.damage, '#ff0000', false, null, 4, this));
        }
    }

    draw() {
    const healthPercent = this.health / this.maxHealth;
    
    // 使用敌人渲染器绘制敌人
    if (typeof enemyRenderer !== 'undefined' && enemyRenderer.isReady) {
        enemyRenderer.drawEnemy(ctx, this.type, this.x, this.y, {
            width: this.width,
            height: this.height,
            healthPercent: healthPercent,
            enableGlow: true,
            enableEffects: true
        });
    } else {
        // 默认绘制
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
    }
    
    // 绘制血条
    this.drawHealthBar();
    
    // 【关键】绘制敌人D的瞄准线
    if (this.type === 'D') {
        this.drawAimingLine();
    }
}
    
    drawHealthBar() {
        if (this.health < this.maxHealth) {
            const barWidth = Math.max(60, this.width);
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x - barWidth/2, this.y - this.height/2 - 15, barWidth, 4);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(this.x - barWidth/2, this.y - this.height/2 - 15, barWidth * (this.health / this.maxHealth), 4);
        }
    }
    
    drawAimingLine() {
        const rayLength = Math.max(canvas.width, canvas.height) * 2;
        const endX = this.x + Math.cos(this.lockedAngle) * rayLength;
        const endY = this.y + Math.sin(this.lockedAngle) * rayLength;
        
        ctx.strokeStyle = `rgba(255, 68, 68, ${0.5 + Math.sin(Date.now() * 0.02) * 0.5})`;
        ctx.lineWidth = 40;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff4444';
        ctx.setLineDash([10, 5]);
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        ctx.setLineDash([]);
    }

    takeDamage(amount) {
        let finalDamage = amount;
        
        if (this.type === 'BOSS') {
            const healthPercent = this.health / this.maxHealth;
            if (healthPercent < 0.3) {
                finalDamage = amount * 0.5;
                
                for (let i = 0; i < 5; i++) {
                    particles.push(new Particle(this.x, this.y, '#ff0000'));
                }
            }
        }
        
        this.health -= finalDamage;
        if (this.health <= 0) {
            this.isDead = true;
            
            for (let i = 0; i < 15; i++) {
                particles.push(new Particle(this.x, this.y, this.color));
            }
            
            gainExperience(this.expValue);
            waveEnemiesKilled++;
            
            if (this.type === 'BOSS') {
                bossDefeated = true;
                waitingForCrystalChoice = true;
                createCrystalChoice(this.x, this.y);
                
                handleBossDrop(this);
            }
            
            return true;
        }
        return false;
    }

    isOffScreen() {
        if (this.type === 'D') {
            return false;
        }
        return this.type !== 'BOSS' && this.y > canvas.height + 50;
    }

    startAiming() {
    this.attackState = 'aiming';
    this.aimingTimer = 0;
    this.lockedAngle = 0;
}

fireShockWave() {
    if (typeof ShockWave === 'undefined') {
        console.error('ShockWave class is not defined!');
        return;
    }
    
    if (typeof shockWaves === 'undefined') {
        console.error('shockWaves array is not defined!');
        window.shockWaves = [];
    }
    
    try {
        shockWaves.push(new ShockWave(this.x, this.y, this.lockedAngle, this.damage, this));
        
        if (typeof particles !== 'undefined') {
            for (let i = 0; i < 10; i++) {
                particles.push(new Particle(this.x, this.y, '#ff8800'));
            }
        }
    } catch (error) {
        console.error('Error creating ShockWave:', error);
    }
}

drawHealthBar() {
    if (this.health < this.maxHealth) {
        const barWidth = Math.max(60, this.width);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - barWidth/2, this.y - this.height/2 - 15, barWidth, 4);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x - barWidth/2, this.y - this.height/2 - 15, barWidth * (this.health / this.maxHealth), 4);
    }
}

drawAimingLine() {
    if (this.type === 'D' && this.attackState === 'aiming' && this.lockedAngle !== undefined) {
        const rayLength = Math.max(canvas.width, canvas.height) * 2;
        const endX = this.x + Math.cos(this.lockedAngle) * rayLength;
        const endY = this.y + Math.sin(this.lockedAngle) * rayLength;
        
        ctx.save();
        ctx.strokeStyle = `rgba(255, 68, 68, ${0.5 + Math.sin(Date.now() * 0.02) * 0.5})`;
        ctx.lineWidth = 40;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff4444';
        ctx.setLineDash([10, 5]);
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        ctx.setLineDash([]);
        ctx.restore();
    }
}
}

class BlackHole {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 100;
        this.warningTime = 45;
        this.isActive = false;
        this.activeTime = 120;
        this.opacity = 1;
        this.rotationAngle = 0;
        this.isDead = false;
    }

    update() {
        this.rotationAngle += 0.1;
        
        if (this.warningTime > 0) {
            this.warningTime--;
            this.opacity = 0.5 + Math.sin(Date.now() * 0.02) * 0.5;
        } else if (!this.isActive) {
            this.isActive = true;
            this.opacity = 1;
        } else if (this.activeTime > 0) {
            this.activeTime--;
            this.opacity = 1;
            
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < this.radius) {
                if (player.invincible) {
                    player.showInvincibleNotification();
                    return false;
                }
                
                if (!player.stunned) {
                    player.stun(120);
                    for (let i = 0; i < 20; i++) {
                        particles.push(new Particle(player.x, player.y, '#ff0000'));
                    }
                    return true;
                }
            }
        } else if (!this.isDead) {
            this.isDead = true;
            return 'disappeared';
        }
        
        return false;
    }

    draw() {
        if (this.isDead) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotationAngle);
        
        if (!this.isActive) {
            ctx.strokeStyle = `rgba(255, 0, 0, ${this.opacity})`;
            ctx.lineWidth = 4;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ff0000';
            
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.strokeStyle = `rgba(255, 100, 100, ${this.opacity * 0.6})`;
            ctx.lineWidth = 2;
            for (let i = 0; i < 8; i++) {
                const angle = (Math.PI * 2 / 8) * i;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(angle) * this.radius * 0.8, Math.sin(angle) * this.radius * 0.8);
                ctx.stroke();
            }
        } else {
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
            gradient.addColorStop(0.5, 'rgba(50, 0, 50, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0.3)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3;
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#ff0000';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

class ShockWave {
    constructor(startX, startY, angle, damage, owner = null) {
        this.startX = startX;
        this.startY = startY;
        this.angle = angle;
        this.damage = damage;
        this.width = 40;
        this.warningDuration = 300; 
        this.activeDuration = 700;  
        this.isActive = false;
        this.opacity = 1;
        this.owner = owner;
        this.startTime = Date.now(); // 记录开始时间
        this.hitEnemies = new Set();
        
        this.length = Math.max(canvas.width, canvas.height) * 2;
        this.endX = this.startX + Math.cos(this.angle) * this.length;
        this.endY = this.startY + Math.sin(this.angle) * this.length;
    }

    update() {
        const elapsed = Date.now() - this.startTime;
        
        if (elapsed < this.warningDuration) {
            // 预警阶段
            this.isActive = false;
            this.opacity = 0.5 + Math.sin(Date.now() * 0.02) * 0.5;
        } else if (elapsed < this.warningDuration + this.activeDuration) {
            // 激活阶段
            this.isActive = true;
            this.opacity = 1;
        }
    }

    hasHitEnemy(enemyId) {
    return this.hitEnemies.has(enemyId);
}

    markEnemyHit(enemyId) {
    this.hitEnemies.add(enemyId);
}

    isDone() {
        const elapsed = Date.now() - this.startTime;
        return elapsed >= this.warningDuration + this.activeDuration;
    }

    draw() {
        ctx.save();
        
        if (!this.isActive) {
            ctx.strokeStyle = `rgba(255, 68, 68, ${this.opacity})`;
            ctx.lineWidth = this.width;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ff4444';
            ctx.setLineDash([20, 10]);
            
            ctx.beginPath();
            ctx.moveTo(this.startX, this.startY);
            ctx.lineTo(this.endX, this.endY);
            ctx.stroke();
            
            ctx.setLineDash([]);
        } else {
            const gradient = ctx.createLinearGradient(this.startX, this.startY, this.endX, this.endY);
            gradient.addColorStop(0, 'rgba(255, 100, 100, 0.9)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(1, 'rgba(255, 100, 100, 0.5)');
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = this.width;
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#ff4444';
            
            ctx.beginPath();
            ctx.moveTo(this.startX, this.startY);
            ctx.lineTo(this.endX, this.endY);
            ctx.stroke();
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = this.width * 0.3;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ffffff';
            
            ctx.beginPath();
            ctx.moveTo(this.startX, this.startY);
            ctx.lineTo(this.endX, this.endY);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    checkCollision(x, y) {
        if (!this.isActive) return false;
        
        const A = this.endY - this.startY;
        const B = this.startX - this.endX;
        const C = this.endX * this.startY - this.startX * this.endY;
        
        const distance = Math.abs(A * x + B * y + C) / Math.sqrt(A * A + B * B);
        
        const dx = x - this.startX;
        const dy = y - this.startY;
        const rayDx = Math.cos(this.angle);
        const rayDy = Math.sin(this.angle);
        
        const projection = dx * rayDx + dy * rayDy;
        
        return projection >= 0 && distance < this.width / 2;
    }
}

class EnemyE extends Enemy {
    constructor(x, y, health, damage) {
        super('E');
        this.x = x;
        this.y = y;
        this.health = health;
        this.maxHealth = health;
        this.damage = damage;
        this.width = 80;
        this.height = 80;
        this.speed = 1.2;
        this.color = '#ff8800';
        this.shootInterval = 180;
        this.expValue = 8;
        this.moveTimer = 0;
        this.targetX = x;
        this.targetY = y;
        this.moveDirection = { x: 0, y: 0 };
        this.lastMoveTime = Date.now();
        this.chargeTime = 60;
        this.attackState = 'idle'; // 'idle', 'aiming', 'firing'
        this.aimingTimer = 0;
        this.lockedAngle = 0;
        this.id = Date.now() + Math.random();
    }

    update() {
        if (this.isDead) return;
        if (this.frozen) {
            return; // 被冰冻时不移动和攻击
        }

        // 攻击状态管理
        if (this.attackState === 'idle') {
            // 只有在空闲状态时才移动
            this.moveTimer++;
            if (this.moveTimer >= 120) {
                this.chooseNewDirection();
                this.moveTimer = 0;
            }

            // 移动逻辑
            this.x += this.moveDirection.x * this.speed;
            this.y += this.moveDirection.y * this.speed;

            // 边界检查
            const upperLimit = canvas.height * 0.5;
            if (this.x < 40) {
                this.x = 40;
                this.chooseNewDirection();
            }
            if (this.x > canvas.width - 40) {
                this.x = canvas.width - 40;
                this.chooseNewDirection();
            }
            if (this.y < 40) {
                this.y = 40;
                this.chooseNewDirection();
            }
            if (this.y > upperLimit) {
                this.y = upperLimit;
                this.chooseNewDirection();
            }

            // 攻击计时器
            this.shootTimer++;
            if (this.shootTimer >= this.shootInterval) {
                this.shootTimer = 0;
                this.startAiming(); // 开始瞄准
            }
        } else if (this.attackState === 'aiming') {
            // 瞄准阶段 - 停止移动
            this.aimingTimer++;
            
            if (this.aimingTimer === 1) {
                // 锁定玩家位置
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                this.lockedAngle = Math.atan2(dy, dx);
            }
            
            if (this.aimingTimer >= this.chargeTime) {
                // 发射冲击波
                this.fireShockWave();
                this.attackState = 'firing';
                this.aimingTimer = 0;
            }
        } else if (this.attackState === 'firing') {
            // 等待冲击波结束 - 继续停止移动
            let hasActiveShockWave = false;
            if (typeof shockWaves !== 'undefined') {
                shockWaves.forEach(shockWave => {
                    const dx = shockWave.startX - this.x;
                    const dy = shockWave.startY - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 10) {
                        hasActiveShockWave = true;
                    }
                });
            }
            
            if (!hasActiveShockWave) {
                this.attackState = 'idle'; // 回到空闲状态，可以继续移动
            }
        }
    }

    chooseNewDirection() {
        const angle = Math.random() * Math.PI * 2;
        this.moveDirection.x = Math.cos(angle);
        this.moveDirection.y = Math.sin(angle);
    }

    startAiming() {
        this.attackState = 'aiming';
        this.aimingTimer = 0;
    }

    fireShockWave() {
        if (typeof ShockWave === 'undefined') {
            console.error('ShockWave class is not defined!');
            return;
        }
        
        if (typeof shockWaves === 'undefined') {
            console.error('shockWaves array is not defined!');
            return;
        }
        
        // 创建冲击波
        shockWaves.push(new ShockWave(this.x, this.y, this.lockedAngle, this.damage, this));
        
        // 添加粒子效果
        for (let i = 0; i < 10; i++) {
            particles.push(new Particle(this.x, this.y, '#ff8800'));
        }
    }

    draw() {
        if (this.isDead) return;

        const healthPercent = this.health / this.maxHealth;
        
        // 绘制敌人本体
        if (!enemyRenderer.drawEnemy(ctx, 'E', this.x, this.y, {
            width: this.width,
            height: this.height,
            healthPercent: healthPercent
        })) {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        }

        // 绘制瞄准线（瞄准状态时）
        if (this.attackState === 'aiming' && this.aimingTimer > 0) {
            const distance = 800;
            const endX = this.x + Math.cos(this.lockedAngle) * distance;
            const endY = this.y + Math.sin(this.lockedAngle) * distance;
            
            ctx.save();
            ctx.strokeStyle = `rgba(255, 136, 0, ${Math.min(this.aimingTimer / this.chargeTime, 0.8)})`;
            ctx.lineWidth = 4;
            ctx.setLineDash([10, 5]);
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }

        // 绘制血条
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - 25, this.y - this.height/2 - 15, 50, 6);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x - 25, this.y - this.height/2 - 15, 50 * healthPercent, 6);
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.isDead = true;
            for (let i = 0; i < 15; i++) {
                particles.push(new Particle(this.x, this.y, this.color));
            }
            gainExperience(this.expValue);
            waveEnemiesKilled++;
            return true;
        }
        return false;
    }
}

class EnemyF extends Enemy {
    constructor(x, y, health, damage) {
        super('F');
        this.x = x;
        this.y = y;
        this.health = health;
        this.maxHealth = health;
        this.damage = damage;
        this.width = 70;
        this.height = 70;
        this.speed = 1.0;
        this.color = '#8800ff';
        this.shootInterval = 90;
        this.expValue = 6;
        this.moveTimer = 0;
        this.targetX = x;
        this.targetY = y;
        this.moveDirection = { x: 0, y: 0 };
        this.lastMoveTime = Date.now();
        this.shootTimer = 0;  // 确保初始化 shootTimer
        this.id = Date.now() + Math.random();
    }

    update() {
        if (this.isDead) return;
        if (this.frozen) {
        return; // 被冰冻时不移动和攻击
    }

        this.moveTimer++;
        if (this.moveTimer >= 100) {
            this.chooseNewDirection();
            this.moveTimer = 0;
        }

        this.x += this.moveDirection.x * this.speed;
        this.y += this.moveDirection.y * this.speed;

        const upperLimit = canvas.height * 0.5;
        if (this.x < 40) {
            this.x = 40;
            this.chooseNewDirection();
        }
        if (this.x > canvas.width - 40) {
            this.x = canvas.width - 40;
            this.chooseNewDirection();
        }
        if (this.y < 40) {
            this.y = 40;
            this.chooseNewDirection();
        }
        if (this.y > upperLimit) {
            this.y = upperLimit;
            this.chooseNewDirection();
        }

        this.shootTimer++;
        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;
            this.shoot();
        }
    }

    chooseNewDirection() {
        const angle = Math.random() * Math.PI * 2;
        this.moveDirection.x = Math.cos(angle);
        this.moveDirection.y = Math.sin(angle);
    }

    shoot() {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const angle = Math.atan2(dy, dx);
        
        // 修复：使用 Bullet 类而不是普通对象
        enemyBullets.push(new Bullet(
            this.x,           // x 坐标
            this.y,           // y 坐标
            angle,            // 角度
            4,                // 速度
            this.damage,      // 伤害
            '#8800ff',        // 颜色（紫色）
            false,            // 不是追踪弹
            null,             // 没有目标
            6,                // 半径
            this              // owner
        ));
    }

    draw() {
        if (this.isDead) return;

        const healthPercent = this.health / this.maxHealth;
        
        // 尝试使用敌人渲染器
        if (typeof enemyRenderer !== 'undefined' && enemyRenderer.isReady) {
            if (!enemyRenderer.drawEnemy(ctx, 'F', this.x, this.y, {
                width: this.width,
                height: this.height,
                healthPercent: healthPercent
            })) {
                // 如果渲染器失败，使用默认绘制
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
            }
        } else {
            // 默认绘制
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        }

        // 绘制血条
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - 25, this.y - this.height/2 - 15, 50, 6);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x - 25, this.y - this.height/2 - 15, 50 * healthPercent, 6);
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.isDead = true;
            for (let i = 0; i < 15; i++) {
                particles.push(new Particle(this.x, this.y, this.color));
            }
            gainExperience(this.expValue);
            // 在能源之眼副本中，可能需要特殊处理
            if (typeof energyEyeDungeon !== 'undefined' && energyEyeDungeon.isActive) {
                // 更新能源之眼的敌人列表
                const fIndex = energyEyeDungeon.enemyFList.indexOf(this);
                if (fIndex > -1) {
                    energyEyeDungeon.enemyFList.splice(fIndex, 1);
                }
            }
            
            return true;
        }
        return false;
    }
}

class StunWave {
    constructor(x, y, owner) {
        this.x = x;
        this.y = y;
        this.owner = owner;
        this.radius = 0;
        this.maxRadius = 240;
        this.isWarning = true;
        this.warningTime = 60;
        this.warningTimer = 0;
        this.isActive = false;
        this.activeTime = 60;
        this.activeTimer = 0;
    }

    update() {
        if (this.isWarning) {
            this.warningTimer++;
            if (this.warningTimer >= this.warningTime) {
                this.isWarning = false;
                this.isActive = true;
                this.activeTimer = 0;
            }
        } else if (this.isActive) {
            this.activeTimer++;
            this.radius = this.maxRadius;
            if (this.activeTimer >= this.activeTime) {
                this.isActive = false;
            }
        }
    }

    draw() {
        ctx.save();
        if (this.isWarning) {
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 10]);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.maxRadius, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.isActive) {
            ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    checkCollision(x, y) {
        if (!this.isActive) return false;
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.sqrt(dx * dx + dy * dy) < this.radius;
    }
}
class FlameWarning {
    constructor(x, owner) {
        this.x = x;
        this.y = 0;
        this.width = 60;
        this.height = canvas.height;
        this.owner = owner;
        this.warningTime = 60;
        this.warningTimer = 0;
        this.isWarning = true;
    }

    update() {
        if (this.isWarning) {
            this.warningTimer++;
            if (this.warningTimer >= this.warningTime) {
                this.isWarning = false;
                if (typeof flameColumns === 'undefined') {
                    window.flameColumns = [];
                }
                flameColumns.push(new FlameColumn(this.x, this.owner));
                return false;
            }
        }
        return true;
    }

    draw() {
        if (this.isWarning) {
            ctx.save();
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 3;
            ctx.setLineDash([10, 5]);
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff0000';
            ctx.beginPath();
            ctx.moveTo(this.x - this.width/2, 0);
            ctx.lineTo(this.x - this.width/2, canvas.height);
            ctx.moveTo(this.x + this.width/2, 0);
            ctx.lineTo(this.x + this.width/2, canvas.height);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
        }
    }
}

class FlameColumn {
    constructor(x, owner) {
        this.x = x;
        this.y = 0;
        this.width = 60;
        this.height = canvas.height;
        this.owner = owner;
        this.damage = Math.floor(player.maxHealth * 0.1);
        this.activeTime = 120;
        this.activeTimer = 0;
        this.isActive = true;
        this.hasHitPlayer = false;
    }

    update() {
        if (this.isActive) {
            this.activeTimer++;
            if (this.activeTimer >= this.activeTime) {
                this.isActive = false;
            }
        }
    }

    draw() {
        if (this.isActive) {
            ctx.save();
            ctx.fillStyle = 'rgba(255, 100, 0, 0.8)';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#ff6400';
            ctx.fillRect(this.x - this.width/2, this.y, this.width, this.height);
            ctx.restore();
        }
    }

    checkCollision(x, y) {
        if (!this.isActive || this.hasHitPlayer) return false;
        const hit = x > this.x - this.width/2 && x < this.x + this.width/2;
        if (hit) {
            this.hasHitPlayer = true;
        }
        return hit;
    }
}


class EnemyG extends Enemy {
    constructor(x, y, health, damage) {
        super('G');
        this.x = x;
        this.y = y;
        this.health = health;
        this.maxHealth = health;
        this.damage = damage;
        this.width = 150;
        this.height = 150;
        this.speed = 5;
        this.color = '#00aa88';
        this.shootInterval = this.randomShootInterval();
        this.expValue = 10;
        this.moveTimer = 0;
        this.moveDirection = { x: 0, y: 0 };
        this.shootTimer = 0;
        this.isAttacking = false;
        this.hasEnteredScreen = false; // 新增：标记是否已进入屏幕
        this.id = Date.now() + Math.random();
    }

    randomShootInterval() {
        return Math.floor(Math.random() * (480 - 360) + 360);
    }

    update() {
        if (this.isDead) return;

        if (this.frozen) {
            return; // 被冰冻时不移动和攻击
        }

        // 检查是否已进入屏幕
        if (!this.hasEnteredScreen && this.y >= 60) {
            this.hasEnteredScreen = true;
        }

        if (!this.isAttacking) {
            this.moveTimer++;
            
            // 如果还没有进入屏幕，继续向下移动
            if (!this.hasEnteredScreen) {
                this.y += this.speed;
                // 确保X坐标在屏幕范围内
                if (this.x < this.width / 2) {
                    this.x = this.width / 2;
                }
                if (this.x > canvas.width - this.width / 2) {
                    this.x = canvas.width - this.width / 2;
                }
            } else {
                // 已进入屏幕后，使用正常的移动逻辑
                if (this.moveTimer >= 80) {
                    this.chooseNewDirection();
                    this.moveTimer = 0;
                }

                this.x += this.moveDirection.x * this.speed;
                this.y += this.moveDirection.y * this.speed;

                const margin = this.width / 2;
                if (this.x < margin) {
                    this.x = margin;
                    this.chooseNewDirection();
                }
                if (this.x > canvas.width - margin) {
                    this.x = canvas.width - margin;
                    this.chooseNewDirection();
                }
                if (this.y < margin) {
                    this.y = margin;
                    this.chooseNewDirection();
                }
                if (this.y > canvas.height - margin) {
                    this.y = canvas.height - margin;
                    this.chooseNewDirection();
                }
            }
        }

        this.shootTimer++;
        if (this.shootTimer >= this.shootInterval && !this.isAttacking) {
            this.shootTimer = 0;
            this.shootInterval = this.randomShootInterval();
            this.createStunWave();
        }
    }

    chooseNewDirection() {
        const angle = Math.random() * Math.PI * 2;
        this.moveDirection.x = Math.cos(angle);
        this.moveDirection.y = Math.sin(angle);
    }

    createStunWave() {
        this.isAttacking = true;
        if (typeof stunWaves === 'undefined') {
            window.stunWaves = [];
        }
        stunWaves.push(new StunWave(this.x, this.y, this));
        setTimeout(() => {
            this.isAttacking = false;
        }, 2000);
    }

    draw() {
        if (this.isDead) return;

        const healthPercent = this.health / this.maxHealth;
        
        if (typeof enemyRenderer !== 'undefined' && enemyRenderer.isReady) {
            if (!enemyRenderer.drawEnemy(ctx, 'G', this.x, this.y, {
                width: this.width,
                height: this.height,
                healthPercent: healthPercent
            })) {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
            }
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        }

        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - 25, this.y - this.height/2 - 15, 50, 6);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x - 25, this.y - this.height/2 - 15, 50 * healthPercent, 6);
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.isDead = true;
            for (let i = 0; i < 15; i++) {
                particles.push(new Particle(this.x, this.y, this.color));
            }
            gainExperience(this.expValue);
            waveEnemiesKilled++;
            
            // 【新增】冰河时代敌人G的掉落逻辑
            if (this.isIceAgeEnemyG && gameStateManager.isInIceAge()) {
                // 20%概率掉落不融雪
                if (Math.random() < 0.2) {
                    const dropItem = {
                        name: '不融雪',
                        quality: 0,
                        stats: {},
                        category: 'material',
                        quantity: 1,
                        description: '永不融化的神秘雪花，法宝合成/升级材料'
                    };
                    createDroppedItem(this.x, this.y, dropItem);
                    console.log('敌人G掉落不融雪材料');
                }
            }
            
            if (typeof stardustOrbitDungeon !== 'undefined' && stardustOrbitDungeon.isActive) {
                const gIndex = stardustOrbitDungeon.enemyGList.indexOf(this);
                if (gIndex > -1) {
                    stardustOrbitDungeon.enemyGList.splice(gIndex, 1);
                }
            }
            
            return true;
        }
        return false;
    }
}

class EnemyH extends Enemy {
    constructor(x, y, health, damage) {
        super('H');
        this.x = x;
        this.y = y;
        this.health = health;
        this.maxHealth = health;
        this.damage = damage;
        this.width = 55;
        this.height = 55;
        this.speed = 0.8;
        this.color = '#cc2200';
        this.shootInterval = this.randomShootInterval();
        this.expValue = 8;
        this.moveTimer = 0;
        this.moveDirection = { x: 0, y: 0 };
        this.shootTimer = 0;
        this.isAttacking = false;
        this.id = Date.now() + Math.random();
    }

    randomShootInterval() {
        return Math.floor(Math.random() * (480 - 360) + 360);
    }

    update() {
        if (this.isDead) return;

        if (this.frozen) {
        return; // 被冰冻时不移动和攻击
    }
        if (!this.isAttacking) {
            this.moveTimer++;
            if (this.moveTimer >= 90) {
                this.chooseNewDirection();
                this.moveTimer = 0;
            }

            this.x += this.moveDirection.x * this.speed;
            this.y += this.moveDirection.y * this.speed;

            const margin = this.width / 2;
            if (this.x < margin) {
                this.x = margin;
                this.chooseNewDirection();
            }
            if (this.x > canvas.width - margin) {
                this.x = canvas.width - margin;
                this.chooseNewDirection();
            }
            if (this.y < margin) {
                this.y = margin;
                this.chooseNewDirection();
            }
            if (this.y > canvas.height * 0.7) {
                this.y = canvas.height * 0.7;
                this.chooseNewDirection();
            }
        }

        this.shootTimer++;
        if (this.shootTimer >= this.shootInterval && !this.isAttacking) {
            this.shootTimer = 0;
            this.shootInterval = this.randomShootInterval();
            this.createFlameColumn();
        }
    }

    chooseNewDirection() {
        const angle = Math.random() * Math.PI * 2;
        this.moveDirection.x = Math.cos(angle);
        this.moveDirection.y = Math.sin(angle);
    }

    createFlameColumn() {
        this.isAttacking = true;
        
        if (typeof flameWarnings === 'undefined') {
            window.flameWarnings = [];
        }
        
        const randomX = Math.random() * canvas.width;
        flameWarnings.push(new FlameWarning(randomX, this));
        
        setTimeout(() => {
            this.isAttacking = false;
        }, 1000);
    }

    draw() {
        if (this.isDead) return;

        const healthPercent = this.health / this.maxHealth;
        
        if (typeof enemyRenderer !== 'undefined' && enemyRenderer.isReady) {
            if (!enemyRenderer.drawEnemy(ctx, 'H', this.x, this.y, {
                width: this.width,
                height: this.height,
                healthPercent: healthPercent
            })) {
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
            }
        } else {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        }

        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x - 25, this.y - this.height/2 - 15, 50, 6);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x - 25, this.y - this.height/2 - 15, 50 * healthPercent, 6);
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.isDead = true;
            for (let i = 0; i < 15; i++) {
                particles.push(new Particle(this.x, this.y, this.color));
            }
            gainExperience(this.expValue);
            waveEnemiesKilled++;
            
            if (typeof stardustOrbitDungeon !== 'undefined' && stardustOrbitDungeon.isActive) {
                const hIndex = stardustOrbitDungeon.enemyHList.indexOf(this);
                if (hIndex > -1) {
                    stardustOrbitDungeon.enemyHList.splice(hIndex, 1);
                }
            }
            
            return true;
        }
        return false;
    }
}

if (typeof flameWarnings === 'undefined') {
    window.flameWarnings = [];
}

function updateFlameWarnings() {
    flameWarnings.forEach((warning, index) => {
        if (!warning.update()) {
            flameWarnings.splice(index, 1);
        }
    });
}

function drawFlameWarnings() {
    flameWarnings.forEach(warning => warning.draw());
}

class Boss2 extends Enemy {
    constructor(x, y, health, damage) {
        super('BOSS2');
        this.x = x || canvas.width / 2;
        this.y = y || 150;
        this.health = 20000;
        this.maxHealth = this.health;
        this.damage = 100;
        this.width = 160;
        this.height = 160;
        this.speed = 0.8;
        this.color = '#4444ff';
        this.shootInterval = 60; // 修改1：射速增加（从120改为60）
        this.expValue = 200;
        this.normalY = 150;
        this.lastCollisionTime = 0;
        this.collisionCooldown = 5000; // 修改1：碰撞冰冻冷却时间改为5秒
        this.moveDirection = { x: 1, y: 0 };
        this.shootTimer = 0;
        this.id = Date.now() + Math.random();
        
        // 新增技能相关属性
this.deathChargeTimer = 0;
this.deathChargeInterval = 480;
this.isDeathCharging = false;
this.deathChargeDuration = 0;
this.deathChargeMaxDuration = 600; // 4秒 = 240帧
this.deathChargeSpeed = 28;
this.deathChargeDirection = { x: 0, y: 0 };

this.iceConeTimer = 0;
this.iceConeInterval = 720;
this.iceCones = [];
this.isIceConeActive = false;
    }

    update() {
    if (this.isDead) return;
    if (this.frozen) {
        return;
    }

    this.updateDeathCharge();
    this.updateIceCones();
    
    if (this.isDeathCharging) {
        this.updateDeathChargeMovement();
    } else {
        this.y = this.normalY;
        this.x += this.moveDirection.x * this.speed;
        
        if (this.x <= this.width/2) {
            this.x = this.width/2;
            this.moveDirection.x = 1;
        }
        if (this.x >= canvas.width - this.width/2) {
            this.x = canvas.width - this.width/2;
            this.moveDirection.x = -1;
        }
    }

    this.shootTimer++;
    if (this.shootTimer >= this.shootInterval) {
        this.shootTimer = 0;
        this.fireTrackingMissile();
    }
}


    draw() {
        if (this.isDead) return;

        const healthPercent = this.health / this.maxHealth;
        
        // 绘制boss
        if (typeof enemyRenderer !== 'undefined' && enemyRenderer.isReady) {
            enemyRenderer.drawEnemy(ctx, 'BOSS2', this.x, this.y, {
                width: this.width,
                height: this.height,
                healthPercent: healthPercent,
                enableGlow: true,
                enableEffects: true
            });
        } else {
            // 死亡冲撞时的特殊颜色
            const color = this.isDeathCharging ? '#ff4444' : this.color;
            ctx.fillStyle = color;
            ctx.fillRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height);
        }
        
        // 绘制冰锥
        this.iceCones.forEach(cone => cone.draw());
        
        this.drawHealthBar();
    }

    fireTrackingMissile() {
    if (typeof player === 'undefined') return;
    
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const angle = Math.atan2(dy, dx);
    
    const trackingMissile = new Bullet(
        this.x, 
        this.y, 
        angle, 
        3,
        this.damage, 
        '#4444ff', 
        false, 
        null, 
        8,
        this
    );
    
    if (typeof enemyBullets !== 'undefined') {
        enemyBullets.push(trackingMissile);
    }
}
    updateDeathCharge() {
    if (!this.isDeathCharging) {
        this.deathChargeTimer++;
        if (this.deathChargeTimer >= this.deathChargeInterval) {
            this.startDeathCharge();
        }
    } else {
        this.deathChargeDuration++;
        if (this.deathChargeDuration >= this.deathChargeMaxDuration) {
            this.endDeathCharge();
        }
    }
}

startDeathCharge() {
    this.isDeathCharging = true;
    this.deathChargeDuration = 0;
    this.deathChargeTimer = 0;
    
    const angle = Math.random() * Math.PI * 2;
    this.deathChargeDirection.x = Math.cos(angle);
    this.deathChargeDirection.y = Math.sin(angle);
}

updateDeathChargeMovement() {
    const newX = this.x + this.deathChargeDirection.x * this.deathChargeSpeed;
    const newY = this.y + this.deathChargeDirection.y * this.deathChargeSpeed;
    
    if (newX <= this.width/2 || newX >= canvas.width - this.width/2) {
        this.deathChargeDirection.x *= -1;
    }
    if (newY <= this.height/2 || newY >= canvas.height - this.height/2) {
        this.deathChargeDirection.y *= -1;
    }
    
    this.x = Math.max(this.width/2, Math.min(canvas.width - this.width/2, newX));
    this.y = Math.max(this.height/2, Math.min(canvas.height - this.height/2, newY));
}

endDeathCharge() {
    this.isDeathCharging = false;
    this.deathChargeDuration = 0;
    this.y = this.normalY;
}

updateIceCones() {
    if (!this.isIceConeActive) {
        this.iceConeTimer++;
        if (this.iceConeTimer >= this.iceConeInterval) {
            this.startIceCone();
        }
    }
    
    this.iceCones.forEach((cone, index) => {
        cone.update();
        if (cone.shouldRemove) {
            this.iceCones.splice(index, 1);
        }
    });
}

startIceCone() {
    this.iceConeTimer = 0;
    this.isIceConeActive = true;
    
    const leftCone = new IceCone(this.x - 100, this.y, this, 'left');
    const rightCone = new IceCone(this.x + 100, this.y, this, 'right');
    
    this.iceCones.push(leftCone, rightCone);
    
    setTimeout(() => {
        this.iceCones.forEach(cone => cone.startAttack());
        this.isIceConeActive = false;
    }, 2000);
}

    takeDamage(amount) {
        this.health -= amount;
        
        if (this.health <= 0) {
            this.isDead = true;
            
            for (let i = 0; i < 20; i++) {
                particles.push(new Particle(this.x, this.y, this.color));
            }
            
            gainExperience(this.expValue);
            
            if (typeof iceAgeDungeon !== 'undefined' && iceAgeDungeon.isActive && !iceAgeDungeon.bossDefeated) {
                iceAgeDungeon.handleBoss2Death();
            }
            
            return true;
        }
        return false;
    }
}

class IceCone {
    constructor(x, y, boss, side) {
        this.x = x;
        this.y = y;
        this.boss = boss;
        this.side = side; // 'left' 或 'right'
        this.width = 40;
        this.height = 60;
        this.followDuration = 2000; // 跟随2秒
        this.startTime = Date.now();
        this.isAttacking = false;
        this.attackSpeed = 12; // 提升速度：从6改为12
        this.shouldRemove = false;
        this.color = '#00ccff';
        this.rotationAngle = 0;
        this.attackStartTime = 0; // 新增：攻击开始时间
        this.maxAttackDuration = 3000; // 新增：最大攻击持续时间3秒
        this.moveDirection = { x: 0, y: 0 }; // 新增：移动方向向量
    }

    update() {
        const elapsed = Date.now() - this.startTime;
        
        if (!this.isAttacking && elapsed < this.followDuration) {
            // 跟随boss移动
            const offset = this.side === 'left' ? -100 : 100;
            this.x = this.boss.x + offset;
            this.y = this.boss.y;
            // 计算朝向玩家的角度
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            this.rotationAngle = Math.atan2(dy, dx) + Math.PI / 2; // +π/2 让尖头（正上方）朝向玩家
        } else if (this.isAttacking) {
            // 检查攻击时间是否超过3秒
            const attackElapsed = Date.now() - this.attackStartTime;
            if (attackElapsed >= this.maxAttackDuration) {
                this.shouldRemove = true;
                return;
            }
            
            // 持续按照发射方向移动，不再追踪玩家位置
            this.x += this.moveDirection.x * this.attackSpeed;
            this.y += this.moveDirection.y * this.attackSpeed;
            
            // 允许冰锥脱离屏幕，不做边界限制
            // 如果完全脱离屏幕，可以提前销毁以节省性能
            const offScreenMargin = 100;
            if (this.x < -offScreenMargin || 
                this.x > canvas.width + offScreenMargin || 
                this.y < -offScreenMargin || 
                this.y > canvas.height + offScreenMargin) {
                this.shouldRemove = true;
            }
        }
    }

    startAttack() {
        this.isAttacking = true;
        this.attackStartTime = Date.now(); // 记录攻击开始时间
        
        // 计算并固定移动方向（朝向玩家当前位置）
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 标准化方向向量
        this.moveDirection.x = dx / distance;
        this.moveDirection.y = dy / distance;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotationAngle); // 应用旋转
        
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        
        // 绘制冰锥形状（以原点为中心）
        ctx.beginPath();
        ctx.moveTo(0, -this.height/2); // 尖头在上方
        ctx.lineTo(-this.width/2, this.height/2);
        ctx.lineTo(this.width/2, this.height/2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }

    // 检查与玩家碰撞
    checkPlayerCollision(playerX, playerY) {
        const dx = this.x - playerX;
        const dy = this.y - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < 25; // 碰撞范围
    }
}


function createIceAgeEnemyG(x, y) {
    // 创建普通的EnemyG，然后覆盖其属性
    const enemyG = new EnemyG(x, y, 100, 10); // 传入临时值
    
    // 覆盖为冰河时代的固定属性（相当于第30波强度）
    enemyG.health = 3000;
    enemyG.maxHealth = 3000;
    enemyG.damage = 0; // 攻击力为0
    
    return enemyG;
}