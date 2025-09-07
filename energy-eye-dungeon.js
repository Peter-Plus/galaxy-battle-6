class EnergyEyeDungeon {
    constructor() {
        this.isActive = false;
        this.energyCrystal = null;
        this.enemyWaves = [];
        this.currentWave = 0;
        this.waveTimer = 0;
        this.waveInterval = 10000;
        this.enemyEList = [];
        this.enemyFList = [];
        this.startTime = 0;
    }

    start() {
    if (typeof passiveEffects !== 'undefined') {
        passiveEffects.resetBattleState();
    }
    
    this.isActive = true;
    this.currentWave = 0;
    this.waveTimer = 0;
    this.enemyEList = [];
    this.enemyFList = [];
    this.startTime = Date.now();
    
    enemies.length = 0;
    bullets.length = 0;
    enemyBullets.length = 0;
    enemyMissiles.length = 0;
    shockWaves.length = 0;
    particles.length = 0;
    blackHoles.length = 0;
    
    gameStateManager.setState('energy_eye');
    this.initializeEnergyEye();
    this.spawnFirstWave();

    // 确保无垠角色状态正确初始化
    if (player.characterType === 'wuyin') {
            window.laserAimingMode = false;  // 使用 window 前缀
            window.tripleShotMode = false;
            window.tripleShotFired = 0;
            window.tripleShotCount = 0;
            player.canMove = true;
            player.invincible = false;
        }
    
    // 重置技能冷却
    skillCooldowns = [0, 0, 0, 0];
    
    this.setupEventListeners();
}

    initializeEnergyEye() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    this.energyCrystal = {
        x: canvas.width * 0.5,
        y: canvas.height * 0.3,
        maxHealth: 5000,
        health: 5000,
        radius: 80, // 稍微增大一点，适配PNG图片
        color: '#00ffff',
        image: null,
        imageLoaded: false
    };
    
    // 加载能源水晶PNG图片
    this.loadCrystalImage();
    
    // 添加调试日志
    console.log('能源水晶初始化:', this.energyCrystal);

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
            
            // 背包和商店快捷键在任何时候都可以使用
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
            
            // 如果背包或商店开启，不处理技能
            if (inventory.isOpen || shop.isOpen) return;
            
            // 技能快捷键
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
        
        // click 事件处理，支持无垠2技能释放
        this.clickHandler = (e) => {
            if (!this.isActive) return;
            if (inventory.isOpen || shop.isOpen) return;
            
            // 处理无垠的激光瞄准模式
            if (window.laserAimingMode) {
                const rect = canvas.getBoundingClientRect();
                const targetX = e.clientX - rect.left;
                const targetY = e.clientY - rect.top;
                
                // 调用全局的 fireLaserCannon 函数
                if (typeof fireLaserCannon === 'function') {
                    fireLaserCannon(targetX, targetY);
                }
                return;
            }
        };
        
        // 鼠标按下事件
        this.mousedownHandler = (e) => {
            if (!this.isActive) return;
            
            if (e.button === 2) { // 右键
                e.preventDefault();
                window.isRightMousePressed = true;
                
                if (!window.isCharging) {
                    window.isCharging = true;
                    window.chargeStartTime = Date.now();
                    window.chargeAmount = 0;
                    const chargeBar = document.querySelector('.charge-bar');
                    if (chargeBar) chargeBar.style.display = 'block';
                }
            } else if (e.button === 0) { // 左键
                window.isLeftMouseDown = true;
            }
        };
        
        // 鼠标释放事件
        this.mouseupHandler = (e) => {
            if (!this.isActive) return;
            
            if (e.button === 2) { // 右键释放 - 发射蓄力光波
                window.isRightMousePressed = false;
                
                if (window.isCharging) {
                    const chargeTime = Date.now() - window.chargeStartTime;
                    
                    // 只有蓄力时间超过200ms才发射光波
                    if (chargeTime > 200) {
                        waves.push(new Wave(player.x, player.y, chargeTime));
                    }
                    
                    // 重置蓄力状态
                    window.isCharging = false;
                    window.chargeAmount = 0;
                    
                    // 隐藏蓄力条
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
        
        // 添加事件监听器 - 使用 canvas 而不是 document（除了keydown）
        document.addEventListener('keydown', this.keydownHandler);
        canvas.addEventListener('mousemove', this.mousemoveHandler);
        canvas.addEventListener('click', this.clickHandler);
        canvas.addEventListener('mousedown', this.mousedownHandler);
        canvas.addEventListener('mouseup', this.mouseupHandler);
        
        // 禁用右键菜单
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
        console.log('能源水晶PNG图片加载成功:', img.naturalWidth + 'x' + img.naturalHeight);
    };
    img.onerror = () => {
        console.log('无法加载能源水晶PNG图片，使用默认渲染');
        this.energyCrystal.imageLoaded = false;
    };
    img.src = 'assets/energy-crystal.png'; // 你的PNG图片路径
}

    spawnFirstWave() {
        this.currentWave = 1;
        this.spawnWaveEnemies();
        this.waveTimer = Date.now() + this.waveInterval;
    }

    spawnWaveEnemies() {
        // 基础属性定义（确保每次都是相同的基础值）
        const baseHealthE = 60;
        const baseAttackE = 5;
        const baseHealthF = 80;
        const baseAttackF = 3;
        
        // 使用平方成长
        const waveMultiplier = this.currentWave * this.currentWave;
        
        console.log(`生成第${this.currentWave}波敌人，倍率: ${waveMultiplier}`);
        
        // 生成敌人E
        for (let i = 0; i < 6; i++) {
            const enemyE = new EnemyE(
                Math.random() * canvas.width,
                Math.random() * (canvas.height * 0.4) + 50,
                baseHealthE * waveMultiplier,
                baseAttackE * waveMultiplier
            );
            this.enemyEList.push(enemyE);
            enemies.push(enemyE);
        }
        
        // 生成敌人F
        for (let i = 0; i < 8; i++) {
            const enemyF = new EnemyF(
                Math.random() * canvas.width,
                Math.random() * (canvas.height * 0.4) + 50,
                baseHealthF * waveMultiplier,
                baseAttackF * waveMultiplier
            );
            this.enemyFList.push(enemyF);
            enemies.push(enemyF);
        }
    }

    update() {
    if (!this.isActive) return;

    // 检查是否打开了背包或商店，如果是则暂停游戏更新
    if (inventory.isOpen || shop.isOpen) {
        return;
    }

    // 【新增】处理蓄力光波的蓄力进度显示（复用无尽征程逻辑）
    if (window.isCharging && window.isRightMousePressed) {
        const currentTime = Date.now();
        const chargeTime = currentTime - window.chargeStartTime;
        const maxChargeTime = 3000; // 最大蓄力时间3秒
        
        // 更新蓄力条显示
        const chargePercent = Math.min(100, (chargeTime / maxChargeTime) * 100);
        const chargeFill = document.querySelector('.charge-fill');
        if (chargeFill) {
            chargeFill.style.width = chargePercent + '%';
        }
        
        // 更新全局蓄力量（用于Wave类计算伤害）
        window.chargeAmount = chargeTime;
    }

    // 波次逻辑
    if (Date.now() >= this.waveTimer) {
        this.currentWave++;
        this.spawnWaveEnemies();
        this.waveTimer = Date.now() + this.waveInterval;
    }

    this.updateEnemies();
    this.checkPlayerDeath();
    this.updateEnergyEyeUI();
}

    updateEnemies() {
        this.enemyEList = this.enemyEList.filter(enemy => enemy.health > 0);
        this.enemyFList = this.enemyFList.filter(enemy => enemy.health > 0);
    }

    checkPlayerDeath() {
        if (player.health <= 0) {
            this.end();
        }
    }

    end() {
    this.isActive = false;
    
    const damagePercent = 1 - (this.energyCrystal.health / this.energyCrystal.maxHealth);
    
    timeVortexManager.completeEnergyEye(damagePercent);

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
            const damageReduction = 1 - currentHealthPercent;
            const actualDamage = damage * currentHealthPercent;
            
            this.energyCrystal.health = Math.max(0, this.energyCrystal.health - actualDamage);
            
            // 添加受击特效
            for (let i = 0; i < 5; i++) {
                particles.push(new Particle(
                    this.energyCrystal.x + (Math.random() - 0.5) * 40,
                    this.energyCrystal.y + (Math.random() - 0.5) * 40,
                    '#00ffff'
                ));
            }
            
            // 添加调试日志
            console.log(`水晶受到 ${actualDamage} 伤害，剩余血量: ${this.energyCrystal.health}`);
            
            if (this.energyCrystal.health <= 0) {
                this.onCrystalDestroyed();
            }
        }
    }

    onCrystalDestroyed() {
        console.log('能源水晶被摧毁！');
        this.end();
    }

    updateEnergyEyeUI() {
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
    this.enemyEList = [];
    this.enemyFList = [];
    this.energyCrystal = null;
    
    enemies.forEach((enemy, index) => {
        if (enemy.type === 'E' || enemy.type === 'F') {
            enemies.splice(index, 1);
        }
    });

    // 清理所有子弹、导弹、冲击波、黑洞、粒子效果等
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
        enemyBullets.splice(i, 1);
    }
    for (let i = enemyMissiles.length - 1; i >= 0; i--) {
        enemyMissiles.splice(i, 1);
    }
    for (let i = shockWaves.length - 1; i >= 0; i--) {
        shockWaves.splice(i, 1);
    }
    for (let i = blackHoles.length - 1; i >= 0; i--) {
        blackHoles.splice(i, 1);
    }
    for (let i = particles.length - 1; i >= 0; i--) {
        particles.splice(i, 1);
    }
    for (let i = waves.length - 1; i >= 0; i--) {
        waves.splice(i, 1);
    }
    if (typeof energyEyeUI !== 'undefined') {
        energyEyeUI.hide();
    }
    
    window.isCharging = false;
    window.isRightMousePressed = false;
    window.chargeStartTime = 0;
    window.chargeAmount = 0;
    window.isLeftMouseDown = false;

    if (typeof laserAimingMode !== 'undefined') {
            window.laserAimingMode = false; 
        }
        
    if (player) {
            player.canMove = true;
            player.invincible = false;
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
}
    
}
function debugEnergyEye() {
    if (energyEyeDungeon && energyEyeDungeon.isActive) {
        console.log('能源之眼调试信息:');
        console.log('当前波数:', energyEyeDungeon.currentWave);
        console.log('敌人E数量:', energyEyeDungeon.enemyEList.length);
        console.log('敌人F数量:', energyEyeDungeon.enemyFList.length);
        if (energyEyeDungeon.enemyEList.length > 0) {
            const sampleE = energyEyeDungeon.enemyEList[0];
            console.log('敌人E样本 - 生命:', sampleE.health, '攻击:', sampleE.damage);
        }
        console.log('能源水晶生命:', energyEyeDungeon.energyCrystal?.health);
    }
}

class EnergyEyeUI {
    constructor() {
        this.addEnergyEyeStyles();
        this.createEnergyEyeUI();
    }

    addEnergyEyeStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .energy-eye-ui {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 1000;
                pointer-events: none;
                display: none;
            }

            .energy-eye-info {
                position: absolute;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                border: 2px solid #00ffff;
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
                color: #00ffff;
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

            .energy-eye-exit {
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

            .energy-eye-exit:hover {
                background: rgba(255, 0, 0, 1);
                transform: scale(1.05);
            }
        `;
        document.head.appendChild(style);
    }

    createEnergyEyeUI() {
        const container = document.createElement('div');
        container.id = 'energyEyeUI';
        container.className = 'energy-eye-ui';
        container.innerHTML = `
            <div class="energy-eye-info">
                <div class="crystal-status">
                    <div class="crystal-name">能源水晶</div>
                    <div class="crystal-health-bar">
                        <div class="crystal-health-fill" id="crystalHealthFill"></div>
                        <div class="crystal-health-text" id="crystalHealthText">5000/5000</div>
                    </div>
                </div>
                <div class="damage-stats">
                    <div class="stat-item">
                        <div class="stat-label">已造成伤害</div>
                        <div class="stat-value" id="damageDealt">0</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">伤害百分比</div>
                        <div class="stat-value" id="damagePercent">0%</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">当前免伤</div>
                        <div class="stat-value" id="damageReduction">0%</div>
                    </div>
                </div>
            </div>
            <div class="wave-timer">
                <div class="timer-label">下波出现</div>
                <div class="timer-value" id="waveTimerValue">10</div>
            </div>
            <div class="energy-eye-exit" onclick="energyEyeDungeon.confirmExit()">
                退出副本
            </div>
        `;
        document.body.appendChild(container);
    }

    show() {
        const ui = document.getElementById('energyEyeUI');
        if (ui) {
            ui.style.display = 'block';
        }
    }

    hide() {
        const ui = document.getElementById('energyEyeUI');
        if (ui) {
            ui.style.display = 'none';
        }
    }

    updateCrystalStatus(current, max) {
        const healthFill = document.getElementById('crystalHealthFill');
        const healthText = document.getElementById('crystalHealthText');
        const damageDealt = document.getElementById('damageDealt');
        const damagePercent = document.getElementById('damagePercent');
        const damageReduction = document.getElementById('damageReduction');

        if (healthFill && healthText && damageDealt && damagePercent && damageReduction) {
            const healthPercent = current / max;
            const damageAmount = max - current;
            const damagePercentValue = (damageAmount / max) * 100;
            const reductionPercent = (1 - healthPercent) * 100;

            healthFill.style.width = `${healthPercent * 100}%`;
            healthText.textContent = `${Math.floor(current)}/${max}`;
            damageDealt.textContent = Math.floor(damageAmount);
            damagePercent.textContent = `${Math.floor(damagePercentValue)}%`;
            damageReduction.textContent = `${Math.floor(reductionPercent)}%`;
        }
    }

    updateWaveTimer(seconds) {
        const timerValue = document.getElementById('waveTimerValue');
        if (timerValue) {
            timerValue.textContent = Math.max(0, Math.ceil(seconds));
        }
    }
}

const energyEyeUI = new EnergyEyeUI();

const energyEyeDungeon = new EnergyEyeDungeon();
window.energyEyeDungeon = energyEyeDungeon;
