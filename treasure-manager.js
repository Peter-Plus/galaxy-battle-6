class TreasureManager {
  constructor() {
    this.isOpen = false;
    this.selectedTreasure = null;
    this.createTreasureUI();
  }

  createTreasureUI() {
    const treasureContainer = document.createElement('div');
    treasureContainer.id = 'treasureContainer';
    treasureContainer.className = 'treasure-container';
    treasureContainer.style.display = 'none';
    treasureContainer.innerHTML = `
      <div class="treasure-panel">
        <div class="treasure-header">
          <h2>法宝系统</h2>
          <button class="close-btn" onclick="treasureManager.toggleTreasure()">×</button>
        </div>
        <div class="treasure-content">
          <div class="treasure-left">
            <h3>法宝列表</h3>
            <div class="treasure-list" id="treasureList"></div>
          </div>
          <div class="treasure-right">
            <div class="treasure-info" id="treasureInfo">
              <div class="treasure-empty">请选择法宝</div>
            </div>
            <div class="treasure-upgrade" id="treasureUpgrade" style="display:none;">
              <h4>升级区域</h4>
              <div class="upgrade-materials">
                <div class="material-slot">
                  <div class="material-icon" id="upgradeMaterialIcon"></div>
                  <div class="material-count" id="upgradeMaterialCount">0/0</div>
                </div>
                <button class="upgrade-btn" id="upgradeBtn" onclick="treasureManager.upgradeTreasure()">升级</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(treasureContainer);
  }

  toggleTreasure() {
    this.isOpen = !this.isOpen;
    const container = document.getElementById('treasureContainer');
    container.style.display = this.isOpen ? 'flex' : 'none';
    
    if (this.isOpen) {
      this.updateTreasureList();
      this.selectedTreasure = null;
      this.updateTreasureInfo();
    }
  }

  updateTreasureList() {
    const listEl = document.getElementById('treasureList');
    listEl.innerHTML = '';
    
    if (!inventory || !inventory.items) return;
    
    const treasures = inventory.items.filter(item => 
      item && (item.category === 'treasure' || item.type === 'treasure')
    );
    
    if (treasures.length === 0) {
      listEl.innerHTML = '<div class="no-treasures">背包中没有法宝</div>';
      return;
    }
    
    treasures.forEach((treasure, index) => {
      const listItem = document.createElement('div');
      listItem.className = 'treasure-list-item';
      if (this.selectedTreasure === treasure) {
        listItem.classList.add('selected');
      }
      
      const icon = this.getTreasureIcon(treasure);
      const level = treasure.level || 1;
      const growthRate = treasure.growthRate || 1.0;
      
      listItem.innerHTML = `
        <div class="treasure-item-icon">${icon}</div>
        <div class="treasure-item-info">
          <div class="treasure-item-name">${treasure.name}</div>
          <div class="treasure-item-level">等级: ${level}</div>
          <div class="treasure-item-growth">成长率: ${growthRate.toFixed(1)}</div>
        </div>
      `;
      
      listItem.onclick = () => this.selectTreasure(treasure);
      listEl.appendChild(listItem);
    });
  }

  selectTreasure(treasure) {
    this.selectedTreasure = treasure;
    this.updateTreasureList();
    this.updateTreasureInfo();
  }

  updateTreasureInfo() {
    const infoEl = document.getElementById('treasureInfo');
    const upgradeEl = document.getElementById('treasureUpgrade');
    
    if (!this.selectedTreasure) {
      infoEl.innerHTML = '<div class="treasure-empty">请选择法宝</div>';
      upgradeEl.style.display = 'none';
      return;
    }
    
    const treasure = this.selectedTreasure;
    const level = treasure.level || 1;
    const growthRate = treasure.growthRate || 1.0;
    const icon = this.getTreasureIcon(treasure);
    
    const stats = this.calculateTreasureStats(treasure);
    
    infoEl.innerHTML = `
      <div class="treasure-display">
        <div class="treasure-display-icon">${icon}</div>
        <div class="treasure-display-info">
          <div class="treasure-display-name">${treasure.name}</div>
          <div class="treasure-display-level">等级: ${level}</div>
          <div class="treasure-display-growth">成长率: ${growthRate.toFixed(1)}</div>
          <div class="treasure-display-stats">
            <div class="stat-item">攻击: +${stats.attack}</div>
            <div class="stat-item">生命: +${stats.health}</div>
            <div class="stat-item">能量: +${stats.maxEnergy}</div>
            <div class="stat-item">防御: +${stats.defense}</div>
            <div class="stat-item">回能: +${stats.energyRegen.toFixed(1)}/秒</div>
          </div>
          <div class="treasure-skill">
            <div class="skill-title">法宝技能:</div>
            <div class="skill-desc">${this.getSkillDescription(treasure)}</div>
          </div>
        </div>
      </div>
    `;
    
    this.updateUpgradeSection();
    upgradeEl.style.display = 'block';
  }

  calculateTreasureStats(treasure) {
    if (treasure.getFinalStats) {
      return treasure.getFinalStats();
    }
    return window.Catalog?.calculateTreasureStats?.(treasure) || treasure.stats || {};
  }

  getSkillDescription(treasure) {
    return window.Catalog?.getTreasureSkillDescription?.(treasure) || treasure.skillEffect || '未知技能';
  }

  updateUpgradeSection() {
    if (!this.selectedTreasure) return;
    
    const treasure = this.selectedTreasure;
    const level = treasure.level || 1;
    
    if (level >= 10) {
      document.getElementById('treasureUpgrade').innerHTML = `
        <h4>升级区域</h4>
        <div class="max-level">已达到最大等级</div>
      `;
      return;
    }
    
    const materialName = this.getUpgradeMaterial(treasure.name);
    const requiredAmount = this.getUpgradeCost(treasure.name, level);
    const currentAmount = this.getMaterialCount(materialName);
    
    const materialIcon = this.getMaterialIcon(materialName);
    
    document.getElementById('treasureUpgrade').innerHTML = `
      <h4>升级区域</h4>
      <div class="upgrade-materials">
        <div class="material-slot">
          <div class="material-icon">${materialIcon}</div>
          <div class="material-name">${materialName}</div>
          <div class="material-count">${currentAmount}/${requiredAmount}</div>
        </div>
        <button class="upgrade-btn ${currentAmount >= requiredAmount ? '' : 'disabled'}" 
                onclick="treasureManager.upgradeTreasure()" 
                ${currentAmount >= requiredAmount ? '' : 'disabled'}>
          升级
        </button>
      </div>
    `;
  }

  getUpgradeMaterial(treasureName) {
    return window.Catalog?.getTreasureUpgradeMaterial?.(treasureName) || '未知材料';
  }

  getUpgradeCost(treasureName, level) {
    return window.Catalog?.getTreasureUpgradeCost?.(treasureName, level) || 999;
  }

  getMaterialCount(materialName) {
    if (!inventory || !inventory.items) return 0;
    
    let count = 0;
    for (const item of inventory.items) {
      if (item && item.name === materialName) {
        count += item.quantity || 1;
      }
    }
    return count;
  }

  upgradeTreasure() {
    if (!this.selectedTreasure) return;
    
    const treasure = this.selectedTreasure;
    const level = treasure.level || 1;
    
    if (level >= 10) {
      this.showNotification('法宝已达到最大等级！', 'error');
      return;
    }
    
    const materialName = this.getUpgradeMaterial(treasure.name);
    const requiredAmount = this.getUpgradeCost(treasure.name, level);
    const currentAmount = this.getMaterialCount(materialName);
    
    if (currentAmount < requiredAmount) {
      this.showNotification('升级材料不足！', 'error');
      return;
    }
    
    this.consumeMaterial(materialName, requiredAmount);
    
    treasure.level = level + 1;
    
    if (inventory.treasureSlot === treasure) {
      inventory.treasureSlot.level = treasure.level;
      inventory.updateTreasureDisplay();
    }
    
    this.showNotification(`${treasure.name} 升级成功！`, 'success');
    
    this.updateTreasureList();
    this.updateTreasureInfo();
    
    if (typeof autoSave === 'function') {
      autoSave();
    }
  }

  consumeMaterial(materialName, amount) {
    let remaining = amount;
    
    for (let i = inventory.items.length - 1; i >= 0 && remaining > 0; i--) {
      const item = inventory.items[i];
      if (!item || item.name !== materialName) continue;
      
      const toConsume = Math.min(remaining, item.quantity || 1);
      item.quantity = (item.quantity || 1) - toConsume;
      remaining -= toConsume;
      
      if (item.quantity <= 0) {
        inventory.items.splice(i, 1);
      }
    }
  }

  getTreasureIcon(treasure) {
    const temp = document.createElement('div');
    temp.style.cssText = 'width:48px;height:48px;display:inline-block;position:relative;';
    
    if (window.treasureIconRenderer?.isReady) {
      const ok = window.treasureIconRenderer.drawIcon(temp, treasure.name);
      if (ok) return temp.outerHTML;
    }
    
    return `<div style="width:48px;height:48px;background:#ffaa00;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#000;font-weight:bold;font-size:18px;">${treasure.name.charAt(0)}</div>`;
  }

  getMaterialIcon(materialName) {
    const temp = document.createElement('div');
    temp.style.cssText = 'width:40px;height:40px;display:inline-block;position:relative;';
    
    if (window.itemIconRenderer?.isReady) {
      const ok = window.itemIconRenderer.drawIcon(temp, materialName);
      if (ok) return temp.outerHTML;
    }
    
    return `<div style="width:40px;height:40px;background:#666;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:14px;">${materialName.charAt(0)}</div>`;
  }

  showNotification(message, type) {
    const n = document.createElement('div');
    const color = type === 'success' ? '#00ff00' : '#ff0000';
    n.className = `treasure-notification ${type}`;
    n.textContent = message;
    n.style.cssText = `
      position:fixed;top:20%;left:50%;transform:translateX(-50%);
      background:rgba(0,0,0,.9);border:2px solid ${color};border-radius:10px;
      padding:15px 25px;color:${color};font-size:16px;font-weight:bold;z-index:1001;
      animation:notificationSlide 3s ease-out forwards;
    `;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 3000);
  }
}

window.treasureManager = new TreasureManager();

const treasureStyle = document.createElement('style');
treasureStyle.textContent = `
.treasure-container {
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

.treasure-panel {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border: 3px solid #ffaa00;
  border-radius: 15px;
  padding: 25px;
  width: 1200px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 0 30px #ffaa00;
  position: relative;
}

.treasure-panel .close-btn {
  position: absolute;
  top: 0px;
  right: 0px;
  background: var(--red);
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  z-index: 10;
}
.treasure-panel .close-btn:hover {
  background: #ff6666;
  transform: scale(1.1);
}

.treasure-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #ffaa00;
}

.treasure-header h2 {
  color: #ffaa00;
  margin: 0;
  text-shadow: 0 0 10px #ffaa00;
  font-size: 24px;
}

.treasure-content {
  display: flex;
  gap: 30px;
  height: 600px;
}

.treasure-left {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.treasure-left h3 {
  color: #00ffff;
  margin: 0 0 15px 0;
  text-shadow: 0 0 10px #00ffff;
}

.treasure-list {
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #666;
  border-radius: 8px;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.treasure-list-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 170, 0, 0.1);
  border: 2px solid #ffaa00;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.treasure-list-item:hover {
  background: rgba(255, 170, 0, 0.2);
  transform: translateX(5px);
}

.treasure-list-item.selected {
  background: rgba(255, 170, 0, 0.3);
  border-color: #ffdd00;
  box-shadow: 0 0 15px rgba(255, 170, 0, 0.5);
}

.treasure-item-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.treasure-item-info {
  flex: 1;
}

.treasure-item-name {
  font-size: 16px;
  font-weight: bold;
  color: #ffaa00;
  margin-bottom: 5px;
}

.treasure-item-level {
  font-size: 14px;
  color: #00ff00;
  margin-bottom: 3px;
}

.treasure-item-growth {
  font-size: 12px;
  color: #aaa;
}

.treasure-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.treasure-info {
  flex: 1;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #666;
  border-radius: 8px;
  padding: 20px;
}

.treasure-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-size: 18px;
}

.treasure-display {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.treasure-display-icon {
  align-self: center;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.treasure-display-info {
  flex: 1;
}

.treasure-display-name {
  font-size: 24px;
  font-weight: bold;
  color: #ffaa00;
  text-align: center;
  margin-bottom: 15px;
  text-shadow: 0 0 10px #ffaa00;
}

.treasure-display-level {
  font-size: 18px;
  color: #00ff00;
  text-align: center;
  margin-bottom: 10px;
}

.treasure-display-growth {
  font-size: 16px;
  color: #aaa;
  text-align: center;
  margin-bottom: 20px;
}

.treasure-display-stats {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid #555;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.stat-item {
  font-size: 14px;
  color: #fff;
  margin-bottom: 8px;
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.treasure-skill {
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid #00ffff;
  border-radius: 8px;
  padding: 15px;
}

.skill-title {
  color: #00ffff;
  font-weight: bold;
  margin-bottom: 8px;
  text-shadow: 0 0 5px #00ffff;
}

.skill-desc {
  color: #fff;
  font-size: 14px;
  line-height: 1.4;
}

.treasure-upgrade {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #666;
  border-radius: 8px;
  padding: 20px;
}

.treasure-upgrade h4 {
  color: #00ffff;
  margin: 0 0 15px 0;
  text-shadow: 0 0 10px #00ffff;
}

.upgrade-materials {
  display: flex;
  align-items: center;
  gap: 20px;
}

.material-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: rgba(255, 170, 0, 0.1);
  border: 1px solid #ffaa00;
  border-radius: 8px;
  flex: 1;
}

.material-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.material-name {
  color: #fff;
  font-size: 12px;
  text-align: center;
  margin-bottom: 5px;
}

.material-count {
  font-size: 14px;
  font-weight: bold;
  color: #fff;
}

.upgrade-btn {
  padding: 15px 30px;
  background: linear-gradient(45deg, #00ff00, #00aa00);
  border: none;
  border-radius: 8px;
  color: #000;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.upgrade-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px #00ff00;
}

.upgrade-btn.disabled {
  background: #666;
  cursor: not-allowed;
  opacity: 0.5;
}

.upgrade-btn.disabled:hover {
  transform: none;
  box-shadow: none;
}

.max-level {
  text-align: center;
  color: #ffaa00;
  font-size: 16px;
  font-weight: bold;
  padding: 20px;
  background: rgba(255, 170, 0, 0.1);
  border: 1px solid #ffaa00;
  border-radius: 8px;
}

.no-treasures {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-size: 16px;
}

.close-btn {
  background: transparent;
  border: none;
  color: #ffaa00;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
}

.close-btn:hover {
  background: rgba(255, 170, 0, 0.2);
  transform: scale(1.1);
}

@keyframes notificationSlide {
  0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  10% { opacity: 1; transform: translateX(-50%) translateY(0); }
  90% { opacity: 1; transform: translateX(-50%) translateY(0); }
  100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
}
`;
document.head.appendChild(treasureStyle);