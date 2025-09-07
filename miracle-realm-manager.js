class MiracleRealmManager {
    constructor() {
        this.dailyAttempts = { iceAge: 30 };
        this.usedAttempts = { iceAge: 0 };
        this.isOpen = false;
        this.createUI();
    }

    createUI() {
        const container = document.createElement('div');
        container.id = 'miracleRealmContainer';
        container.className = 'miracle-realm-container';
        container.style.display = 'none';
        container.innerHTML = `
            <div class="miracle-realm-overlay">
                <div class="miracle-realm-panel">
                    <div class="realm-header">
                        <h2>奇迹之境</h2>
                        <span class="realm-subtitle">法宝材料副本</span>
                        <button class="close-btn" onclick="miracleRealmManager.close()">×</button>
                    </div>
                    <div class="dungeon-list">
                        <div class="dungeon-item ice-age-item" onclick="miracleRealmManager.enterIceAge()">
                            <img src="assets/ice_age.png" alt="冰河时代">
                            <div class="dungeon-info">
                                <h3>冰河时代</h3>
                                <p>获得法宝合成/升级材料 - 不融雪</p>
                                <div class="attempts">今日挑战: <span id="iceAgeAttempts">0</span>/30</div>
                                <div class="difficulty">难度: ★★★☆☆</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(container);
        
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .miracle-realm-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 2000;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0, 0, 0, 0.9);
            }
            
            .miracle-realm-overlay {
                background: linear-gradient(135deg, rgba(100, 150, 255, 0.1), rgba(0, 50, 150, 0.2));
                border-radius: 20px;
                padding: 30px;
                border: 3px solid #66aaff;
                box-shadow: 0 0 30px rgba(100, 170, 255, 0.5);
            }
            
            .miracle-realm-panel {
                width: 600px;
                color: white;
                
            }
            
            .realm-header {
                text-align: center;
                margin-bottom: 30px;
                position: relative;
            }
            
            .realm-header h2 {
                font-size: 32px;
                color: #66aaff;
                text-shadow: 0 0 20px #66aaff;
                margin: 0;
            }
            
            .realm-subtitle {
                font-size: 16px;
                color: #aaccff;
                display: block;
                margin-top: 5px;
            }
            
            .close-btn {
                position: absolute;
                top: -10px;
                right: -10px;
                width: 40px;
                height: 40px;
                background: #ff4444;
                border: none;
                border-radius: 50%;
                color: white;
                font-size: 24px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .close-btn:hover {
                background: #ff6666;
                transform: scale(1.1);
            }
            
            .dungeon-list {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .dungeon-item {
                display: flex;
                align-items: center;
                gap: 20px;
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(20, 40, 80, 0.4));
                border: 2px solid #4488cc;
                border-radius: 15px;
                padding: 20px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .dungeon-item:hover {
                border-color: #66aaff;
                box-shadow: 0 0 20px rgba(100, 170, 255, 0.4);
                transform: scale(1.02);
            }
            
            .ice-age-item {
                border-color: #88ccff;
            }
            
            .ice-age-item:hover {
                border-color: #aaeeff;
                box-shadow: 0 0 25px rgba(170, 238, 255, 0.5);
            }
            
            .dungeon-item img {
                width: 80px;
                height: 80px;
                border-radius: 10px;
            }
            
            .dungeon-info h3 {
                font-size: 24px;
                color: #88ccff;
                margin: 0 0 10px 0;
                text-shadow: 0 0 10px #88ccff;
            }
            
            .dungeon-info p {
                font-size: 14px;
                color: #aaccdd;
                margin: 0 0 10px 0;
            }
            
            .attempts {
                font-size: 16px;
                color: #ffcc66;
                margin: 5px 0;
            }
            
            .difficulty {
                font-size: 14px;
                color: #ff9966;
                margin: 5px 0;
            }
        `;
        document.head.appendChild(style);
    }

    failIceAge() {
    this.usedAttempts.iceAge++;
    this.saveToCurrentSave();
    this.updateAttemptsDisplay();
}

    open() {
        this.isOpen = true;
        document.getElementById('miracleRealmContainer').style.display = 'flex';
        this.updateAttemptsDisplay();
    }

    close() {
        this.isOpen = false;
        document.getElementById('miracleRealmContainer').style.display = 'none';
        gameStateManager.setState(gameStateManager.states.MAIN);
    }

    enterIceAge() {
        if (this.usedAttempts.iceAge >= this.dailyAttempts.iceAge) {
            alert('今日挑战次数已用完！');
            return;
        }
        
        // 重置被动效果
        if (typeof passiveEffects !== 'undefined') {
            passiveEffects.resetBattleState();
        }
        
        this.close();
        iceAgeDungeon.start();
    }

    completeIceAge() {
        this.usedAttempts.iceAge++;
        this.saveToCurrentSave();
        if (typeof autoSave === 'function') {
            autoSave();
        }
    }

    updateAttemptsDisplay() {
        const iceAgeElement = document.getElementById('iceAgeAttempts');
        if (iceAgeElement) {
            iceAgeElement.textContent = this.usedAttempts.iceAge;
        }
    }

    loadProgressFromSave(saveData) {
    if (saveData && saveData.iceAge !== undefined) {
        // 如果传入的是miracleRealmProgress子对象
        this.usedAttempts = { 
            iceAge: saveData.iceAge || 0
        };
    } else if (saveData && saveData.miracleRealmProgress) {
        // 如果传入的是完整的存档数据
        this.usedAttempts = { 
            iceAge: saveData.miracleRealmProgress.iceAge || 0
        };
    } else {
        this.usedAttempts = { iceAge: 0 };
    }
    this.updateAttemptsDisplay();
}

    saveToCurrentSave() {
        if (typeof currentSaveId !== 'undefined' && currentSaveId) {
            const saves = JSON.parse(localStorage.getItem('galacticWarshipSaves') || '{}');
            if (saves[currentSaveId]) {
                if (!saves[currentSaveId].miracleRealmProgress) {
                    saves[currentSaveId].miracleRealmProgress = {};
                }
                saves[currentSaveId].miracleRealmProgress.iceAge = this.usedAttempts.iceAge;
                localStorage.setItem('galacticWarshipSaves', JSON.stringify(saves));
            }
        }
    }

    resetDaily() {
        this.usedAttempts = { iceAge: 0 };
        this.saveToCurrentSave();
    }
}

// 创建全局实例
const miracleRealmManager = new MiracleRealmManager();