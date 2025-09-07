class Bullet {
    constructor(x, y, angle = -Math.PI / 2, speed = 15, damage = 10, color = '#ffff00', homing = false, target = null, radius = 4, owner = null) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = speed;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.radius = radius;
        this.damage = damage;
        this.color = color;
        this.trail = [];
        this.homing = homing;
        this.target = target;
        this.isAsuraBullet = false;
        this.owner = owner;
    }

    update() {
        if (this.homing && this.target && !this.target.isDead) {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const angle = Math.atan2(dy, dx);
            this.vx = Math.cos(angle) * this.speed;
            this.vy = Math.sin(angle) * this.speed;
        }

        this.x += this.vx;
        this.y += this.vy;
        
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 10) {
            this.trail.shift();
        }
    }

    draw() {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        this.trail.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        ctx.globalAlpha = 1;

        if (this.isAsuraBullet) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff0000';
        } else {
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
        }

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    isOffScreen() {
        return this.x < -50 || this.x > canvas.width + 50 || 
               this.y < -50 || this.y > canvas.height + 50;
    }
}

class EnemyMissile {
    constructor(x, y, targetX, targetY, damage, owner = null) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.damage = damage;
        this.speed = 12;
        this.radius = 8;
        this.trail = [];
        this.owner = owner;
        
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 15) {
            this.trail.shift();
        }
    }

    draw() {
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        this.trail.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        ctx.globalAlpha = 1;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Math.atan2(this.vy, this.vx) + Math.PI / 2);
        
        ctx.fillStyle = '#ff4444';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff4444';
        
        ctx.beginPath();
        ctx.moveTo(0, -this.radius);
        ctx.lineTo(-this.radius/2, this.radius);
        ctx.lineTo(this.radius/2, this.radius);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, -this.radius/2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }

    isOffScreen() {
        return this.x < -50 || this.x > canvas.width + 50 || 
               this.y < -50 || this.y > canvas.height + 50;
    }
}

class Wave {
    constructor(x, y, chargeTime) {
        this.x = x;
        this.y = y;
        const chargePercent = Math.min(chargeTime / 3000, 1);
        this.radius = 20;
        this.maxRadius = 160 + chargePercent * 440;
        this.speed = 5 + chargePercent * 5;
        this.damage = attackPower * (0.1 + chargePercent *0.1);
        this.opacity = 1;
    }

    update() {
        this.radius += this.speed;
        this.opacity = 1 - (this.radius / this.maxRadius);
    }

    draw() {
        ctx.strokeStyle = `rgba(255, 0, 255, ${this.opacity})`;
        ctx.lineWidth = 5;
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#ff00ff';
        
        for (let i = 0; i < 3; i++) {
            ctx.globalAlpha = this.opacity * (1 - i * 0.3);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius - i * 10, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }

    isDone() {
        return this.radius >= this.maxRadius;
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.radius = Math.random() * 5 + 2;
        this.color = color;
        this.life = 1;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.life -= 0.02;
        this.radius *= 0.98;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.life;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }
}

class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speed = Math.random() * 2 + 0.5;
        this.brightness = Math.random();
    }

    update() {
        this.y += this.speed;
        if (this.y > canvas.height) {
            this.y = 0;
            this.x = Math.random() * canvas.width;
        }
        this.brightness = Math.sin(Date.now() * 0.001 + this.x) * 0.5 + 0.5;
    }

    draw() {
        ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class NextWavePortal {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 40;
        this.angle = 0;
        this.pulseScale = 1;
        this.isActive = true;
        this.playerNearby = false;
        
        // 粒子效果
        this.particles = [];
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                angle: Math.random() * Math.PI * 2,
                distance: Math.random() * 60 + 20,
                speed: Math.random() * 0.02 + 0.01,
                size: Math.random() * 3 + 1
            });
        }
    }
    
    update() {
        if (!this.isActive) return;
        
        // 旋转动画
        this.angle += 0.05;
        
        // 脉冲动画
        this.pulseScale = 1 + Math.sin(Date.now() * 0.003) * 0.2;
        
        // 更新粒子
        this.particles.forEach(particle => {
            particle.angle += particle.speed;
            particle.distance += Math.sin(particle.angle * 10) * 0.5;
        });
        
        // 检查玩家是否在附近
        if (typeof player !== 'undefined') {
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            this.playerNearby = distance < this.radius + 20;
        }
    }
    
    draw() {
        if (!this.isActive) return;
        
        // 保存当前状态
        ctx.save();
        
        // 绘制外圈光环
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = '#8B00FF';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * this.pulseScale * 1.5, 0, Math.PI * 2);
        ctx.stroke();
        
        // 绘制粒子
        ctx.globalAlpha = 0.8;
        this.particles.forEach(particle => {
            const px = this.x + Math.cos(particle.angle) * particle.distance;
            const py = this.y + Math.sin(particle.angle) * particle.distance;
            
            ctx.fillStyle = '#8B00FF';
            ctx.beginPath();
            ctx.arc(px, py, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // 绘制主体黑洞
        ctx.globalAlpha = 1;
        
        // 外圈旋转环
        ctx.strokeStyle = '#4B0082';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * this.pulseScale, 0, Math.PI * 2);
        ctx.stroke();
        
        // 内圈
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 0.8);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(0.7, '#2D1B69');
        gradient.addColorStop(1, '#8B00FF');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.8 * this.pulseScale, 0, Math.PI * 2);
        ctx.fill();
        
        // 旋转的能量线
        ctx.strokeStyle = '#9370DB';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        
        for (let i = 0; i < 8; i++) {
            const angle = this.angle + (i * Math.PI / 4);
            const startRadius = this.radius * 0.3;
            const endRadius = this.radius * 0.7;
            
            const startX = this.x + Math.cos(angle) * startRadius;
            const startY = this.y + Math.sin(angle) * startRadius;
            const endX = this.x + Math.cos(angle) * endRadius;
            const endY = this.y + Math.sin(angle) * endRadius;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
        
        // 绘制提示文字
        if (this.playerNearby) {
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#8B00FF';
            ctx.fillText('按空格进入下一波', this.x, this.y - this.radius - 30);
            ctx.shadowBlur = 0;
        }
        
        // 恢复状态
        ctx.restore();
    }
    
    // 检查玩家是否在传送门范围内
    checkPlayerCollision(playerX, playerY) {
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.radius;
    }
    
    // 销毁传送门
    destroy() {
        this.isActive = false;
    }
}