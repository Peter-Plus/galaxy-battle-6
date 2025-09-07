class GameStateManager {
    constructor() {
        this.states = {
            START: 'start',
            MAIN: 'main', 
            ENDLESS: 'endless',
            TIME_VORTEX: 'time_vortex',
            ENERGY_EYE: 'energy_eye',
            STARDUST_ORBIT: 'stardust_orbit',
            ICE_AGE: 'ICE_AGE'  // 新增冰河时代状态
        };
        this.currentState = this.states.START;
        this.previousState = null;
    }

    setState(newState) {
        this.previousState = this.currentState;
        this.currentState = newState;
        this.handleStateChange();
    }

    handleStateChange() {
        this.hideAllScreens();
        
        switch(this.currentState) {
            case this.states.START:
                this.showStartScreen();
                break;
            case this.states.MAIN:
                this.showMainScreen();
                break;
            case this.states.ENDLESS:
                this.showEndlessMode();
                break;
            case this.states.TIME_VORTEX:
                this.showTimeVortexMode();
                break;
            case this.states.ENERGY_EYE:
                this.showEnergyEyeMode();
                break;
            case this.states.STARDUST_ORBIT:
                this.showStardustOrbitMode();
                break;
            case this.states.ICE_AGE:  // 新增冰河时代处理
                this.showIceAgeMode();
                break;
        }
    }

    hideAllScreens() {
        const startContainer = document.getElementById('startContainer');
        const mainContainer = document.getElementById('mainContainer');
        const gameCanvas = document.getElementById('gameCanvas');
        const gameUI = document.querySelector('.ui');
        const bottomIcons = document.getElementById('bottomIcons');
        const shortcutIcons = document.getElementById('shortcutIcons');
        const timeVortexContainer = document.getElementById('timeVortexContainer');
        const energyEyeUI = document.getElementById('energyEyeUI');
        const stardustOrbitUI = document.getElementById('stardustOrbitUI');
        const miracleRealmContainer = document.getElementById('miracleRealmContainer'); // 新增
        
        if (startContainer) startContainer.style.display = 'none';
        if (mainContainer) mainContainer.style.display = 'none';
        if (gameCanvas) gameCanvas.style.display = 'none';
        if (gameUI) gameUI.style.display = 'none';
        if (bottomIcons) bottomIcons.style.display = 'none';
        if (shortcutIcons) shortcutIcons.style.display = 'none';
        if (timeVortexContainer) timeVortexContainer.style.display = 'none';
        if (energyEyeUI) energyEyeUI.style.display = 'none';
        if (stardustOrbitUI) stardustOrbitUI.style.display = 'none';
        if (miracleRealmContainer) miracleRealmContainer.style.display = 'none'; // 新增
        
        const waveInfo = document.querySelector('.wave-info');
        if (waveInfo) waveInfo.style.display = 'none';
    }

    showStartScreen() {
        const startContainer = document.getElementById('startContainer');
        if (startContainer) startContainer.style.display = 'flex';
    }

    showMainScreen() {
        const mainContainer = document.getElementById('mainContainer');
        if (mainContainer) mainContainer.style.display = 'flex';
    }

    showTimeVortexMode() {
        console.log('进入时空漩涡模式');
    }

    showEnergyEyeMode() {
        const gameCanvas = document.getElementById('gameCanvas');
        const gameUI = document.querySelector('.ui');
        const energyEyeUI = document.getElementById('energyEyeUI');
        const skillBar = document.querySelector('.skill-bar');
        
        if (gameCanvas) gameCanvas.style.display = 'block';
        if (gameUI) gameUI.style.display = 'block';
        if (skillBar) skillBar.style.display = 'flex';
        
        if (energyEyeUI) energyEyeUI.style.display = 'block';
        
        this.showShortcutIcons();
        
        console.log('进入能源之眼副本模式');
    }

    showStardustOrbitMode() {
        const gameCanvas = document.getElementById('gameCanvas');
        const gameUI = document.querySelector('.ui');
        const stardustOrbitUI = document.getElementById('stardustOrbitUI');
        const skillBar = document.querySelector('.skill-bar');
        
        if (gameCanvas) gameCanvas.style.display = 'block';
        if (gameUI) gameUI.style.display = 'block';
        if (skillBar) skillBar.style.display = 'flex';
        
        if (stardustOrbitUI) stardustOrbitUI.style.display = 'block';
        
        this.showShortcutIcons();
        
        console.log('进入星尘轨道副本模式');
    }

    // 新增：冰河时代模式显示
    showIceAgeMode() {
        const gameCanvas = document.getElementById('gameCanvas');
        const gameUI = document.querySelector('.ui');
        const skillBar = document.querySelector('.skill-bar');
        
        if (gameCanvas) gameCanvas.style.display = 'block';
        if (gameUI) gameUI.style.display = 'block';
        if (skillBar) skillBar.style.display = 'flex';
        
        // 【关键】隐藏波次显示，这是与无尽征程的唯一UI区别
        const waveInfo = document.querySelector('.wave-info');
        if (waveInfo) waveInfo.style.display = 'none';
        
        this.showShortcutIcons();
        
        console.log('进入冰河时代副本模式');
    }

    showShortcutIcons() {
        let shortcutIcons = document.getElementById('shortcutIcons');
        if (!shortcutIcons) {
            shortcutIcons = document.createElement('div');
            shortcutIcons.id = 'shortcutIcons';
            shortcutIcons.className = 'shortcut-icons';
            shortcutIcons.innerHTML = `
                <div class="shortcut-icon">
                    <img src="assets/inventory.png" alt="背包">
                    <span>P</span>
                </div>
                <div class="shortcut-icon">
                    <img src="assets/shop.png" alt="商店">
                    <span>V</span>
                </div>
                <div class="shortcut-icon">
                    <img src="assets/main.png" alt="主界面">
                    <span>M</span>
                </div>
            `;
            document.body.appendChild(shortcutIcons);
        }
        shortcutIcons.style.display = 'flex';
    }

    showEndlessMode() {
        const gameCanvas = document.getElementById('gameCanvas');
        const gameUI = document.querySelector('.ui');
        const waveInfo = document.querySelector('.wave-info');
        const skillBar = document.querySelector('.skill-bar');
        
        if (gameCanvas) gameCanvas.style.display = 'block';
        if (gameUI) gameUI.style.display = 'block';
        if (waveInfo) waveInfo.style.display = 'block';
        if (skillBar) skillBar.style.display = 'flex';
        
        this.showShortcutIcons();
        this.cleanupForEndless();
        
        if (typeof startGame === 'function') {
            startGame();
            setTimeout(() => {
                if (typeof startWave === 'function' && gameStateManager.isInGame()) {
                    startWave(currentWave || 1);
                }
            }, 500);
        }
    }

    cleanupForEndless() {
    // 清除所有场景残留物
    bullets.length = 0;
    enemyBullets.length = 0;
    enemyMissiles.length = 0;
    enemies.length = 0;
    waves.length = 0;
    particles.length = 0;
    blackHoles.length = 0;
    shockWaves.length = 0;
    crystalCores.length = 0;
    droppedItems.length = 0;
    enemySpawnQueue.length = 0;
    
    // 清除小型机管理器的状态
    if (window.miniShipManager) {
        window.miniShipManager.miniShips.length = 0;
    }
    
    // 重置游戏状态变量
    waveEnemiesKilled = 0;
    waveInProgress = false;
    waitingForCrystalChoice = false;
    bossDefeated = false;
    gameState = 'playing';
    nextWavePortal = null;
    
    // 重置技能冷却
    skillCooldowns = { 1: 0, 2: 0, 3: 0 };
    consumableCooldown = 0;
    
    // 恢复玩家满属性值
    player.health = player.maxHealth;
    player.energy = player.maxEnergy;
    player.invincible = false;
    player.invincibilityTimer = 0;
    player.shield = false;
    player.shieldTime = 0;
    player.stunned = false;
    player.stunTime = 0;
    
    // 清除充能状态
    isCharging = false;
    chargeAmount = 0;
    isRightMousePressed = false;
    
    // 清除特殊模式状态
    if (window.tripleShotMode) {
        window.tripleShotMode = false;
        window.tripleShotCount = 0;
        window.tripleShotFired = 0;
    }
    
    if (typeof laserAimingMode !== 'undefined') {
            window.laserAimingMode = false;  // 使用 window 确保修改全局变量
            player.canMove = true;
            player.invincible = false;
        }
        
        // 【新增】清理所有全局鼠标状态
        window.isLeftMouseDown = false;
        window.isRightMousePressed = false;
        window.isCharging = false;
        window.chargeAmount = 0;
        window.mouseX = canvas.width / 2;
        window.mouseY = canvas.height / 2;
    
    // 重置连击系统
    if (typeof resetCombo === 'function') {
        resetCombo();
    }
    
    // 重置被动效果战斗状态
    if (typeof passiveEffects !== 'undefined' && passiveEffects.resetBattleState) {
        passiveEffects.resetBattleState();
    }
    
    // 隐藏充能条
    const chargeBar = document.querySelector('.charge-bar');
    if (chargeBar) chargeBar.style.display = 'none';
    
    // 更新UI显示
    updateSkillUI();
    updateHealthBar();
    updateEnergyBar();
}

    goToMain() {
        this.setState(this.states.MAIN);
    }

    goToEndless() {
        this.setState(this.states.ENDLESS);
    }

    goToTimeVortex() {
        this.setState(this.states.TIME_VORTEX);
    }

    goToEnergyEye() {
        this.setState(this.states.ENERGY_EYE);
    }

    goToStardustOrbit() {
        this.setState(this.states.STARDUST_ORBIT);
    }

    // 新增：进入冰河时代
    goToIceAge() {
        this.setState(this.states.ICE_AGE);
    }

    returnToMainFromDungeon() {
        this.setState(this.states.MAIN);
        
        if (typeof energyEyeDungeon !== 'undefined' && energyEyeDungeon.cleanup) {
            energyEyeDungeon.cleanup();
        }
        if (typeof stardustOrbitDungeon !== 'undefined' && stardustOrbitDungeon.cleanup) {
            stardustOrbitDungeon.cleanup();
        }
        // 新增：冰河时代清理
        if (typeof iceAgeDungeon !== 'undefined' && iceAgeDungeon.cleanup) {
            iceAgeDungeon.cleanup();
        }
    }

    onPlayerDeath() {
        if (this.isInEnergyEye()) {
            if (typeof energyEyeDungeon !== 'undefined' && energyEyeDungeon.end) {
                energyEyeDungeon.end();
            }
            this.setState(this.states.MAIN);
        } else if (this.isInStardustOrbit()) {
            if (typeof stardustOrbitDungeon !== 'undefined' && stardustOrbitDungeon.end) {
                stardustOrbitDungeon.end();
            }
            this.setState(this.states.MAIN);
        } else if (this.isInIceAge()) {  // 新增：冰河时代死亡处理
            if (typeof iceAgeDungeon !== 'undefined' && iceAgeDungeon.end) {
                iceAgeDungeon.end();
            }
            this.setState(this.states.MAIN);
        } else {
            this.setState(this.states.MAIN);
        }
    }

    getCurrentState() {
        return this.currentState;
    }

    isInGame() {
        return this.currentState === this.states.ENDLESS;
    }

    isInTimeVortex() {
        return this.currentState === this.states.TIME_VORTEX;
    }

    isInEnergyEye() {
        return this.currentState === this.states.ENERGY_EYE;
    }

    isInStardustOrbit() {
        return this.currentState === this.states.STARDUST_ORBIT;
    }

    // 新增：检查是否在冰河时代
    isInIceAge() {
        return this.currentState === this.states.ICE_AGE;
    }

    isInAnyDungeon() {
        return this.isInTimeVortex() || this.isInEnergyEye() || this.isInStardustOrbit() || this.isInIceAge();
    }

    getPreviousState() {
        return this.previousState;
    }

    goToPreviousState() {
        if (this.previousState) {
            this.setState(this.previousState);
        } else {
            this.goToMain();
        }
    }

    canEnterTimeVortexDungeon(dungeonType) {
        switch (dungeonType) {
            case 'energyEye':
                return true;
            case 'stardustOrbit':
                return currentWave >= 20;
            default:
                return false;
        }
    }

    getCurrentDungeonType() {
        switch (this.currentState) {
            case this.states.ENERGY_EYE:
                return 'energyEye';
            case this.states.STARDUST_ORBIT:
                return 'stardustOrbit';
            case this.states.ICE_AGE:  // 新增
                return 'iceAge';
            default:
                return null;
        }
    }

    exitCurrentDungeon() {
        const currentDungeon = this.getCurrentDungeonType();
        
        if (currentDungeon === 'energyEye' && typeof energyEyeDungeon !== 'undefined') {
            energyEyeDungeon.end();
        } else if (currentDungeon === 'stardustOrbit' && typeof stardustOrbitDungeon !== 'undefined') {
            stardustOrbitDungeon.end();
        } else if (currentDungeon === 'iceAge' && typeof iceAgeDungeon !== 'undefined') {  // 新增
            iceAgeDungeon.end();
        }
        
        this.setState(this.states.MAIN);
    }
}

const gameStateManager = new GameStateManager();