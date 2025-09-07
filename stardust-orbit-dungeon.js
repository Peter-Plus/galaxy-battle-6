class StardustOrbitDungeon {
    constructor() {
        this.isActive = false;
        this.energyCrystal = null;
        this.enemyWaves = [];
        this.currentWave = 0;
        this.waveTimer = 0;
        this.waveInterval = 10000;
        this.enemyGList = [];
        this.enemyHList = [];
        this.startTime = 0;
    }

start() {
    if (typeof passiveEffects !== 'undefined') {
        passiveEffects.resetBattleState();
    }
    
    this.isActive = true;
    this.currentWave = 0;
    this.waveTimer = 0;
    this.enemyGList = [];
    this.enemyHList = [];
    this.startTime = Date.now();
    
    enemies.length = 0;
    bullets.length = 0;
    enemyBullets.length = 0;
    enemyMissiles.length = 0;
    shockWaves.length = 0;
    particles.length = 0;
    blackHoles.length = 0;
    
    gameStateManager.setState('stardust_orbit');
    this.initializeStardustOrbit();
    this.spawnFirstWave();
    
    this.setupEventListeners();
}

initializeStardustOrbit() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // 直接创建能源水晶，不要分离到单独方法
    this.energyCrystal = {
        x: canvas.width * 0.5,
        y: canvas.height * 0.3,
        maxHealth: 15000,
        health: 15000,
        radius: 80,
        color: '#ffaa00',
        image: null,
        imageLoaded: false
    };
    
    // 立即加载图片
    this.loadCrystalImage();
    
    // 重置玩家位置和状态
    player.x = canvas.width / 2;
    player.y = canvas.height - 100;
    player.health = player.maxHealth;
    player.energy = player.maxEnergy;
    player.stunned = false;
    player.stunTime = 0;
}

    setupEventListeners() {
        // 移除旧的监听器
        this.removeEventListeners();
        
        // 按键按下事件 - 包含所有需要的按键
        this.keydownHandler = (e) => {
            if (!this.isActive) return;
            
            if (e.key.toLowerCase() === 'p') {
                inventory.toggleInventory();
                return;
            }
            if (e.key.toLowerCase() === 'v') {
                shop.toggleShop();
                return;
            }
            
            // M键返回主界面
            if (e.key.toLowerCase() === 'm') {
                this.confirmExit();
                return;
            }
            
            if (inventory.isOpen || shop.isOpen) return;
            
            if (e.key === '1') skill1();
            else if (e.key === '2') skill2();
            else if (e.key === '3') skill3();
            else if (e.key === '4') {
                // 法宝使用
                if (inventory.treasureSlot && inventory.treasureSlot.canUse()) {
                    inventory.treasureSlot.use(player, enemies);
                }
            }
            else if (e.key.toLowerCase() === 't') {
                // 消耗品使用
                if (typeof handleConsumableUse === 'function') {
                    handleConsumableUse();
                } else {
                    inventory.useConsumable();
                }
            }
            else if (e.key === 'Escape') {
                this.confirmExit();
            }
        };
        
        // 鼠标移动事件
        this.mousemoveHandler = (e) => {
            if (!this.isActive) return;
            const rect = canvas.getBoundingClientRect();
            window.mouseX = e.clientX - rect.left;
            window.mouseY = e.clientY - rect.top;
        };
        
        // click 事件处理
        this.clickHandler = (e) => {
            if (!this.isActive) return;
            if (inventory.isOpen || shop.isOpen) return;
            
            // 处理无垠的激光瞄准模式
            if (window.laserAimingMode) {
                const rect = canvas.getBoundingClientRect();
                const targetX = e.clientX - rect.left;
                const targetY = e.clientY - rect.top;
                
                if (typeof fireLaserCannon === 'function') {
                    fireLaserCannon(targetX, targetY);
                }
                return;
            }
        };
        
        // 鼠标按下事件
        this.mousedownHandler = (e) => {
            if (!this.isActive) return;
            
            if (e.button === 2) {
                e.preventDefault();
                window.isRightMousePressed = true;
                
                if (!window.isCharging) {
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
        
        // 鼠标释放事件
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
        
        // 使用 canvas 而不是 document（除了keydown）
        document.addEventListener('keydown', this.keydownHandler);
        canvas.addEventListener('mousemove', this.mousemoveHandler);
        canvas.addEventListener('click', this.clickHandler);
        canvas.addEventListener('mousedown', this.mousedownHandler);
        canvas.addEventListener('mouseup', this.mouseupHandler);
        
        this.contextmenuHandler = (e) => {
            if (this.isActive) e.preventDefault();
        };
        canvas.addEventListener('contextmenu', this.contextmenuHandler);
    }

    removeEventListeners() {
        if (this.keydownHandler) {
            document.removeEventListener('keydown', this.keydownHandler);
        }
        if (this.mousemoveHandler) {
            canvas.removeEventListener('mousemove', this.mousemoveHandler);
        }
        if (this.clickHandler) {  // 【新增】
            canvas.removeEventListener('click', this.clickHandler);
        }
        if (this.mousedownHandler) {
            canvas.removeEventListener('mousedown', this.mousedownHandler);
        }
        if (this.mouseupHandler) {
            canvas.removeEventListener('mouseup', this.mouseupHandler);
        }
        if (this.contextmenuHandler) {
            canvas.removeEventListener('contextmenu', this.contextmenuHandler);
        }
    }

    loadCrystalImage() {
    if (!this.energyCrystal) return;
    
    const img = new Image();
    img.onload = () => {
        this.energyCrystal.image = img;
        this.energyCrystal.imageLoaded = true;
    };
    img.onerror = () => {
        this.energyCrystal.imageLoaded = false;
    };
    img.src = 'assets/energy-crystal.png';
}

    spawnFirstWave() {
        this.currentWave = 1;
        this.spawnWaveEnemies();
        this.waveTimer = Date.now() + this.waveInterval;
    }

    spawnWaveEnemies() {
        const baseHealthG = 300;
        const baseAttackG = 0;
        const baseHealthH = 90;
        const baseAttackH = 0;
        
        const waveMultiplier = this.currentWave * this.currentWave;
        
        for (let i = 0; i < 6; i++) {
            const enemyG = new EnemyG(
                Math.random() * canvas.width,
                Math.random() * (canvas.height * 0.8) + 50,
                baseHealthG * waveMultiplier,
                baseAttackG * waveMultiplier
            );
            this.enemyGList.push(enemyG);
            enemies.push(enemyG);
        }
        
        for (let i = 0; i < 8; i++) {
            const enemyH = new EnemyH(
                Math.random() * canvas.width,
                Math.random() * (canvas.height * 0.4) + 50,
                baseHealthH * waveMultiplier,
                baseAttackH * waveMultiplier
            );
            this.enemyHList.push(enemyH);
            enemies.push(enemyH);
        }
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

        if (Date.now() >= this.waveTimer) {
            this.currentWave++;
            this.spawnWaveEnemies();
            this.waveTimer = Date.now() + this.waveInterval;
        }

        this.updateEnemies();
        this.checkPlayerDeath();
        this.updateStardustOrbitUI();
    }

    updateEnemies() {
        this.enemyGList = this.enemyGList.filter(enemy => enemy.health > 0);
        this.enemyHList = this.enemyHList.filter(enemy => enemy.health > 0);
    }

    checkPlayerDeath() {
        if (player.health <= 0) {
            this.end();
        }
    }

    end() {
        this.isActive = false;
        
        const damagePercent = 1 - (this.energyCrystal.health / this.energyCrystal.maxHealth);
        
        timeVortexManager.completeStardustOrbit(damagePercent);

        if (typeof player !== 'undefined' && player) {
    player.health = player.maxHealth;
    player.energy = player.maxEnergy;
    
    // 更新UI显示
    if (typeof updateHealthBar === 'function') {
        updateHealthBar();
    }
    if (typeof updateEnergyBar === 'function') {
        updateEnergyBar();
    }
    }
        
        this.removeEventListeners();
        
        this.cleanup();
        
        gameStateManager.setState(gameStateManager.states.MAIN);
    }

    damageCrystal(damage) {
        if (this.energyCrystal && this.energyCrystal.health > 0) {
            const currentHealthPercent = this.energyCrystal.health / this.energyCrystal.maxHealth;
            const actualDamage = damage * currentHealthPercent;
            
            this.energyCrystal.health = Math.max(0, this.energyCrystal.health - actualDamage);
            
            for (let i = 0; i < 5; i++) {
                particles.push(new Particle(
                    this.energyCrystal.x + (Math.random() - 0.5) * 40,
                    this.energyCrystal.y + (Math.random() - 0.5) * 40,
                    '#ffaa00'
                ));
            }
            
            if (this.energyCrystal.health <= 0) {
                this.onCrystalDestroyed();
            }
        }
    }

    onCrystalDestroyed() {
        this.end();
    }

    updateStardustOrbitUI() {
        const waveDisplay = document.querySelector('.wave-display');
        if (waveDisplay) {
            waveDisplay.style.display = 'none';
        }
    }

    confirmExit() {
    // 使用和无尽征程一样的UI提示，而不是浏览器原生confirm
    const modal = document.createElement('div');
    modal.className = 'main-menu-confirm-modal';
    modal.innerHTML = `
        <div class="main-menu-confirm-content">
            <h3>返回主界面</h3>
            <p>是否返回主界面？将直接获得结算奖励。</p>
            <div class="main-menu-confirm-buttons">
                <button id="confirmMainMenuBtn">确定</button>
                <button id="cancelMainMenuBtn">取消</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('confirmMainMenuBtn').addEventListener('click', () => {
        modal.remove();
        this.end();
    });
    
    document.getElementById('cancelMainMenuBtn').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

    cleanup() {
        this.currentWave = 0;
        this.waveTimer = 0;
        this.enemyGList = [];
        this.enemyHList = [];
        this.energyCrystal = null;
        
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (enemies[i].type === 'G' || enemies[i].type === 'H') {
                enemies.splice(i, 1);
            }
        }

        // 清理所有子弹
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets.splice(i, 1);
    }
    
    // 清理所有导弹
    for (let i = enemyMissiles.length - 1; i >= 0; i--) {
        enemyMissiles.splice(i, 1);
    }
    
    // 清理晕眩波
    if (typeof stunWaves !== 'undefined') {
        for (let i = stunWaves.length - 1; i >= 0; i--) {
            stunWaves.splice(i, 1);
        }
    }
    
    // 清理火柱
    if (typeof flameColumns !== 'undefined') {
        for (let i = flameColumns.length - 1; i >= 0; i--) {
            flameColumns.splice(i, 1);
        }
    }
    
    // 清理火柱预警
    if (typeof flameWarnings !== 'undefined') {
        for (let i = flameWarnings.length - 1; i >= 0; i--) {
            flameWarnings.splice(i, 1);
        }
    }
    
    // 清理冲击波
    for (let i = shockWaves.length - 1; i >= 0; i--) {
        shockWaves.splice(i, 1);
    }
    
    // 清理黑洞
    for (let i = blackHoles.length - 1; i >= 0; i--) {
        blackHoles.splice(i, 1);
    }
    
    // 清理粒子效果
    for (let i = particles.length - 1; i >= 0; i--) {
        particles.splice(i, 1);
    }
    
    // 清理波纹效果
    for (let i = waves.length - 1; i >= 0; i--) {
        waves.splice(i, 1);
    }
        
    // 隐藏蓄力条
    const chargeBar = document.querySelector('.charge-bar');
    if (chargeBar) {
        chargeBar.style.display = 'none';
        const chargeFill = document.querySelector('.charge-fill');
        if (chargeFill) {
            chargeFill.style.width = '0%';
        }
    }

    if (typeof stardustOrbitUI !== 'undefined') {
            stardustOrbitUI.hide();
        }
    }
}

class StardustOrbitUI {
    constructor() {
        this.addStardustOrbitStyles();
        this.createStardustOrbitUI();
    }

    addStardustOrbitStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .stardust-orbit-ui {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 1000;
                pointer-events: none;
                display: none;
            }

            .stardust-orbit-info {
                position: absolute;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                border: 2px solid #ffaa00;
                border-radius: 10px;
                padding: 15px 20px;
                color: white;
                text-align: center;
                min-width: 300px;
            }

            .crystal-status {
                margin-bottom: 10px;
            }

            .crystal-name {
                font-size: 18px;
                color: #ffaa00;
                font-weight: bold;
                margin-bottom: 5px;
            }

            .crystal-health-bar {
                width: 100%;
                height: 20px;
                background: #333;
                border-radius: 10px;
                overflow: hidden;
                position: relative;
                margin-bottom: 5px;
            }

            .crystal-health-fill {
                height: 100%;
                background: linear-gradient(90deg, #ff4444, #ffaa44, #44ff44);
                transition: width 0.3s ease;
            }

            .crystal-health-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                color: white;
                font-size: 12px;
                font-weight: bold;
                text-shadow: 1px 1px 2px black;
            }

            .damage-stats {
                display: flex;
                justify-content: space-between;
                gap: 20px;
                margin-top: 10px;
                font-size: 14px;
            }

            .stat-item {
                text-align: center;
            }

            .stat-label {
                color: #cccccc;
                font-size: 12px;
            }

            .stat-value {
                color: #00ff00;
                font-weight: bold;
                margin-top: 2px;
            }

            .wave-timer {
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                border: 2px solid #ffaa00;
                border-radius: 8px;
                padding: 10px 15px;
                color: #ffaa00;
                font-weight: bold;
                text-align: center;
            }

            .timer-label {
                font-size: 12px;
                margin-bottom: 5px;
            }

            .timer-value {
                font-size: 18px;
            }

            .stardust-orbit-exit {
                position: absolute;
                bottom: 20px;
                right: 20px;
                background: rgba(255, 0, 0, 0.8);
                border: 2px solid #ff4444;
                border-radius: 8px;
                padding: 10px 15px;
                color: white;
                font-weight: bold;
                cursor: pointer;
                pointer-events: all;
                transition: all 0.3s;
            }

            .stardust-orbit-exit:hover {
                background: rgba(255, 0, 0, 1);
                transform: scale(1.05);
            }
        `;
        document.head.appendChild(style);
    }

    createStardustOrbitUI() {
        const container = document.createElement('div');
        container.id = 'stardustOrbitUI';
        container.className = 'stardust-orbit-ui';
        container.innerHTML = `
            <div class="stardust-orbit-info">
                <div class="crystal-status">
                    <div class="crystal-name">星尘水晶</div>
                    <div class="crystal-health-bar">
                        <div class="crystal-health-fill" id="stardustCrystalHealthFill"></div>
                        <div class="crystal-health-text" id="stardustCrystalHealthText">15000/15000</div>
                    </div>
                </div>
                <div class="damage-stats">
                    <div class="stat-item">
                        <div class="stat-label">已造成伤害</div>
                        <div class="stat-value" id="stardustDamageDealt">0</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">伤害百分比</div>
                        <div class="stat-value" id="stardustDamagePercent">0%</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">当前免伤</div>
                        <div class="stat-value" id="stardustDamageReduction">0%</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">当前波次</div>
                        <div class="stat-value" id="stardustCurrentWaveDisplay">1</div>
                    </div>
                </div>
            </div>
            <div class="wave-timer">
                <div class="timer-label">下波出现</div>
                <div class="timer-value" id="stardustWaveTimerValue">10</div>
            </div>
            <div class="stardust-orbit-exit" onclick="stardustOrbitDungeon.confirmExit()">
                退出副本
            </div>
        `;
        document.body.appendChild(container);
    }

    show() {
        document.getElementById('stardustOrbitUI').style.display = 'block';
    }

    hide() {
        document.getElementById('stardustOrbitUI').style.display = 'none';
    }

    updateCrystalHealth(health, maxHealth) {
        const healthFill = document.getElementById('stardustCrystalHealthFill');
        const healthText = document.getElementById('stardustCrystalHealthText');
        const damageDealt = document.getElementById('stardustDamageDealt');
        const damagePercent = document.getElementById('stardustDamagePercent');
        const damageReduction = document.getElementById('stardustDamageReduction');

        if (healthFill && healthText && damageDealt && damagePercent && damageReduction) {
            const healthPercent = health / maxHealth;
            const damageAmount = maxHealth - health;
            const damagePercentValue = (damageAmount / maxHealth) * 100;
            const reductionPercent = (1 - healthPercent) * 100;

            healthFill.style.width = `${healthPercent * 100}%`;
            healthText.textContent = `${Math.floor(health)}/${maxHealth}`;
            damageDealt.textContent = Math.floor(damageAmount);
            damagePercent.textContent = `${Math.floor(damagePercentValue)}%`;
            damageReduction.textContent = `${Math.floor(reductionPercent)}%`;
        }
    }

    updateWaveTimer(seconds) {
        const timerValue = document.getElementById('stardustWaveTimerValue');
        if (timerValue) {
            timerValue.textContent = Math.max(0, Math.ceil(seconds));
        }
    }
}

function drawStardustCrystal() {
    if (!stardustOrbitDungeon || !stardustOrbitDungeon.isActive || !stardustOrbitDungeon.energyCrystal) {
        return;
    }
    
    const crystal = stardustOrbitDungeon.energyCrystal;
    
    ctx.save();
    
    if (crystal.image && crystal.imageLoaded) {
        const pulseScale = 1 + Math.sin(Date.now() * 0.002) * 0.1;
        
        ctx.globalAlpha = 0.9 + Math.sin(Date.now() * 0.003) * 0.1;
        
        ctx.shadowBlur = 30;
        ctx.shadowColor = crystal.color;
        
        const renderSize = crystal.radius * 2 * pulseScale;
        ctx.drawImage(
            crystal.image,
            crystal.x - renderSize / 2,
            crystal.y - renderSize / 2,
            renderSize,
            renderSize
        );
        
        const time = Date.now() * 0.001;
        for (let i = 0; i < 2; i++) {
            const waveRadius = crystal.radius + (Math.sin(time + i * Math.PI) + 1) * 15;
            const waveAlpha = (Math.sin(time + i * Math.PI) + 1) * 0.05;
            
            ctx.globalAlpha = waveAlpha;
            ctx.strokeStyle = crystal.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(crystal.x, crystal.y, waveRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    } else {
        const pulseScale = 1 + Math.sin(Date.now() * 0.003) * 0.15;
        
        ctx.shadowBlur = 20;
        ctx.shadowColor = crystal.color;
        
        ctx.fillStyle = crystal.color;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(crystal.x, crystal.y, crystal.radius * pulseScale, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(crystal.x, crystal.y, crystal.radius + 5, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    ctx.restore();
}

stardustOrbitDungeon = new StardustOrbitDungeon();
stardustOrbitUI = new StardustOrbitUI();
window.stardustOrbitDungeon = stardustOrbitDungeon;
window.stardustOrbitUI = stardustOrbitUI;