class CharacterSelection {
    constructor() {
        this.selectedCharacter = null;
        this.saveName = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('select-character-btn')) {
                const characterType = e.target.dataset.character;
                this.selectCharacter(characterType);
            }
        });
    }

    showCharacterSelection(saveName) {
    this.saveName = saveName;
    
    // 隐藏开始界面
    document.getElementById('startContainer').style.display = 'none';
    document.getElementById('saveModal').style.display = 'none';
    
    // 显示角色选择界面
    document.getElementById('characterSelection').style.display = 'flex';
    
    // 添加角色卡片悬停效果
    const cards = document.querySelectorAll('.character-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.05)';
            card.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.6)';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'scale(1)';
            card.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.3)';
        });
    });
}

    hideCharacterSelection() {
        document.getElementById('characterSelection').style.display = 'none';
    }

    selectCharacter(characterType) {
        this.selectedCharacter = characterType;
        this.hideCharacterSelection();
        
        // 初始化选定角色并开始游戏
        player.initializeForCharacter(characterType);
        startGame();
        currentSaveId = saveGame(this.saveName);
        
        if (timeVortexManager) {
            timeVortexManager.loadProgressFromSave(null);
        }
        
        gameStateManager.goToMain();
    }
}

window.characterSelection = new CharacterSelection();