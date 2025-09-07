// ==================== Inventory（重构精简版） ====================

class InventorySystem {
  constructor() {
    this.isOpen = false;
    this.items = [];
    this.equippedItems = [null, null];
    this.treasureSlot = null;
    this.consumableSlot = null;
    this.draggedItem = null;
    this.draggedFromSlot = null;
    this.draggedFromIndex = null;
    this.gold = 0;
    this.maxInventorySize = 20;
    this.costumeSlot = null;

    this.createInventoryUI();
    this.setupEventListeners();
  }

  createInventoryUI() {
  const c = document.createElement('div');
  c.id = 'inventoryContainer';
  c.className = 'inventory-container';
  c.style.display = 'none';
  c.innerHTML = `
    <div class="inventory-panel-new">
      <div class="inventory-header">
        <h2>背包系统</h2>
        <button class="close-btn" onclick="inventory.toggleInventory()">×</button>
      </div>

      <div class="inventory-main-layout">
        <!-- 左侧面板 -->
        <div class="inventory-left-panel">
          <!-- 六个装备栏 -->
          <div class="equipment-section-new">
            <div class="equipment-grid-new">
              <div class="equipment-slot equipment-slot-new" data-slot="0">
                <div class="slot-placeholder">装备1</div>
              </div>
              <div class="equipment-slot equipment-slot-new" data-slot="1">
                <div class="slot-placeholder">装备2</div>
              </div>
              <div class="equipment-slot equipment-slot-new" data-slot="2">
                <div class="slot-placeholder">装备3</div>
              </div>
              
              <!-- 下面3个特殊栏位 -->
              <div class="consumable-slot consumable-slot-new" data-slot="0">
                <div class="slot-placeholder">道具</div>
              </div>
              <div class="treasure-slot treasure-slot-new" data-slot="0">
                <div class="slot-placeholder">法宝</div>
              </div>
              <div class="costume-slot costume-slot-new" data-slot="0">
                <div class="slot-placeholder">时装</div>
              </div>
            </div>
          </div>

          <!-- 晶核等级显示（简化版） -->
    <div class="crystal-section-inline">
      <h3>晶核</h3>
      <div class="crystal-icons-row">
        <div class="crystal-icon-group explosion">
          <span class="icon">🔥</span>
          <span class="label">Lv.<span id="explosionLevel">0</span></span>
          <div class="crystal-tooltip">
            <div class="level-info">爆发 Lv.<span id="explosionLevelTooltip">0</span></div>
            <div class="bonus-info" id="explosionBonus">攻击力 +0%</div>
          </div>
        </div>
        
        <div class="crystal-icon-group survival">
          <span class="icon">💚</span>
          <span class="label">Lv.<span id="survivalLevel">0</span></span>
          <div class="crystal-tooltip">
            <div class="level-info">生存 Lv.<span id="survivalLevelTooltip">0</span></div>
            <div class="bonus-info" id="survivalBonus">生命 +0%<br>吸血 +0%</div>
          </div>
        </div>
        
        <div class="crystal-icon-group tactical">
          <span class="icon">🔷</span>
          <span class="label">Lv.<span id="tacticalLevel">0</span></span>
          <div class="crystal-tooltip">
            <div class="level-info">战术 Lv.<span id="tacticalLevelTooltip">0</span></div>
            <div class="bonus-info" id="tacticalBonus">技能冷却 -0%<br>回能 +0/秒</div>
          </div>
        </div>
      </div>
    </div>

          <!-- 玩家属性（紧凑版） -->
          <div class="player-stats-compact">
            <div class="stats-grid-compact">
              <div class="stat-row">
                <span class="stat-label">生命:</span>
                <span class="stat-value" id="statHealth">0</span>
                <span class="stat-label">能量:</span>
                <span class="stat-value" id="statEnergy">0</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">攻击:</span>
                <span class="stat-value" id="statAttack">0</span>
                <span class="stat-label">防御:</span>
                <span class="stat-value" id="statDefense">0</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">反伤:</span>
                <span class="stat-value" id="statReflect">0%</span>
                <span class="stat-label">吸血:</span>
                <span class="stat-value" id="statLifeSteal">0%</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">回能:</span>
                <span class="stat-value" id="statEnergyRegen">0/s</span>
                <span class="stat-label">冷却:</span>
                <span class="stat-value" id="statCooldown">0%</span>
              </div>
              <div class="stat-row level-combat-row">
  <span class="stat-label level-label">等级:</span>
  <span class="stat-value level-value" id="playerLevel">1</span>
  <span class="stat-label combat-label">战斗力:</span>
  <span class="stat-value combat-value" id="combatPower">0</span>
</div>
            </div>
          </div>
        </div>

        <!-- 右侧物品格 -->
        <div class="inventory-right-panel">
          <div class="inventory-header-info">
            <h3>物品背包</h3>
            <div class="inventory-right-stats">
              <span class="gold-display-inline">
                <span class="gold-icon">💰</span>
                金币: <span id="goldAmount">0</span>
              </span>
              <span class="inventory-count">
                容量: <span id="inventoryCount">0</span>/<span id="maxInventoryCount">20</span>
              </span>
            </div>
          </div>
          <div class="inventory-grid-new">
            <!-- 动态生成网格 -->
          </div>
        </div>
      </div>
    </div>

    <div class="context-menu" id="contextMenu" style="display:none;"></div>
  `;
  document.body.appendChild(c);
  
  this.syncInventoryGrid();
  this.initializeNewEquipmentSlots();
}

  initializeNewEquipmentSlots() {
  // 扩展装备栏数组以支持3个装备槽位
  if (this.equippedItems.length < 3) {
    this.equippedItems = [
      this.equippedItems[0] || null,
      this.equippedItems[1] || null,
      null  // 第三个装备栏
    ];
  }
}


  dropToCostume(targetSlot, item) {
  const currentCostume = this.costumeSlot;
  
  // 更完善的时装类型检测
  const isCostume = item.category === 'costume' || 
                   item.type === 'costume' || 
                   (window.Catalog?.getItemData?.(item.name)?.type === 'costume') ||
                   item.name === '胜利飞燕一号';
  
  if (!isCostume) {
    this.showNotification('只能装备时装！', 'error');
    return;
  }
  
  if (this.draggedFromSlot === 'costume') {
    return;
  } else if (this.draggedFromSlot === 'equipment') {
    this.equippedItems[this.draggedFromIndex] = null;
    this.costumeSlot = item;
    if (currentCostume) {
      const emptyIndex = this.findEmptyInventorySlot();
      if (emptyIndex !== -1) this.items[emptyIndex] = currentCostume;
    }
  } else if (this.draggedFromSlot === 'consumable') {
    this.consumableSlot = null;
    this.costumeSlot = item;
    if (currentCostume) {
      const emptyIndex = this.findEmptyInventorySlot();
      if (emptyIndex !== -1) this.items[emptyIndex] = currentCostume;
    }
  } else if (this.draggedFromSlot === 'treasure') {
    this.treasureSlot = null;
    this.costumeSlot = item;
    if (currentCostume) {
      const emptyIndex = this.findEmptyInventorySlot();
      if (emptyIndex !== -1) this.items[emptyIndex] = currentCostume;
    }
  } else if (this.draggedFromSlot === 'inventory') {
    this.items[this.draggedFromIndex] = null;
    this.costumeSlot = item;
    if (currentCostume) this.items[this.draggedFromIndex] = currentCostume;
    this.items = this.items.filter(Boolean);
  }
  
  this.updateInventoryDisplay();
}

  setupEventListeners() {
    document.addEventListener('mousedown', this.handleMouseDown.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this));
    document.addEventListener('mouseup', this.handleMouseUp.bind(this));
    document.addEventListener('contextmenu', this.handleRightClick.bind(this));
    document.addEventListener('click', this.hideContextMenu.bind(this));
  }

  // ===== 右键菜单 =====
  handleRightClick(e) {
    if (!this.isOpen) return;
    const itemEl = e.target.closest('.item'); if (!itemEl) return;
    const slotEl = itemEl.closest('.inventory-slot') || itemEl.closest('.consumable-slot'); if (!slotEl) return;

    let item = null, idx = null;
    if (slotEl.classList.contains('inventory-slot')) {
      idx = parseInt(slotEl.dataset.index);
      item = this.items[idx];
    } else {
      item = this.consumableSlot;
      idx = 'consumable';
    }
    if (!item) return;

    e.preventDefault();
    this.showContextMenu(e, idx, item);
  }

  showContextMenu(e, itemIndex, item) {
  const menu = document.getElementById('contextMenu');
  const meta = ItemGenerator.getItemData(item.name);
  
  if (meta) {
    const arr = [];
    
    // 定义四个不能在背包中使用的药水
    const forbiddenConsumables = ['血瓶', '能量瓶', '强力药水', '护体药水'];
    
    // 添加使用选项 - 但排除四个药水
    if (meta.useEffect && !forbiddenConsumables.includes(item.name)) {
      arr.push('<div class="context-item" data-action="use">使用</div>');
    }
    
    // 添加开启选项
    if (meta.lootTable) {
      arr.push('<div class="context-item" data-action="open">开启</div>');
    }
    
    // 处理出售价格 - 特殊处理刷新券
    let price;
    if (item.name === '刷新券') {
      price = 500; // 刷新券的实际出售价格是正数
    } else {
      price = (window.Catalog?.getSellPrice?.(item)) ?? (meta.sellPrice ?? 40);
    }
    
    // 只有价格大于0才显示出售选项
    if (price > 0) {
      arr.push(`<div class="context-item" data-action="sell">出售 (+${price}金币)</div>`);
    }
    
    menu.innerHTML = arr.join('');
  } else {
    // 没有meta数据的物品，使用默认出售价格
    const price = (window.Catalog?.getSellPrice?.(item)) ?? (40 * Math.pow(2, item.quality || 0));
    menu.innerHTML = `<div class="context-item" data-action="sell">出售 (+${price}金币)</div>`;
  }
  
  // 设置菜单位置和显示
  menu.style.left = e.pageX + 'px';
  menu.style.top = e.pageY + 'px';
  menu.style.display = 'block';
  menu.dataset.itemIndex = itemIndex;
  
  // 添加点击事件处理 - 这是关键修复！
  menu.onclick = (ev) => {
    const action = ev.target.dataset.action;
    if (action) {
      this.handleItemAction(action, itemIndex, item);
      this.hideContextMenu();
    }
  };
}

  autoSaveOnClose() {
    // 确保有当前存档ID
    if (typeof currentSaveId !== 'undefined' && currentSaveId && 
        typeof gameStateManager !== 'undefined') {
        
        // 扩展条件：在无尽征程模式或主界面都可以自动保存
        const canSave = (gameStateManager.isInGame() && 
                        typeof gameRunning !== 'undefined' && gameRunning) ||
                       (gameStateManager.getCurrentState() === 'main');
        
        if (canSave) {
            // 调用自动保存函数
            if (typeof autoSave === 'function') {
                autoSave();
            } else if (typeof saveGame === 'function') {
                // 备用方案：直接调用保存游戏
                const saves = JSON.parse(localStorage.getItem('galacticWarshipSaves') || '{}');
                const currentSave = saves[currentSaveId];
                if (currentSave) {
                    saveGame(currentSave.name, currentSaveId);
                }
            }
            
            console.log('背包关闭时自动保存完成');
        }
    }
}

  hideContextMenu() {
    const menu = document.getElementById('contextMenu');
    menu.style.display = 'none';
  }

  handleItemAction(action, idx, item) {
  const IEH = window.ItemEffectHandler;
  const CH  = window.ContainerHandler;
  const CFH = window.CraftingHandler;

  if (action === 'use') {
    if (!IEH) { this.showNotification('道具系统未初始化（items.js 未加载）', 'error'); return; }
    IEH.handleItemUse(item.name, item, idx, this);
  } else if (action === 'open') {
    if (!CH) { this.showNotification('容器系统未初始化（items.js 未加载）', 'error'); return; }
    CH.handleContainerOpen(item.name, item, idx, this);
  } else if (action === 'craft') {
    if (!CFH) { this.showNotification('合成系统未初始化（items.js 未加载）', 'error'); return; }
    CFH.handleCrafting(item.name, this);
  } else if (action === 'sell') {
    this.sellItem(idx, item);
  }
}

  // ===== 材料统计 =====
  countMaterial(name) {
    let c = 0;
    for (const it of this.items) if (it && it.name === name) c += it.quantity || 1;
    return c;
  }
  removeMaterials(name, amount) {
    let left = amount;
    for (let i = this.items.length - 1; i >= 0 && left > 0; i--) {
      const it = this.items[i];
      if (!it || it.name !== name) continue;
      const rm = Math.min(left, it.quantity || 1);
      it.quantity = (it.quantity || 1) - rm;
      left -= rm;
      if ((it.quantity || 0) <= 0) this.items.splice(i, 1);
    }
  }

  // ===== 出售 =====
  sellItem(idx, item) {
    const price = (window.Catalog?.getSellPrice?.(item))
      ?? (ItemGenerator.getItemData(item.name)?.sellPrice ?? 40 * Math.pow(2, item.quality));
    this.addGold(price);

    if (idx === 'consumable') {
      if (item.quantity && item.quantity > 1) item.quantity--;
      else this.consumableSlot = null;
    } else {
      if (item.quantity && item.quantity > 1) item.quantity--;
      else this.items.splice(idx, 1);
    }

    this.updateInventoryDisplay();
    this.updateConsumableDisplay();
    if (window.shop) shop.updateGoldDisplay();
  }

  addGold(n) { this.gold += n; this.updateGoldDisplay(); }
  updateGoldDisplay() { const el = document.getElementById('goldAmount'); if (el) el.textContent = this.gold; }

updateCrystalLevels() {
  // 获取当前晶核等级 - 修改为读取全局变量
  const explosionLv = (typeof explosionCoreCount !== 'undefined') ? explosionCoreCount : (window.explosionCoreCount || 0);
  const survivalLv = (typeof survivalCoreCount !== 'undefined') ? survivalCoreCount : (window.survivalCoreCount || 0);
  const tacticalLv = (typeof tacticalCoreCount !== 'undefined') ? tacticalCoreCount : (window.tacticalCoreCount || 0);
  
  // 更新等级显示
  const explosionEl = document.getElementById('explosionLevel');
  const survivalEl = document.getElementById('survivalLevel');
  const tacticalEl = document.getElementById('tacticalLevel');
  
  if (explosionEl) {
    explosionEl.textContent = explosionLv;
    // 同时更新tooltip中的等级
    const tooltipLvEl = document.getElementById('explosionLevelTooltip');
    if (tooltipLvEl) tooltipLvEl.textContent = explosionLv;
  }
  if (survivalEl) {
    survivalEl.textContent = survivalLv;
    const tooltipLvEl = document.getElementById('survivalLevelTooltip');
    if (tooltipLvEl) tooltipLvEl.textContent = survivalLv;
  }
  if (tacticalEl) {
    tacticalEl.textContent = tacticalLv;
    const tooltipLvEl = document.getElementById('tacticalLevelTooltip');
    if (tooltipLvEl) tooltipLvEl.textContent = tacticalLv;
  }
  
  // 计算并更新加成显示
  const DIMINISHING_FACTOR = 0.95;
  
  // 爆发加成
  const explosionBonus = window.totalExplosionBonus || 0;
  const explosionBonusEl = document.getElementById('explosionBonus');
  if (explosionBonusEl) {
    explosionBonusEl.innerHTML = `攻击力 +${(explosionBonus * 100).toFixed(1)}%`;
  }
  
  // 生存加成
  const survivalLifeStealBonus = window.totalSurvivalLifeStealBonus || 0;
  const survivalHealthBonus = window.totalSurvivalHealthBonus || 0;
  const survivalBonusEl = document.getElementById('survivalBonus');
  if (survivalBonusEl) {
    survivalBonusEl.innerHTML = `生命 +${(survivalHealthBonus * 100).toFixed(1)}%<br>吸血 +${(survivalLifeStealBonus * 100).toFixed(1)}%`;
  }
  
  // 战术加成
  const tacticalCooldownBonus = window.totalTacticalCooldownBonus || 0;
  const tacticalEnergyBonus = window.totalTacticalEnergyBonus || 0;
  const tacticalBonusEl = document.getElementById('tacticalBonus');
  if (tacticalBonusEl) {
    tacticalBonusEl.innerHTML = `技能冷却 -${(tacticalCooldownBonus * 100).toFixed(1)}%<br>回能 +${tacticalEnergyBonus.toFixed(3)}/秒`;
  }
}

  toggleInventory() {
    const wasOpen = this.isOpen;  // 记录之前的状态
    this.isOpen = !this.isOpen;
    const c = document.getElementById('inventoryContainer');
    c.style.display = this.isOpen ? 'flex' : 'none';
    
    if (this.isOpen) {
        this.updateInventoryDisplay();
        this.updateGoldDisplay();
        this.updateCrystalLevels();
    } else if (wasOpen) {
        // 背包关闭时自动保存
        this.autoSaveOnClose();
    }
}

  // ===== 添加道具 =====
  _isStackable(name) {
    if (window.Catalog?.isStackable) return !!Catalog.isStackable(name);
    const list = (typeof ItemGenerator?.getStackableItems === 'function') ? ItemGenerator.getStackableItems() : [];
    return Array.isArray(list) && list.includes(name);
  }

  addItem(data) {
    if (data.category === 'treasure' || (data.special === 'random_treasure' && data.name === '寒霜')) {
        if (data.special === 'random_treasure' && data.name === '寒霜') {
            const treasureData = window.Catalog?.generateTreasureBy('寒霜', 1, 1.0 + Math.random() * 1.5);
            if (treasureData) {
                const treasure = new window.Treasure(treasureData);
                if (this.items.length >= this.maxInventorySize) {
                    this.showInventoryFullNotification();
                    return false;
                }
                this.items.push(treasure);
                this.updateInventoryDisplay();
                return true;
            }
        } else if (window.Treasure && data.category === 'treasure') {
            const treasure = new window.Treasure(data);
            if (this.items.length >= this.maxInventorySize) {
                this.showInventoryFullNotification();
                return false;
            }
            this.items.push(treasure);
            this.updateInventoryDisplay();
            return true;
        }
    }
    
    if (this._isStackable(data.name)) {
        if (this.consumableSlot && this.consumableSlot.name === data.name) {
            this.consumableSlot.quantity = (this.consumableSlot.quantity || 1) + (data.quantity || 1);
            this.updateInventoryDisplay();
            this.updateConsumableDisplay();
            return true;
        }
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i] && this.items[i].name === data.name) {
                this.items[i].quantity = (this.items[i].quantity || 1) + (data.quantity || 1);
                this.updateInventoryDisplay();
                this.updateConsumableDisplay();
                return true;
            }
        }
    }

    if (this.items.length >= this.maxInventorySize) {
        this.showInventoryFullNotification();
        return false;
    }

    const item = new Item(data);
    if (this._isStackable(data.name)) item.quantity = data.quantity || 1;
    this.items.push(item);
    this.updateInventoryDisplay();
    return true;
}

  showInventoryFullNotification() {
    const n = document.createElement('div');
    n.style.cssText = `
      position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
      background:rgba(255,0,0,.9);border:2px solid #f00;border-radius:10px;
      padding:15px 25px;color:#fff;font-size:18px;font-weight:bold;z-index:1000;
      animation:inventoryFullShake 1s ease-out;
    `;
    n.textContent = '背包已满！';
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 1500);
  }

  // ===== 刷新 UI =====
  updateInventoryDisplay() {
  document.querySelectorAll('#inventoryContainer .equipment-slot, #inventoryContainer .consumable-slot, #inventoryContainer .treasure-slot, #inventoryContainer .costume-slot').forEach(slot => {

    const itemElements = slot.querySelectorAll('.item, .item-element, .item-display, .treasure');
    itemElements.forEach(el => el.remove());
    
    slot.classList.remove('has-item');
    
    // 显示占位符
    const placeholder = slot.querySelector('.slot-placeholder');
    if (placeholder) {
      placeholder.style.display = 'flex';
    }
  });

  document.querySelectorAll('#inventoryContainer .inventory-slot').forEach((slot, i) => {
    slot.innerHTML = '';
    slot.classList.remove('has-item');
    if (i < this.items.length && this.items[i]) {
      slot.appendChild(this.items[i].createElement());
      slot.classList.add('has-item');
    }
  });

  this.equippedItems.forEach((item, i) => {
    if (item && i < 3) {
      const slot = document.querySelector(`#inventoryContainer .equipment-slot[data-slot="${i}"]`);
      if (slot) {
        const itemEl = item.createElement();
        slot.appendChild(itemEl);
        slot.classList.add('has-item');
        
        // 隐藏占位符
        const placeholder = slot.querySelector('.slot-placeholder');
        if (placeholder) {
          placeholder.style.display = 'none';
        }
      }
    }
  });

  if (this.consumableSlot) {
    const slot = document.querySelector('#inventoryContainer .consumable-slot[data-slot="0"]');
    if (slot) {
      const itemEl = this.consumableSlot.createElement();
      slot.appendChild(itemEl);
      slot.classList.add('has-item');
      
      // 隐藏占位符
      const placeholder = slot.querySelector('.slot-placeholder');
      if (placeholder) {
        placeholder.style.display = 'none';
      }
    }
  }

  if (this.treasureSlot) {
    const slot = document.querySelector('#inventoryContainer .treasure-slot[data-slot="0"]');
    if (slot) {
      const itemEl = this.treasureSlot.createElement();
      slot.appendChild(itemEl);
      slot.classList.add('has-item');
      
      // 隐藏占位符
      const placeholder = slot.querySelector('.slot-placeholder');
      if (placeholder) {
        placeholder.style.display = 'none';
      }
    }
  }

  // 更新时装栏
  if (this.costumeSlot) {
    const slot = document.querySelector('#inventoryContainer .costume-slot[data-slot="0"]');
    if (slot) {
      const itemEl = this.costumeSlot.createElement();
      slot.appendChild(itemEl);
      slot.classList.add('has-item');
      
      // 隐藏占位符
      const placeholder = slot.querySelector('.slot-placeholder');
      if (placeholder) {
        placeholder.style.display = 'none';
      }
    }
  }

  this.updateInventoryCountDisplay();
  this.updatePlayerStatsDisplay();
}

  updateInventoryCountDisplay() {
  // 计算实际的物品数量（过滤掉 null 和 undefined）
  const actualItemCount = this.items.filter(item => item !== null && item !== undefined).length;
  
  // 更新背包数量显示
  const inventoryCountElement = document.getElementById('inventoryCount');
  if (inventoryCountElement) {
    inventoryCountElement.textContent = actualItemCount;
  }
  
  // 确保最大容量显示也是正确的
  const maxInventoryCountElement = document.getElementById('maxInventoryCount');
  if (maxInventoryCountElement) {
    maxInventoryCountElement.textContent = this.maxInventorySize;
  }
}

  updateConsumableDisplay() {
    const ui = document.getElementById('consumableUI'); if (!ui) return;
    const slot = ui.querySelector('.consumable-ui-slot'); if (!slot) return;

    slot.innerHTML = ''; slot.classList.remove('has-item');
    if (this.consumableSlot) {
      slot.appendChild(this.consumableSlot.createElement());
      slot.classList.add('has-item');
      const q = slot.querySelector('.quantity-display'); if (q) q.textContent = this.consumableSlot.quantity || 1;
    }
  }

  updateTreasureDisplay() {
    const ui = document.getElementById('treasureUI');
    if (!ui) return;
    
    const slot = ui.querySelector('.treasure-ui-slot');
    if (!slot) return;
    
    // 移除现有状态类
    slot.classList.remove('has-treasure', 'ready', 'cooldown');
    
    // 确保基础元素存在
    if (!slot.querySelector('.treasure-key')) {
        const key = document.createElement('span');
        key.className = 'treasure-key';
        key.textContent = '4';
        slot.appendChild(key);
    }
    
    let nameElement = slot.querySelector('.treasure-name');
    if (!nameElement) {
        nameElement = document.createElement('span');
        nameElement.className = 'treasure-name';
        slot.appendChild(nameElement);
    }
    
    if (!slot.querySelector('.treasure-cooldown')) {
        const cooldown = document.createElement('div');
        cooldown.className = 'treasure-cooldown';
        slot.appendChild(cooldown);
    }
    
    if (!slot.querySelector('.treasure-cooldown-text')) {
        const text = document.createElement('div');
        text.className = 'treasure-cooldown-text';
        slot.appendChild(text);
    }
    
    // 如果有法宝，显示法宝信息
    if (this.treasureSlot) {
        slot.classList.add('has-treasure');
        
        // 更新法宝名称
        nameElement.textContent = this.treasureSlot.name || '法宝';
        
        // 创建法宝图标 - 移除现有的物品图标
        const existingItem = slot.querySelector('.item, .treasure');
        if (existingItem) {
            existingItem.remove();
        }
        
        // 添加新的法宝图标
        const itemElement = this.treasureSlot.createElement();
        if (itemElement) {
            itemElement.style.width = '30px';
            itemElement.style.height = '30px';
            itemElement.style.position = 'absolute';
            itemElement.style.top = '10px';
            itemElement.style.left = '10px';
            itemElement.style.pointerEvents = 'none';
            slot.appendChild(itemElement);
        }
        
        // 更新冷却状态
        this.updateTreasureCooldown();
    } else {
        // 无法宝时显示默认状态
        nameElement.textContent = '法宝';
        
        // 移除任何物品图标
        const existingItem = slot.querySelector('.item, .treasure');
        if (existingItem) {
            existingItem.remove();
        }
    }
  }

  // 新增：法宝冷却更新函数
  updateTreasureCooldown() {
    const slot = document.querySelector('.treasure-ui-slot');
    if (!slot || !this.treasureSlot) return;
    
    const cooldownDiv = slot.querySelector('.treasure-cooldown');
    const cooldownText = slot.querySelector('.treasure-cooldown-text');
    
    if (this.treasureSlot.cooldownLeft > 0) {
        // 冷却中
        slot.classList.remove('ready');
        slot.classList.add('cooldown');
        
        // 更新冷却进度条（从下往上填充）
        const percent = (this.treasureSlot.cooldownLeft / this.treasureSlot.maxCooldown) * 100;
        if (cooldownDiv) {
            cooldownDiv.style.height = `${percent}%`;
        }
        
        // 更新冷却文字
        const secondsLeft = Math.ceil(this.treasureSlot.cooldownLeft / 1000);
        if (cooldownText) {
            cooldownText.textContent = secondsLeft > 0 ? secondsLeft : '';
            cooldownText.style.display = secondsLeft > 0 ? 'block' : 'none';
        }
    } else {
        // 可用状态
        slot.classList.remove('cooldown');
        slot.classList.add('ready');
        
        if (cooldownDiv) {
            cooldownDiv.style.height = '0%';
        }
        
        if (cooldownText) {
            cooldownText.textContent = '';
            cooldownText.style.display = 'none';
        }
    }
  }

  expandInventory() {
    this.syncInventoryGrid();
    this.updateInventoryDisplay();
}

  showNotification(message, type) {
    const n = document.createElement('div');
    const color = type === 'success' ? '#00ff00' : '#ff0000';
    n.className = `inventory-notification ${type}`;
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

  handleMouseDown(e) {
  if (!this.isOpen) return;
  const el = e.target.closest('.item') || e.target.closest('.treasure'); 
  if (!el) return;
  e.preventDefault();

  const slot = el.closest('.inventory-slot') || 
               el.closest('.equipment-slot') || 
               el.closest('.consumable-slot') || 
               el.closest('.treasure-slot') ||
               el.closest('.costume-slot');
  if (!slot) return;

  if (slot.classList.contains('inventory-slot')) {
    const i = parseInt(slot.dataset.index);
    this.draggedItem = this.items[i]; 
    this.draggedFromSlot = 'inventory'; 
    this.draggedFromIndex = i;
  } else if (slot.classList.contains('equipment-slot')) {
    const i = parseInt(slot.dataset.slot);
    this.draggedItem = this.equippedItems[i]; 
    this.draggedFromSlot = 'equipment'; 
    this.draggedFromIndex = i;
  } else if (slot.classList.contains('treasure-slot')) {
    this.draggedItem = this.treasureSlot; 
    this.draggedFromSlot = 'treasure'; 
    this.draggedFromIndex = 0;
  } else if (slot.classList.contains('costume-slot')) {
    this.draggedItem = this.costumeSlot; 
    this.draggedFromSlot = 'costume'; 
    this.draggedFromIndex = 0;
  } else {
    this.draggedItem = this.consumableSlot; 
    this.draggedFromSlot = 'consumable'; 
    this.draggedFromIndex = 0;
  }

  if (this.draggedItem) this.createDragPreview(e, this.draggedItem);
}


  createDragPreview(e, item) {
    const p = document.createElement('div');
    p.id = 'dragPreview';
    p.className = 'drag-preview';
    p.appendChild(item.createElement());
    p.style.position = 'absolute'; p.style.pointerEvents = 'none'; p.style.zIndex = '3001';
    p.style.left = e.clientX - 25 + 'px'; p.style.top = e.clientY - 25 + 'px';
    document.body.appendChild(p);
  }

  handleMouseMove(e) {
    const p = document.getElementById('dragPreview');
    if (p) { p.style.left = e.clientX - 25 + 'px'; p.style.top = e.clientY - 25 + 'px'; }
  }

  handleMouseUp(e) {
  const p = document.getElementById('dragPreview'); 
  if (p) p.remove();
  if (!this.draggedItem) return;

  const target = e.target.closest('.inventory-slot') || 
                 e.target.closest('.equipment-slot') || 
                 e.target.closest('.consumable-slot') || 
                 e.target.closest('.treasure-slot') ||
                 e.target.closest('.costume-slot');
  
  if (target) this.handleDrop(target);

  this.draggedItem = null; 
  this.draggedFromSlot = null; 
  this.draggedFromIndex = null;
}


  handleDrop(targetSlot) {
  if (this.isSameSlot(targetSlot)) return;
  if (targetSlot.classList.contains('inventory-slot')) this.dropToInventory(targetSlot);
  else if (targetSlot.classList.contains('equipment-slot')) this.dropToEquipment(targetSlot);
  else if (targetSlot.classList.contains('consumable-slot')) this.dropToConsumable(targetSlot);
  else if (targetSlot.classList.contains('treasure-slot')) this.dropToTreasure(targetSlot);
  else if (targetSlot.classList.contains('costume-slot')) this.dropToCostume(targetSlot, this.draggedItem);
}

dropToTreasure(targetSlot) {
  const item = this.draggedItem;
  
  // 更全面的法宝类型检测
  const isTreasure = item.category === 'treasure' || 
                    item.type === 'treasure' || 
                    (window.Catalog && window.Catalog.getTreasureData && window.Catalog.getTreasureData(item.name)) ||
                    (window.TREASURE_BASE_DATA && window.TREASURE_BASE_DATA[item.name]) ||
                    (item instanceof window.Treasure);
  
  if (!isTreasure) {
    this.showNotification('只能放置法宝！', 'error');
    return;
  }

  const currentTreasure = this.treasureSlot;
  
  if (this.draggedFromSlot === 'inventory') {
    this.treasureSlot = item;
    if (currentTreasure) {
      this.items[this.draggedFromIndex] = currentTreasure;
    } else {
      this.items[this.draggedFromIndex] = null;
      this.items = this.items.filter(Boolean);
    }
  } else if (this.draggedFromSlot === 'treasure') {
    // 法宝栏拖拽到法宝栏（不做任何操作，保持原位）
    return;
  } else if (this.draggedFromSlot === 'equipment') {
    this.equippedItems[this.draggedFromIndex] = null;
    this.treasureSlot = item;
    if (currentTreasure) {
      const emptyIndex = this.findEmptyInventorySlot();
      if (emptyIndex !== -1) this.items[emptyIndex] = currentTreasure;
    }
  } else if (this.draggedFromSlot === 'consumable') {
    this.consumableSlot = null;
    this.treasureSlot = item;
    if (currentTreasure) {
      const emptyIndex = this.findEmptyInventorySlot();
      if (emptyIndex !== -1) this.items[emptyIndex] = currentTreasure;
    }
  } else if (this.draggedFromSlot === 'costume') {
    this.costumeSlot = null;
    this.treasureSlot = item;
    if (currentTreasure) {
      const emptyIndex = this.findEmptyInventorySlot();
      if (emptyIndex !== -1) this.items[emptyIndex] = currentTreasure;
    }
  }

  // *** 关键修复：法宝装备后立即更新属性 ***
  this.updateEquipmentStats();        // 更新游戏内部属性计算
  this.updatePlayerStatsDisplay();    // 更新背包界面属性显示
  this.updateInventoryDisplay();      // 更新背包UI显示
}

dropToInventory(targetSlot) {
  const i = parseInt(targetSlot.dataset.index);
  const target = this.items[i];

  // 检查可堆叠物品的合并
  if (target && this._isStackable(this.draggedItem.name) && this.draggedItem.name === target.name) {
    target.quantity = (target.quantity || 1) + (this.draggedItem.quantity || 1);
    this.removeFromOriginSlot();
  } 
  // 检查装备的合并
  else if (target && this.canMergeItems(this.draggedItem, target)) {
    this.mergeItems(this.draggedFromSlot, this.draggedFromIndex, i);
  } 
  else {
    // 处理时装从时装栏拖回背包的情况
    if (this.draggedFromSlot === 'costume') {
      this.costumeSlot = null;
      this.items[i] = target;
      if (target) {
        const emptyIndex = this.findEmptyInventorySlot();
        if (emptyIndex !== -1) {
          this.items[emptyIndex] = this.draggedItem;
        }
      } else {
        this.items[i] = this.draggedItem;
      }
    }
    // 处理法宝从法宝栏拖回背包的情况
    else if (this.draggedFromSlot === 'treasure') {
      this.treasureSlot = null;
      this.items[i] = target;
      if (target) {
        const emptyIndex = this.findEmptyInventorySlot();
        if (emptyIndex !== -1) {
          this.items[emptyIndex] = this.draggedItem;
        }
      } else {
        this.items[i] = this.draggedItem;
      }
      // *** 关键修复：法宝从法宝栏移除时更新属性 ***
      this.updateEquipmentStats();
      this.updatePlayerStatsDisplay();
    }
    else {
      this.items[i] = target;
      if (target) {
        const emptyIndex = this.findEmptyInventorySlot();
        if (emptyIndex !== -1) {
          this.items[emptyIndex] = this.draggedItem;
        }
      } else {
        this.items[i] = this.draggedItem;
      }
      this.removeFromOriginSlot();
      // *** 关键修复：装备移除时更新属性 ***
      if (this.draggedFromSlot === 'equipment') {
        this.updateEquipmentStats();
        this.updatePlayerStatsDisplay();
      }
    }
  }
  
  this.updateInventoryDisplay();
}

  isSameSlot(targetSlot) {
  if (targetSlot.classList.contains('inventory-slot')) {
    const i = parseInt(targetSlot.dataset.index);
    return this.draggedFromSlot === 'inventory' && this.draggedFromIndex === i;
  } else if (targetSlot.classList.contains('equipment-slot')) {
    const i = parseInt(targetSlot.dataset.slot);
    return this.draggedFromSlot === 'equipment' && this.draggedFromIndex === i;
  } else if (targetSlot.classList.contains('consumable-slot')) {
    return this.draggedFromSlot === 'consumable' && this.draggedFromIndex === 0;
  } else if (targetSlot.classList.contains('treasure-slot')) {
    return this.draggedFromSlot === 'treasure' && this.draggedFromIndex === 0;
  } else if (targetSlot.classList.contains('costume-slot')) {
    return this.draggedFromSlot === 'costume' && this.draggedFromIndex === 0;
  }
  return false;
}

removeFromOriginSlot() {
  let needsUpdate = false;
  
  if (this.draggedFromSlot === 'inventory') {
    this.items[this.draggedFromIndex] = null;
    this.items = this.items.filter(Boolean);
  } else if (this.draggedFromSlot === 'equipment') {
    this.equippedItems[this.draggedFromIndex] = null;
    needsUpdate = true;  // 装备移除需要更新属性
  } else if (this.draggedFromSlot === 'consumable') {
    this.consumableSlot = null;
  } else if (this.draggedFromSlot === 'treasure') {
    this.treasureSlot = null;
    needsUpdate = true;  // 法宝移除需要更新属性
  } else if (this.draggedFromSlot === 'costume') {
    this.costumeSlot = null;
  }
  
  // *** 关键修复：当移除装备或法宝时更新属性 ***
  if (needsUpdate) {
    this.updateEquipmentStats();
    this.updatePlayerStatsDisplay();
  }
}

  dropToEquipment(targetSlot) {
  const item = this.draggedItem;
  
  // 添加装备类型检查 - 只允许装备类型的物品放入装备槽
  const isEquipment = item.category === 'common' || 
                     item.category === 'rare' || 
                     item.category === 'artifact' || 
                     item.type === 'equipment' ||
                     (item instanceof Item && item.isEquipment()) ||
                     this.isKnownEquipment(item.name);
  
  if (!isEquipment) {
    this.showNotification('只能放置装备！', 'error');
    return;
  }

  const i = parseInt(targetSlot.dataset.slot);
  const cur = this.equippedItems[i];

  if (this.draggedFromSlot === 'inventory') {
    this.equippedItems[i] = this.draggedItem;
    if (cur) this.items[this.draggedFromIndex] = cur;
    else { this.items[this.draggedFromIndex] = null; this.items = this.items.filter(Boolean); }
  } else if (this.draggedFromSlot === 'equipment') {
    this.equippedItems[this.draggedFromIndex] = cur;
    this.equippedItems[i] = this.draggedItem;
  } else if (this.draggedFromSlot === 'consumable') {
    this.consumableSlot = null; this.equippedItems[i] = this.draggedItem;
    if (cur) { const empty = this.findEmptyInventorySlot(); if (empty !== -1) this.items[empty] = cur; }
  } else if (this.draggedFromSlot === 'treasure') {
    this.treasureSlot = null;
    this.equippedItems[i] = this.draggedItem;
    if (cur) { const empty = this.findEmptyInventorySlot(); if (empty !== -1) this.items[empty] = cur; }
  } else if (this.draggedFromSlot === 'costume') {
    this.costumeSlot = null;
    this.equippedItems[i] = this.draggedItem;
    if (cur) { const empty = this.findEmptyInventorySlot(); if (empty !== -1) this.items[empty] = cur; }
  }

  // *** 关键修复：装备操作后立即更新属性 ***
  this.updateEquipmentStats(); 
  this.updatePlayerStatsDisplay();
  this.updateInventoryDisplay(); 
  this.updateConsumableDisplay();
}

  isKnownEquipment(itemName) {
  if (window.equipmentIconRenderer) {
    return Object.prototype.hasOwnProperty.call(window.equipmentIconRenderer.iconConfig || {}, itemName);
  }
  
  // 检查是否在装备基础数据中
  if (window.EQUIPMENT_BASE_DATA) {
    for (const [category, equipments] of Object.entries(window.EQUIPMENT_BASE_DATA)) {
      if (equipments[itemName]) {
        return true;
      }
    }
  }
  
  // 备用的已知装备列表
  const knownEquipments = [
    '破甲弹', '原核炮', '钛金甲', '反伤甲', '毁灭之刃', 
    '源流钢炮', '逐日弓', '血色·阿修罗', '冥王', '泰坦之心'
  ];
  return knownEquipments.includes(itemName);
}

  dropToConsumable() {
    const meta = ItemGenerator.getItemData(this.draggedItem.name);
    if (!meta || meta.type !== 'consumable') return;

    const cur = this.consumableSlot;
    if (cur && this._isStackable(this.draggedItem.name) && this.draggedItem.name === cur.name) {
      cur.quantity = (cur.quantity || 1) + (this.draggedItem.quantity || 1);
      if (this.draggedFromSlot === 'inventory') { this.items[this.draggedFromIndex] = null; this.items = this.items.filter(Boolean); }
      else if (this.draggedFromSlot === 'equipment') { this.equippedItems[this.draggedFromIndex] = null; }
      this.updateEquipmentStats(); this.updateInventoryDisplay(); this.updateConsumableDisplay(); return;
    }

    if (this.draggedFromSlot === 'inventory') {
      this.consumableSlot = this.draggedItem;
      if (cur) this.items[this.draggedFromIndex] = cur;
      else { this.items[this.draggedFromIndex] = null; this.items = this.items.filter(Boolean); }
    } else if (this.draggedFromSlot === 'equipment') {
      this.equippedItems[this.draggedFromIndex] = null;
      this.consumableSlot = this.draggedItem;
      if (cur) { const empty = this.findEmptyInventorySlot(); if (empty !== -1) this.items[empty] = cur; }
    }

    this.updateEquipmentStats(); this.updateInventoryDisplay(); this.updateConsumableDisplay();
  }

  findEmptyInventorySlot() { for (let i = 0; i < this.maxInventorySize; i++) if (!this.items[i]) return i; return -1; }

  canMergeItems(a, b) {
    if (this._isStackable(a.name)) return false;
    if (a.category === 'treasure' || a.type === 'treasure') return false;
    return a.name === b.name && a.quality === b.quality && a.quality < 5;
  }

  mergeItems(fromSlot, fromIndex, toIndex) {
  const target = this.items[toIndex], source = this.draggedItem;
  const newQuality = target.quality + 1;
  const newStats = {}; Object.keys(target.stats).forEach(k => newStats[k] = target.stats[k] * 2);
  const merged = new Item({ name: target.name, quality: newQuality, stats: newStats, category: target.category });
  this.items[toIndex] = merged;

  let needsUpdate = false;
  if (fromSlot === 'inventory') { 
    this.items[fromIndex] = null; 
    this.items = this.items.filter(Boolean); 
  }
  else if (fromSlot === 'equipment') {
    this.equippedItems[fromIndex] = null;
    needsUpdate = true;  // 装备合并需要更新属性
  }
  else if (fromSlot === 'consumable') {
    this.consumableSlot = null;
  }
  else if (fromSlot === 'treasure') {
    this.treasureSlot = null;
    needsUpdate = true;  // 法宝合并需要更新属性
  }

  this.createMergeEffect();
  
  // *** 关键修复：合并操作后更新属性 ***
  this.updateEquipmentStats(); 
  this.updatePlayerStatsDisplay();
  this.updateInventoryDisplay(); 
  this.updateConsumableDisplay();
}

  createMergeEffect() {
    const c = document.getElementById('inventoryContainer');
    const e = document.createElement('div');
    e.className = 'merge-effect';
    e.textContent = '合并成功！';
    e.style.cssText = `
      position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
      color:#ff0;font-size:24px;font-weight:bold;text-shadow:0 0 10px #ff0;pointer-events:none;z-index:1001;
    `;
    c.appendChild(e);
    setTimeout(() => e.remove(), 1500);
  }

  updateEquipmentStats() {
  let atk = 0, ls = 0, hp = 0, def = 0, ref = 0, erg = 0, maxE = 0;
  let hasAsura = false, hasHades = false, hasTitan = false;

  this.equippedItems.forEach(it => {
    if (!it) return;
    atk += it.stats.attack || 0;
    ls += it.stats.lifeSteal || 0;
    hp += it.stats.health || 0;
    def += it.stats.defense || 0;
    ref += it.stats.reflect || 0;
    erg += it.stats.energyRegen || 0;
    maxE += it.stats.maxEnergy || 0;
    if (it.name === '血色·阿修罗') hasAsura = true;
    if (it.name === '冥王') hasHades = true;
    if (it.name === '泰坦之心') hasTitan = true;
  });

  if (this.treasureSlot) {
    const treasureStats = this.treasureSlot.getFinalStats ? 
      this.treasureSlot.getFinalStats() : 
      (window.Catalog?.calculateTreasureStats?.(this.treasureSlot) || this.treasureSlot.stats || {});
    
    atk += treasureStats.attack || 0;
    ls += treasureStats.lifeSteal || 0;
    hp += treasureStats.health || 0;
    def += treasureStats.defense || 0;
    ref += treasureStats.reflect || 0;
    erg += treasureStats.energyRegen || 0;
    maxE += treasureStats.maxEnergy || 0;
  }

  if (window.updatePlayerStats) {
    window.updatePlayerStats({
      attack: atk, lifeSteal: ls, health: hp, defense: def, reflect: ref, energyRegen: erg, maxEnergy: maxE,
      hasAsura, hasHades, hasTitan
    });
  }
}

  useConsumableSlot() {
  if (!this.consumableSlot) return false;
  const IEH = window.ItemEffectHandler;
  if (!IEH) { this.showNotification('道具系统未初始化（items.js 未加载）', 'error'); return false; }
  const ok = IEH.handleItemUse(this.consumableSlot.name, this.consumableSlot, 'consumable', this);
  if (ok) this.updateConsumableDisplay();
  return !!ok;
  }

  getInventoryData() {
    return {
        items: this.items.map(item => item ? {
            name: item.name,
            quality: item.quality,
            stats: item.stats,
            category: item.category,
            quantity: item.quantity,
            passiveEffects: item.passiveEffects || null
        } : null).filter(item => item !== null),
        equippedItems: this.equippedItems.map(item => item ? {
            name: item.name,
            quality: item.quality,
            stats: item.stats,
            category: item.category,
            passiveEffects: item.passiveEffects || null
        } : null),
        consumableSlot: this.consumableSlot ? {
            name: this.consumableSlot.name,
            quality: this.consumableSlot.quality,
            stats: this.consumableSlot.stats,
            category: this.consumableSlot.category,
            quantity: this.consumableSlot.quantity,
            passiveEffects: this.consumableSlot.passiveEffects || null
        } : null,
        costumeSlot: this.costumeSlot ? {
            name: this.costumeSlot.name,
            quality: this.costumeSlot.quality,
            stats: this.costumeSlot.stats,
            category: this.costumeSlot.category,
            quantity: this.costumeSlot.quantity,
            passiveEffects: this.costumeSlot.passiveEffects || null
        } : null,
        gold: this.gold,
        maxInventorySize: this.maxInventorySize
    };
}

  syncInventoryGrid() {
  const grid = document.querySelector('#inventoryContainer .inventory-grid-new') || 
                document.querySelector('#inventoryContainer .inventory-grid');
  if (!grid) return;
  
  const currentSlots = grid.children.length;
  const targetSize = this.maxInventorySize;
  
  if (currentSlots < targetSize) {
    for (let i = currentSlots; i < targetSize; i++) {
      const slot = document.createElement('div');
      slot.className = 'inventory-slot inventory-slot-new';
      slot.dataset.index = i;
      grid.appendChild(slot);
    }
  } else if (currentSlots > targetSize) {
    for (let i = currentSlots - 1; i >= targetSize; i--) {
      if (grid.children[i]) {
        grid.removeChild(grid.children[i]);
      }
    }
  }
  
  document.getElementById('maxInventoryCount').textContent = this.maxInventorySize;
}

  updatePlayerStatsDisplay() {
  // 计算装备属性
  let equipmentStats = {
    health: 0,
    energy: 0,
    attack: 0,
    defense: 0,
    reflect: 0,
    lifeSteal: 0,
    energyRegen: 0,
    maxEnergy: 0
  };
  
  // 从装备中获取属性
  this.equippedItems.forEach(item => {
    if (item && item.stats) {
      equipmentStats.attack += item.stats.attack || 0;
      equipmentStats.health += item.stats.health || 0;
      equipmentStats.defense += item.stats.defense || 0;
      equipmentStats.reflect += item.stats.reflect || 0;
      equipmentStats.lifeSteal += item.stats.lifeSteal || 0;
      equipmentStats.energyRegen += item.stats.energyRegen || 0;
      equipmentStats.maxEnergy += item.stats.maxEnergy || 0;
    }
  });

  // *** 关键修复：添加法宝属性计算 ***
  if (this.treasureSlot) {
    const treasureStats = this.treasureSlot.getFinalStats ? 
      this.treasureSlot.getFinalStats() : 
      (window.Catalog?.calculateTreasureStats?.(this.treasureSlot) || this.treasureSlot.stats || {});
    
    equipmentStats.attack += treasureStats.attack || 0;
    equipmentStats.health += treasureStats.health || 0;
    equipmentStats.defense += treasureStats.defense || 0;
    equipmentStats.reflect += treasureStats.reflect || 0;
    equipmentStats.lifeSteal += treasureStats.lifeSteal || 0;
    equipmentStats.energyRegen += treasureStats.energyRegen || 0;
    equipmentStats.maxEnergy += treasureStats.maxEnergy || 0;
  }

  // 获取角色配置（基础属性）
  let characterConfig;
  if (typeof player !== 'undefined' && typeof player.getCharacterConfig === 'function') {
    characterConfig = player.getCharacterConfig();
  } else if (typeof player !== 'undefined' && player.CHARACTER_CONFIGS) {
    characterConfig = player.CHARACTER_CONFIGS[player.characterType || 'noah'];
  } else {
    // 默认配置
    characterConfig = {
      baseHealth: 500,
      baseEnergy: 100,
      baseEnergyRegen: 3,
      healthGrowth: 30,
      attackGrowth: 5,
      baseDefense: 0,
      defenseGrowth: 0
    };
  }

  // 计算基础属性
  const currentLevel = (typeof level !== 'undefined') ? level : 1;
  const baseMaxHealth = characterConfig.baseHealth + (currentLevel - 1) * characterConfig.healthGrowth;
  const baseAttack = (typeof baseAttackPower !== 'undefined') ? baseAttackPower : (10 + (currentLevel - 1) * characterConfig.attackGrowth);
  const baseDefense = (characterConfig.baseDefense || 0) + Math.floor(Math.max(0, currentLevel - 1) * (characterConfig.defenseGrowth || 0));
  
  // 计算最终属性
  let totalStats = {
    health: baseMaxHealth + equipmentStats.health,
    energy: characterConfig.baseEnergy + equipmentStats.maxEnergy,
    attack: baseAttack + equipmentStats.attack,
    defense: baseDefense + equipmentStats.defense,
    reflect: equipmentStats.reflect,
    lifeSteal: equipmentStats.lifeSteal,
    energyRegen: characterConfig.baseEnergyRegen + equipmentStats.energyRegen,
    cooldown: 0
  };

  // 添加晶核加成
  // 爆发晶核加成（攻击力）
  const explosionBonus = window.totalExplosionBonus || 0;
  if (explosionBonus > 0) {
    totalStats.attack = Math.floor(totalStats.attack * (1 + explosionBonus));
  }

  // 生存晶核加成（生命值和吸血）
  const survivalHealthBonus = window.totalSurvivalHealthBonus || 0;
  const survivalLifeStealBonus = window.totalSurvivalLifeStealBonus || 0;
  if (survivalHealthBonus > 0) {
    const survivalHealthIncrease = Math.floor(baseMaxHealth * survivalHealthBonus);
    totalStats.health += survivalHealthIncrease;
  }
  if (survivalLifeStealBonus > 0) {
    totalStats.lifeSteal += survivalLifeStealBonus;
  }

  // 战术晶核加成（回能和冷却）
  const tacticalEnergyBonus = window.totalTacticalEnergyBonus || 0;
  const tacticalCooldownBonus = window.totalTacticalCooldownBonus || 0;
  if (tacticalEnergyBonus > 0) {
    totalStats.energyRegen += tacticalEnergyBonus;
  }
  if (tacticalCooldownBonus > 0) {
    totalStats.cooldown = (tacticalCooldownBonus * 100); // 转为百分比显示
  }

  // 应用强力药水加成（如果激活）
  if (typeof player !== 'undefined' && player.powerBoostActive && player.powerBoostMultiplier > 1) {
    totalStats.attack = Math.floor(totalStats.attack * player.powerBoostMultiplier);
  }

  // 更新显示元素
  const updateElement = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  
  // 根据实际显示需求格式化数值
  updateElement('statAttack', totalStats.attack.toFixed(1));
  updateElement('statDefense', Math.floor(totalStats.defense));
  updateElement('statReflect', (totalStats.reflect * 100).toFixed(1) + '%');
  updateElement('statLifeSteal', (totalStats.lifeSteal * 100).toFixed(1) + '%');
  // 获取玩家当前生命值和能量值用于显示当前/最大值格式
let currentHealth = Math.floor(totalStats.health);
let currentEnergy = Math.floor(totalStats.energy);

// 如果可以获取玩家对象，使用实际当前值
if (typeof player !== 'undefined' && player) {
  currentHealth = Math.floor(player.health || currentHealth);
  currentEnergy = Math.floor(player.energy || currentEnergy);
} else if (typeof window.player !== 'undefined' && window.player) {
  currentHealth = Math.floor(window.player.health || currentHealth);
  currentEnergy = Math.floor(window.player.energy || currentEnergy);
}

const maxHealth = Math.floor(totalStats.health);
const maxEnergy = Math.floor(totalStats.energy);

// 修改后的显示更新：
// 生命显示为 当前/最大
updateElement('statHealth', `${currentHealth}/${maxHealth}`);
// 能量显示为 当前/最大  
updateElement('statEnergy', `${currentEnergy}/${maxEnergy}`);
// 回能去掉 /s 后缀
updateElement('statEnergyRegen', totalStats.energyRegen.toFixed(1));
  
  // 冷却减免显示
  if (totalStats.cooldown > 0) {
    updateElement('statCooldown', totalStats.cooldown.toFixed(1) + '%');
  }

  // 同步游戏主界面的攻击力显示（如果存在）
  const mainAttackEl = document.getElementById('attack');
  if (mainAttackEl) {
    mainAttackEl.textContent = Math.floor(totalStats.attack);
  }
  const combatPower = this.calculateCombatPower(totalStats);
  this.updateLevelAndCombatPower(combatPower);
}

  calculateCombatPower(stats) {
  // 战斗力计算公式：
  // 生命值 × 2.5 + 攻击力 × 30 + 防御力 × 25 + 反伤率 × 200 + 吸血率 × 500 + 能量回复 × 1000 + 能量上限 × 10 + 冷却减免率 × 1000
  
  const health = stats.health || 0;
  const attack = stats.attack || 0;
  const defense = stats.defense || 0;
  const reflect = stats.reflect || 0; // 直接使用百分比数值，例如960%就是960
  const lifeSteal = stats.lifeSteal || 0; // 直接使用百分比数值，例如960%就是960
  const energyRegen = stats.energyRegen || 0;
  const maxEnergy = stats.energy || 0;
  
  // 获取冷却减免率（从战术晶核），直接使用百分比数值
  const cooldownReduction = (window.totalTacticalCooldownBonus || 0) * 100; // 转换为百分比数值
  
  const combatPower = 
    health * 2.5 +
    attack * 30 +
    defense * 25 +
    reflect * 200 +
    lifeSteal * 500 +
    energyRegen * 1000 +
    maxEnergy * 10 +
    cooldownReduction * 1000;
  
  return Math.floor(combatPower);
}


// 更新等级和战斗力显示
updateLevelAndCombatPower(combatPower) {
  const playerLevel = window.player ? (window.player.level || 1) : 1;
  
  const levelEl = document.getElementById('playerLevel');
  if (levelEl) levelEl.textContent = playerLevel;
  
  const combatPowerEl = document.getElementById('combatPower');
  if (combatPowerEl) combatPowerEl.textContent = combatPower.toLocaleString();
}


  reset() {
    this.items = [];
    this.equippedItems = [null, null];
    this.treasureSlot = null;
    this.consumableSlot = null;
    this.gold = 0;
    this.maxInventorySize = 20;
    this.syncInventoryGrid();
    this.updateInventoryDisplay();
    this.updateConsumableDisplay();
    this.updateGoldDisplay();
    this.updateEquipmentStats();
  }

  getTreasureData() {
    const treasureData = {};
    
    if (this.treasureSlot && this.treasureSlot instanceof window.Treasure) {
        treasureData.treasureSlot = {
            name: this.treasureSlot.name,
            level: this.treasureSlot.level,
            growthRate: this.treasureSlot.growthRate,
            stats: this.treasureSlot.stats,
            cooldownLeft: this.treasureSlot.cooldownLeft,
            quality: this.treasureSlot.quality,
            skillEffect: this.treasureSlot.skillEffect,
            description: this.treasureSlot.description
        };
    }
    
    treasureData.inventoryTreasures = [];
    this.items.forEach((item, index) => {
        if (item && item instanceof window.Treasure) {
            treasureData.inventoryTreasures.push({
                index: index,
                name: item.name,
                level: item.level,
                growthRate: item.growthRate,
                stats: item.stats,
                cooldownLeft: item.cooldownLeft,
                quality: item.quality,
                skillEffect: item.skillEffect,
                description: item.description
            });
        }
    });
    
    return treasureData;
}

loadInventoryData(data, treasureData = null) {
    this.items = data.items.map(itemData => {
        if (!itemData) return null;
        
        if (itemData.category === 'treasure' || itemData.type === 'treasure') {
            return new Item({
                name: itemData.name,
                quality: itemData.quality,
                stats: itemData.stats,
                category: 'treasure',
                level: itemData.level,
                growthRate: itemData.growthRate,
                skillEffect: itemData.skillEffect,
                description: itemData.description
            });
        }
        
        const enhancedItemData = this.enhanceItemDataWithPassiveEffects(itemData);
        return new Item(enhancedItemData);
    });

    if (treasureData) {
        if (treasureData.treasureSlot) {
            this.treasureSlot = new window.Treasure(treasureData.treasureSlot);
        }
        
        if (treasureData.inventoryTreasures) {
            treasureData.inventoryTreasures.forEach(treasureInfo => {
                if (this.items[treasureInfo.index]) {
                    this.items[treasureInfo.index] = new window.Treasure({
                        name: treasureInfo.name,
                        level: treasureInfo.level,
                        growthRate: treasureInfo.growthRate,
                        stats: treasureInfo.stats,
                        cooldownLeft: treasureInfo.cooldownLeft,
                        quality: treasureInfo.quality,
                        skillEffect: treasureInfo.skillEffect,
                        description: treasureInfo.description
                    });
                }
            });
        }
    }

    if (!treasureData) {
        this.items.forEach((item, index) => {
            if (item && (item.category === 'treasure' || item.type === 'treasure')) {
                const treasureData = window.Catalog?.generateTreasureBy(item.name, 1, 1.0 + Math.random() * 1.5);
                if (treasureData) {
                    this.items[index] = new window.Treasure(treasureData);
                }
            }
        });
        
        if (this.treasureSlot && (this.treasureSlot.category === 'treasure' || this.treasureSlot.type === 'treasure')) {
            const treasureData = window.Catalog?.generateTreasureBy(this.treasureSlot.name, 1, 1.0 + Math.random() * 1.5);
            if (treasureData) {
                this.treasureSlot = new window.Treasure(treasureData);
            }
        }
    }

    this.gold = data.gold;
    this.maxInventorySize = data.maxInventorySize;
    
    if (data.equippedItems) {
        this.equippedItems = data.equippedItems.map(item => {
            if (!item) return null;
            const enhancedItemData = this.enhanceItemDataWithPassiveEffects(item);
            return new Item(enhancedItemData);
        });
    }

    if (data.consumableSlot) {
        const enhancedItemData = this.enhanceItemDataWithPassiveEffects(data.consumableSlot);
        this.consumableSlot = new Item(enhancedItemData);
    }

    if (data.costumeSlot) {
        const enhancedItemData = this.enhanceItemDataWithPassiveEffects(data.costumeSlot);
        this.costumeSlot = new Item(enhancedItemData);
    }

    this.syncInventoryGrid();
    this.updateInventoryDisplay();
    this.updateConsumableDisplay();
    this.updateEquipmentStats();
}

enhanceItemDataWithPassiveEffects(itemData) {
    if (!itemData || !itemData.name) return itemData;
    
    // 如果已经有passiveEffects，直接返回
    if (itemData.passiveEffects) return itemData;
    
    // 从catalog中获取完整的装备数据
    if (window.Catalog && itemData.category === 'artifact') {
        const fullEquipmentData = window.Catalog.getEquipmentData(itemData.name, 'artifact');
        if (fullEquipmentData && fullEquipmentData.passiveEffects) {
            return {
                ...itemData,
                passiveEffects: fullEquipmentData.passiveEffects
            };
        }
    }
    
    // 备用方案：直接从EQUIPMENT_BASE_DATA获取
    if (window.EQUIPMENT_BASE_DATA?.artifact?.[itemData.name]?.passiveEffects) {
        return {
            ...itemData,
            passiveEffects: window.EQUIPMENT_BASE_DATA.artifact[itemData.name].passiveEffects
        };
    }
    
    return itemData;
}


}

const slotPlaceholderStyle = `
.slot-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: rgba(0, 255, 255, 0.5);
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  pointer-events: none;
  text-shadow: 0 0 5px rgba(0, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  transition: opacity 0.3s ease;
}

/* 当槽位有物品时隐藏占位符 */
.equipment-slot.has-item .slot-placeholder,
.consumable-slot.has-item .slot-placeholder,
.treasure-slot.has-item .slot-placeholder,
.costume-slot.has-item .slot-placeholder {
  display: none !important;
}

/* 确保槽位相对定位以便占位符正确定位 */
.equipment-slot,
.consumable-slot,
.treasure-slot,
.costume-slot {
  position: relative;
}

/* 调整栏位布局为 3x2 网格 */
.equipment-grid-new {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 10px;
  width: 100%;
  max-width: 280px;
}

/* 确保所有槽位大小一致 */
.equipment-slot-new,
.consumable-slot-new,
.treasure-slot-new,
.costume-slot-new {
  width: 80px;
  height: 80px;
  border: 2px solid #666;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(20, 20, 40, 0.6));
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
}

.equipment-slot-new:hover,
.consumable-slot-new:hover,
.treasure-slot-new:hover,
.costume-slot-new:hover {
  border-color: rgba(0, 255, 255, 0.8);
  box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
  transform: scale(1.05);
}

/* 有物品时的样式 */
.equipment-slot-new.has-item,
.consumable-slot-new.has-item,
.treasure-slot-new.has-item,
.costume-slot-new.has-item {
  border-color: rgba(0, 255, 255, 0.9);
  background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(0, 150, 150, 0.1));
}
`;

const styleElement = document.createElement('style');
styleElement.textContent = slotPlaceholderStyle;
document.head.appendChild(styleElement);

// ====== Item（用于背包/装备的 UI 渲染）======
class Item {
  constructor(d) {
    
    this.name = d.name;
    this.quality = d.quality || 0;
    this.stats = d.stats || {};
    this.category = d.category || 'common';
    this.quantity = d.quantity || undefined;

    const qc = window.QUALITY_CONFIG || { names: ['普通','优秀','精良','史诗','传说','神器'], colors: ['#fff','#0f0','#06f','#93f','#fa0','#f00'] };
    this.qualityNames = qc.names;
    this.qualityColors = qc.colors;
  }

  getDisplayName() {
    if (window.Catalog?.getDisplayName) return Catalog.getDisplayName(this.name, this.quality);
    if (this.quality === 5) {
      const m = { '破甲弹':'银色子弹','原核炮':'无垠激光炮','钛金甲':'霸王舰甲','反伤甲':'金刚','毁灭之刃':'灭世','源流钢炮':'无流','逐日弓':'破晓' };
      return m[this.name] || this.name;
    }
    return this.name;
  }

  createElement() {
    const el = document.createElement('div');
    el.className = 'item';
    el.style.cssText = `
      width:48px;height:48px;border:2px solid ${this.qualityColors[this.quality]};
      border-radius:8px;background:linear-gradient(135deg,rgba(0,0,0,.9),rgba(20,20,40,.9));
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      font-size:10px;color:${this.qualityColors[this.quality]};text-align:center;position:relative;cursor:pointer;
      box-shadow:0 0 15px ${this.qualityColors[this.quality]}66,inset 0 1px 0 rgba(255,255,255,.1);transition:all .3s ease;
    `;

    this.createItemIcon(el);

    if ((inventory?._isStackable(this.name)) && this.quantity > 1) {
      const q = document.createElement('div');
      q.className = 'quantity-display';
      q.style.cssText = `
        position:absolute;bottom:0;right:0;background:rgba(255,255,255,.9);color:#000;font-size:10px;font-weight:bold;
        min-width:14px;height:14px;border-radius:7px;display:flex;align-items:center;justify-content:center;z-index:1;border:1px solid #666;
      `;
      q.textContent = this.quantity;
      el.appendChild(q);
    }

    const ring = document.createElement('div');
    ring.style.cssText = `position:absolute;top:-1px;left:-1px;right:-1px;bottom:-1px;border:1px solid ${this.qualityColors[this.quality]};border-radius:8px;opacity:.6;animation:qualityGlow 3s ease-in-out infinite;`;
    const dot = document.createElement('div');
    dot.style.cssText = `position:absolute;top:2px;right:2px;width:8px;height:8px;border-radius:50%;background:${this.qualityColors[this.quality]};box-shadow:0 0 6px ${this.qualityColors[this.quality]};border:1px solid #fff;`;
    el.appendChild(ring); el.appendChild(dot);

    el.title = this.getTooltip();
    return el;
  }

  createItemIcon(container) {
  // 优先检查时装类别
  if (this.category === 'costume' && window.itemIconRenderer?.isReady) {
    const ok = window.itemIconRenderer.drawIcon(container, this.name);
    if (ok) return;
  }

  if (this.isEquipment() && window.equipmentIconRenderer?.isReady) {
    const ok = window.equipmentIconRenderer.drawIcon(container, this.name, this.quality);
    if (ok) return;
  }

  // 检查是否为法宝 - 使用 Treasure 对象实例或物品元数据
  if ((this.category === 'treasure' || this instanceof window.Treasure) && 
      window.treasureIconRenderer?.isReady) {
    const ok = window.treasureIconRenderer.drawIcon(container, this.name);
    if (ok) return;
  }

  // 也检查物品定义中的法宝类型
  const itemMeta = ItemGenerator?.getItemData?.(this.name);
  if (itemMeta?.type === 'treasure' && window.treasureIconRenderer?.isReady) {
    const ok = window.treasureIconRenderer.drawIcon(container, this.name);
    if (ok) return;
  }

  if (window.itemIconRenderer?.isReady) {
    const ok = window.itemIconRenderer.drawIcon(container, this.name);
    if (ok) return;
  }

  container.innerHTML = `
    <div style="width:24px;height:24px;background:#666;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:bold;margin:auto;">
      ${this.name.charAt(0)}
    </div>
  `;
}

  isEquipment() {
    return this.category === 'common' || this.category === 'rare' || this.category === 'artifact' || this.isKnownEquipment();
  }
  isKnownEquipment() {
    if (window.equipmentIconRenderer) return Object.prototype.hasOwnProperty.call(window.equipmentIconRenderer.iconConfig || {}, this.name);
    const known = ['破甲弹','原核炮','钛金甲','反伤甲','毁灭之刃','源流钢炮','逐日弓','血色·阿修罗','冥王','泰坦之心'];
    return known.includes(this.name);
  }

  getTooltip() {
    if (window.Catalog?.buildTooltip) return Catalog.buildTooltip({ name: this.name, quality: this.quality, stats: this.stats, quantity: this.quantity || 1 });

    let tip = `${this.getDisplayName()}\n品质: ${this.qualityNames[this.quality]}\n\n`;
    const meta = ItemGenerator.getItemData(this.name);
    if (meta) {
      tip += meta.description || '';
      if (this.quantity > 1) tip += `\n数量: ${this.quantity}`;
      return tip;
    }
    tip += '属性:\n';
    Object.entries(this.stats).forEach(([k, v]) => {
      if (k === 'attack') tip += `攻击力: +${v}\n`;
      else if (k === 'lifeSteal') tip += `吸血: +${(v * 100).toFixed(1)}%\n`;
      else if (k === 'health') tip += `生命值: ${v >= 0 ? '+' : ''}${v}\n`;
      else if (k === 'defense') tip += `防御力: ${v >= 0 ? '+' : ''}${v}\n`;
      else if (k === 'reflect') tip += `反伤: +${(v * 100).toFixed(1)}%\n`;
      else if (k === 'energyRegen') tip += `回能: +${v}/秒\n`;
      else if (k === 'maxEnergy') tip += `最大能量: +${v}\n`;
    });
    if (this.quality < 5 && !inventory._isStackable(this.name)) tip += '\n可与同品质同名装备合并升级';
    return tip;
  }
}

// ===== 掉落物 =====
class DroppedItem {
  constructor(x, y, itemData) {
    this.x = x; this.y = y; this.itemData = itemData;
    this.radius = 20; this.bobOffset = Math.random() * Math.PI * 2; this.glowIntensity = 0; this.collected = false;
  }
  update() {
    this.glowIntensity = Math.sin(Date.now() * 0.005 + this.bobOffset) * 0.5 + 0.5;
    const dx = player.x - this.x, dy = player.y - this.y, dist = Math.hypot(dx, dy);
    if (dist < this.radius + 25 && !this.collected) {
      const ok = inventory.addItem(this.itemData);
      if (ok) {
        this.collected = true;
        if (this.itemData.name === '血瓶') this.showPickupNotification('血瓶'); else showItemDropNotification(this.itemData);
        return true;
      }
    }
    return false;
  }
  draw() {
    if (this.collected) return;
    ctx.save();
    const item = new Item(this.itemData);
    const glow = item.qualityColors[item.quality];

    ctx.shadowBlur = 20 + this.glowIntensity * 10;
    ctx.shadowColor = glow;
    ctx.strokeStyle = glow + '88';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.radius + this.glowIntensity * 5, 0, Math.PI * 2); ctx.stroke();

    ctx.translate(this.x, this.y);
    if (this.itemData.name === '血瓶') {
      ctx.fillStyle = '#ff4444'; ctx.beginPath(); ctx.roundRect(-8, -10, 16, 20, 4); ctx.fill();
      ctx.fillStyle = '#666'; ctx.beginPath(); ctx.roundRect(-4, -12, 8, 4, 2); ctx.fill();
    } else {
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.font = '12px Arial'; ctx.textAlign = 'center'; ctx.fillText('E', 0, 4);
    }
    ctx.restore();
  }
  showPickupNotification(name) {
    const n = document.createElement('div');
    n.style.cssText = `
      position:fixed;top:50px;left:50%;transform:translateX(-50%);
      background:rgba(0,0,0,.8);border:2px solid #00ff00;border-radius:10px;
      padding:10px 20px;color:#00ff00;font-size:16px;z-index:999;animation:pickupFade 2s ease-out forwards;
    `;
    n.textContent = `拾取了 ${name}`; document.body.appendChild(n); setTimeout(() => n.remove(), 2000);
  }
}

window.droppedItems = [];
window.generateHealthPotion = function () {
  return ItemGenerator ? ItemGenerator.generateItem('血瓶', 1) : { name: '血瓶', quality: 0, stats: {}, category: 'consumable' };
};
window.createDroppedItem = function (x, y, itemData) { droppedItems.push(new DroppedItem(x, y, itemData)); };
window.updateDroppedItems = function () { for (let i = droppedItems.length - 1; i >= 0; i--) { if (droppedItems[i].update()) droppedItems.splice(i, 1); } };
window.drawDroppedItems = function () { droppedItems.forEach(it => it.draw()); };

// 实例
window.inventory = new InventorySystem();

// 样式
const style = document.createElement('style');
style.textContent = `
  @keyframes pickupFade{0%{opacity:0;transform:translateX(-50%) translateY(-20px);}20%{opacity:1;transform:translateX(-50%) translateY(0);}80%{opacity:1;transform:translateX(-50%) translateY(0);}100%{opacity:0;transform:translateX(-50%) translateY(20px);}}
  @keyframes inventoryFullShake{0%,100%{transform:translate(-50%,-50%) scale(1);}25%{transform:translate(-50%,-50%) scale(1.05) rotate(-1deg);}75%{transform:translate(-50%,-50%) scale(1.05) rotate(1deg);}}
  @keyframes notificationSlide{0%{opacity:0;transform:translateX(-50%) translateY(-20px);}20%{opacity:1;transform:translateX(-50%) translateY(0);}80%{opacity:1;transform:translateX(-50%) translateY(0);}100%{opacity:0;transform:translateX(-50%) translateY(20px);}}
  .status-section{margin-bottom:20px;padding:15px;background:rgba(0,255,255,.1);border:1px solid #0ff;border-radius:8px;}
  .gold-display{color:#ffdd00;font-size:18px;font-weight:bold;margin-bottom:10px;text-shadow:0 0 10px #ffdd00;}
  .crystal-levels{display:flex;flex-direction:column;gap:5px;font-size:14px;}
  .crystal-levels>div{color:#0ff;text-shadow:0 0 5px #0ff;}
  .consumable-slots{margin-bottom:20px;}
  .consumable-grid{display:flex;gap:10px;margin-bottom:20px;}
  .consumable-slot{width:80px;height:80px;border:2px solid #666;border-radius:10px;background:linear-gradient(135deg,rgba(0,0,0,.6),rgba(20,20,40,.6));display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;transition:all .3s ease;}
  .consumable-slot.has-item{border-color:#ff0;box-shadow:0 0 15px #ffff0044;background:linear-gradient(135deg,rgba(255,255,0,.1),rgba(255,200,0,.1));}
  .consumable-slot:hover{border-color:#ff0;transform:scale(1.05);box-shadow:0 0 20px #ffff0033;}
  .context-menu{position:absolute;background:rgba(0,0,0,.9);border:2px solid #0ff;border-radius:8px;padding:5px;z-index:1001;min-width:120px;}
  .context-item{padding:8px 12px;color:#0ff;cursor:pointer;border-radius:4px;transition:background .3s;}
  .context-item:hover{background:rgba(0,255,255,.2);}
  .merge-effect{animation:mergeGlow 1.5s ease-out;}
  @keyframes mergeGlow{0%{opacity:0;transform:translate(-50%,-50%) scale(.5);}50%{opacity:1;transform:translate(-50%,-50%) scale(1.2);}100%{opacity:0;transform:translate(-50%,-50%) scale(1);}}
  @keyframes qualityGlow{0%,100%{opacity:.3;transform:scale(1);}50%{opacity:.8;transform:scale(1.02);}}
`;
document.head.appendChild(style);
