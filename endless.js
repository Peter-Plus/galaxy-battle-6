// endless.js - 无尽征程专用代码

function showMainMenuConfirm() {
    const modal = document.createElement('div');
    modal.className = 'main-menu-confirm-modal';
    modal.innerHTML = `
        <div class="main-menu-confirm-content">
            <h3>返回主界面</h3>
            <p>是否返回主界面？当前进度将会保存。</p>
            <div class="main-menu-confirm-buttons">
                <button id="confirmMainMenuBtn">确定</button>
                <button id="cancelMainMenuBtn">取消</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('confirmMainMenuBtn').addEventListener('click', () => {
        modal.remove();
        returnToMainFromBattle();
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

function returnToMainFromBattle() {
    autoSave();
    clearBattleState();
    gameStateManager.goToMain();
}

function clearBattleState() {
    gameRunning = false;
    
    // 重置连击系统
    resetCombo();
    
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
    
    waveEnemiesKilled = 0;
    waveInProgress = false;
    waitingForCrystalChoice = false;
    bossDefeated = false;
    gameState = 'playing';
    nextWavePortal = null;
    
    skillCooldowns = { 1: 0, 2: 0, 3: 0 };
    consumableCooldown = 0;
    
    player.health = player.maxHealth;
    player.energy = player.maxEnergy;
    player.invincible = false;
    player.invincibilityTimer = 0;
    
    isCharging = false;
    chargeAmount = 0;
    isRightMousePressed = false;
    
    const chargeBar = document.querySelector('.charge-bar');
    if (chargeBar) chargeBar.style.display = 'none';
    
    updateSkillUI();
    updateHealthBar();
    updateEnergyBar();
}

function drawCrystalSelection() {
    player.draw();
    bullets.forEach(bullet => bullet.draw());
    enemyBullets.forEach(bullet => bullet.draw());
    enemyMissiles.forEach(missile => missile.draw());
    waves.forEach(wave => wave.draw());
    shockWaves.forEach(shockWave => shockWave.draw());
    enemies.forEach(enemy => enemy.draw());
    particles.forEach(particle => particle.draw());
    blackHoles.forEach(blackHole => blackHole.draw());
    drawDroppedItems();
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#000000';
    ctx.fillText('选择宇宙晶核', canvas.width / 2, 100);
    
    ctx.font = '24px Arial';
    ctx.fillText('点击选择一个晶核来强化你的能力', canvas.width / 2, 150);
    
    crystalCores.forEach(core => {
        core.update();
        core.draw();
    });
}

// 检查波次完成
function checkWaveComplete() {
    if (waveInProgress && 
        gameState === 'playing' && 
        enemies.length === 0 && 
        !waitingForCrystalChoice && 
        bossDefeated) {
        
        waveInProgress = false;
    }
}

function startWave(waveNumber) {
    if (typeof passiveEffects !== 'undefined') {
        passiveEffects.resetBattleState();
    }
    
    waveInProgress = true;
    waveEnemiesKilled = 0;
    bossDefeated = false;
    
    enemySpawnQueue = [];
    enemySpawnTimer = 0;
    
    document.getElementById('waveNum').textContent = waveNumber;
    document.getElementById('waveAnnouncement').style.display = 'block';
    
    setTimeout(() => {
        document.getElementById('waveAnnouncement').style.display = 'none';
    }, 2000);
    
    let enemyCount;
    
    if (waveNumber < 10) {
        enemyCount = {
            A: 8,
            B: 5,
            C: 3,
            D: 0
        };
    } else {
        enemyCount = {
            A: 10,
            B: 7,
            C: 5,
            D: 3
        };
    }
    
    const enemyList = [];
    
    for (let i = 0; i < enemyCount.A; i++) {
        enemyList.push('A');
    }
    for (let i = 0; i < enemyCount.B; i++) {
        enemyList.push('B');
    }
    for (let i = 0; i < enemyCount.C; i++) {
        enemyList.push('C');
    }
    for (let i = 0; i < enemyCount.D; i++) {
        enemyList.push('D');
    }
    
    for (let i = enemyList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [enemyList[i], enemyList[j]] = [enemyList[j], enemyList[i]];
    }
    
    let spawnTime = 0;
    enemyList.forEach((enemyType) => {
        enemySpawnQueue.push({
            type: enemyType,
            spawnTime: spawnTime
        });
        spawnTime += enemySpawnInterval;
    });
    
    const bossSpawnTime = spawnTime + 2000;
    enemySpawnQueue.push({
        type: 'BOSS',
        spawnTime: bossSpawnTime
    });
}

function createCrystalChoice(x, y) {
    gameState = 'choosing_crystal';
    crystalCores = [];
    
    const coreTypes = ['explosion', 'survival', 'tactical'];
    const spacing = 200;
    const startX = canvas.width / 2 - spacing;
    
    coreTypes.forEach((type, index) => {
        crystalCores.push(new CrystalCore(startX + index * spacing, canvas.height / 2, type));
    });
}

function selectCrystalCore(type, fromItem = false) {
    switch(type) {
        case 'explosion':
            explosionCoreCount++;
            const explosionBonus = 0.05 * Math.pow(DIMINISHING_FACTOR, explosionCoreCount - 1);
            window.totalExplosionBonus += explosionBonus;
            
            attackPower = Math.floor((baseAttackPower + equipmentStats.attack) * (1 + window.totalExplosionBonus));
            document.getElementById('attack').textContent = attackPower;
            break;
            
        case 'survival':
            survivalCoreCount++;
            const survivalLifeStealBonus = 0.05 * Math.pow(DIMINISHING_FACTOR, survivalCoreCount - 1);
            const survivalHealthBonus = 0.05 * Math.pow(DIMINISHING_FACTOR, survivalCoreCount - 1);
            
            window.totalSurvivalLifeStealBonus += survivalLifeStealBonus;
            window.totalSurvivalHealthBonus += survivalHealthBonus;
            
            const baseMaxHealth = 500 + (level - 1) * 30;
            const healthBonus = Math.floor(baseMaxHealth * survivalHealthBonus);
            player.maxHealth += healthBonus;
            player.health = player.maxHealth;
            updateHealthBar();
            break;
            
        case 'tactical':
            tacticalCoreCount++;
            const tacticalCooldownBonus = 0.05 * Math.pow(DIMINISHING_FACTOR, tacticalCoreCount - 1);
            const tacticalEnergyBonus = 0.05 * Math.pow(DIMINISHING_FACTOR, tacticalCoreCount - 1);
            
            window.totalTacticalCooldownBonus += tacticalCooldownBonus;
            window.totalTacticalEnergyBonus += tacticalEnergyBonus;
            
            player.energyRegen += tacticalEnergyBonus;
            
            Object.keys(maxSkillCooldowns).forEach(key => {
                maxSkillCooldowns[key] = Math.floor(baseCooldowns[key] * (1 - window.totalTacticalCooldownBonus));
            });
            break;
    }
    
    for (let i = 0; i < 30; i++) {
        const color = type === 'explosion' ? '#ff4444' : 
                     type === 'survival' ? '#44ff44' : '#4444ff';
        particles.push(new Particle(player.x, player.y, color));
    }
    
    crystalCores = [];
    gameState = 'playing';
    
    if (!fromItem) {
        nextWavePortal = new NextWavePortal(canvas.width / 2, canvas.height / 2);
    }
    
    waitingForCrystalChoice = false;
}

function handleEnemyDrop(enemy) {
    if (['B', 'C', 'D'].includes(enemy.type) && Math.random() < 0.05) {
        createDroppedItem(enemy.x, enemy.y, generateHealthPotion());
    }
    
    let goldAmount = 0;
    switch(enemy.type) {
        case 'A': goldAmount = 5; break;
        case 'B': goldAmount = 5; break;
        case 'C': goldAmount = 20; break;
        case 'D': goldAmount = 25; break;
        case 'BOSS': goldAmount = 80; break;
    }
    
    if (goldAmount > 0) {
        inventory.addGold(goldAmount);
    }
}

function handleBossDrop(boss) {
    const dropRoll = Math.random();
    let category, quality;
    
    if (dropRoll < 0.65) {
        category = 'common';
    } else if (dropRoll < 0.95) {
        category = 'rare';
    } else {
        category = 'artifact_material';
    }
    
    if (category === 'artifact_material') {
        const materials = ['阿修罗之眼', '泰坦结晶', '冥王碎片'];
        const randomMaterial = materials[Math.floor(Math.random() * materials.length)];
        
        const materialData = ItemGenerator.generateItem(randomMaterial, 1);
        
        createDroppedItem(boss.x, boss.y, materialData);
        showItemDropNotification(materialData);
        return;
    }
    
    const qualityRoll = Math.random();
    if (qualityRoll < 0.50) {
        quality = 0;
    } else if (qualityRoll < 0.80) {
        quality = 1;
    } else if (qualityRoll < 0.95) {
        quality = 2;
    } else {
        quality = 3;
    }
    
    const itemData = generateRandomEquipment(category, quality);
    
    createDroppedItem(boss.x, boss.y, itemData);
    showItemDropNotification(itemData);
}


function showItemDropNotification(itemData) {
    const notification = document.createElement('div');
    notification.className = 'item-drop-notification';
    
    const qualityColors = ['#ffffff', '#00ff00', '#0066ff', '#9933ff', '#ffaa00', '#ff0000'];
    const qualityNames = ['普通', '优秀', '精良', '史诗', '传说', '神器'];
    
    // 检查是否为"不融雪"材料，如果是则使用史诗品质样式
    let displayQuality = itemData.quality;
    let displayType = '装备掉落！';
    
    if (itemData.name === '不融雪' && itemData.category === 'material') {
        displayQuality = 3; // 史诗品质
        displayType = '材料掉落！';
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 50px;
        right: 20px;
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid ${qualityColors[displayQuality]};
        border-radius: 10px;
        padding: 15px;
        color: #ffffff;
        font-size: 16px;
        text-shadow: 0 0 10px ${qualityColors[displayQuality]};
        z-index: 999;
        animation: slideInRight 0.5s ease-out;
        box-shadow: 0 0 20px ${qualityColors[displayQuality]}66;
    `;
    
    const displayName = new Item(itemData).getDisplayName();
    notification.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">${displayType}</div>
        <div style="color: ${qualityColors[displayQuality]}; font-weight: bold;">${qualityNames[displayQuality]} ${displayName}</div>
        <div style="font-size: 12px; margin-top: 5px; opacity: 0.8;">靠近拾取</div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease-in';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

class CrystalCore {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 40;
        this.glowRadius = 60;
        this.rotation = 0;
        this.hovered = false;
        
        switch(type) {
        case 'explosion':
            this.color = '#ff4444';
            this.glowColor = '#ff8888';
            this.name = '爆发晶核';
            const nextExplosionBonus = 0.05 * Math.pow(DIMINISHING_FACTOR, explosionCoreCount);
            this.description = `攻击力 +${(nextExplosionBonus * 100).toFixed(1)}%`;
            break;
        case 'survival':
            this.color = '#44ff44';
            this.glowColor = '#88ff88';
            this.name = '生存晶核';
            const nextSurvivalBonus = 0.05 * Math.pow(DIMINISHING_FACTOR, survivalCoreCount);
            this.description = `生命 +${(nextSurvivalBonus * 100).toFixed(1)}%\n吸血 +${(nextSurvivalBonus * 100).toFixed(1)}%`;
            break;
        case 'tactical':
            this.color = '#4444ff';
            this.glowColor = '#8888ff';
            this.name = '战术晶核';
            const nextTacticalCooldownBonus = 0.05 * Math.pow(DIMINISHING_FACTOR, tacticalCoreCount);
            const nextTacticalEnergyBonus = 0.05 * Math.pow(DIMINISHING_FACTOR, tacticalCoreCount);
            this.description = `技能冷却 -${(nextTacticalCooldownBonus * 100).toFixed(1)}%\n回能 +${nextTacticalEnergyBonus.toFixed(3)}/秒`;
            break;
        }
    }
    
    update() {
        this.rotation += 0.02;
        
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.hovered = dist < this.radius;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        const glowSize = this.hovered ? this.glowRadius + 10 : this.glowRadius;
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
        gradient.addColorStop(0, this.color + '88');
        gradient.addColorStop(0.7, this.color + '44');
        gradient.addColorStop(1, this.color + '00');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(-glowSize, -glowSize, glowSize * 2, glowSize * 2);
        
        ctx.shadowBlur = 30;
        ctx.shadowColor = this.glowColor;
        ctx.fillStyle = this.color;
        
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = Math.cos(angle) * this.radius;
            const y = Math.sin(angle) * this.radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = '#ffffff88';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        for (let i = 0; i < 3; i++) {
            const angle = (Math.PI * 2 / 3) * i;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * this.radius * 0.8, Math.sin(angle) * this.radius * 0.8);
            ctx.stroke();
        }
        
        ctx.restore();
        
        if (this.hovered) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 5;
            ctx.shadowColor = '#000000';
            ctx.fillText(this.name, this.x, this.y - this.radius - 20);
            
            ctx.font = '16px Arial';
            const lines = this.description.split('\n');
            lines.forEach((line, index) => {
                ctx.fillText(line, this.x, this.y - this.radius - 50 - index * 20);
            });
        }
    }
    
    isClicked(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < this.radius;
    }
}