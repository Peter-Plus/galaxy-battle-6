class StartScreen {
    constructor() {
        this.backgroundImage = new Image();
        this.backgroundLoaded = false;
        this.backgroundImage.onload = () => {
            this.backgroundLoaded = true;
        };
        this.backgroundImage.src = 'assets/start.png';
        
        this.createStartUI();
        this.createSaveModal();
        this.hideGameUI();
    }
    
    createStartUI() {
        const startContainer = document.createElement('div');
        startContainer.id = 'startContainer';
        startContainer.className = 'start-container';
        startContainer.innerHTML = `
            <div class="start-overlay">
                <div class="start-content">
                    <h1 class="game-title">银河战舰 5.1</h1>
                    <div class="start-buttons">
                        <button class="start-btn" id="startGameBtn">开始游戏</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(startContainer);
        
        document.getElementById('startGameBtn').addEventListener('click', async () => {
            const elem = document.documentElement;
            try {
                if (!document.fullscreenElement) {
                    if (elem.requestFullscreen) {
                        await elem.requestFullscreen();
                    } else if (elem.webkitRequestFullscreen) {
                        await elem.webkitRequestFullscreen();
                    } else if (elem.msRequestFullscreen) {
                        await elem.msRequestFullscreen();
                    }
                }
            } catch (e) {
                console.warn('全屏请求被拒绝或失败：', e);
            }
            this.showSaveModal();
        });
    }
    
    createSaveModal() {
        const saveModal = document.createElement('div');
        saveModal.id = 'saveModal';
        saveModal.className = 'save-modal';
        saveModal.style.display = 'none';
        saveModal.innerHTML = `
            <div class="save-modal-content">
                <div class="save-modal-header">
                    <h2>选择存档</h2>
                    <button class="close-btn" id="closeSaveModal">×</button>
                </div>
                <div class="save-modal-body">
                    <div class="save-actions">
                        <button class="new-game-btn" id="newGameBtn">新游戏</button>
                    </div>
                    <div class="save-list" id="saveList"></div>
                </div>
            </div>
        `;
        document.body.appendChild(saveModal);
        
        document.getElementById('closeSaveModal').addEventListener('click', () => {
            this.hideSaveModal();
        });
        
        document.getElementById('newGameBtn').addEventListener('click', () => {
            this.createNewGame();
        });
        
        saveModal.addEventListener('click', (e) => {
            if (e.target === saveModal) {
                this.hideSaveModal();
            }
        });
    }
    
    showSaveModal() {
        document.getElementById('saveModal').style.display = 'flex';
        this.updateSaveList();
    }
    
    hideSaveModal() {
        document.getElementById('saveModal').style.display = 'none';
    }
    
    updateSaveList() {
    const saveList = document.getElementById('saveList');
    const saves = getSaves();
    
    saveList.innerHTML = '';
    
    if (Object.keys(saves).length === 0) {
        saveList.innerHTML = '<div class="no-saves">暂无存档</div>';
        return;
    }
    
    Object.values(saves).sort((a, b) => b.timestamp - a.timestamp).forEach(save => {
        const saveItem = document.createElement('div');
        saveItem.className = 'save-item';
        
        const date = new Date(save.timestamp);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        // 获取角色信息
        const characterType = save.characterType || 'noah';
        const characterName = characterType === 'wuyin' ? '无垠' : '诺亚';
        
        // 获取战斗力，如果旧存档没有战斗力则显示为0
        const combatPower = save.combatPower || 0;
        
        saveItem.innerHTML = `
            <div class="save-info">
                <div class="save-name">${save.name}</div>
                <div class="save-details">
                    <span>角色: ${characterName}</span>
                    <span>等级: ${save.game.level}</span>
                    <span>波次: ${save.game.currentWave}</span>
                    <span class="combat-power">战斗力: ${combatPower.toLocaleString()}</span>
                </div>
                <div class="save-date">${dateStr}</div>
            </div>
            <div class="save-actions">
                <button class="load-btn" data-save-id="${save.id}">载入</button>
                <button class="delete-btn" data-save-id="${save.id}">删除</button>
            </div>
        `;
        
        saveList.appendChild(saveItem);
    });
    
    saveList.addEventListener('click', (e) => {
        if (e.target.classList.contains('load-btn')) {
            const saveId = e.target.dataset.saveId;
            this.loadGame(saveId);
        } else if (e.target.classList.contains('delete-btn')) {
            const saveId = e.target.dataset.saveId;
            this.deleteSave(saveId);
        }
    });
}
    
    createNewGame() {
        const modal = document.createElement('div');
        modal.className = 'name-modal';
        modal.innerHTML = `
            <div class="name-modal-content">
                <h3>输入存档名称</h3>
                <input type="text" id="saveNameInput" placeholder="请输入存档名称" maxlength="20">
                <div class="name-modal-buttons">
                    <button id="confirmNameBtn">确定</button>
                    <button id="cancelNameBtn">取消</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const input = document.getElementById('saveNameInput');
        input.focus();
        input.value = `存档 ${new Date().toLocaleString()}`;
        input.select();
        
        document.getElementById('confirmNameBtn').addEventListener('click', () => {
            const name = input.value.trim() || `存档 ${new Date().toLocaleString()}`;
            modal.remove();
            this.startNewGame(name);
        });
        
        document.getElementById('cancelNameBtn').addEventListener('click', () => {
            modal.remove();
        });
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const name = input.value.trim() || `存档 ${new Date().toLocaleString()}`;
                modal.remove();
                this.startNewGame(name);
            }
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    startNewGame(saveName) {
        this.hideSaveModal(); // 先关闭存档选择窗口  
        window.characterSelection.showCharacterSelection(saveName);
    }
    
    loadGame(saveId) {
        this.hideSaveModal(); // 先关闭存档选择窗口
        startGame(saveId);
        
        // 加载游戏会自动通过 loadGame 函数加载每日挑战数据
        // 无需额外操作
        
        gameStateManager.goToMain();
    }
    
    deleteSave(saveId) {
        const modal = document.createElement('div');
        modal.className = 'confirm-modal';
        modal.innerHTML = `
            <div class="confirm-modal-content">
                <h3>确认删除</h3>
                <p>确定要删除这个存档吗？此操作不可撤销。</p>
                <div class="confirm-modal-buttons">
                    <button id="confirmDeleteBtn">确定</button>
                    <button id="cancelDeleteBtn">取消</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            deleteSave(saveId);
            modal.remove();
            this.updateSaveList();
        });
        
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    hideStartScreen() {
        document.getElementById('startContainer').style.display = 'none';
        document.getElementById('saveModal').style.display = 'none';
        this.showGameUI();
    }
    
    hideGameUI() {
    const uiElements = [
        '.ui',
        '.wave-info', 
        '.skill-bar',
        '.passive-indicator'
    ];
    
    uiElements.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.display = 'none';
        }
    });
}

showGameUI() {
    const uiElements = [
        '.ui',
        '.wave-info',
        '.skill-bar'
    ];
    
    uiElements.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.display = '';
        }
    });
    }
    
    render() {
        const ctx = canvas.getContext('2d');
        
        if (this.backgroundLoaded) {
            const scale = Math.max(canvas.width / this.backgroundImage.width, canvas.height / this.backgroundImage.height);
            const x = (canvas.width - this.backgroundImage.width * scale) / 2;
            const y = (canvas.height - this.backgroundImage.height * scale) / 2;
            
            ctx.drawImage(this.backgroundImage, x, y, this.backgroundImage.width * scale, this.backgroundImage.height * scale);
        } else {
            ctx.fillStyle = 'linear-gradient(180deg, #000428 0%, #004e92 100%)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        stars.forEach(star => {
            star.update();
            star.draw();
        });
    }
}

// 如果需要迁移旧存档的每日挑战数据，可以添加这个函数
function migrateOldSaves() {
    const saves = JSON.parse(localStorage.getItem('galacticWarshipSaves') || '{}');
    let hasChanges = false;
    
    // 尝试从旧的全局存储中读取每日挑战数据
    const oldDate = localStorage.getItem('timeVortexDate');
    const oldAttempts = localStorage.getItem('timeVortexAttempts');
    
    // 为没有每日挑战数据的存档添加默认数据
    Object.keys(saves).forEach(saveId => {
        const save = saves[saveId];
        if (!save.dailyProgress) {
            // 如果有旧的全局数据且是今天的，则使用旧数据
            if (oldDate === new Date().toDateString() && oldAttempts) {
                try {
                    const parsedAttempts = JSON.parse(oldAttempts);
                    save.dailyProgress = {
                        date: oldDate,
                        usedAttempts: parsedAttempts
                    };
                } catch (e) {
                    // 解析失败，使用默认值
                    save.dailyProgress = {
                        date: new Date().toDateString(),
                        usedAttempts: { energyEye: 0 }
                    };
                }
            } else {
                // 没有旧数据或不是今天的数据，使用默认值
                save.dailyProgress = {
                    date: new Date().toDateString(),
                    usedAttempts: { energyEye: 0 }
                };
            }
            hasChanges = true;
        }
    });
    
    // 如果有更改，保存回localStorage
    if (hasChanges) {
        localStorage.setItem('galacticWarshipSaves', JSON.stringify(saves));
        console.log('已为旧存档添加每日挑战数据');
    }
    
    // 清除旧的全局每日挑战数据（可选）
    if (oldDate && oldAttempts) {
        localStorage.removeItem('timeVortexDate');
        localStorage.removeItem('timeVortexAttempts');
        console.log('已清除旧的全局每日挑战数据');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    migrateOldSaves();
});

const startScreen = new StartScreen();