class AchievementSystem {
    constructor() {
        this.isOpen = false;
        this.currentTab = 'achievements';
        
        this.achievements = {
    1: {
        id: 1,
        name: '牛刀小试',
        description: '等级达到10级',
        condition: 'level',
        target: 10,
        rewards: { points: 50, medals: 20 },
        completed: false,
        claimed: false
    },
    2: {
        id: 2,
        name: '初露锋芒',
        description: '等级达到20级',
        condition: 'level',
        target: 20,
        rewards: { points: 80, medals: 20 },
        completed: false,
        claimed: false
    },
    3: {
        id: 3,
        name: '无尽试炼·一',
        description: '无尽征程通关20波',
        condition: 'wave',
        target: 20,
        rewards: { points: 80, medals: 30 },
        completed: false,
        claimed: false
    },
    4: {
        id: 4,
        name: '生存高手',
        description: '生存晶核等级达到30级',
        condition: 'survivalCore',
        target: 30,
        rewards: { points: 60, medals: 20 },
        completed: false,
        claimed: false
    },
    5: {
        id: 5,
        name: '战斗狂魔',
        description: '爆发晶核等级达到30级',
        condition: 'burstCore',
        target: 30,
        rewards: { points: 60, medals: 20 },
        completed: false,
        claimed: false
    },
    6: {
        id: 6,
        name: '战术专家',
        description: '战术晶核等级达到30级',
        condition: 'tacticalCore',
        target: 30,
        rewards: { points: 60, medals: 20 },
        completed: false,
        claimed: false
    },
    7: {
        id: 7,
        name: '药水大师',
        description: '总药水数量达到100个',
        condition: 'totalPotions',
        target: 100,
        rewards: { points: 70, medals: 25 },
        completed: false,
        claimed: false
    },
    8: {
        id: 8,
        name: '初级收藏家',
        description: '背包物品数量（堆叠算一个）达到40个',
        condition: 'inventoryItems',
        target: 40,
        rewards: { points: 50, medals: 15 },
        completed: false,
        claimed: false
    },
    9: {
        id: 9,
        name: '中级收藏家',
        description: '背包拥有神器品质装备3件且物品数量达到50个',
        condition: 'midCollector',
        target: 1,
        rewards: { points: 100, medals: 30 },
        completed: false,
        claimed: false
    },
    10: {
        id: 10,
        name: '高级收藏家',
        description: '背包拥有所有种类神器品质装备且物品数量达到60个',
        condition: 'advancedCollector',
        target: 1,
        rewards: { points: 300, medals: 80 },
        completed: false,
        claimed: false
    },
    11: {
        id: 11,
        name: '当打之年',
        description: '等级达到30级',
        condition: 'level',
        target: 30,
        rewards: { points: 80, medals: 20 },
        completed: false,
        claimed: false
    },
    12: {
        id: 12,
        name: '久经沙场',
        description: '无尽征程达到100波',
        condition: 'wave',
        target: 100,
        rewards: { points: 200, medals: 50 },
        completed: false,
        claimed: false
    },
    13: {
        id: 13,
        name: '踏上征途',
        description: '等级达到1级',
        condition: 'level',
        target: 1,
        rewards: { points: 10, medals: 5 },
        completed: false,
        claimed: false
    },
    14: {
        id: 14,
        name: '宝器现世',
        description: '背包中获得一件法宝',
        condition: 'hasTreasure',
        target: 1,
        rewards: { points: 80, medals: 30 },
        completed: false,
        claimed: false
    },
    15: {
        id: 15,
        name: '凶兽·梼杌',
        description: '通关副本冰河时代（击败boss2梼杌）',
        condition: 'defeatTaowu',
        target: 1,
        rewards: { points: 80, medals: 30 },
        completed: false,
        claimed: false
    },
    16: {
        id: 16,
        name: '神兵在手',
        description: '拥有一件满级（10级）法宝',
        condition: 'maxLevelTreasure',
        target: 1,
        rewards: { points: 150, medals: 60 },
        completed: false,
        claimed: false
    }
};
        
        this.achievementPoints = 0;
        this.achievementMedals = 0;
        
        this.shopItems = [
    {
        name: '不融雪',
        price: 20,
        description: '渺沧海，尽茫茫。铁骨不融，一念寒光裂九荒。夜无疆。',
        limitPurchase: 1,
        purchased: 0,
        category: 'material'
    },
    {
  name: '新手宝箱',
  price: 5, 
  description: '新手超级礼包！打开后获得神秘奖励！',
  limitPurchase: 1,
  purchased: 0,
  category: 'consumable'
    },
    {
  name: '神珍铁',
  price: 100, 
  description: '神珍装备的珍稀合成材料',
  limitPurchase: 2,
  purchased: 0,
  category: 'material'
    },
    
    {
        name: '史诗品质毁灭之刃',
        price: 50,
        description: '史诗品质武器，高攻但牺牲生存',
        limitPurchase: 2,
        purchased: 0,
        equipmentName: '毁灭之刃',
        quality: 3,
        category: 'equipment'
    },
    {
        name: '史诗品质逐日弓',
        price: 60,
        description: '史诗品质武器，平衡远程武器',
        limitPurchase: 2,
        purchased: 0,
        equipmentName: '逐日弓',
        quality: 3,
        category: 'equipment'
    },
    {
        name: '史诗品质反伤甲',
        price: 60,
        description: '史诗品质装甲，反弹部分伤害',
        limitPurchase: 2,
        purchased: 0,
        equipmentName: '反伤甲',
        quality: 3,
        category: 'equipment'
    },
    {
        name: '史诗品质源流钢炮',
        price: 50,
        description: '史诗品质武器，提供持续回能',
        limitPurchase: 2,
        purchased: 0,
        equipmentName: '源流钢炮',
        quality: 3,
        category: 'equipment'
    },
    {
        name: '护体药水',
        price: 10,
        description: '提供临时防护效果',
        limitPurchase: null,
        purchased: 0,
        category: 'consumable'
    },
    {
        name: '强力药水',
        price: 10,
        description: '提供临时攻击力加成',
        limitPurchase: null,
        purchased: 0,
        category: 'consumable'
    },
    {
        name: '能量瓶',
        price: 8,
        description: '恢复能量',
        limitPurchase: null,
        purchased: 0,
        category: 'consumable'
    },
    {
        name: '胜利飞燕一号',
        price: 100,
        description: '传说品质时装，改变角色外观',
        limitPurchase: 1,
        purchased: 0,
        category: 'costume'
    }
];
        
        this.createAchievementUI();
        this.setupEventListeners();
        this.waitForRenderers();
    }

    waitForRenderers() {
    const checkRenderers = () => {
        const equipmentReady = window.equipmentIconRenderer?.isReady || false;
        const itemReady = window.itemIconRenderer?.isReady || false;
        
        if (equipmentReady && itemReady) {
            console.log('✅ 图标渲染器已就绪，更新成就商店显示');
            if (this.isShopVisible) {
                this.updateShopList();
            }
        } else {
            setTimeout(checkRenderers, 500);
        }
    };
    
    setTimeout(checkRenderers, 100);
}

    // 获取保存数据
getSaveData() {
    return {
        achievements: this.achievements,
        achievementPoints: this.achievementPoints,
        achievementMedals: this.achievementMedals,
        shopItems: this.shopItems.map(item => ({
            name: item.name,
            purchased: item.purchased  // 保存购买情况
        }))
    };
}

// 加载保存数据
loadSaveData(saveData) {
    if (!saveData) return;
    
    // 加载成就数据
    if (saveData.achievements) {
        this.achievements = { ...this.achievements, ...saveData.achievements };
    }
    
    // 加载成就点数和勋章
    this.achievementPoints = saveData.achievementPoints || 0;
    this.achievementMedals = saveData.achievementMedals || 0;
    
    // 加载商店购买情况
    if (saveData.shopItems) {
        saveData.shopItems.forEach(savedItem => {
            const shopItem = this.shopItems.find(item => item.name === savedItem.name);
            if (shopItem) {
                shopItem.purchased = savedItem.purchased || 0;
            }
        });
    }
    
    this.updateDisplay();
    if (this.isShopVisible) {
        this.updateShopList();
    }
}
    
    createAchievementUI() {
        const achievementContainer = document.createElement('div');
        achievementContainer.id = 'achievementContainer';
        achievementContainer.className = 'achievement-container';
        achievementContainer.style.display = 'none';
        achievementContainer.innerHTML = `
            <div class="achievement-panel">
                <div class="achievement-header">
                    <h2>成就系统</h2>
                    <button class="close-btn" onclick="achievementSystem.toggleAchievement()">×</button>
                </div>
                <div class="achievement-tabs">
                    <button class="tab-btn active" data-tab="achievements">成就达成</button>
                    <button class="tab-btn" data-tab="shop">成就商店</button>
                </div>
                <div class="achievement-stats">
                    <div class="stat-item">
                        <span class="stat-label">成就点数：</span>
                        <span class="stat-value" id="achievementPoints">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">成就勋章：</span>
                        <span class="stat-value" id="achievementMedals">0</span>
                    </div>
                </div>
                <div class="achievement-content">
                    <div id="achievementsTab" class="tab-content active">
                        <div class="achievements-list" id="achievementsList"></div>
                    </div>
                    <div id="shopTab" class="tab-content">
                        <div class="achievement-shop-list" id="achievementShopList"></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(achievementContainer);
        
        this.addAchievementStyles();
    }
    
    addAchievementStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .achievement-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.8);
                z-index: 3000;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .achievement-panel {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border: 3px solid #ffdd00;
  border-radius: 15px;
  padding: 20px;
  width: 900px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 0 30px #ffdd00;
  position: relative;
}
            
            .achievement-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 2px solid #ffdd00;
            }
            
            .achievement-header h2 {
                color: #ffdd00;
                margin: 0;
                text-shadow: 0 0 10px #ffdd00;
            }
            
.close-btn {
    background: linear-gradient(135deg, #ff4444, #cc0000);
    border: 2px solid #ff6666;
    color: white;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 22px;
    font-weight: bold;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: absolute;
    top: -20px;
    right: -20px;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 
        0 4px 15px rgba(255, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.2);
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.close-btn:hover {
    background: linear-gradient(135deg, #ff6666, #ff0000);
    border-color: #ff8888;
    transform: scale(1.15) rotate(90deg);
    box-shadow: 
        0 0 25px rgba(255, 0, 0, 0.6),
        0 0 40px rgba(255, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.close-btn:active {
    transform: scale(1.05) rotate(90deg);
    box-shadow: 
        0 2px 10px rgba(255, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
}
            
            .achievement-tabs {
                display: flex;
                margin-bottom: 15px;
                gap: 10px;
            }
            
            .tab-btn {
                padding: 12px 25px;
                background: rgba(255, 255, 255, 0.1);
                border: 2px solid #666;
                border-radius: 8px;
                color: #ccc;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 14px;
                font-weight: bold;
            }
            
            .tab-btn.active, .tab-btn:hover {
                background: linear-gradient(45deg, #ffdd00, #ffa500);
                border-color: #ffdd00;
                color: #000;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(255, 221, 0, 0.3);
            }
            
            .achievement-stats {
                display: flex;
                justify-content: space-around;
                margin-bottom: 20px;
                padding: 15px;
                background: rgba(255, 221, 0, 0.1);
                border: 1px solid #ffdd00;
                border-radius: 8px;
            }
            
            .stat-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
            }
            
            .stat-label {
                color: #ffdd00;
                font-size: 14px;
                font-weight: bold;
            }
            
            .stat-value {
                color: #00ff00;
                font-size: 18px;
                font-weight: bold;
                text-shadow: 0 0 8px #00ff00;
            }
            
            .tab-content {
                display: none;
                min-height: 400px;
            }
            
            .tab-content.active {
                display: block;
            }
            
            .achievement-item {
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(20, 20, 40, 0.6));
                border: 2px solid #666;
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 15px;
                transition: all 0.3s;
                position: relative;
            }
            
            .achievement-item.completed {
                border-color: #00ff00;
                box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
            }
            
            .achievement-item.claimed {
                border-color: #ffdd00;
                box-shadow: 0 0 15px rgba(255, 221, 0, 0.3);
                opacity: 0.7;
            }
            
            .achievement-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .achievement-details h3 {
                margin: 0 0 5px 0;
                color: #ffdd00;
                font-size: 16px;
            }
            
            .achievement-details p {
                margin: 0 0 10px 0;
                color: #ccc;
                font-size: 14px;
            }
            
            .achievement-progress {
                font-size: 12px;
                color: #00ff00;
            }
            
            .achievement-rewards {
                display: flex;
                align-items: center;
                gap: 15px;
                color: #ffa500;
                font-size: 14px;
                font-weight: bold;
            }
            
            .claim-btn {
                padding: 8px 16px;
                background: linear-gradient(45deg, #00ff00, #32cd32);
                border: none;
                border-radius: 6px;
                color: #000;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 12px;
            }
            
            .claim-btn:hover:not(:disabled) {
                transform: scale(1.05);
                box-shadow: 0 0 15px #00ff00;
            }
            
            .claim-btn:disabled {
                background: #666;
                color: #999;
                cursor: not-allowed;
                opacity: 0.5;
            }
            
            .shop-item {
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(20, 20, 40, 0.6));
                border: 2px solid #666;
                border-radius: 10px;
                padding: 15px;
                margin-bottom: 15px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                transition: all 0.3s;
            }
            
            .shop-item:hover {
                border-color: #ffdd00;
                transform: translateX(5px);
                box-shadow: 0 0 15px rgba(255, 221, 0, 0.3);
            }
            
            .shop-item-info h3 {
                margin: 0 0 5px 0;
                color: #ffdd00;
                font-size: 16px;
            }
            
            .shop-item-info p {
                margin: 0;
                color: #ccc;
                font-size: 14px;
            }
            
            .shop-item-price {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
            }
            
            .price-text {
                color: #ffa500;
                font-weight: bold;
                font-size: 14px;
            }
            
            .buy-btn {
                padding: 8px 16px;
                background: linear-gradient(45deg, #ffdd00, #ffa500);
                border: none;
                border-radius: 6px;
                color: #000;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
                font-size: 12px;
            }
            
            .buy-btn:hover:not(:disabled) {
                transform: scale(1.05);
                box-shadow: 0 0 15px #ffdd00;
            }
            
            .buy-btn:disabled {
                background: #666;
                color: #999;
                cursor: not-allowed;
                opacity: 0.5;
            }
            .achievement-panel::-webkit-scrollbar {
    width: 14px;
}

.achievement-panel::-webkit-scrollbar-track {
    background: linear-gradient(180deg, 
        rgba(10, 20, 40, 0.8), 
        rgba(20, 30, 50, 0.8)
    );
    border-radius: 7px;
    border: 1px solid rgba(255, 221, 0, 0.1);
    box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.6);
}

.achievement-panel::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, 
        rgba(255, 221, 0, 0.9), 
        rgba(255, 165, 0, 0.7),
        rgba(255, 100, 0, 0.9)
    );
    border-radius: 7px;
    border: 1px solid rgba(255, 221, 0, 0.4);
    box-shadow: 
        0 0 12px rgba(255, 221, 0, 0.5),
        inset 0 2px 0 rgba(255, 255, 255, 0.3),
        inset 0 -2px 0 rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
}

.achievement-panel::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, 
        rgba(255, 255, 100, 1), 
        rgba(255, 200, 0, 0.8),
        rgba(255, 150, 0, 1)
    );
    border-color: rgba(255, 255, 0, 0.6);
    box-shadow: 
        0 0 20px rgba(255, 221, 0, 0.8),
        0 0 35px rgba(255, 221, 0, 0.4),
        inset 0 2px 0 rgba(255, 255, 255, 0.4);
    transform: scaleX(1.1);
}

.achievement-panel::-webkit-scrollbar-thumb:active {
    background: linear-gradient(180deg, 
        rgba(255, 255, 255, 0.9), 
        rgba(255, 221, 0, 0.8),
        rgba(255, 255, 255, 0.9)
    );
    box-shadow: 
        0 0 25px rgba(255, 255, 255, 0.6),
        inset 0 2px 0 rgba(255, 255, 255, 0.5);
    transform: scaleX(1.05);
}

/* 成就列表滚动条美化 */
.achievements-list::-webkit-scrollbar,
.achievement-shop-list::-webkit-scrollbar {
    width: 12px;
}

.achievements-list::-webkit-scrollbar-track,
.achievement-shop-list::-webkit-scrollbar-track {
    background: rgba(0, 20, 40, 0.6);
    border-radius: 6px;
    border: 1px solid rgba(255, 221, 0, 0.1);
}

.achievements-list::-webkit-scrollbar-thumb,
.achievement-shop-list::-webkit-scrollbar-thumb {
    background: linear-gradient(180deg, 
        rgba(255, 221, 0, 0.8), 
        rgba(255, 165, 0, 0.6)
    );
    border-radius: 6px;
    border: 1px solid rgba(255, 221, 0, 0.3);
    transition: all 0.3s ease;
}

.achievements-list::-webkit-scrollbar-thumb:hover,
.achievement-shop-list::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(180deg, 
        rgba(255, 255, 100, 0.9), 
        rgba(255, 200, 0, 0.7)
    );
    border-color: rgba(255, 255, 0, 0.5);
    transform: scaleX(1.1);
}

/* Firefox 滚动条样式 */
.achievement-panel {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 221, 0, 0.8) rgba(10, 20, 40, 0.8);
}

.achievements-list,
.achievement-shop-list {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 221, 0, 0.7) rgba(0, 20, 40, 0.6);
}

.limit-info {
    color: #ff9500; 
    font-size: 12px;
    margin-top: 5px;
    font-weight: bold; /* 加粗增强可读性 */
    text-shadow: 0 0 8px rgba(255, 149, 0, 0.5); /* 发光效果 */
    background: rgba(255, 149, 0, 0.1); /* 轻微背景色 */
    padding: 2px 6px;
    border-radius: 4px;
    border: 1px solid rgba(255, 149, 0, 0.3);
}
        `;
        document.head.appendChild(style);
    }
    
    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                this.switchTab(e.target.dataset.tab);
            }
            
            if (e.target.classList.contains('claim-btn')) {
                const achievementId = parseInt(e.target.dataset.id);
                this.claimAchievement(achievementId);
            }
            
            if (e.target.classList.contains('buy-btn')) {
                const itemIndex = parseInt(e.target.dataset.index);
                this.buyShopItem(itemIndex);
            }
        });
    }
    
    switchTab(tabName) {
        this.currentTab = tabName;
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName + 'Tab').classList.add('active');
        
        if (tabName === 'achievements') {
            this.updateAchievementsList();
        } else if (tabName === 'shop') {
            this.updateShopList();
        }
    }
    
    toggleAchievement() {
        this.isOpen = !this.isOpen;
        const container = document.getElementById('achievementContainer');
        container.style.display = this.isOpen ? 'flex' : 'none';
        
        if (this.isOpen) {
            this.checkAchievements();
            this.updateDisplay();
            this.switchTab(this.currentTab);
        }
    }
    
    updateDisplay() {
        document.getElementById('achievementPoints').textContent = this.achievementPoints;
        document.getElementById('achievementMedals').textContent = this.achievementMedals;
    }
    
    checkAchievements() {
    Object.values(this.achievements).forEach(achievement => {
        if (!achievement.completed) {
            let currentValue = 0;
            
            switch (achievement.condition) {
                case 'level':
                    currentValue = typeof level !== 'undefined' ? level : 1;
                    break;
                case 'wave':
                    currentValue = typeof currentWave !== 'undefined' ? currentWave : 1;
                    break;
                case 'survivalCore':
                    currentValue = typeof survivalCoreCount !== 'undefined' ? survivalCoreCount : 0;
                    break;
                case 'burstCore':
                    currentValue = typeof explosionCoreCount !== 'undefined' ? explosionCoreCount : 0;
                    break;
                case 'tacticalCore':
                    currentValue = typeof tacticalCoreCount !== 'undefined' ? tacticalCoreCount : 0;
                    break;
                case 'totalPotions':
                    currentValue = this.getTotalPotions();
                    break;
                case 'inventoryItems':
                    currentValue = this.getInventoryItemCount();
                    break;
                case 'midCollector':
                    currentValue = this.checkMidCollector() ? 1 : 0;
                    break;
                case 'advancedCollector':
                    currentValue = this.checkAdvancedCollector() ? 1 : 0;
                    break;
                case 'hasTreasure':
                    currentValue = this.checkHasTreasure() ? 1 : 0;
                    break;
                case 'defeatTaowu':
                    currentValue = this.checkDefeatTaowu() ? 1 : 0;
                    break;
                case 'maxLevelTreasure':
                    currentValue = this.checkMaxLevelTreasure() ? 1 : 0;
                    break;
            }
            
            if (currentValue >= achievement.target) {
                achievement.completed = true;
                this.showAchievementNotification(achievement);
            }
        }
    });
}
    
    getTotalPotions() {
    if (typeof inventory === 'undefined' || !inventory.items) return 0;
    let totalPotions = 0;
    inventory.items.forEach(item => {
        if (item && item.category === 'consumable' && 
            (item.name.includes('药水') || item.name.includes('药剂'))) {
            totalPotions += item.quantity || 1;
        }
    });
    return totalPotions;
}

getInventoryItemCount() {
    if (typeof inventory === 'undefined' || !inventory.items) return 0;
    return inventory.items.filter(item => item !== null).length;
}

checkMidCollector() {
    if (typeof inventory === 'undefined' || !inventory.items) return false;
    
    const artifactCount = inventory.items.filter(item => 
        item && item.quality === 4
    ).length;
    
    const totalItems = this.getInventoryItemCount();
    
    return artifactCount >= 3 && totalItems >= 50;
}

checkAdvancedCollector() {
    if (typeof inventory === 'undefined' || !inventory.items) return false;
    
    const artifactsByCategory = new Set();
    inventory.items.forEach(item => {
        if (item && item.quality === 4) {
            artifactsByCategory.add(item.category);
        }
    });
    
    const requiredCategories = ['weapon', 'armor', 'accessory'];
    const hasAllCategories = requiredCategories.every(cat => artifactsByCategory.has(cat));
    const totalItems = this.getInventoryItemCount();
    
    return hasAllCategories && totalItems >= 60;
}

checkHasTreasure() {
    if (typeof inventory === 'undefined' || !inventory.items) return false;
    return inventory.items.some(item => item && item.category === 'treasure');
}

checkDefeatTaowu() {
    // 简化检查逻辑，直接检查成就状态
    const taowuAchievement = this.achievements[15];
    return taowuAchievement ? taowuAchievement.completed : false;
}

checkMaxLevelTreasure() {
    if (typeof inventory === 'undefined' || !inventory.items) return false;
    return inventory.items.some(item => 
        item && item.category === 'treasure' && item.level >= 10
    );
}


    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>🏆 成就达成！</h3>
                <p>${achievement.name}</p>
                <p>奖励：${achievement.rewards.points}成就点数 + ${achievement.rewards.medals}成就勋章</p>
            </div>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20%;
            right: 20px;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border: 2px solid #ffdd00;
            border-radius: 10px;
            padding: 15px;
            color: #ffdd00;
            z-index: 4000;
            min-width: 300px;
            box-shadow: 0 0 20px #ffdd00;
            animation: slideInRight 0.5s ease-out;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .achievement-notification h3 { margin: 0 0 10px 0; font-size: 16px; }
            .achievement-notification p { margin: 5px 0; font-size: 14px; }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 5000);
    }
    
    updateAchievementsList() {
    const list = document.getElementById('achievementsList');
    list.innerHTML = '';
    
    Object.values(this.achievements).forEach(achievement => {
        const item = document.createElement('div');
        item.className = `achievement-item ${achievement.completed ? 'completed' : ''} ${achievement.claimed ? 'claimed' : ''}`;
        
        let currentValue = 0;
        switch (achievement.condition) {
            case 'level':
                currentValue = typeof level !== 'undefined' ? level : 1;
                break;
            case 'wave':
                currentValue = typeof currentWave !== 'undefined' ? currentWave : 1;
                break;
            case 'survivalCore':
                currentValue = typeof survivalCoreCount !== 'undefined' ? survivalCoreCount : 0;
                break;
            case 'burstCore':
                currentValue = typeof explosionCoreCount !== 'undefined' ? explosionCoreCount : 0;
                break;
            case 'tacticalCore':
                currentValue = typeof tacticalCoreCount !== 'undefined' ? tacticalCoreCount : 0;
                break;
            case 'totalPotions':
                currentValue = this.getTotalPotions();
                break;
            case 'inventoryItems':
                currentValue = this.getInventoryItemCount();
                break;
            case 'midCollector':
                currentValue = this.checkMidCollector() ? 1 : 0;
                break;
            case 'advancedCollector':
                currentValue = this.checkAdvancedCollector() ? 1 : 0;
                break;
            case 'hasTreasure':
                currentValue = this.checkHasTreasure() ? 1 : 0;
                break;
            case 'defeatTaowu':
                currentValue = this.checkDefeatTaowu() ? 1 : 0;
                break;
            case 'maxLevelTreasure':
                currentValue = this.checkMaxLevelTreasure() ? 1 : 0;
                break;
        }
        
        const progress = Math.min(currentValue, achievement.target);
        const progressPercent = (progress / achievement.target * 100).toFixed(1);
        
        item.innerHTML = `
            <div class="achievement-info">
                <div class="achievement-details">
                    <h3>${achievement.name}</h3>
                    <p>${achievement.description}</p>
                    <div class="achievement-progress">
                        进度: ${progress}/${achievement.target} (${progressPercent}%)
                    </div>
                </div>
                <div class="achievement-rewards">
                    <span>🏆 ${achievement.rewards.points}点数</span>
                    <span>🏅 ${achievement.rewards.medals}勋章</span>
                    <button class="claim-btn" 
                            data-id="${achievement.id}"
                            ${!achievement.completed || achievement.claimed ? 'disabled' : ''}>
                        ${achievement.claimed ? '已领取' : (achievement.completed ? '领取奖励' : '未完成')}
                    </button>
                </div>
            </div>
        `;
        
        list.appendChild(item);
    });
}
    
    claimAchievement(achievementId) {
    const achievement = this.achievements[achievementId];
    if (!achievement || !achievement.completed || achievement.claimed) {
        return;
    }
    
    achievement.claimed = true;
    this.achievementPoints += achievement.rewards.points;
    this.achievementMedals += achievement.rewards.medals;
    
    this.showNotification(`领取成功：获得 ${achievement.rewards.points} 成就点数和 ${achievement.rewards.medals} 成就勋章！`, 'success');
    
    this.updateDisplay();
    this.updateAchievementsList();
    
    if (typeof autoSave === 'function') {
        autoSave();
    }
}
    
    updateShopList() {
    const list = document.getElementById('achievementShopList');
    list.innerHTML = '';
    
    this.shopItems.forEach((item, index) => {
        const shopItem = document.createElement('div');
        shopItem.className = 'shop-item';
        
        const canAfford = this.achievementMedals >= item.price;
        const hasSpace = this.hasInventorySpace();
        const canPurchase = item.limitPurchase === null || item.purchased < item.limitPurchase;
        const canBuy = canAfford && hasSpace && canPurchase;
        
        let buttonText = '购买';
        let buttonClass = 'buy-btn';
        
        if (!canAfford) {
            buttonText = '勋章不足';
            buttonClass += ' disabled';
        } else if (!hasSpace) {
            buttonText = '背包已满';
            buttonClass += ' disabled';
        } else if (!canPurchase) {
            buttonText = '已售罄';
            buttonClass += ' disabled';
        }
        
        const limitText = item.limitPurchase !== null ? 
            `<div class="limit-info">限购：${item.purchased}/${item.limitPurchase}</div>` : '';
        
        const iconContainer = document.createElement('div');
        iconContainer.className = 'shop-item-icon';
        iconContainer.style.cssText = 'width:48px;height:48px;position:relative;';
        
        this.renderItemIcon(iconContainer, item);
        
        shopItem.innerHTML = `
            <div class="shop-item-info">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                ${limitText}
            </div>
            <div class="shop-item-price">
                <div class="price-text">🏅 ${item.price} 勋章</div>
                <button class="${buttonClass}" 
                        data-index="${index}"
                        ${canBuy ? '' : 'disabled'}>
                    ${buttonText}
                </button>
            </div>
        `;
        
        shopItem.insertBefore(iconContainer, shopItem.firstChild);
        list.appendChild(shopItem);
    });
}

    renderItemIcon(container, item) {
    container.innerHTML = '';
    
    if (item.category === 'equipment' && window.equipmentIconRenderer?.isReady) {
        const equipmentName = item.equipmentName || item.name.replace('史诗品质', '');
        const rendered = window.equipmentIconRenderer.drawIcon(container, equipmentName, item.quality || 3);
        if (rendered) return;
    }
    
    if (item.category === 'consumable' && window.itemIconRenderer?.isReady) {
        const itemName = item.name;
        const rendered = window.itemIconRenderer.drawIcon(container, itemName);
        if (rendered) return;
    }
    
    if (item.category === 'costume' && window.itemIconRenderer?.isReady) {
        const rendered = window.itemIconRenderer.drawIcon(container, item.name);
        if (rendered) return;
    }
    
    if (item.category === 'material' && window.itemIconRenderer?.isReady) {
        const rendered = window.itemIconRenderer.drawIcon(container, item.name);
        if (rendered) return;
    }
    
    container.innerHTML = '<div style="width:48px;height:48px;background:#333;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#999;font-size:12px;">无图</div>';
}
    
    hasInventorySpace() {
        return typeof inventory !== 'undefined' && inventory.items.length < inventory.maxInventorySize;
    }
    
    buyShopItem(itemIndex) {
    const item = this.shopItems[itemIndex];
    
    if (this.achievementMedals < item.price) {
        this.showNotification('成就勋章不足！', 'error');
        return;
    }
    
    if (!this.hasInventorySpace()) {
        this.showNotification('背包已满！', 'error');
        return;
    }
    
    if (item.limitPurchase !== null && item.purchased >= item.limitPurchase) {
        this.showNotification('该商品已达到购买限制！', 'error');
        return;
    }
    
    this.achievementMedals -= item.price;
    item.purchased++;
    
    const itemData = this.generateItemData(item);
    if (itemData && typeof inventory !== 'undefined' && inventory.addItem(itemData)) {
        this.showNotification(`购买成功：${item.name}`, 'success');
        this.updateDisplay();
        this.updateShopList();
        if (inventory.updateInventoryDisplay) {
            inventory.updateInventoryDisplay();
        }
    } else {
        this.achievementMedals += item.price;
        item.purchased--;
        this.showNotification('购买失败！', 'error');
    }
    }
    
    generateItemData(shopItem) {
        if (typeof ItemGenerator !== 'undefined') {
            return ItemGenerator.generateItem(shopItem.name, 1);
        }
        return null;
    }
    
    showNotification(message, type) {
        const notification = document.createElement('div');
        const color = type === 'success' ? '#00ff00' : '#ff0000';
        notification.className = `achievement-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid ${color};
            border-radius: 10px;
            padding: 15px 25px;
            color: ${color};
            font-size: 16px;
            font-weight: bold;
            z-index: 4001;
            animation: notificationSlide 3s ease-out forwards;
        `;
        
        const style = document.createElement('style');
        style.textContent = `
            @keyframes notificationSlide {
                0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                10%, 90% { opacity: 1; transform: translateX(-50%) translateY(0); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 3000);
    }
  
}

window.achievementSystem = new AchievementSystem();