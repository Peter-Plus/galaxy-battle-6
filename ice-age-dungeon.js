class IceAgeDungeon {
    constructor() {
        this.isActive = false;
        this.currentWave = 1;
        this.maxWaves = 3;
        this.waveTimer = 0;
        this.waveStarted = false;
        this.bossDefeated = false;
        this.portalActive = false;
        this.portalX = 0;
        this.portalY = 0;
        
        this.spawnTimer = 0;
        this.spawnInterval = 0;
        this.enemiesLeftToSpawn = [];
        this.isSpawning = false;
        
        this.wave1Enemies = [];
        this.wave2Enemies = [];
        this.wave3Enemies = [];
        this.boss2 = null;
        
        this.keydownHandler = null;
        this.mousemoveHandler = null;
        this.mousedownHandler = null;
        this.mouseupHandler = null;
    }

    start() {
        this.isActive = true;
        this.currentWave = 1;
        this.waveStarted = false;
        this.bossDefeated = false;
        this.portalActive = false;
        
        enemies.length = 0;
        enemyBullets.length = 0;
        bullets.length = 0;
        particles.length = 0;
        
        player.health = player.maxHealth;
        player.energy = player.maxEnergy;
        player.x = canvas.width / 2;
        player.y = canvas.height - 100;
        
        gameStateManager.setState(gameStateManager.states.ICE_AGE);
        gameRunning = true;
        
        this.addEventListeners();
        
        this.scheduleWave(1, 3000, 6000);
        
        console.log('冰河时代副本开始');
    }

    addEventListeners() {
        this.keydownHandler = (e) => {
            if (!this.isActive) return;
            
            if (e.key === 'p' || e.key === 'P') {
                inventory.toggleInventory();
                return;
            }

            if (e.key === 'v' || e.key === 'V') {
                shop.toggleShop();
                return;
            }

            if (e.key === 't' || e.key === 'T') {
                handleConsumableUse();
                return;
            }

            if (e.key === 'm' || e.key === 'M') {
                this.confirmExit();
                return;
            }

            if (e.key === '4') {
                e.preventDefault();
                
                if (inventory.treasureSlot && inventory.treasureSlot.canUse()) {
                    const success = inventory.treasureSlot.use(player, enemies);
                    if (success) {
                        showTreasureUseNotification(inventory.treasureSlot.name);
                    }
                } else if (inventory.treasureSlot && !inventory.treasureSlot.canUse()) {
                    showTreasureCooldownNotification();
                } else {
                    showNoTreasureNotification();
                }
                return;
            }

            if (e.code === 'Space' && this.portalActive) {
                const dx = player.x - this.portalX;
                const dy = player.y - this.portalY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 80) {
                    this.completeSuccessfully();
                }
                return;
            }
            
            if (!window.player || window.player.stunned) return;
            if (inventory.isOpen || shop.isOpen) return;
            
            switch(e.key) {
                case '1':
                    if (typeof skill1 === 'function') skill1();
                    break;
                case '2':
                    if (typeof skill2 === 'function') skill2();
                    break;
                case '3':
                    if (typeof skill3 === 'function') skill3();
                    break;
            }
        };
        
        this.mousemoveHandler = (e) => {
            if (!this.isActive || inventory.isOpen || shop.isOpen) return;
            const rect = canvas.getBoundingClientRect();
            window.mouseX = e.clientX - rect.left;
            window.mouseY = e.clientY - rect.top;
        };
        
        this.mousedownHandler = (e) => {
            if (!this.isActive || inventory.isOpen || shop.isOpen) return;
            
            if (e.button === 2) {
                e.preventDefault();
                
                if (!window.isRightMousePressed) {
                    window.isRightMousePressed = true;
                    window.isCharging = true;
                    window.chargeStartTime = Date.now();
                    window.chargeAmount = 0;
                    
                    const chargeBar = document.querySelector('.charge-bar');
                    if (chargeBar) chargeBar.style.display = 'block';
                }
            } else if (e.button === 0) {
                window.isLeftMouseDown = true;
            }
        };
        
        this.mouseupHandler = (e) => {
            if (!this.isActive) return;
            
            if (e.button === 2) {
                window.isRightMousePressed = false;
                
                if (window.isCharging) {
                    const chargeTime = Date.now() - window.chargeStartTime;
                    
                    if (chargeTime > 200) {
                        waves.push(new Wave(player.x, player.y, chargeTime));
                    }
                    
                    window.isCharging = false;
                    window.chargeAmount = 0;
                    
                    const chargeBar = document.querySelector('.charge-bar');
                    if (chargeBar) {
                        chargeBar.style.display = 'none';
                        const chargeFill = document.querySelector('.charge-fill');
                        if (chargeFill) chargeFill.style.width = '0%';
                    }
                }
            } else if (e.button === 0) {
                window.isLeftMouseDown = false;
            }
        };
        
        document.addEventListener('keydown', this.keydownHandler);
        canvas.addEventListener('mousemove', this.mousemoveHandler);
        canvas.addEventListener('mousedown', this.mousedownHandler);
        canvas.addEventListener('mouseup', this.mouseupHandler);
        
        canvas.addEventListener('contextmenu', (e) => {
            if (this.isActive) e.preventDefault();
        });
    }

    removeEventListeners() {
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
            this.keydownHandler = null;
        }
        if (this.mousemoveHandler) {
            canvas.removeEventListener('mousemove', this.mousemoveHandler);
            this.mousemoveHandler = null;
        }
        if (this.mousedownHandler) {
            canvas.removeEventListener('mousedown', this.mousedownHandler);
            this.mousedownHandler = null;
        }
        if (this.mouseupHandler) {
            canvas.removeEventListener('mouseup', this.mouseupHandler);
            this.mouseupHandler = null;
        }
    }

    confirmExit() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;
        
        modal.innerHTML = `
            <div style="background: #2a2a2a; border: 2px solid #666; border-radius: 10px; padding: 30px; text-align: center; color: white;">
                <h3>确认退出</h3>
                <p>确定要退出冰河时代副本吗？<br>进度将不会保存。</p>
                <div style="margin-top: 20px;">
                    <button id="confirmExitBtn" style="margin-right: 10px; padding: 8px 16px; background: #ff4444; color: white; border: none; border-radius: 4px; cursor: pointer;">确定</button>
                    <button id="cancelExitBtn" style="padding: 8px 16px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">取消</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('confirmExitBtn').onclick = () => {
            modal.remove();
            this.end();
        };
        
        document.getElementById('cancelExitBtn').onclick = () => {
            modal.remove();
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        };
    }

    scheduleWave(waveNumber, delay, spawnDuration) {
        setTimeout(() => {
            if (!this.isActive) return;
            
            console.log(`开始第${waveNumber}波，生成时长：${spawnDuration/1000}秒`);
            this.currentWave = waveNumber;
            this.startWaveSpawning(waveNumber, spawnDuration);
            
            if (waveNumber === 1) {
                this.scheduleWave(2, spawnDuration + 6000, 8000);
            } else if (waveNumber === 2) {
                this.scheduleWave(3, spawnDuration + 9000, 0);
            }
            
        }, delay);
    }

    startWaveSpawning(waveNumber, spawnDuration) {
        this.isSpawning = true;
        this.spawnTimer = 0;
        
        const healthMultiplier = 1 + (30 - 1) * 0.2;
        const damageMultiplier = 1 + (30 - 1) * 0.1;
        
        switch(waveNumber) {
            case 1:
                this.enemiesLeftToSpawn = [
                    ...Array(6).fill().map(() => ({type: 'A', healthMult: healthMultiplier, damageMult: damageMultiplier})),
                    ...Array(6).fill().map(() => ({type: 'C', healthMult: healthMultiplier, damageMult: damageMultiplier})),
                    ...Array(6).fill().map(() => ({type: 'D', healthMult: healthMultiplier, damageMult: damageMultiplier}))
                ];
                this.spawnInterval = spawnDuration / this.enemiesLeftToSpawn.length;
                break;
                
            case 2:
                this.enemiesLeftToSpawn = [
                    ...Array(15).fill().map(() => ({type: 'B', healthMult: healthMultiplier, damageMult: damageMultiplier})),
                    ...Array(3).fill().map(() => ({type: 'C', healthMult: healthMultiplier, damageMult: damageMultiplier})),
                    ...Array(6).fill().map(() => ({type: 'D', healthMult: healthMultiplier, damageMult: damageMultiplier}))
                ];
                this.spawnInterval = spawnDuration / this.enemiesLeftToSpawn.length;
                break;
                
            case 3:
                this.spawnWave3Immediately();
                this.isSpawning = false;
                return;
        }
        
        this.shuffleArray(this.enemiesLeftToSpawn);
    }

    update() {
        if (!this.isActive) return;
        
        if (inventory.isOpen || shop.isOpen) {
            return;
        }
        
        if (window.isCharging && window.isRightMousePressed) {
            const currentTime = Date.now();
            const chargeTime = currentTime - window.chargeStartTime;
            const maxChargeTime = 3000;
            
            const chargePercent = Math.min(100, (chargeTime / maxChargeTime) * 100);
            const chargeFill = document.querySelector('.charge-fill');
            if (chargeFill) {
                chargeFill.style.width = chargePercent + '%';
            }
            
            window.chargeAmount = chargeTime;
        }
        
        this.updateEnemySpawning();
        
        this.checkPlayerDeath();
    }

    updateEnemySpawning() {
        if (!this.isSpawning || this.enemiesLeftToSpawn.length === 0) return;
        
        this.spawnTimer += deltaTime;
        
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnTimer = 0;
            this.spawnNextEnemy();
        }
    }

    spawnNextEnemy() {
        if (this.enemiesLeftToSpawn.length === 0) {
            this.isSpawning = false;
            return;
        }
        
        const enemyData = this.enemiesLeftToSpawn.shift();
        const enemy = this.createEnemy(enemyData.type, enemyData.healthMult, enemyData.damageMult);
        
        if (this.currentWave === 1) {
            this.wave1Enemies.push(enemy);
        } else if (this.currentWave === 2) {
            this.wave2Enemies.push(enemy);
        }
        
        enemies.push(enemy);
        console.log(`生成${enemyData.type}类敌人，剩余${this.enemiesLeftToSpawn.length}个`);
    }

    createEnemy(type, healthMultiplier, damageMultiplier) {
        const enemy = new Enemy(type);
        
        switch(type) {
            case 'A':
                enemy.health = 50 * healthMultiplier;
                enemy.damage = 10 * damageMultiplier;
                break;
            case 'B':
                enemy.health = 35 * healthMultiplier;
                enemy.damage = 12 * damageMultiplier;
                break;
            case 'C':
                enemy.health = 50 * healthMultiplier;
                enemy.damage = 10 * damageMultiplier;
                break;
            case 'D':
                enemy.health = 80 * healthMultiplier;
                enemy.damage = 20 * damageMultiplier;
                break;
        }
        
        enemy.maxHealth = enemy.health;
        
        return enemy;
    }

    spawnWave3Immediately() {
        for (let i = 0; i < 2; i++) {
            const enemyG = this.createIceAgeEnemyG();
            this.wave3Enemies.push(enemyG);
            enemies.push(enemyG);
        }
        
        this.boss2 = new Boss2(canvas.width / 2, 150);
        this.wave3Enemies.push(this.boss2);
        enemies.push(this.boss2);
        
        console.log('第三波敌人（G*2 + Boss2*1）一次性生成完成');
    }

    createIceAgeEnemyG() {
        const enemyG = new EnemyG();
        
        enemyG.x = Math.random() * canvas.width;
        enemyG.y = -60;
        
        enemyG.health = 3000;
        enemyG.maxHealth = 3000;
        enemyG.damage = 0;
        enemyG.isIceAgeEnemyG = true;
        
        enemyG.moveDirection = { x: (Math.random() - 0.5) * 0.5, y: 1 };
        enemyG.moveTimer = 0;
        
        enemyG.shootTimer = 0;
        enemyG.shootInterval = enemyG.randomShootInterval();
        enemyG.isAttacking = false;
        
        return enemyG;
    }

    handleBoss2Death() {
        this.bossDefeated = true;
        
        const dropItem = {
            name: '不融雪',
            quality: 0,
            stats: {},
            category: 'material',
            quantity: 1,
            description: '永不融化的神秘雪花，法宝合成/升级材料'
        };
        
        createDroppedItem(this.boss2.x, this.boss2.y, dropItem);
        console.log('Boss2掉落不融雪材料');
        
        this.portalX = this.boss2.x;
        this.portalY = this.boss2.y;
        this.portalActive = true;
        
        console.log('Boss2被击败，传送门已激活');
    }

    checkPlayerDeath() {
    if (player.health <= 0) {
        this.end('player_death');
    }
}

    completeSuccessfully() {
    if (typeof achievementSystem !== 'undefined') {
        const taowuAchievement = achievementSystem.achievements[15]; // 凶兽·梼杌成就ID为15
        if (taowuAchievement && !taowuAchievement.completed) {
            taowuAchievement.completed = true;
            achievementSystem.showAchievementNotification(taowuAchievement);
        }
    }
    
    if (typeof miracleRealmManager !== 'undefined') {
        miracleRealmManager.completeIceAge();
    }
    
    if (typeof autoSave === 'function') {
        autoSave();
    }
    
    this.end();
}

    drawPortal() {
        if (!this.portalActive) return;
        
        ctx.save();
        
        const time = Date.now() * 0.005;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(this.portalX, this.portalY, 60 + i * 20, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(100, 200, 255, ${0.5 - i * 0.15})`;
            ctx.lineWidth = 8;
            ctx.stroke();
        }
        
        ctx.beginPath();
        ctx.arc(this.portalX, this.portalY, 40, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 220, 255, ${0.7 + Math.sin(time) * 0.3})`;
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('按空格键离开副本', this.portalX, this.portalY + 80);
        
        ctx.restore();
    }

    cleanup() {
        enemies.length = 0;
        enemyBullets.length = 0;
        
        this.wave1Enemies.length = 0;
        this.wave2Enemies.length = 0;
        this.wave3Enemies.length = 0;
        this.boss2 = null;
        this.enemiesLeftToSpawn.length = 0;
        this.isSpawning = false;
    }

    end(reason = 'normal') {
    this.isActive = false;
    this.portalActive = false;
    
    this.removeEventListeners();
    this.cleanup();
    
    if (reason === 'player_death') {
        player.health = player.maxHealth;
        player.energy = player.maxEnergy;
        updateHealthBar();
        updateEnergyBar();
        
        if (typeof miracleRealmManager !== 'undefined') {
            miracleRealmManager.failIceAge();
        }
        
        if (typeof autoSave === 'function') {
            autoSave();
        }
        
        this.showChallengeFailed();
    } else {
        gameStateManager.setState(gameStateManager.states.MAIN);
    }
}
    showChallengeFailed() {
    const modal = document.createElement('div');
    modal.className = 'ice-age-challenge-failed-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
    `;
    modal.innerHTML = `
        <div style="
            background: rgba(20, 20, 20, 0.95);
            border: 3px solid #ff4444;
            border-radius: 20px;
            padding: 40px;
            text-align: center;
            color: #ffffff;
            font-size: 24px;
            font-weight: bold;
        ">
            <div style="color: #ff4444; font-size: 36px; margin-bottom: 20px;">挑战失败</div>
            <button onclick="iceAgeDungeon.returnToMainMenu()" style="
                background: linear-gradient(135deg, #444, #666);
                border: 2px solid #888;
                border-radius: 10px;
                color: #ffffff;
                font-size: 18px;
                font-weight: bold;
                padding: 15px 30px;
                cursor: pointer;
                transition: all 0.3s ease;
            ">返回主界面</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}
    returnToMainMenu() {
    const modal = document.querySelector('.ice-age-challenge-failed-modal');
    if (modal) {
        modal.remove();
    }
    gameStateManager.setState(gameStateManager.states.MAIN);
}

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

const iceAgeDungeon = new IceAgeDungeon();