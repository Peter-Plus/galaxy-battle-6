class TimeVortexManager {
    constructor() {
        this.dailyAttempts = { energyEye: 6, stardustOrbit: 6 };
        this.usedAttempts = { energyEye: 0, stardustOrbit: 0 };
        this.isOpen = false;
        this.createUI();
    }

    createUI() {
        const container = document.createElement('div');
        container.id = 'timeVortexContainer';
        container.className = 'time-vortex-container';
        container.style.display = 'none';
        container.innerHTML = `
            <div class="time-vortex-overlay">
                <div class="time-vortex-panel">
                    <div class="vortex-header">
                        <h2>时空漩涡</h2>
                        <button class="close-btn" onclick="timeVortexManager.close()">×</button>
                    </div>
                    <div class="dungeon-list">
                        <div class="dungeon-item" onclick="timeVortexManager.enterEnergyEye()">
                            <img src="assets/energy_eye.png" alt="能源之眼">
                            <div class="dungeon-info">
                                <h3>能源之眼</h3>
                                <p>获得血瓶、能量瓶、强力药水、护体药水</p>
                                <div class="attempts">今日挑战: <span id="energyEyeAttempts">0</span>/6</div>
                            </div>
                        </div>
                        <div class="dungeon-item" onclick="timeVortexManager.enterStardustOrbit()">
                            <img src="assets/stardust-orbit.png" alt="星尘轨道">
                            <div class="dungeon-info">
                                <h3>星尘轨道</h3>
                                <p>获得玄铁、炎晶、雷砂</p>
                                <div class="attempts">今日挑战: <span id="stardustOrbitAttempts">0</span>/6</div>
                                <div class="unlock-condition">需要无尽征程20波</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(container);
    }

    open() {
        this.isOpen = true;
        document.getElementById('timeVortexContainer').style.display = 'flex';
        this.updateAttemptsDisplay();
        this.updateStardustOrbitStatus();
    }

    updateStardustOrbitStatus() {
    const unlockCondition = document.querySelector('.unlock-condition');
    if (unlockCondition) {
        const wave = currentWave || 1;
        
        if (wave >= 20) {
            unlockCondition.style.display = 'none';
        } else {
            unlockCondition.style.display = 'block';
            unlockCondition.textContent = `需要无尽征程达到20波`;
        }
    }
}

    close() {
        this.isOpen = false;
        document.getElementById('timeVortexContainer').style.display = 'none';
    }

    enterEnergyEye() {
        if (this.usedAttempts.energyEye >= this.dailyAttempts.energyEye) {
            alert('今日挑战次数已用完！');
            return;
        }
        if (typeof passiveEffects !== 'undefined') {
            passiveEffects.resetBattleState();
        }
        this.close();
        energyEyeDungeon.start();
    }

    enterStardustOrbit() {
    if (window.currentWave < 20) {
        alert('需要无尽征程达到20波才能开放星尘轨道！');
        return;
    }
    if (this.usedAttempts.stardustOrbit >= this.dailyAttempts.stardustOrbit) {
        alert('今日挑战次数已用完！');
        return;
    }
    if (typeof passiveEffects !== 'undefined') {
        passiveEffects.resetBattleState();
    }
    this.close();
    stardustOrbitDungeon.start();  // 直接调用，完全学习能源之眼的方式，不做任何检查
}

    completeEnergyEye(damagePercent) {
    this.usedAttempts.energyEye++;
    this.calculateEnergyEyeRewards(damagePercent, () => {
        this.saveToCurrentSave();
        if (typeof autoSave === 'function') {
            autoSave();
        }
    });
}

    completeStardustOrbit(damagePercent) {
    this.usedAttempts.stardustOrbit++;
    this.calculateStardustOrbitRewards(damagePercent, () => {
        this.saveToCurrentSave();
        if (typeof autoSave === 'function') {
            autoSave();
        }
    });
}

    calculateEnergyEyeRewards(damagePercent, onComplete) {
        const baseRewards = { '血瓶': 10, '能量瓶': 10, '强力药水': 8, '护体药水': 8 };
        const actualRewards = {};
        
        for (const [item, amount] of Object.entries(baseRewards)) {
            actualRewards[item] = Math.ceil(amount * damagePercent);
        }

        for (const [itemName, amount] of Object.entries(actualRewards)) {
            if (amount > 0) {
                try {
                    let itemData;
                    if (window.Catalog && typeof window.Catalog.generateItem === 'function') {
                        itemData = window.Catalog.generateItem(itemName, amount);
                    } else if (window.ItemGenerator && typeof window.ItemGenerator.generateItem === 'function') {
                        itemData = window.ItemGenerator.generateItem(itemName, amount);
                    } else {
                        itemData = {
                            name: itemName,
                            quality: 0,
                            stats: {},
                            category: 'consumable',
                            quantity: amount
                        };
                    }
                    
                    if (itemData) {
                        inventory.addItem(itemData);
                    }
                } catch (error) {
                    console.error(`添加奖励物品失败: ${itemName}`, error);
                }
            }
        }

        if (typeof onComplete === 'function') {
            onComplete();
        }

        this.showRewardDialog(actualRewards, damagePercent, '能源之眼');
    }

    calculateStardustOrbitRewards(damagePercent, onComplete) {
        const baseRewards = { '玄铁': 10, '炎晶': 10, '雷砂': 10 };
        const actualRewards = {};
        
        for (const [item, amount] of Object.entries(baseRewards)) {
            actualRewards[item] = Math.ceil(amount * damagePercent);
        }

        for (const [itemName, amount] of Object.entries(actualRewards)) {
            if (amount > 0) {
                try {
                    let itemData;
                    if (window.Catalog && typeof window.Catalog.generateItem === 'function') {
                        itemData = window.Catalog.generateItem(itemName, amount);
                    } else if (window.ItemGenerator && typeof window.ItemGenerator.generateItem === 'function') {
                        itemData = window.ItemGenerator.generateItem(itemName, amount);
                    } else {
                        itemData = {
                            name: itemName,
                            quality: 0,
                            stats: {},
                            category: 'material',
                            quantity: amount
                        };
                    }
                    
                    if (itemData) {
                        inventory.addItem(itemData);
                    }
                } catch (error) {
                    console.error(`添加奖励物品失败: ${itemName}`, error);
                }
            }
        }

        if (typeof onComplete === 'function') {
            onComplete();
        }

        this.showRewardDialog(actualRewards, damagePercent, '星尘轨道');
    }

    showRewardDialog(rewards, damagePercent, dungeonName) {
        const modal = document.createElement('div');
        modal.className = 'reward-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 3000;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.9);
        `;

        const rewardList = Object.entries(rewards)
            .filter(([item, amount]) => amount > 0)
            .map(([item, amount]) => `${item} × ${amount}`)
            .join('\n');

        modal.innerHTML = `
            <div class="reward-content">
                <h3>${dungeonName}挑战完成</h3>
                <p>造成伤害: ${(damagePercent * 100).toFixed(1)}%</p>
                <div class="reward-list">${rewardList}</div>
                <button onclick="this.closest('.reward-modal').remove()">确定</button>
            </div>
        `;

        document.body.appendChild(modal);

        setTimeout(() => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });
        }, 100);
    }

    updateAttemptsDisplay() {
        const energyEyeElement = document.getElementById('energyEyeAttempts');
        const stardustOrbitElement = document.getElementById('stardustOrbitAttempts');
        
        if (energyEyeElement) {
            energyEyeElement.textContent = this.usedAttempts.energyEye;
        }
        if (stardustOrbitElement) {
            stardustOrbitElement.textContent = this.usedAttempts.stardustOrbit;
        }
    }

    loadProgressFromSave(saveData) {
        if (saveData && saveData.attempts) {
            this.usedAttempts = { 
                energyEye: saveData.attempts.energyEye || 0,
                stardustOrbit: saveData.attempts.stardustOrbit || 0
            };
        } else {
            this.usedAttempts = { energyEye: 0, stardustOrbit: 0 };
        }
        this.updateAttemptsDisplay();
    }

    saveToCurrentSave() {
        if (typeof currentSaveId === 'undefined' || !currentSaveId) return;

        try {
            const saves = JSON.parse(localStorage.getItem('galacticWarshipSaves') || '{}');
            if (saves[currentSaveId] && saves[currentSaveId].dailyProgress) {
                saves[currentSaveId].dailyProgress.attempts = { ...this.usedAttempts };
                localStorage.setItem('galacticWarshipSaves', JSON.stringify(saves));
            }
        } catch (error) {
            console.error('保存每日进度失败', error);
        }
    }

    resetDailyAttempts() {
        this.usedAttempts = { energyEye: 0, stardustOrbit: 0 };
        this.updateAttemptsDisplay();
        this.saveToCurrentSave();
    }
    getDailyProgressData() {
    return {
        attempts: {
            energyEye: this.usedAttempts.energyEye,
            stardustOrbit: this.usedAttempts.stardustOrbit
        }
    };

}
}

class TimeVortexUI {
    constructor() {
        this.addTimeVortexStyles();
    }

    addTimeVortexStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .time-vortex-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 2500;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0, 0, 0, 0.8);
            }

            .time-vortex-overlay {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .time-vortex-panel {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border: 2px solid #00ffff;
  border-radius: 15px;
  width: 700px;
  max-width: 90vw;
  padding: 20px;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
  position: relative;
}
            .vortex-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                color: #00ffff;
            }

            .vortex-header h2 {
                margin: 0;
                font-size: 28px;
                text-shadow: 0 0 10px #00ffff;
            }

            .close-btn {
    background: transparent;
    border: 2px solid #ff4444;
    color: #ff4444;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-size: 24px;
    cursor: pointer;
    transition: all 0.3s;
    position: absolute;
    top: 0px;
    right: 0px;
    z-index: 10;
}

            .close-btn:hover {
                background: #ff4444;
                color: white;
                transform: scale(1.1);
            }

            .dungeon-list {
                display: grid;
                gap: 20px;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            }

            .dungeon-item {
                background: linear-gradient(135deg, #2a2a3e, #1e1e3e);
                border: 2px solid #444;
                border-radius: 10px;
                padding: 20px;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .dungeon-item:hover {
                border-color: #00ffff;
                box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
                transform: scale(1.02);
            }

            .dungeon-item img {
                width: 60px;
                height: 60px;
                border-radius: 8px;
                object-fit: cover;
            }

            .dungeon-info {
                flex: 1;
            }

            .dungeon-info h3 {
                margin: 0 0 8px 0;
                color: #00ffff;
                font-size: 18px;
                text-shadow: 0 0 5px #00ffff;
            }

            .dungeon-info p {
                margin: 0 0 10px 0;
                color: #cccccc;
                font-size: 14px;
                line-height: 1.4;
            }

            .attempts {
                color: #ffaa00;
                font-weight: bold;
                font-size: 14px;
            }

            .unlock-condition {
                color: #ff6666;
                font-size: 12px;
                font-style: italic;
                margin-top: 5px;
            }

            .reward-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 3000;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0, 0, 0, 0.9);
            }

            .reward-content {
                background: linear-gradient(135deg, #1a1a2e, #16213e);
                border: 2px solid #00ff00;
                border-radius: 15px;
                padding: 30px;
                text-align: center;
                color: white;
                max-width: 400px;
                box-shadow: 0 0 30px rgba(0, 255, 0, 0.3);
            }

            .reward-content h3 {
                margin: 0 0 15px 0;
                color: #00ff00;
                font-size: 24px;
                text-shadow: 0 0 10px #00ff00;
            }

            .reward-content p {
                margin: 0 0 20px 0;
                color: #cccccc;
                font-size: 16px;
            }

            .reward-list {
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(0, 255, 0, 0.3);
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                white-space: pre-line;
                color: #00ff00;
                font-weight: bold;
            }

            .reward-content button {
                background: linear-gradient(45deg, #00ff00, #00aa00);
                border: none;
                border-radius: 8px;
                padding: 12px 30px;
                color: black;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 16px;
            }

            .reward-content button:hover {
                transform: scale(1.05);
                box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
            }
        `;
        document.head.appendChild(style);
    }
}

new TimeVortexUI();

const timeVortexManager = new TimeVortexManager();