const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let nextWavePortal = null;
let currentGameState = 'start';
let gameRunning = false;
let level = 1;
let experience = 0;
let expToNextLevel = 100;
let attackPower = 10;
let baseAttackPower = 10;
let currentWave = 1;
let waveEnemiesKilled = 0;
let waveInProgress = false;
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
let isCharging = false;
let chargeAmount = 0;
let chargeStartTime = 0;
let skillCooldowns = { 1: 0, 2: 0, 3: 0 };
const maxSkillCooldowns = { 1: 7000, 2: 8000, 3: 10000 };
let isRightMousePressed = false;
let laserAimingMode = false;
let tripleShotMode = false;
let tripleShotCount = 0;
let tripleShotFired = 0;

let consumableCooldown = 0;
const CONSUMABLE_COOLDOWN_TIME = 10000;

let lastTime = 0;
let deltaTime = 0;
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;

let currentSaveId = null;
let autoSaveTimer = 0;
const AUTO_SAVE_INTERVAL = 30000;

let crystalCores = [];
let gameState = 'playing';
let explosionCoreCount = 0;
let survivalCoreCount = 0;
let tacticalCoreCount = 0;
let lifeStealMultiplier = 1;

window.totalExplosionBonus = 0;
window.totalSurvivalLifeStealBonus = 0;
window.totalSurvivalHealthBonus = 0;
window.totalTacticalCooldownBonus = 0;
window.totalTacticalEnergyBonus = 0;

let equipmentStats = {
    attack: 0,
    lifeSteal: 0,
    health: 0,
    defense: 0,
    reflect: 0,
    energyRegen: 0,
    maxEnergy: 0
};

let waitingForCrystalChoice = false;
let bossDefeated = false;

let blackHoles = [];
let shockWaves = [];

let enemySpawnQueue = [];
let enemySpawnTimer = 0;
let enemySpawnInterval = 800;

const player = new Player();
window.player = player;  
const bullets = [];
const enemyBullets = [];
const enemyMissiles = [];
const enemies = [];
const waves = [];
const particles = [];
const stars = [];

for (let i = 0; i < 100; i++) {
    stars.push(new Star());
}

// 1. 修复后的 saveGame 函数
function saveGame(saveName, saveId = null) {
    // 计算当前战斗力
    let combatPower = 0;
    if (typeof inventory !== 'undefined' && inventory.calculateCombatPower) {
        // 构建与背包界面完全一致的属性对象
        const totalStats = {
            health: player.maxHealth || 1000,
            attack: attackPower || 10,
            defense: player.defense || 0,
            reflect: equipmentStats.reflect || 0,
            // 修正：吸血计算要区分基础倍率和装备加成
            lifeSteal: (lifeStealMultiplier - 1) + (equipmentStats.lifeSteal || 0),
            energyRegen: player.energyRegen || 0.5,
            energy: player.maxEnergy || 100
        };
        
        combatPower = inventory.calculateCombatPower(totalStats);
    }
    
    const saveData = {
        id: saveId || Date.now().toString(),
        name: saveName,
        timestamp: Date.now(),
        characterType: player.characterType,
        combatPower: combatPower,  // 新增：保存战斗力
        player: {
            maxHealth: player.maxHealth,
            maxEnergy: player.maxEnergy,
            defense: player.defense,
            energyRegen: player.energyRegen
        },
        game: {
            level,
            experience,
            expToNextLevel,
            attackPower,
            baseAttackPower,
            currentWave,
            lifeStealMultiplier
        },
        crystals: {
            explosionCoreCount,
            survivalCoreCount,
            tacticalCoreCount,
            totalExplosionBonus: window.totalExplosionBonus,
            totalSurvivalLifeStealBonus: window.totalSurvivalLifeStealBonus,
            totalSurvivalHealthBonus: window.totalSurvivalHealthBonus,
            totalTacticalCooldownBonus: window.totalTacticalCooldownBonus,
            totalTacticalEnergyBonus: window.totalTacticalEnergyBonus
        },
        inventory: inventory.getInventoryData(),
        equipmentStats: { ...equipmentStats },
        treasureData: inventory.getTreasureData(),
        dailyProgress: {
            attempts: {
                energyEye: timeVortexManager ? timeVortexManager.usedAttempts.energyEye : 0,
                stardustOrbit: timeVortexManager ? timeVortexManager.usedAttempts.stardustOrbit : 0
            }
        },
        miracleRealmProgress: {
            iceAge: miracleRealmManager ? miracleRealmManager.usedAttempts.iceAge : 0
        },
        achievement: typeof achievementSystem !== 'undefined' ? achievementSystem.getSaveData() : {
            achievements: {},
            achievementPoints: 0,
            achievementMedals: 0,
            shopItems: []
        }
    };
    
    const saves = JSON.parse(localStorage.getItem('galacticWarshipSaves') || '{}');
    saves[saveData.id] = saveData;
    localStorage.setItem('galacticWarshipSaves', JSON.stringify(saves));
    
    return saveData.id;
}



function updateSkillUI() {
    Object.keys(skillCooldowns).forEach(key => {
        const skillEl = document.querySelector(`[data-skill="${key}"]`);
        if (skillEl) {
            const cooldownText = skillEl.querySelector('.cooldown-text');
            
            if (skillCooldowns[key] <= 0) {
                skillEl.classList.remove('cooldown');
                skillEl.classList.add('ready');
                if (cooldownText) cooldownText.textContent = '';
            } else {
                skillEl.classList.remove('ready');
                skillEl.classList.add('cooldown');
                const secondsLeft = Math.ceil(skillCooldowns[key] / 1000);
                if (cooldownText) cooldownText.textContent = secondsLeft > 0 ? secondsLeft : '';
            }
        }
    });
}


function loadGame(saveId) {
    const saves = JSON.parse(localStorage.getItem('galacticWarshipSaves') || '{}');
    const saveData = saves[saveId];
    
    if (!saveData) return false;
    // ===== 关键：在载入游戏时检查是否需要刷新 =====
    const needsRefresh = dailyLoginManager.needsDailyRefresh(saveId);
    // 加载角色类型并初始化
    if (saveData.characterType) {
        player.initializeForCharacter(saveData.characterType);
    }
    
    // 加载成就系统数据（新增）
    if (typeof achievementSystem !== 'undefined' && saveData.achievement) {
        achievementSystem.loadSaveData(saveData.achievement);
    }
    
    player.maxHealth = saveData.player.maxHealth;
    player.maxEnergy = saveData.player.maxEnergy;
    player.defense = saveData.player.defense;
    player.energyRegen = saveData.player.energyRegen;
    
    player.health = player.maxHealth;
    player.energy = player.maxEnergy;
    
    level = saveData.game.level;
    experience = saveData.game.experience;
    expToNextLevel = saveData.game.expToNextLevel;
    attackPower = saveData.game.attackPower;
    baseAttackPower = saveData.game.baseAttackPower;
    currentWave = saveData.game.currentWave;
    lifeStealMultiplier = saveData.game.lifeStealMultiplier;
    
    explosionCoreCount = saveData.crystals.explosionCoreCount;
    survivalCoreCount = saveData.crystals.survivalCoreCount;
    tacticalCoreCount = saveData.crystals.tacticalCoreCount;
    window.totalExplosionBonus = saveData.crystals.totalExplosionBonus;
    window.totalSurvivalLifeStealBonus = saveData.crystals.totalSurvivalLifeStealBonus;
    window.totalSurvivalHealthBonus = saveData.crystals.totalSurvivalHealthBonus;
    window.totalTacticalCooldownBonus = saveData.crystals.totalTacticalCooldownBonus;
    window.totalTacticalEnergyBonus = saveData.crystals.totalTacticalEnergyBonus;
    
    // 先重置被动效果状态
    if (typeof passiveEffects !== 'undefined') {
        passiveEffects.resetBattleState();
    }
    
    // 然后加载装备数据，这会重新激活被动效果
    inventory.loadInventoryData(saveData.inventory, saveData.treasureData);

    if (needsRefresh) {
        console.log('检测到日期变更，执行每日刷新...');
        
        // 重置所有副本次数
        if (timeVortexManager) {
            timeVortexManager.resetDailyAttempts();
        }
        if (miracleRealmManager) {
            miracleRealmManager.resetDaily();
        }
        
    } else {
        // 不需要刷新，正常加载进度
        if (timeVortexManager && saveData.dailyProgress) {
            timeVortexManager.loadProgressFromSave(saveData.dailyProgress);
        } else if (timeVortexManager) {
            timeVortexManager.loadProgressFromSave(null);
        }
        
        if (miracleRealmManager && saveData.miracleRealmProgress) {
            miracleRealmManager.loadProgressFromSave(saveData.miracleRealmProgress);
        } else if (miracleRealmManager) {
            miracleRealmManager.loadProgressFromSave(null);
        }
    }
    
    // ===== 关键：更新此存档的登录时间（只在这里更新） =====
    dailyLoginManager.updateLoginTime(saveId);
    
    // 更新所有UI显示（保持原有函数名）
    updateHealthBar();
    updateEnergyBar();
    updateExpBar();
    updateDefenseDisplay();
    document.getElementById('level').textContent = level;
    document.getElementById('attack').textContent = attackPower;
    document.getElementById('wave').textContent = currentWave;
    if (needsRefresh && typeof autoSave === 'function') {
        setTimeout(() => {
            autoSave();
            console.log('每日刷新后的数据已保存');
        }, 100);
    }
    return true;
}

function deleteSave(saveId) {
    const saves = JSON.parse(localStorage.getItem('galacticWarshipSaves') || '{}');
    delete saves[saveId];
    localStorage.setItem('galacticWarshipSaves', JSON.stringify(saves));
    dailyLoginManager.removeSaveRecord(saveId);
}

function getSaves() {
    return JSON.parse(localStorage.getItem('galacticWarshipSaves') || '{}');
}

function startNewGame() {
    level = 1;
    experience = 0;
    expToNextLevel = 100;
    attackPower = 10;
    baseAttackPower = 10;
    currentWave = 1;
    waveEnemiesKilled = 0;
    waveInProgress = false;
    lifeStealMultiplier = 1;
    
    explosionCoreCount = 0;
    survivalCoreCount = 0;
    tacticalCoreCount = 0;
    window.totalExplosionBonus = 0;
    window.totalSurvivalLifeStealBonus = 0;
    window.totalSurvivalHealthBonus = 0;
    window.totalTacticalCooldownBonus = 0;
    window.totalTacticalEnergyBonus = 0;
    
    equipmentStats = {
        attack: 0,
        lifeSteal: 0,
        health: 0,
        defense: 0,
        reflect: 0,
        energyRegen: 0,
        maxEnergy: 0
    };
    
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
    
    skillCooldowns = { 1: 0, 2: 0, 3: 0 };
    consumableCooldown = 0;
    autoSaveTimer = 0;
    waitingForCrystalChoice = false;
    bossDefeated = false;
    gameState = 'playing';
    
    player.reset();
    inventory.reset();
    
    if (typeof passiveEffects !== 'undefined') {
        passiveEffects.resetBattleState();
    }
    
    if (timeVortexManager) {
        timeVortexManager.loadProgressFromSave(null);
    }
    // ===== 新增：为新游戏记录登录时间 =====
    if (currentSaveId) {
        dailyLoginManager.updateLoginTime(currentSaveId);
    }
    
    updateHealthBar();
    updateEnergyBar();
    updateExpBar();
    updateDefenseDisplay();
    document.getElementById('level').textContent = level;
    document.getElementById('attack').textContent = attackPower;
    document.getElementById('wave').textContent = currentWave;
}

function startGame(saveId = null) {
    if (saveId) {
        if (!loadGame(saveId)) {
            startNewGame();
        }
        currentSaveId = saveId;
    } else if (currentSaveId) {
        if (!loadGame(currentSaveId)) {
            startNewGame();
        }
    } else {
        startNewGame();
        currentSaveId = null;
    }
    
    gameRunning = true;
    autoSaveTimer = 0;
    
    setTimeout(() => {
        if (gameStateManager.isInGame() && gameRunning) {
            startWave(currentWave);
        }
    }, 1000);
}

function autoSave() {
    if (currentSaveId) {
        const saves = JSON.parse(localStorage.getItem('galacticWarshipSaves') || '{}');
        const currentSave = saves[currentSaveId];
        if (currentSave) {
            // autoSave 直接调用 saveGame，它会自动计算战斗力
            saveGame(currentSave.name, currentSaveId);
        }
    }
}

document.addEventListener('keydown', (e) => {
    if (!gameStateManager.isInGame()) return;
    
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
    showMainMenuConfirm();
    return;
    }

    
if (e.key === '4') {
    e.preventDefault();
    
    // 法宝使用逻辑 - 移除所有通知
    if (inventory.treasureSlot && inventory.treasureSlot.canUse()) {
        inventory.treasureSlot.use(player, enemies);
    }
    return;
}

    if (e.key === ' ') {
    if (nextWavePortal && nextWavePortal.checkPlayerCollision(player.x, player.y)) {
        player.health = player.maxHealth;
        player.energy = player.maxEnergy;
        updateHealthBar();
        updateEnergyBar();
        nextWavePortal = null;
        
        currentWave++;
        document.getElementById('wave').textContent = currentWave;
        
        if (typeof passiveEffects !== 'undefined') {
            passiveEffects.resetBattleState();
        }
        
        autoSave();
        startWave(currentWave);
    }
    return;
    }
    
    if (!gameRunning || gameState === 'choosing_crystal' || inventory.isOpen || shop.isOpen) return;
    
    if (!player.canUseSkills()) return;
    
    switch(e.key) {
        case '1':
            skill1();
            break;
        case '2':
            skill2();
            break;
        case '3':
            skill3();
            break;
    }
});

function handleConsumableUse() {
    if (!gameRunning || gameState === 'choosing_crystal' || inventory.isOpen || shop.isOpen) return;
    
    if (consumableCooldown > 0) {
        showConsumableCooldownNotification();
        return;
    }
    
    if (!inventory.consumableSlot) {
        showNoConsumableNotification();
        return;
    }
    
    const success = inventory.useConsumableSlot();
    if (success) {
        consumableCooldown = CONSUMABLE_COOLDOWN_TIME;
    }
}

function showConsumableCooldownNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 30%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 0, 0, 0.8);
        border: 2px solid #ff0000;
        border-radius: 8px;
        padding: 10px 20px;
        color: #ffffff;
        font-size: 16px;
        font-weight: bold;
        z-index: 999;
        animation: fadeOut 1s ease-out forwards;
    `;
    
    const remainingTime = Math.ceil(consumableCooldown / 1000);
    notification.textContent = `道具冷却中... ${remainingTime}秒`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 1000);
}

function showNoConsumableNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 30%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 100, 0, 0.8);
        border: 2px solid #ff6600;
        border-radius: 8px;
        padding: 10px 20px;
        color: #ffffff;
        font-size: 16px;
        font-weight: bold;
        z-index: 999;
        animation: fadeOut 1.5s ease-out forwards;
    `;
    
    notification.textContent = '没有道具可用！';
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 1500);
}

function fireLaserCannon(targetX, targetY) {
    if (!window.laserAimingMode) return;
    
    const angle = Math.atan2(targetY - player.y, targetX - player.x);
    const laserDamage = attackPower * 3;
    
    const playerShockWave = new ShockWave(player.x, player.y, angle, laserDamage, player);
    playerShockWave.warningTime = 30;
    playerShockWave.activeTime = 60;
    playerShockWave.isPlayerShockWave = true;
    playerShockWave.hitEnemies = new Set(); 
    shockWaves.push(playerShockWave);
    
    if (window.miniShipManager) {
        window.miniShipManager.miniShips.forEach(ship => {
            if (!ship.isDead) {
                // 计算从小型机位置指向鼠标的角度
                const shipAngle = Math.atan2(targetY - ship.y, targetX - ship.x);
                const shipShockWave = new ShockWave(ship.x, ship.y, shipAngle, laserDamage, ship);
                shipShockWave.warningTime = 30;
                shipShockWave.activeTime = 60;
                shipShockWave.isPlayerShockWave = true;
                shipShockWave.hitEnemies = new Set();
                shockWaves.push(shipShockWave);
            }
        });
    }
    
    window.laserAimingMode = false;
    
    // 使用真实时间延迟，总共1.5秒（0.5秒预警 + 1秒冲击波）
    setTimeout(() => {
        player.canMove = true;
        player.invincible = false;
    }, 1500);
    
    const hint = document.getElementById('laserAimHint');
    if (hint) {
        hint.remove();
    }
}

function drawLaserTrajectory() {
    if (!window.laserAimingMode) return;
    
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ff0000';
    
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
    ctx.lineTo(mouseX, mouseY);
    ctx.stroke();
    
    // 无垠高级聚能特效
    drawAdvancedChargingEffect(player.x, player.y, 1.0);
    
    if (window.miniShipManager) {
        window.miniShipManager.miniShips.forEach(ship => {
            if (!ship.isDead) {
                ctx.beginPath();
                ctx.moveTo(ship.x, ship.y);
                ctx.lineTo(mouseX, mouseY);
                ctx.stroke();
                
                // 小型机高级聚能特效
                drawAdvancedChargingEffect(ship.x, ship.y, 0.6);
            }
        });
    }
    
    ctx.restore();
}

function drawAdvancedChargingEffect(x, y, scale = 1.0) {
    const time = Date.now();
    
    ctx.save();
    ctx.translate(x, y);
    
    // 1. 多层能量波纹
    for (let layer = 0; layer < 4; layer++) {
        const offset = layer * 300;
        const radius = ((time + offset) * 0.03) % 80 + 30;
        const alpha = (1 - (radius - 30) / 50) * 0.6 * scale;
        
        ctx.strokeStyle = `rgba(255, ${50 + layer * 30}, ${50 + layer * 30}, ${alpha})`;
        ctx.lineWidth = 3 - layer * 0.5;
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#ff3333';
        ctx.beginPath();
        ctx.arc(0, 0, radius * scale, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // 2. 高速旋转能量螺旋
    for (let spiral = 0; spiral < 3; spiral++) {
        const spiralOffset = spiral * Math.PI * 2 / 3;
        for (let i = 0; i < 12; i++) {
            const angle = time * 0.008 + spiralOffset + i * Math.PI / 6;
            const radius = 25 + i * 3;
            const particleX = Math.cos(angle) * radius * scale;
            const particleY = Math.sin(angle) * radius * scale;
            
            const alpha = 0.8 - i * 0.05;
            ctx.fillStyle = `rgba(255, ${150 - i * 8}, ${150 - i * 8}, ${alpha})`;
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#ff6666';
            ctx.beginPath();
            ctx.arc(particleX, particleY, (3 - i * 0.15) * scale, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // 3. 电弧闪电效果
    for (let arc = 0; arc < 6; arc++) {
        const arcAngle = time * 0.01 + arc * Math.PI / 3;
        const arcLength = 40 * scale;
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.7 + Math.sin(time * 0.02 + arc) * 0.3})`;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffffff';
        
        // 绘制锯齿状电弧
        ctx.beginPath();
        ctx.moveTo(0, 0);
        
        for (let seg = 0; seg < 8; seg++) {
            const segAngle = arcAngle + (seg / 8) * 0.3;
            const segRadius = (seg / 8) * arcLength;
            const jitter = Math.sin(time * 0.05 + seg + arc) * 5 * scale;
            
            const segX = Math.cos(segAngle) * segRadius + jitter;
            const segY = Math.sin(segAngle) * segRadius + jitter;
            ctx.lineTo(segX, segY);
        }
        ctx.stroke();
    }
    
    // 4. 聚能核心
    const coreSize = 8 + Math.sin(time * 0.02) * 4;
    const corePulse = Math.sin(time * 0.025) * 0.5 + 0.8;
    
    // 核心外环
    ctx.strokeStyle = `rgba(255, 200, 200, ${corePulse})`;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ffcccc';
    ctx.beginPath();
    ctx.arc(0, 0, coreSize * scale, 0, Math.PI * 2);
    ctx.stroke();
    
    // 核心内部
    ctx.fillStyle = `rgba(255, 255, 255, ${corePulse})`;
    ctx.shadowBlur = 25;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, (coreSize - 3) * scale, 0, Math.PI * 2);
    ctx.fill();
    
    // 5. 能量爆发射线
    for (let burst = 0; burst < 16; burst++) {
        const burstAngle = time * 0.004 + burst * Math.PI / 8;
        const burstLength = 50 + Math.sin(time * 0.006 + burst) * 15;
        
        const startX = Math.cos(burstAngle) * 12 * scale;
        const startY = Math.sin(burstAngle) * 12 * scale;
        const endX = Math.cos(burstAngle) * burstLength * scale;
        const endY = Math.sin(burstAngle) * burstLength * scale;
        
        const burstAlpha = 0.3 + Math.sin(time * 0.015 + burst) * 0.2;
        
        // 创建渐变效果
        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${burstAlpha})`);
        gradient.addColorStop(0.5, `rgba(255, 100, 100, ${burstAlpha * 0.7})`);
        gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#ff8888';
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
    
    // 6. 外围冲击波
    const shockRadius = 60 + Math.sin(time * 0.005) * 20;
    const shockAlpha = 0.4 + Math.sin(time * 0.008) * 0.3;
    
    ctx.strokeStyle = `rgba(255, 0, 0, ${shockAlpha})`;
    ctx.lineWidth = 6;
    ctx.shadowBlur = 30;
    ctx.shadowColor = '#ff0000';
    ctx.beginPath();
    ctx.arc(0, 0, shockRadius * scale, 0, Math.PI * 2);
    ctx.stroke();
    
    // 内层冲击波
    ctx.strokeStyle = `rgba(255, 150, 150, ${shockAlpha * 0.8})`;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff9999';
    ctx.beginPath();
    ctx.arc(0, 0, (shockRadius - 15) * scale, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
}

function drawChargingEffect(x, y) {
    const time = Date.now();
    
    ctx.save();
    ctx.translate(x, y);
    
    // 主聚能环
    const mainPulse = Math.sin(time * 0.01) * 0.3 + 0.7;
    ctx.strokeStyle = `rgba(255, 50, 50, ${mainPulse})`;
    ctx.lineWidth = 4;
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#ff3333';
    ctx.beginPath();
    ctx.arc(0, 0, 35 + Math.sin(time * 0.008) * 8, 0, Math.PI * 2);
    ctx.stroke();
    
    // 旋转能量粒子
    for (let i = 0; i < 6; i++) {
        const angle = time * 0.005 + i * Math.PI / 3;
        const radius = 25 + Math.sin(time * 0.006 + i) * 5;
        const particleX = Math.cos(angle) * radius;
        const particleY = Math.sin(angle) * radius;
        
        ctx.fillStyle = `rgba(255, 100, 100, ${0.8 + Math.sin(time * 0.01 + i) * 0.2})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ff6666';
        ctx.beginPath();
        ctx.arc(particleX, particleY, 2 + Math.sin(time * 0.012 + i) * 1, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 核心能量球
    const corePulse = Math.sin(time * 0.015) * 0.4 + 0.6;
    ctx.fillStyle = `rgba(255, 255, 255, ${corePulse})`;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 4 + Math.sin(time * 0.02) * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // 聚能射线
    for (let i = 0; i < 8; i++) {
        const angle = time * 0.003 + i * Math.PI / 4;
        const startRadius = 15;
        const endRadius = 30 + Math.sin(time * 0.008 + i) * 5;
        
        const startX = Math.cos(angle) * startRadius;
        const startY = Math.sin(angle) * startRadius;
        const endX = Math.cos(angle) * endRadius;
        const endY = Math.sin(angle) * endRadius;
        
        const lineAlpha = 0.4 + Math.sin(time * 0.01 + i) * 0.3;
        ctx.strokeStyle = `rgba(255, 150, 150, ${lineAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#ff9999';
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
    
    ctx.restore();
}

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

canvas.addEventListener('click', (e) => {
    const canUseSkills = gameStateManager.isInGame() || gameStateManager.isInAnyDungeon();
    
    if (!canUseSkills || !gameRunning || inventory.isOpen || shop.isOpen) return;
    
    if (window.laserAimingMode) {
        fireLaserCannon(mouseX, mouseY);
        return;
    }
    
    if (gameState === 'choosing_crystal') {
        crystalCores.forEach(core => {
            if (core.isClicked(mouseX, mouseY)) {
                const fromItem = window.crystalChoiceFromItem || false;
                window.crystalChoiceFromItem = false;
                selectCrystalCore(core.type, fromItem);
            }
        });
        return;
    }
});

canvas.addEventListener('mousedown', (e) => {
    if (e.button === 2) {
        e.preventDefault();
        
        const canUseSkills = gameStateManager.isInGame() || gameStateManager.isInAnyDungeon();
        
        if (!canUseSkills || !gameRunning || gameState === 'choosing_crystal' || inventory.isOpen || shop.isOpen) return;
        
        if (!isRightMousePressed) {
            isRightMousePressed = true;
            isCharging = true;
            chargeStartTime = Date.now();
            chargeAmount = 0;
            document.querySelector('.charge-bar').style.display = 'block';
        }
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (e.button === 2 && isRightMousePressed) {
        e.preventDefault();
        isRightMousePressed = false;
        if (isCharging) {
            const chargeTime = Date.now() - chargeStartTime;
            if (chargeTime > 200) {
                waves.push(new Wave(player.x, player.y, chargeTime));
            }
            isCharging = false;
            chargeAmount = 0;
            document.querySelector('.charge-bar').style.display = 'none';
            const chargeFill = document.querySelector('.charge-fill');
            if (chargeFill) chargeFill.style.width = '0%';
        }
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (e.button === 2 && isRightMousePressed) {
        e.preventDefault();
        isRightMousePressed = false;
        if (isCharging) {
            const chargeTime = Date.now() - chargeStartTime;
            if (chargeTime > 200) {
                waves.push(new Wave(player.x, player.y, chargeTime));
            }
            isCharging = false;
            chargeAmount = 0;
            document.querySelector('.charge-bar').style.display = 'none';
            document.querySelector('.charge-fill').style.width = '0%';
        }
    }
});

canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

canvas.addEventListener('mouseleave', (e) => {
    if (isRightMousePressed) {
        isRightMousePressed = false;
        if (isCharging) {
            const chargeTime = Date.now() - chargeStartTime;
            if (chargeTime > 200) {
                waves.push(new Wave(player.x, player.y, chargeTime));
            }
            isCharging = false;
            chargeAmount = 0;
            document.querySelector('.charge-bar').style.display = 'none';
            document.querySelector('.charge-fill').style.width = '0%';
        }
    }
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

function updateEnemySpawning() {
    if (!gameRunning || !gameStateManager.isInGame() || inventory.isOpen || shop.isOpen) {
        return;
    }
    
    if (enemySpawnQueue.length === 0) {
        return;
    }
    
    enemySpawnTimer += deltaTime;
    
    for (let i = enemySpawnQueue.length - 1; i >= 0; i--) {
        const spawnData = enemySpawnQueue[i];
        
        if (enemySpawnTimer >= spawnData.spawnTime) {
            const enemy = new Enemy(spawnData.type);
            if (spawnData.type !== 'BOSS') {
                enemy.x = Math.random() * canvas.width;
            }
            enemies.push(enemy);
            
            enemySpawnQueue.splice(i, 1);
        }
    }
}

function gameLoop(currentTime) {
    if (typeof timeVortexOptimizer !== 'undefined') {
        timeVortexOptimizer.update();
    }
    // 处理开始界面
    if (gameStateManager.getCurrentState() === 'start') {
        startScreen.render();
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // 处理能源之眼副本
    if (gameStateManager.isInEnergyEye()) {
        // 计算 deltaTime
        if (lastTime === 0) lastTime = currentTime;
        deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        // 清空画布
        ctx.fillStyle = '#000011'; // 深蓝色背景，区别于其他模式
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制星空背景
        stars.forEach(star => {
            star.update();
            star.draw();
        });

        if (inventory.isOpen || shop.isOpen) {
        // 绘制所有对象但不更新它们
        if (energyEyeDungeon && energyEyeDungeon.isActive && energyEyeDungeon.energyCrystal) {
            drawEnergyCoreCrystal();
        }
        drawGameObjects();
        
        
        // 添加暂停遮罩
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 显示能源之眼UI（但不更新倒计时）
        if (typeof energyEyeUI !== 'undefined') {
            energyEyeUI.show();
            if (energyEyeDungeon && energyEyeDungeon.energyCrystal) {
                energyEyeUI.updateCrystalStatus(
                    energyEyeDungeon.energyCrystal.health,
                    energyEyeDungeon.energyCrystal.maxHealth
                );
                // 暂停时不更新倒计时
            }
        }
        
        requestAnimationFrame(gameLoop);
        return;
    }
        
        // 更新能源之眼副本逻辑
        if (energyEyeDungeon && energyEyeDungeon.isActive) {
            energyEyeDungeon.update();
        }
        
        updateGameObjects();
        
        if (energyEyeDungeon && energyEyeDungeon.isActive && energyEyeDungeon.energyCrystal) {
            drawEnergyCoreCrystal(); // 新增专门的水晶绘制函数
        }
        
        drawGameObjects();
        
        // 检查碰撞
        checkCollisions();
        checkEnergyEyeCollisions();
        
        // 更新UI
        updateUI();
        
        // 显示能源之眼UI
        if (typeof energyEyeUI !== 'undefined') {
            energyEyeUI.show();
            if (energyEyeDungeon && energyEyeDungeon.energyCrystal) {
                energyEyeUI.updateCrystalStatus(
                    energyEyeDungeon.energyCrystal.health,
                    energyEyeDungeon.energyCrystal.maxHealth
                );
                
                // 更新波次倒计时
                const timeToNextWave = Math.max(0, (energyEyeDungeon.waveTimer - Date.now()) / 1000);
                energyEyeUI.updateWaveTimer(timeToNextWave);
            }
        }
        
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // 处理星尘轨道副本
if (gameStateManager.isInStardustOrbit()) {
    if (lastTime === 0) lastTime = currentTime;
    deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    ctx.fillStyle = '#110022';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    stars.forEach(star => {
        star.update();
        star.draw();
    });

    if (inventory.isOpen || shop.isOpen) {
        if (stardustOrbitDungeon && stardustOrbitDungeon.isActive && stardustOrbitDungeon.energyCrystal) {
            drawStardustCrystal();
        }
        drawGameObjects();
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (typeof stardustOrbitUI !== 'undefined') {
            stardustOrbitUI.show();
            if (stardustOrbitDungeon && stardustOrbitDungeon.energyCrystal) {
                stardustOrbitUI.updateCrystalHealth(
                    stardustOrbitDungeon.energyCrystal.health,
                    stardustOrbitDungeon.energyCrystal.maxHealth
                );
            }
        }
        
        requestAnimationFrame(gameLoop);
        return;
    }
    
    if (stardustOrbitDungeon && stardustOrbitDungeon.isActive) {
        stardustOrbitDungeon.update();
    }
    
    updateGameObjects();
    
    if (stardustOrbitDungeon && stardustOrbitDungeon.isActive && stardustOrbitDungeon.energyCrystal) {
        drawStardustCrystal();
    }
    
    drawGameObjects();
    
    checkCollisions();
    checkStardustOrbitCollisions();
    
    // 【关键添加】小型机碰撞检测
    if (window.miniShipManager) {
        window.miniShipManager.checkCollisions(enemies, enemyBullets, enemyMissiles);
    }
    
    updateUI();
    
    if (typeof stardustOrbitUI !== 'undefined') {
        stardustOrbitUI.show();
        if (stardustOrbitDungeon && stardustOrbitDungeon.energyCrystal) {
            stardustOrbitUI.updateCrystalHealth(
                stardustOrbitDungeon.energyCrystal.health,
                stardustOrbitDungeon.energyCrystal.maxHealth
            );
            
            const timeToNextWave = Math.max(0, (stardustOrbitDungeon.waveTimer - Date.now()) / 1000);
            stardustOrbitUI.updateWaveTimer(timeToNextWave);
        }
    }
    
    requestAnimationFrame(gameLoop);
    return;
}
    if (gameStateManager.isInIceAge()) {
    // 计算 deltaTime
    if (lastTime === 0) lastTime = currentTime;
    deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    // 清空画布
    ctx.fillStyle = '#001122'; // 冰蓝色背景
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制星空背景
    stars.forEach(star => {
        star.update();
        star.draw();
    });

    // 绘制激光瞄准轨道
    drawLaserTrajectory();
    
    // 绘制小型机
    if (window.miniShipManager) {
        window.miniShipManager.draw();
    }

    // 更新小型机
    if (window.miniShipManager) {
        window.miniShipManager.update();
        // 检查小型机碰撞
        window.miniShipManager.checkCollisions(enemies, enemyBullets, enemyMissiles);
    }

    if (inventory.isOpen || shop.isOpen) {
        // 绘制所有对象但不更新它们
        drawGameObjects();
        
        // 添加暂停遮罩
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        requestAnimationFrame(gameLoop);
        return;
    }
    
    // 更新冰河时代副本逻辑
    if (iceAgeDungeon && iceAgeDungeon.isActive) {
        iceAgeDungeon.update();
    }
    
    updateGameObjects();
    drawGameObjects();
    
    // 绘制传送门
    if (iceAgeDungeon && iceAgeDungeon.isActive) {
        iceAgeDungeon.drawPortal();
    }
    
    // 检查碰撞
    checkCollisions();
    
    // 更新UI（无波次显示）
    updateUI();
    
    requestAnimationFrame(gameLoop);
    return;
}

    // 原有的无尽征程逻辑...
    if (gameStateManager.isInGame() && gameState === 'choosing_crystal') {
    drawCrystalSelection();
    requestAnimationFrame(gameLoop);
    return;
}
    
    if (!gameRunning) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    if (lastTime === 0) lastTime = currentTime;
    deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    stars.forEach(star => {
        star.update();
        star.draw();
    });
    
    if (inventory.isOpen || shop.isOpen) {
        drawPausedGame();
        requestAnimationFrame(gameLoop);
        return;
    }
    
    updateGameObjects();
    if (nextWavePortal) {
    nextWavePortal.update();
}
    drawGameObjects();
    checkCollisions();
    checkEnergyEyeCollisions();
    updateUI();
    
    requestAnimationFrame(gameLoop);
}

function updateUI() {
  // 更新连击计时器
  updateComboTimer(deltaTime);
  
  Object.keys(skillCooldowns).forEach(key => {
    if (skillCooldowns[key] > 0) {
      skillCooldowns[key] -= deltaTime;
      if (skillCooldowns[key] < 0) skillCooldowns[key] = 0;
      
      const skillEl = document.querySelector(`[data-skill="${key}"]`);
      const cooldownText = skillEl.querySelector('.cooldown-text');
      skillEl.classList.remove('ready');
      skillEl.classList.add('cooldown');
      const secondsLeft = Math.ceil(skillCooldowns[key] / 1000);
      cooldownText.textContent = secondsLeft > 0 ? secondsLeft : '';
      
      if (skillCooldowns[key] === 0) {
        skillEl.classList.remove('cooldown');
        skillEl.classList.add('ready');
        cooldownText.textContent = '';
      }
    }
  });
  
  if (consumableCooldown > 0) {
    consumableCooldown -= deltaTime;
    if (consumableCooldown < 0) consumableCooldown = 0;
  }
  
  autoSaveTimer += deltaTime;
  if (autoSaveTimer >= AUTO_SAVE_INTERVAL) {
    autoSaveTimer = 0;
    autoSave();
  }
  
  if (isCharging) {
    const currentTime = Date.now();
    const chargeTime = Math.min((currentTime - chargeStartTime) / 3000, 1) * 100;
    chargeAmount = chargeTime;
    document.querySelector('.charge-fill').style.width = `${chargeAmount}%`;
  }
  
  inventory.updateConsumableDisplay();
  
  if (inventory.treasureSlot) {
    inventory.treasureSlot.updateCooldown(deltaTime);
    inventory.updateTreasureCooldown();
  }
}

function drawPausedGame() {
    // 先绘制冲击波
    shockWaves.forEach(shockWave => shockWave.draw());
    
    player.draw();
    
    bullets.forEach(bullet => bullet.draw());
    enemyBullets.forEach(bullet => bullet.draw());
    enemyMissiles.forEach(missile => missile.draw());
    waves.forEach(wave => wave.draw());
    enemies.forEach(enemy => enemy.draw());
    particles.forEach(particle => particle.draw());
    blackHoles.forEach(blackHole => blackHole.draw());
    drawDroppedItems();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}


function updateGameObjects() {
    player.update();
    
    // 更新小型机
    if (window.miniShipManager) {
        window.miniShipManager.update();
    }
    
    updateEnemySpawning();
    
    bullets.forEach((bullet, index) => {
        bullet.update();
        if (bullet.isOffScreen()) {
            bullets.splice(index, 1);
        }
    });
    
    enemyBullets.forEach((bullet, index) => {
        bullet.update();
        if (bullet.isOffScreen()) {
            enemyBullets.splice(index, 1);
        }
    });
    
    enemyMissiles.forEach((missile, index) => {
        missile.update();
        if (missile.isOffScreen()) {
            enemyMissiles.splice(index, 1);
        }
    });
    
    shockWaves.forEach((shockWave, index) => {
        shockWave.update();
        if (shockWave.isDone()) {
            shockWaves.splice(index, 1);
        }
    });
    
    waves.forEach((wave, index) => {
        wave.update();
        if (wave.isDone()) {
            waves.splice(index, 1);
        }
    });
    
    enemies.forEach((enemy, index) => {
        enemy.update();
        if (enemy.isOffScreen()) {
            enemies.splice(index, 1);
        }
    });
    
    particles.forEach((particle, index) => {
        particle.update();
        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });
    
    if (gameStateManager.isInStardustOrbit() || gameStateManager.isInIceAge()) {
    if (typeof updateStunWaves === 'function') {
        updateStunWaves();
    }
    if (typeof updateFlameColumns === 'function') {
        updateFlameColumns();
    }
    if (typeof updateFlameWarnings === 'function') {
        updateFlameWarnings();
    }
}

    // 更新冰冻敌人状态
    enemies.forEach(enemy => {
        if (enemy.frozen && enemy.frozenTime > 0) {
            enemy.frozenTime -= deltaTime;
            if (enemy.frozenTime <= 0) {
                enemy.frozen = false;
                if (enemy.element) {
                    enemy.element.style.filter = '';
                }
            }
        }
    });
    
    // 更新寒霜冰冻区域
    updateFrostZones();
    
    updateDroppedItems();
    
    // 更新寒霜特效
    updateFrostEffects();
}

function drawGameObjects() {
    // 先绘制冲击波（在最底层）
    shockWaves.forEach(shockWave => shockWave.draw());
    
    player.draw();
    
    if (window.miniShipManager) {
        window.miniShipManager.draw();
    }
    
    bullets.forEach(bullet => bullet.draw());
    enemyBullets.forEach(bullet => bullet.draw());
    enemyMissiles.forEach(missile => missile.draw());
    waves.forEach(wave => wave.draw());
    enemies.forEach(enemy => enemy.draw());
    particles.forEach(particle => particle.draw());
    blackHoles.forEach(blackHole => blackHole.draw());
    
    if (gameStateManager.isInStardustOrbit() || gameStateManager.isInIceAge()) {
        if (typeof drawStunWaves === 'function') {
            drawStunWaves();
        }
        if (typeof drawFlameColumns === 'function') {
            drawFlameColumns();
        }
        if (typeof drawFlameWarnings === 'function') {
            drawFlameWarnings();
        }
    }
    
    drawDroppedItems();
    if (nextWavePortal) {
        nextWavePortal.draw();
    }

    drawLaserTrajectory();

    drawFrostEffects();
    drawEnemyFrostEffects();
}

function drawEnemyFrostEffects() {
    enemies.forEach(enemy => {
        if (enemy.frozen && enemy.frostEffect) {
            const elapsed = Date.now() - enemy.frostEffect.startTime;
            if (elapsed < enemy.frostEffect.duration) {
                drawEnemyFrostVisuals(enemy, elapsed);
            }
        }
    });
}

function drawEnemyFrostVisuals(enemy, elapsed) {
    const ctx = window.ctx || canvas.getContext('2d');
    
    // 绘制冰环
    ctx.save();
    ctx.strokeStyle = `rgba(0, 255, 255, ${0.6 + Math.sin(elapsed * 0.008) * 0.2})`;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#00ffff';
    
    const ringRadius = 35 + Math.sin(elapsed * 0.005) * 5;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    
    // 绘制冰晶
    enemy.frostEffect.crystals.forEach((crystal, index) => {
        ctx.save();
        
        // 计算浮动位置
        const floatY = Math.sin(elapsed * 0.003 + crystal.floatOffset) * 3;
        const currentRotation = crystal.rotation + crystal.rotSpeed * elapsed * 0.1;
        
        ctx.translate(crystal.x, crystal.y + floatY);
        ctx.rotate(currentRotation * Math.PI / 180);
        
        // 设置透明度
        const alpha = 0.8 + Math.sin(elapsed * 0.01 + index) * 0.2;
        ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ffff';
        
        // 绘制菱形冰晶
        const size = crystal.size;
        ctx.beginPath();
        ctx.moveTo(0, -size/2);
        ctx.lineTo(size/3, 0);
        ctx.lineTo(0, size/2);
        ctx.lineTo(-size/3, 0);
        ctx.closePath();
        ctx.fill();
        
        // 绘制高亮边缘
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
    });
}

const originalTakeDamage = Player.prototype.takeDamage;
Player.prototype.takeDamage = function(amount) {
    if (this.invincible) {
        this.showInvincibleNotification();
        return;
    }
    
    if (this.stunned && passiveEffects.isImmuneToControl()) {
        this.stunned = false;
        this.stunTime = 0;
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #000000;
            font-size: 20px;
            font-weight: bold;
            text-shadow: 0 0 5px #000000;
            z-index: 999;
            animation: immunityEffect 1s ease-out forwards;
        `;
        notification.textContent = '免疫控制！';
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 1000);
    }
    
    if (!this.shield) {
        const actualDamage = Math.max(1, amount - this.defense);
        this.health -= actualDamage;
        this.health = Math.max(0, this.health);
        updateHealthBar();
        
        if (this.health <= 0) {
            if (passiveEffects.handleTitanRevive()) {
                return;
            }
            
            // 检查是否在能源之眼副本中
if (gameStateManager.isInEnergyEye()) {
    if (typeof energyEyeDungeon !== 'undefined') {
        energyEyeDungeon.end();
    }
    // 立即切换状态，防止后续检查
    gameStateManager.setState(gameStateManager.states.MAIN);
    return;
}

            // 检查是否在星尘轨道副本中
            if (gameStateManager.isInStardustOrbit()) {
                if (typeof stardustOrbitDungeon !== 'undefined' && stardustOrbitDungeon.isActive) {
                    stardustOrbitDungeon.end();
                }
                return;
            }
            
            // 【新增】检查是否在冰河时代副本中
            if (gameStateManager.isInIceAge()) {
                if (typeof iceAgeDungeon !== 'undefined' && iceAgeDungeon.isActive) {
                    iceAgeDungeon.end('player_death');
                }
                return;
            }
            
            gameOver();
        }
    }
};

const originalEnemyTakeDamage = Enemy.prototype.takeDamage;
Enemy.prototype.takeDamage = function(amount) {
    this.health -= amount;
    if (this.health <= 0) {
        this.isDead = true;
        
        if (this.type === 'BOSS') {
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                if (enemyBullets[i].owner === this) {
                    enemyBullets.splice(i, 1);
                }
            }
            for (let i = enemyMissiles.length - 1; i >= 0; i--) {
                if (enemyMissiles[i].owner === this) {
                    enemyMissiles.splice(i, 1);
                }
            }
            for (let i = shockWaves.length - 1; i >= 0; i--) {
                if (shockWaves[i].owner === this) {
                    shockWaves.splice(i, 1);
                }
            }
            blackHoles.length = 0;
            
            bossDefeated = true;
            
            if (gameStateManager.isInGame()) {
                waitingForCrystalChoice = true;
                createCrystalChoice(this.x, this.y);
                handleBossDrop(this);
            } else if (gameStateManager.isInEnergyEye()) {
            }
        }
        
        for (let i = 0; i < 15; i++) {
            particles.push(new Particle(this.x, this.y, this.color));
        }
        
        gainExperience(this.expValue);
        waveEnemiesKilled++;
        
        return true;
    }
    return false;
};

function initGame() {
    updateHealthBar();
    updateEnergyBar();
    updateExpBar();
    updateDefenseDisplay();
    
    // 初始化奇迹之境管理器
    if (typeof miracleRealmManager !== 'undefined') {
        // 从当前存档加载进度
        if (currentSaveId) {
            const saves = JSON.parse(localStorage.getItem('galacticWarshipSaves') || '{}');
            if (saves[currentSaveId]) {
                miracleRealmManager.loadProgressFromSave(saves[currentSaveId]);
            }
        }
    }
    
    // 初始化时空漩涡管理器（如果存在）
    if (typeof timeVortexManager !== 'undefined') {
        if (currentSaveId) {
            const saves = JSON.parse(localStorage.getItem('galacticWarshipSaves') || '{}');
            if (saves[currentSaveId] && saves[currentSaveId].dailyProgress) {
                timeVortexManager.loadProgressFromSave(saves[currentSaveId].dailyProgress);
            }
        }
    }
    
    requestAnimationFrame(gameLoop);
}

function drawEnergyCoreCrystal() {
    if (!energyEyeDungeon || !energyEyeDungeon.isActive || !energyEyeDungeon.energyCrystal) {
        return;
    }
    
    const crystal = energyEyeDungeon.energyCrystal;
    
    ctx.save();
    
    // 检查是否有预加载的水晶图片
    if (crystal.image && crystal.imageLoaded) {
        // 使用PNG图片渲染
        const pulseScale = 1 + Math.sin(Date.now() * 0.002) * 0.1; // 轻微的脉动效果
        
        ctx.globalAlpha = 0.9 + Math.sin(Date.now() * 0.003) * 0.1;
        
        // 添加发光效果
        ctx.shadowBlur = 30;
        ctx.shadowColor = crystal.color;
        
        // 绘制主体图片
        const renderSize = crystal.radius * 2 * pulseScale;
        ctx.drawImage(
            crystal.image,
            crystal.x - renderSize / 2,
            crystal.y - renderSize / 2,
            renderSize,
            renderSize
        );
        
        // 添加能量波纹效果（可选，增强视觉效果）
        const time = Date.now() * 0.001;
        for (let i = 0; i < 2; i++) {
            const waveRadius = crystal.radius + (Math.sin(time + i * Math.PI) + 1) * 15;
            const waveAlpha = (Math.sin(time + i * Math.PI) + 1) * 0.05;
            
            ctx.globalAlpha = waveAlpha;
            ctx.strokeStyle = crystal.color;
            ctx.lineWidth = 1;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(crystal.x, crystal.y, waveRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        
    } 
    ctx.restore();
}

function checkEnergyEyeCollisions() {
    if (!energyEyeDungeon || !energyEyeDungeon.isActive || !energyEyeDungeon.energyCrystal) {
        return;
    }
    
    const crystal = energyEyeDungeon.energyCrystal;
    
    // 检查玩家子弹与能源水晶的碰撞
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        if (!bullet) continue;
        
        const distance = Math.sqrt(
            Math.pow(bullet.x - crystal.x, 2) +
            Math.pow(bullet.y - crystal.y, 2)
        );
        
        // 如果子弹击中水晶
        if (distance < crystal.radius + (bullet.radius || 5)) {
            // 对水晶造成伤害
            energyEyeDungeon.damageCrystal(bullet.damage || 10);
            
            // 创建击中特效
            for (let j = 0; j < 3; j++) {
                particles.push(new Particle(bullet.x, bullet.y, bullet.color || '#00ff00'));
            }
            
            // 移除子弹
            bullets.splice(i, 1);
        }
    }

    for (let i = shockWaves.length - 1; i >= 0; i--) {
        const shockWave = shockWaves[i];
        if (!shockWave || !shockWave.isPlayerShockWave) continue;
        
        // 检查冲击波是否击中水晶
        if (shockWave.checkCollision && shockWave.checkCollision(crystal.x, crystal.y, crystal.radius)) {
            // 【关键修复】检查是否已经对水晶造成过伤害
            if (!shockWave.hasHitCrystal) {
                shockWave.hasHitCrystal = true; // 标记已击中水晶
                
                // 对水晶造成伤害
                energyEyeDungeon.damageCrystal(shockWave.damage || 50);
                
                // 创建击中特效
                for (let j = 0; j < 8; j++) {
                    particles.push(new Particle(
                        crystal.x + (Math.random() - 0.5) * 60,
                        crystal.y + (Math.random() - 0.5) * 60,
                        '#ffff00'  // 黄色粒子效果表示冲击波击中
                    ));
                }
            }
        }
    }
}

function checkStardustOrbitCollisions() {
    if (!stardustOrbitDungeon || !stardustOrbitDungeon.isActive || !stardustOrbitDungeon.energyCrystal) {
        return;
    }
    
    const crystal = stardustOrbitDungeon.energyCrystal;
    
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        if (!bullet) continue;
        
        const distance = Math.sqrt(
            Math.pow(bullet.x - crystal.x, 2) +
            Math.pow(bullet.y - crystal.y, 2)
        );
        
        if (distance < crystal.radius + (bullet.radius || 5)) {
            stardustOrbitDungeon.damageCrystal(bullet.damage || 10);
            
            for (let j = 0; j < 3; j++) {
                particles.push(new Particle(bullet.x, bullet.y, bullet.color || '#ffaa00'));
            }
            
            bullets.splice(i, 1);
        }
    }

    for (let i = shockWaves.length - 1; i >= 0; i--) {
        const shockWave = shockWaves[i];
        if (!shockWave || !shockWave.isPlayerShockWave) continue;
        
        if (shockWave.checkCollision && shockWave.checkCollision(crystal.x, crystal.y, crystal.radius)) {
            // 【关键修复】检查是否已经对水晶造成过伤害
            if (!shockWave.hasHitCrystal) {
                shockWave.hasHitCrystal = true; // 标记已击中水晶
                
                stardustOrbitDungeon.damageCrystal(shockWave.damage || 50);
                
                for (let j = 0; j < 8; j++) {
                    particles.push(new Particle(
                        crystal.x + (Math.random() - 0.5) * 60,
                        crystal.y + (Math.random() - 0.5) * 60,
                        '#ffaa00'
                    ));
                }
            }
        }
    }
}

function updateFrostEffects() {
    if (!window.frostEffects) return;
    
    const now = Date.now();
    for (let i = window.frostEffects.length - 1; i >= 0; i--) {
        const effect = window.frostEffects[i];
        if (now - effect.startTime > effect.duration) {
            window.frostEffects.splice(i, 1);
        }
    }
}

function drawFrostEffects() {
    if (!window.frostEffects) return;
    
    const now = Date.now();
    window.frostEffects.forEach(effect => {
        const elapsed = now - effect.startTime;
        const progress = elapsed / effect.duration;
        
        if (progress > 1) return;
        
        ctx.save();
        
        // 绘制中央光环
        const ringProgress = Math.min(progress * 2, 1);
        const ringRadius = effect.radius * ringProgress;
        const ringAlpha = Math.max(0, 1 - progress);
        
        ctx.strokeStyle = `rgba(0, 255, 255, ${ringAlpha * 0.8})`;
        ctx.lineWidth = 5 - ringProgress * 2;
        ctx.shadowBlur = 30;
        ctx.shadowColor = '#00ffff';
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // 绘制冰晶
        effect.crystals.forEach(crystal => {
            const crystalElapsed = elapsed - crystal.delay;
            if (crystalElapsed < 0) return;
            
            const crystalProgress = crystalElapsed / (effect.duration - crystal.delay);
            if (crystalProgress > 1) return;
            
            const alpha = crystalProgress < 0.3 ? crystalProgress / 0.3 : Math.max(0, 1 - (crystalProgress - 0.3) / 0.7);
            const scale = crystalProgress < 0.5 ? crystalProgress * 2 : 1;
            
            ctx.save();
            ctx.translate(crystal.x, crystal.y);
            ctx.rotate((crystal.rotation + crystalProgress * 360) * Math.PI / 180);
            ctx.scale(scale, scale);
            
            ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00ffff';
            
            const size = crystal.size;
            ctx.beginPath();
            ctx.moveTo(0, -size/2);
            ctx.lineTo(size/4, -size/4);
            ctx.lineTo(size/2, 0);
            ctx.lineTo(size/4, size/4);
            ctx.lineTo(0, size/2);
            ctx.lineTo(-size/4, size/4);
            ctx.lineTo(-size/2, 0);
            ctx.lineTo(-size/4, -size/4);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
        });
        
        ctx.restore();
    });
}

function updateFrostZones() {
    if (!window.frostZones) return;
    
    const now = Date.now();
    
    // 检查每个冰冻区域
    for (let i = window.frostZones.length - 1; i >= 0; i--) {
        const zone = window.frostZones[i];
        const elapsed = now - zone.startTime;
        
        // 如果区域已经超过激活时间，移除
        if (elapsed > zone.activeTime) {
            window.frostZones.splice(i, 1);
            continue;
        }
        
        // 检查范围内的敌人
        enemies.forEach(enemy => {
            if (enemy && !enemy.frozen && enemy.x !== undefined && enemy.y !== undefined) {
                const dx = enemy.x - zone.x;
                const dy = enemy.y - zone.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= zone.radius) {
                    enemy.frozen = true;
                    enemy.frozenTime = zone.duration;
                    
                    if (enemy.element) {
                        enemy.element.style.filter = 'brightness(0.5) saturate(0) hue-rotate(180deg)';
                    }
                }
            }
        });
    }
}

const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes fadeOut {
        0% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1); 
        }
        70% { 
            opacity: 1; 
            transform: translate(-50%, -50%) scale(1); 
        }
        100% { 
            opacity: 0; 
            transform: translate(-50%, -50%) scale(0.8) translateY(-20px); 
        }
    }
`;
document.head.appendChild(notificationStyle);

initGame();