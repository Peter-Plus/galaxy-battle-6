// 小型机图片预加载管理
class MiniShipImageLoader {
    constructor() {
        this.image = null;
        this.isLoaded = false;
        this.loadImage();
    }
    
    loadImage() {
        this.image = new Image();
        this.image.src = 'assets/ships/mini_ship.png';
        this.image.onload = () => {
            this.isLoaded = true;
            console.log('小型机PNG图片加载成功');
        };
        this.image.onerror = () => {
            console.warn('小型机PNG图片加载失败');
            this.isLoaded = false;
        };
    }
}

// 全局图片加载器实例
const miniShipImageLoader = new MiniShipImageLoader();

class MiniShip {
    constructor(x, y, side) {
        this.x = x + (side === 'left' ? -80 : 80);
        this.y = y;
        this.side = side;
        this.width = 48;
        this.height = 64;
        this.speed = 6;
        
        this.maxHealth = Math.floor(player.maxHealth * 0.15);
        this.health = this.maxHealth;
        this.attack = attackPower;
        this.defense = Math.floor(player.defense * 0.5);
        
        this.aliveTime = 0;
        this.maxAliveTime = 5000;
        
        this.shootTimer = 0;
        this.shootInterval = 20;
        
        this.isDead = false;
    }

    update() {
        if (this.isDead) return;
        
        this.aliveTime += deltaTime;
        
        if (this.aliveTime >= this.maxAliveTime) {
            this.destroy();
            return;
        }
        
        const targetX = player.x + (this.side === 'left' ? -80 : 80);
        const targetY = player.y;
        
        this.x += (targetX - this.x) * 0.1;
        this.y += (targetY - this.y) * 0.1;
        
        this.shootTimer++;
        if (this.shootTimer >= this.shootInterval) {
            this.shoot();
            this.shootTimer = 0;
        }
    }

    draw() {
        if (this.isDead) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // 激光瞄准期间绘制增强版聚能特效
        if (laserAimingMode) {
            this.drawEnhancedChargingEffect();
        }
        
        // 使用预加载的PNG图片渲染小型机
        if (miniShipImageLoader.isLoaded && miniShipImageLoader.image) {
            ctx.drawImage(miniShipImageLoader.image, -this.width/2, -this.height/2, this.width, this.height);
        }
        
        // 血条
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = '#333';
        ctx.fillRect(-30, -this.height/2 - 15, 60, 8);
        ctx.fillStyle = healthPercent > 0.3 ? '#00ff00' : '#ff0000';
        ctx.fillRect(-30, -this.height/2 - 15, 60 * healthPercent, 8);
        
        ctx.restore();
    }

    drawEnhancedChargingEffect() {
        const time = Date.now();
        const scale = 0.6; // 小型机特效比例
        
        // 1. 小型机专用能量波纹
        for (let layer = 0; layer < 3; layer++) {
            const offset = layer * 250 + (this.side === 'left' ? 0 : 500); // 左右小型机错开
            const radius = ((time + offset) * 0.025) % 50 + 20;
            const alpha = (1 - (radius - 20) / 30) * 0.5;
            
            ctx.strokeStyle = `rgba(255, ${70 + layer * 40}, ${70 + layer * 40}, ${alpha})`;
            ctx.lineWidth = 2 - layer * 0.3;
            ctx.shadowBlur = 18;
            ctx.shadowColor = '#ff5555';
            ctx.beginPath();
            ctx.arc(0, 0, radius * scale, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // 2. 小型机能量螺旋
        for (let i = 0; i < 8; i++) {
            const spiralAngle = time * 0.009 + i * Math.PI / 4;
            const spiralRadius = 18 + i * 2;
            const particleX = Math.cos(spiralAngle) * spiralRadius * scale;
            const particleY = Math.sin(spiralAngle) * spiralRadius * scale;
            
            const particleAlpha = 0.8 - i * 0.08;
            ctx.fillStyle = `rgba(255, ${180 - i * 12}, ${180 - i * 12}, ${particleAlpha})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#ff7777';
            ctx.beginPath();
            ctx.arc(particleX, particleY, (2.2 - i * 0.2) * scale, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 3. 小型机电弧效果
        for (let arc = 0; arc < 4; arc++) {
            const arcAngle = time * 0.012 + arc * Math.PI / 2;
            const arcLength = 25 * scale;
            
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 + Math.sin(time * 0.02 + arc) * 0.3})`;
            ctx.lineWidth = 1.5;
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#ffffff';
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            
            for (let seg = 0; seg < 6; seg++) {
                const segAngle = arcAngle + (seg / 6) * 0.4;
                const segRadius = (seg / 6) * arcLength;
                const jitter = Math.sin(time * 0.06 + seg + arc) * 3 * scale;
                
                const segX = Math.cos(segAngle) * segRadius + jitter;
                const segY = Math.sin(segAngle) * segRadius + jitter;
                ctx.lineTo(segX, segY);
            }
            ctx.stroke();
        }
        
        // 4. 小型机核心能量
        const miniCoreSize = 4 + Math.sin(time * 0.025) * 2;
        const miniCorePulse = Math.sin(time * 0.03) * 0.4 + 0.9;
        
        // 核心光晕
        ctx.fillStyle = `rgba(255, 150, 150, ${miniCorePulse * 0.4})`;
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#ff9999';
        ctx.beginPath();
        ctx.arc(0, 0, (miniCoreSize + 6) * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // 核心主体
        ctx.fillStyle = `rgba(255, 255, 255, ${miniCorePulse})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, miniCoreSize * scale, 0, Math.PI * 2);
        ctx.fill();
        
        // 5. 小型机能量爆发
        for (let burst = 0; burst < 8; burst++) {
            const burstAngle = time * 0.005 + burst * Math.PI / 4;
            const burstLength = 30 + Math.sin(time * 0.008 + burst) * 10;
            
            const startX = Math.cos(burstAngle) * 8 * scale;
            const startY = Math.sin(burstAngle) * 8 * scale;
            const endX = Math.cos(burstAngle) * burstLength * scale;
            const endY = Math.sin(burstAngle) * burstLength * scale;
            
            const burstGradient = ctx.createLinearGradient(startX, startY, endX, endY);
            burstGradient.addColorStop(0, `rgba(255, 255, 255, ${0.7 + Math.sin(time * 0.018 + burst) * 0.3})`);
            burstGradient.addColorStop(0.6, `rgba(255, 120, 120, ${0.5 + Math.sin(time * 0.02 + burst) * 0.2})`);
            burstGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
            
            ctx.strokeStyle = burstGradient;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#ff8888';
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
        // 6. 小型机外围冲击环
        const miniShockRadius = 40 + Math.sin(time * 0.006) * 12;
        const miniShockAlpha = 0.5 + Math.sin(time * 0.009) * 0.3;
        
        ctx.strokeStyle = `rgba(255, 80, 80, ${miniShockAlpha})`;
        ctx.lineWidth = 4;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff5555';
        ctx.beginPath();
        ctx.arc(0, 0, miniShockRadius * scale, 0, Math.PI * 2);
        ctx.stroke();
        
        // 7. 连接到主角的能量链
        if (player && !player.isDead) {
            const linkDistance = Math.sqrt((player.x - this.x) ** 2 + (player.y - this.y) ** 2);
            const linkAlpha = 0.3 + Math.sin(time * 0.015) * 0.2;
            
            // 计算连接点（从小型机边缘到主角边缘）
            const linkAngle = Math.atan2(player.y - this.y, player.x - this.x);
            const startLinkX = Math.cos(linkAngle) * 25 * scale;
            const startLinkY = Math.sin(linkAngle) * 25 * scale;
            
            // 转换到世界坐标系绘制连接线
            ctx.restore(); // 临时退出小型机坐标系
            
            const linkGradient = ctx.createLinearGradient(
                this.x + startLinkX, this.y + startLinkY,
                player.x, player.y
            );
            linkGradient.addColorStop(0, `rgba(255, 120, 120, ${linkAlpha})`);
            linkGradient.addColorStop(0.5, `rgba(255, 200, 200, ${linkAlpha * 1.5})`);
            linkGradient.addColorStop(1, `rgba(255, 120, 120, ${linkAlpha})`);
            
            ctx.strokeStyle = linkGradient;
            ctx.lineWidth = 3;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff9999';
            
            // 绘制波动的能量连接线
            ctx.beginPath();
            ctx.moveTo(this.x + startLinkX, this.y + startLinkY);
            
            // 创建波浪状连接线
            const segments = 8;
            for (let seg = 1; seg <= segments; seg++) {
                const progress = seg / segments;
                const midX = this.x + startLinkX + (player.x - this.x - startLinkX) * progress;
                const midY = this.y + startLinkY + (player.y - this.y - startLinkY) * progress;
                
                // 添加波浪效果
                const waveOffset = Math.sin(progress * Math.PI * 2 + time * 0.01) * 8;
                const perpAngle = linkAngle + Math.PI / 2;
                const waveX = midX + Math.cos(perpAngle) * waveOffset;
                const waveY = midY + Math.sin(perpAngle) * waveOffset;
                
                ctx.lineTo(waveX, waveY);
            }
            ctx.stroke();
            
            // 连接线上的能量粒子
            for (let particle = 0; particle < 5; particle++) {
                const particleProgress = (time * 0.002 + particle * 0.2) % 1;
                const particleX = this.x + startLinkX + (player.x - this.x - startLinkX) * particleProgress;
                const particleY = this.y + startLinkY + (player.y - this.y - startLinkY) * particleProgress;
                
                ctx.fillStyle = `rgba(255, 255, 255, ${0.8 + Math.sin(time * 0.02 + particle) * 0.2})`;
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#ffffff';
                ctx.beginPath();
                ctx.arc(particleX, particleY, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.save(); // 重新进入小型机坐标系
            ctx.translate(this.x, this.y);
        }
        
        ctx.restore();
    }

    shoot() {
        if (window.tripleShotMode) {
            const skill3Damage = Math.floor(this.attack * 0.4);
            for (let i = -1; i <= 1; i++) {
                const angle = -Math.PI / 2;
                const offsetX = i * 15;
                bullets.push(new Bullet(
                    this.x + offsetX, 
                    this.y, 
                    angle, 
                    15, 
                    skill3Damage, 
                    '#ffff00', 
                    false, 
                    null, 
                    10
                ));
            }
        } else {
            bullets.push(new Bullet(
                this.x, 
                this.y, 
                -Math.PI / 2, 
                15, 
                this.attack, 
                '#ffff00', 
                false, 
                null, 
                10
            ));
        }
    }

    takeDamage(damage) {
        if (this.isDead) return;
        
        const finalDamage = Math.max(1, damage - this.defense);
        this.health -= finalDamage;
        
        for (let i = 0; i < 3; i++) {
            particles.push(new Particle(this.x, this.y, '#ff4444'));
        }
        
        if (this.health <= 0) {
            this.destroy();
        }
    }

    destroy() {
        if (this.isDead) return;
        
        this.isDead = true;
        
        const survivalSeconds = this.aliveTime / 1000;
        const healAmount = survivalSeconds * 2;
        player.heal(healAmount);
        
        for (let i = 0; i < 15; i++) {
            particles.push(new Particle(this.x, this.y, '#00ffff'));
        }
    }

    draw() {
        if (this.isDead) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // 使用预加载的PNG图片渲染小型机
        if (miniShipImageLoader.isLoaded && miniShipImageLoader.image) {
            ctx.drawImage(miniShipImageLoader.image, -this.width/2, -this.height/2, this.width, this.height);
        }
        
        // 血条
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = '#333';
        ctx.fillRect(-30, -this.height/2 - 15, 60, 8);
        ctx.fillStyle = healthPercent > 0.3 ? '#00ff00' : '#ff0000';
        ctx.fillRect(-30, -this.height/2 - 15, 60 * healthPercent, 8);
        
        ctx.restore();
    }
}

class MiniShipManager {
    constructor() {
        this.miniShips = [];
    }

    spawnMiniShips() {
        this.clearAllMiniShips();
        
        this.miniShips.push(new MiniShip(player.x, player.y, 'left'));
        this.miniShips.push(new MiniShip(player.x, player.y, 'right'));
    }

    update() {
        this.miniShips = this.miniShips.filter(ship => {
            if (!ship.isDead) {
                ship.update();
                return true;
            }
            return false;
        });
    }

    draw() {
        this.miniShips.forEach(ship => ship.draw());
    }

    clearAllMiniShips() {
        this.miniShips.forEach(ship => ship.destroy());
        this.miniShips = [];
    }

    checkCollisions(enemies, enemyBullets, enemyMissiles) {
        this.miniShips.forEach(ship => {
            if (ship.isDead) return;
            
            enemies.forEach(enemy => {
                const dx = enemy.x - ship.x;
                const dy = enemy.y - ship.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 40) {
                    ship.takeDamage(enemy.damage || 50);
                }
            });
            
            enemyBullets.forEach((bullet, index) => {
                const dx = bullet.x - ship.x;
                const dy = bullet.y - ship.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < bullet.radius + 20) {
                    ship.takeDamage(bullet.damage);
                    enemyBullets.splice(index, 1);
                }
            });
        });
    }
}

window.miniShipManager = new MiniShipManager();