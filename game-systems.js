const DIMINISHING_FACTOR = 0.95;
let comboCount = 0;
let comboTimer = 0;
const COMBO_TIMEOUT = 1000; // 1秒超时

if (!window.totalExplosionBonus) window.totalExplosionBonus = 0;
if (!window.totalSurvivalLifeStealBonus) window.totalSurvivalLifeStealBonus = 0;
if (!window.totalSurvivalHealthBonus) window.totalSurvivalHealthBonus = 0;
if (!window.totalTacticalCooldownBonus) window.totalTacticalCooldownBonus = 0;
if (!window.totalTacticalEnergyBonus) window.totalTacticalEnergyBonus = 0;

const baseCooldowns = { 1: 7000, 2: 8000, 3: 10000 };

window.updatePlayerStats = function(stats) {
    equipmentStats = stats;
    
    const explosionBonus = window.totalExplosionBonus || 0;
    attackPower = Math.floor((baseAttackPower + equipmentStats.attack) * (1 + explosionBonus));
    
    // 根据角色类型计算基础生命值
    const config = player.getCharacterConfig();
    const baseMaxHealth = config.baseHealth + (level - 1) * config.healthGrowth;
    let newMaxHealth = baseMaxHealth + equipmentStats.health;
    
    if (window.totalSurvivalHealthBonus) {
        const survivalHealthBonus = Math.floor(baseMaxHealth * window.totalSurvivalHealthBonus);
        newMaxHealth += survivalHealthBonus;
    }
    
    const oldMaxHealth = player.maxHealth;
    const healthPercentage = player.health / oldMaxHealth;
    
    player.maxHealth = newMaxHealth;
    
    if (newMaxHealth >= oldMaxHealth) {
        const healthDiff = newMaxHealth - oldMaxHealth;
        player.health += healthDiff;
    } else {
        player.health = Math.max(1, Math.floor(newMaxHealth * healthPercentage));
    }
    
    player.health = Math.min(player.health, player.maxHealth);
    
    const baseDef=config.baseDefense+Math.floor(Math.max(0,level-1)*config.defenseGrowth);
    player.defense=baseDef;
    
    // 根据角色类型计算基础能量值
    const newMaxEnergy = config.baseEnergy + equipmentStats.maxEnergy;
    const energyDiff = newMaxEnergy - player.maxEnergy;
    player.maxEnergy = newMaxEnergy;
    player.energy += energyDiff;
    
    const tacticalEnergyBonus = window.totalTacticalEnergyBonus || 0;
    player.energyRegen = config.baseEnergyRegen + equipmentStats.energyRegen + tacticalEnergyBonus;
    
    passiveEffects.updatePassiveEffects(stats);
    
    document.getElementById('attack').textContent = attackPower;
    updateHealthBar();
    updateEnergyBar();
    updateDefenseDisplay();
};

function handleReflectDamage(originalDamage, attacker) {
    if (equipmentStats.reflect > 0) {
        const reflectDamage = originalDamage * equipmentStats.reflect;
        
        if (attacker && 
            attacker.takeDamage && 
            !attacker.isDead && 
            enemies.includes(attacker)) {
            
            attacker.takeDamage(reflectDamage);
            
            for (let i = 0; i < 10; i++) {
                particles.push(new Particle(attacker.x, attacker.y, '#ffaa00'));
            }
            
            if (attacker.health <= 0) {
                const index = enemies.indexOf(attacker);
                if (index !== -1) {
                    handleEnemyDrop(attacker);
                    enemies.splice(index, 1);
                }
            }
        }
    }
}

const skillEnergyCosts = { 1: 20, 2: 30, 3: 45 };

function skill1() {
    if (skillCooldowns[1] > 0) return;
    
    if (!player.hasEnoughEnergy(skillEnergyCosts[1])) {
        return;
    }
    
    player.consumeEnergy(skillEnergyCosts[1]);
    
    if (player.characterType === 'wuyin') {
        // 无垠技能1：召唤小型机
        if (window.miniShipManager) {
            window.miniShipManager.spawnMiniShips();
        }
    } else {
        // 诺亚技能1：散弹
        const damage = attackPower * 3;
        for (let i = -3; i <= 3; i++) {
            const angle = -Math.PI / 2 + i * 0.15;
            bullets.push(new Bullet(player.x, player.y, angle, 8, damage, '#00ff00', false, null, 8));
        }
    }
    
    skillCooldowns[1] = maxSkillCooldowns[1];
    updateSkillUI(1);
}

function skill2() {
    if (skillCooldowns[2] > 0) return;
    
    if (!player.hasEnoughEnergy(skillEnergyCosts[2])) {
        return;
    }
    
    player.consumeEnergy(skillEnergyCosts[2]);
    
    if (player.characterType === 'wuyin') {
        window.laserAimingMode = true;
        player.canMove = false;
        player.invincible = true;
        
    } else {
        const damage = attackPower * 0.25;
        let fired = 0;
        
        const interval = setInterval(() => {
            if (fired >= 10 || !gameRunning) {
                clearInterval(interval);
                return;
            }
            
            let nearestEnemy = null;
            let minDist = Infinity;
            enemies.forEach(enemy => {
                const dx = enemy.x - player.x;
                const dy = enemy.y - player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDist) {
                    minDist = dist;
                    nearestEnemy = enemy;
                }
            });
            
            if (nearestEnemy) {
                const angle = Math.atan2(nearestEnemy.y - player.y, nearestEnemy.x - player.x);
                const bullet = new Bullet(player.x, player.y, angle, 25, damage, '#ff00ff', true, nearestEnemy);
                bullets.push(bullet);
            }
            
            fired++;
        }, 100);
    }
    
    skillCooldowns[2] = maxSkillCooldowns[2];
    updateSkillUI(2);
}

function skill3() {
    if (skillCooldowns[3] > 0) return;
    
    if (!player.hasEnoughEnergy(skillEnergyCosts[3])) {
        return;
    }
    
    player.consumeEnergy(skillEnergyCosts[3]);
    
    if (player.characterType === 'wuyin') {
        const shotCount = Math.min(5 + comboCount, 25) * 2;
        window.tripleShotMode = true;
        window.tripleShotCount = shotCount;
        window.tripleShotFired = 0;
        player.invincible = true;
        player.setAttackSpeed(6);
    } else {
        player.shield = true;
        player.shieldTime = 120;
    }
    
    skillCooldowns[3] = maxSkillCooldowns[3];
    updateSkillUI(3);
}

function updateSkillUI(skillNum) {
    const skillEl = document.querySelector(`[data-skill="${skillNum}"]`);
    skillEl.classList.remove('ready');
    skillEl.classList.add('cooldown');
}

function gainExperience(exp) {
    experience += exp;
    if (experience >= expToNextLevel) {
        levelUp();
    }
    updateExpBar();
}

function updateComboUI() {
    let comboDisplay = document.getElementById('comboDisplay');
    if (!comboDisplay) {
        // 创建连击UI元素
        comboDisplay = document.createElement('div');
        comboDisplay.id = 'comboDisplay';
        comboDisplay.style.cssText = `
            position: absolute;
            top: 80px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            border: 2px solid #ff6600;
            border-radius: 8px;
            padding: 8px 12px;
            color: #ff6600;
            font-size: 18px;
            font-weight: bold;
            z-index: 10;
            text-shadow: 0 0 10px #ff6600;
            box-shadow: 0 0 15px rgba(255, 102, 0, 0.5);
            display: none;
            pointer-events: none;
        `;
        document.body.appendChild(comboDisplay);
    }
    
    if (comboCount > 0) {
        comboDisplay.textContent = `连击 x${comboCount}`;
        comboDisplay.style.display = 'block';
        
        // 根据连击数调整颜色和效果
        if (comboCount >= 50) {
            comboDisplay.style.borderColor = '#ff0066';
            comboDisplay.style.color = '#ff0066';
            comboDisplay.style.textShadow = '0 0 15px #ff0066';
            comboDisplay.style.boxShadow = '0 0 25px rgba(255, 0, 102, 0.8)';
        } else if (comboCount >= 20) {
            comboDisplay.style.borderColor = '#9933ff';
            comboDisplay.style.color = '#9933ff';
            comboDisplay.style.textShadow = '0 0 12px #9933ff';
            comboDisplay.style.boxShadow = '0 0 20px rgba(153, 51, 255, 0.6)';
        } else if (comboCount >= 10) {
            comboDisplay.style.borderColor = '#ffff00';
            comboDisplay.style.color = '#ffff00';
            comboDisplay.style.textShadow = '0 0 10px #ffff00';
            comboDisplay.style.boxShadow = '0 0 15px rgba(255, 255, 0, 0.5)';
        } else {
            comboDisplay.style.borderColor = '#ff6600';
            comboDisplay.style.color = '#ff6600';
            comboDisplay.style.textShadow = '0 0 10px #ff6600';
            comboDisplay.style.boxShadow = '0 0 15px rgba(255, 102, 0, 0.5)';
        }
    } else {
        comboDisplay.style.display = 'none';
    }
}

// 获取当前总吸血值（包含连击加成）
function getTotalLifeSteal() {
    const baseLifeSteal = lifeStealMultiplier + equipmentStats.lifeSteal;
    const comboBonus = comboCount * 0.01; // 每1连击增加1%吸血
    return baseLifeSteal + comboBonus; // 直接相加，不是相乘
}

// 增加连击数
function addCombo() {
    comboCount++;
    comboTimer = COMBO_TIMEOUT;
    updateComboUI();
}

// 重置连击数
function resetCombo() {
    comboCount = 0;
    comboTimer = 0;
    updateComboUI();
}

// 更新连击计时器
function updateComboTimer(deltaTime) {
    if (comboCount > 0) {
        comboTimer -= deltaTime;
        if (comboTimer <= 0) {
            resetCombo();
        }
    }
}


function levelUp() {
    level++;
    experience -= expToNextLevel;
    expToNextLevel = 100 * level;
    
    // 根据角色类型使用不同成长公式
    const config = player.getCharacterConfig();
    baseAttackPower += config.attackGrowth;
    attackPower = Math.floor((baseAttackPower + equipmentStats.attack) * (1 + (window.totalExplosionBonus || 0)));
    player.maxHealth += config.healthGrowth;
    player.health = player.maxHealth;
    window.updatePlayerStats(equipmentStats);
    
    document.getElementById('level').textContent = level;
    document.getElementById('attack').textContent = attackPower;
    updateHealthBar();
    updateExpBar();
    
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(player.x, player.y, '#ffff00'));
    }
}

function updateHealthBar() {
    const percent = (player.health / player.maxHealth) * 100;
    document.getElementById('healthBar').style.width = percent + '%';
    document.getElementById('healthText').textContent = `${Math.round(player.health)}/${player.maxHealth}`;
}

function updateEnergyBar() {
    const percent = (player.energy / player.maxEnergy) * 100;
    document.getElementById('energyBar').style.width = percent + '%';
    document.getElementById('energyText').textContent = `${Math.round(player.energy)}/${player.maxEnergy}`;
}

function updateExpBar() {
    const percent = (experience / expToNextLevel) * 100;
    document.getElementById('expBar').style.width = percent + '%';
    document.getElementById('expText').textContent = `${Math.round(experience)}/${expToNextLevel}`;
}

function updateDefenseDisplay(){
  const el=document.getElementById('defense');
  if(el) el.textContent=Math.floor((player.defense||0)+(equipmentStats.defense||0));
}



function checkCollisions() {
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            const dx = bullet.x - enemy.x;
            const dy = bullet.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < bullet.radius + enemy.width / 2) {
                // 增加连击数 - 每次子弹命中都增加 
                addCombo();
                
                if (passiveEffects.handleHadesExecute(enemy)) {
                    enemies.splice(eIndex, 1);
                    bullets.splice(bIndex, 1);
                    return;
                }
                
                enemy.takeDamage(bullet.damage);

                if (bullet.homing || bullet.isAsuraBullet) {
                    const baseHeal = 2;
                    const totalLifeSteal = getTotalLifeSteal();
                    const healAmount = baseHeal * totalLifeSteal;
                    player.heal(healAmount);
    
                    for (let i = 0; i < 3; i++) {
                        particles.push(new Particle(player.x, player.y, '#00ff00'));
                    }
                }

                if (enemy.health <= 0) {
                    handleEnemyDrop(enemy);
                    enemies.splice(eIndex, 1);
                }

                bullets.splice(bIndex, 1);
            }
        });
    });

    waves.forEach(wave => {
        enemies.forEach((enemy, eIndex) => {
            const dx = wave.x - enemy.x;
            const dy = wave.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < wave.radius) {
                // 冲击波命中也增加连击数
                addCombo();
                
                if (passiveEffects.handleHadesExecute(enemy)) {
                    enemies.splice(eIndex, 1);
                    return;
                }
                
                if (enemy.takeDamage(wave.damage)) {
                    handleEnemyDrop(enemy);
                    enemies.splice(eIndex, 1);
                }
            }
        });
    });

    enemyBullets.forEach((bullet, bIndex) => {
        const dx = bullet.x - player.x;
        const dy = bullet.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < bullet.radius + 20) {
            const originalDamage = bullet.damage;
            handleReflectDamage(originalDamage, bullet.owner);
            
            player.takeDamage(originalDamage);
            enemyBullets.splice(bIndex, 1);
            
            if (!player.invincible) {
                for (let i = 0; i < 5; i++) {
                    particles.push(new Particle(player.x, player.y, '#ff0000'));
                }
            }
        }
    });

    enemyMissiles.forEach((missile, mIndex) => {
        const dx = missile.x - player.x;
        const dy = missile.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < missile.radius + 20) {
            const originalDamage = missile.damage;
            handleReflectDamage(originalDamage, missile.owner);
            
            player.takeDamage(originalDamage);
            enemyMissiles.splice(mIndex, 1);
            
            if (!player.invincible) {
                for (let i = 0; i < 15; i++) {
                    particles.push(new Particle(missile.x, missile.y, '#ff4444'));
                }
            }
        }
    });

    shockWaves.forEach((shockWave, sIndex) => {
        if (shockWave.isPlayerShockWave) {
            // 【修复】玩家的冲击波对敌人造成伤害 - 只对每个敌人造成一次伤害
            enemies.forEach((enemy, eIndex) => {
                if (shockWave.checkCollision(enemy.x, enemy.y)) {
                    // 【关键修复】检查该冲击波是否已经击中过这个敌人
                    if (!shockWave.hasHitEnemy || !shockWave.hasHitEnemy(enemy.id)) {
                        // 标记该敌人已被此冲击波击中
                        if (shockWave.markEnemyHit) {
                            shockWave.markEnemyHit(enemy.id);
                        }
                        
                        // 增加连击数
                        addCombo();
                        
                        // 处理哈迪斯处决效果
                        if (passiveEffects.handleHadesExecute(enemy)) {
                            enemies.splice(eIndex, 1);
                            return;
                        }
                        
                        // 对敌人造成伤害
                        if (enemy.takeDamage(shockWave.damage)) {
                            handleEnemyDrop(enemy);
                            enemies.splice(eIndex, 1);
                        }
                    }
                }
            });
            
            // 【重要】玩家的冲击波不会因为击中敌人而消失
            // 这样可以让无垠的小型机发射的3个冲击波都能对同一个敌人造成伤害
            
        } else {
            // 【保持原有逻辑】敌人的冲击波对玩家造成伤害后会消失
            if (shockWave.checkCollision(player.x, player.y)) {
                const originalDamage = shockWave.damage;
                handleReflectDamage(originalDamage, shockWave.owner);
                
                player.takeDamage(originalDamage);
                shockWaves.splice(sIndex, 1); // 敌人冲击波击中玩家后消失
                
                if (!player.invincible) {
                    for (let i = 0; i < 20; i++) {
                        particles.push(new Particle(player.x, player.y, '#ff0000'));
                    }
                }
                return;
            }
            
            // 检查与小型机碰撞（保持原有逻辑）
            if (window.miniShipManager) {
                let hitMiniShip = false;
                window.miniShipManager.miniShips.forEach(ship => {
                    if (!ship.isDead && shockWave.checkCollision(ship.x, ship.y)) {
                        ship.takeDamage(shockWave.damage);
                        for (let i = 0; i < 10; i++) {
                            particles.push(new Particle(ship.x, ship.y, '#ff0000'));
                        }
                        hitMiniShip = true;
                    }
                });
                if (hitMiniShip) {
                    shockWaves.splice(sIndex, 1); // 敌人冲击波击中小型机后消失
                    return;
                }
            }
        }
    });

    enemies.forEach((enemy, eIndex) => {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    let collisionRange = 30;
    
    if (enemy.type === 'BOSS') {
        collisionRange = 60;
    } else if (enemy.type === 'D') {
        collisionRange = 40;
    } else if (enemy.type === 'BOSS2') {
        collisionRange = 80;
    } else if (enemy.type === 'G') {
        collisionRange = 35;
    } else if (enemy.type === 'H') {
        collisionRange = 32;
    }
    
    if (dist < collisionRange) {
        let shouldDealDamage = true;
        const currentTime = Date.now();
        
        if (enemy.type === 'BOSS') {
            const originalDamage = enemy.damage * 2;
            
            if (currentTime - enemy.lastCollisionTime < enemy.collisionCooldown) {
                shouldDealDamage = false;
            } else {
                enemy.lastCollisionTime = currentTime;
            }
            
            if (shouldDealDamage) {
                handleReflectDamage(originalDamage, enemy);
                player.takeDamage(originalDamage);
            }
        } else if (enemy.type === 'BOSS2') {
            if (currentTime - enemy.lastCollisionTime < enemy.collisionCooldown) {
                shouldDealDamage = false;
            } else {
                enemy.lastCollisionTime = currentTime;
            }
            
            if (shouldDealDamage) {
                freezePlayer(3000);
                
                for (let i = 0; i < 15; i++) {
                    particles.push(new Particle(player.x, player.y, '#00ccff'));
                }
            }
        } else if (enemy.type === 'G') {
            // G类型敌人不死亡，只造成伤害（damage为0所以实际无伤害）
            const originalDamage = enemy.damage * 3;
            handleReflectDamage(originalDamage, enemy);
            player.takeDamage(originalDamage);
            
            if (!player.invincible) {
                for (let i = 0; i < 5; i++) {
                    particles.push(new Particle(player.x, player.y, '#ff0000'));
                }
            }
        } else {
            // A、B、C、D、E、F、H类型敌人撞击后直接死亡
            const originalDamage = enemy.damage * 3;
            handleReflectDamage(originalDamage, enemy);
            player.takeDamage(originalDamage);
            
            // 敌人直接死亡
            handleEnemyDrop(enemy);
            enemies.splice(eIndex, 1);
            
            if (!player.invincible) {
                for (let i = 0; i < 5; i++) {
                    particles.push(new Particle(player.x, player.y, '#ff0000'));
                }
            }
        }
    }
    if (gameStateManager.isInIceAge() && iceAgeDungeon && iceAgeDungeon.boss2) {
        const boss2 = iceAgeDungeon.boss2;
        if (boss2.iceCones && boss2.iceCones.length > 0) {
            for (let coneIndex = boss2.iceCones.length - 1; coneIndex >= 0; coneIndex--) {
                const cone = boss2.iceCones[coneIndex];
                if (cone.isAttacking && cone.checkPlayerCollision(player.x, player.y)) {
                    // 冰锥命中玩家
                    const conesDamage = 150; // 冰锥伤害
                    
                    // 处理反伤
                    handleReflectDamage(conesDamage, boss2);
                    
                    // 对玩家造成伤害
                    player.takeDamage(conesDamage);
                    
                    // 冰冻玩家（这里会检查霸体效果）
                    freezePlayer(2500);
                    
                    // 粒子特效
                    for (let i = 0; i < 12; i++) {
                        particles.push(new Particle(player.x, player.y, '#00ccff'));
                    }
                    
                    // 移除击中的冰锥
                    boss2.iceCones.splice(coneIndex, 1);
                    continue;
                }
                
                // 检查与小型机碰撞
                if (window.miniShipManager && cone.isAttacking) {
                    let hitMiniShip = false;
                    window.miniShipManager.miniShips.forEach(ship => {
                        if (!ship.isDead && cone.checkPlayerCollision(ship.x, ship.y)) {
                            ship.takeDamage(100);
                            for (let i = 0; i < 8; i++) {
                                particles.push(new Particle(ship.x, ship.y, '#00ccff'));
                            }
                            hitMiniShip = true;
                        }
                    });
                    if (hitMiniShip) {
                        boss2.iceCones.splice(coneIndex, 1);
                    }
                }
            }
        }
    }
});

    blackHoles.forEach((blackHole, index) => {
        const result = blackHole.update();
        
        if (result === 'disappeared') {
            blackHoles.splice(index, 1);
        } else if (result === 'exploded') {
            const damage = attackPower * 15;
            const explosionRadius = 150;
            
            enemies.forEach((enemy, eIndex) => {
                const dx = enemy.x - blackHole.x;
                const dy = enemy.y - blackHole.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < explosionRadius) {
                    // 黑洞爆炸也算连击
                    addCombo();
                    
                    if (passiveEffects.handleHadesExecute(enemy)) {
                        enemies.splice(eIndex, 1);
                        return;
                    }
                    
                    if (enemy.takeDamage(damage)) {
                        handleEnemyDrop(enemy);
                        enemies.splice(eIndex, 1);
                    }
                }
            });
            
            blackHoles.splice(index, 1);
            
            for (let i = 0; i < 30; i++) {
                particles.push(new Particle(blackHole.x, blackHole.y, '#9933ff'));
            }
        }
    });

    droppedItems.forEach((item, index) => {
        const dx = item.x - player.x;
        const dy = item.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 35) {
            const pickedUp = inventory.addItem(item.itemData);
            if (pickedUp) {
                droppedItems.splice(index, 1);
            }
        }
    });

    // 【关键修复】在checkCollisions函数末尾添加小型机碰撞检测
    if (window.miniShipManager) {
        window.miniShipManager.checkCollisions(enemies, enemyBullets, enemyMissiles);
    }
}

function gameOver() {
    gameRunning = false;
    
    player.health = player.maxHealth;
    player.energy = player.maxEnergy;
    updateHealthBar();
    updateEnergyBar();
    
    if (currentSaveId) {
        autoSave();
    }
    
    // 检查是否在任何副本中
    if (gameStateManager.isInEnergyEye() || 
        gameStateManager.isInStardustOrbit() || 
        gameStateManager.isInIceAge()) {
        return;
    }
    
    // 只有在无尽征程模式下才显示挑战失败UI
    if (gameStateManager.isInGame()) {
        showChallengeFailed();
    }
}

function showChallengeFailed() {
    const modal = document.createElement('div');
    modal.className = 'challenge-failed-modal';
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
            <button onclick="returnToMainMenu()" style="
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

function returnToMainMenu() {
    const modal = document.querySelector('.challenge-failed-modal');
    if (modal) {
        modal.remove();
    }
    gameStateManager.goToMain();
}

const goldStyle = document.createElement('style');
goldStyle.textContent = `
    @keyframes goldFade {
        0% { 
            opacity: 0; 
            transform: translateX(100%) scale(0.8); 
        }
        20% { 
            opacity: 1; 
            transform: translateX(0) scale(1.1); 
        }
        80% { 
            opacity: 1; 
            transform: translateX(0) scale(1); 
        }
        100% { 
            opacity: 0; 
            transform: translateX(50%) scale(0.9); 
        }
    }
`;
let stunWaves = [];
let flameColumns = [];

function updateStunWaves() {
    stunWaves.forEach((stunWave, index) => {
        stunWave.update();
        
        // 检查与玩家碰撞
        if (stunWave.isActive && stunWave.checkCollision(player.x, player.y)) {
            player.stun(60);
            stunWaves.splice(index, 1);
            return;
        }
        
        // 【新增】检查与小型机碰撞
        if (window.miniShipManager && stunWave.isActive) {
            let hitMiniShip = false;
            window.miniShipManager.miniShips.forEach(ship => {
                if (!ship.isDead && stunWave.checkCollision(ship.x, ship.y)) {
                    ship.takeDamage(stunWave.damage || Math.floor(player.maxHealth * 0.2));
                    hitMiniShip = true;
                }
            });
            if (hitMiniShip) {
                stunWaves.splice(index, 1);
                return;
            }
        }
        
        if (!stunWave.isWarning && !stunWave.isActive) {
            stunWaves.splice(index, 1);
        }
    });
}

function updateFlameColumns() {
    flameColumns.forEach((column, index) => {
        column.update();
        
        // 检查与玩家碰撞
        if (column.checkCollision(player.x, player.y)) {
            player.takeDamage(column.damage);
            for (let i = 0; i < 10; i++) {
                particles.push(new Particle(player.x, player.y, '#ff4400'));
            }
        }
        
        // 【新增】检查与小型机碰撞
        if (window.miniShipManager) {
            window.miniShipManager.miniShips.forEach(ship => {
                if (!ship.isDead && column.checkCollision(ship.x, ship.y)) {
                    ship.takeDamage(column.damage);
                    for (let i = 0; i < 5; i++) {
                        particles.push(new Particle(ship.x, ship.y, '#ff4400'));
                    }
                }
            });
        }
        
        if (!column.isActive) {
            flameColumns.splice(index, 1);
        }
    });
}

function drawStunWaves() {
    stunWaves.forEach(stunWave => stunWave.draw());
}

function drawFlameColumns() {
    flameColumns.forEach(column => column.draw());
}
document.head.appendChild(goldStyle);