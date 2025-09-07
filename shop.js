// ==================== 商店系统（精简重构版） ====================

class ShopSystem {
  constructor() {
    this.isOpen = false;

    const fallbackItems = [
      { name: '血瓶', price: 200, category: 'consumable' },
      { name: '能量瓶', price: 350, category: 'consumable' },
      { name: '史诗破甲弹', price: 2000, category: 'equipment', quality: 3, equipmentName: '破甲弹' },
      { name: '史诗钛金甲', price: 1700, category: 'equipment', quality: 3, equipmentName: '钛金甲' },
      { name: '史诗原核炮', price: 1800, category: 'equipment', quality: 3, equipmentName: '原核炮' },
      { name: '随机史诗装备宝箱', price: 1600, category: 'consumable' },
      { name: '阿修罗之眼', price: 10000, category: 'material' },
      { name: '泰坦结晶', price: 12000, category: 'material' },
      { name: '冥王碎片', price: 9000, category: 'material' },
      { name: '扩充背包', price: 1000, category: 'special' },
      { name: '随机珍稀装备宝箱', price: 20000, category: 'consumable' },
      { name: '孟婆汤', price: 2000, category: 'special' },
      { name: '宇宙晶核', price: 1500, category: 'consumable' }
    ];

    const fallbackCodes = {
      'BETA2024': { used: false, rewards: [
        { name: '血瓶', quantity: 5 },
        { name: '能量瓶', quantity: 3 },
        { name: '宇宙晶核', quantity: 2 }
      ]},
      'NEWBIE': { used: false, rewards: [
        { name: '随机史诗装备宝箱', quantity: 1 },
        { name: '扩充背包', quantity: 1 }
      ]},
      '48692301': { used: false, rewards: [{ name: '阿修罗之眼', quantity: 6 }]},
      '48692302': { used: false, rewards: [{ name: '泰坦结晶', quantity: 9 }]},
      '48692303': { used: false, rewards: [{ name: '冥王碎片', quantity: 6 }]},
      '48692304': { used: false, rewards: [{ name: '随机珍稀装备宝箱', quantity: 15 }]},
      '48692305': { used: false, rewards: [{ name: '扩充背包', quantity: 3 }]},
      '48692306': { used: false, rewards: [{ name: '孟婆汤', quantity: 2 }]},
      '48692307': { used: false, rewards: [{ name: '随机史诗装备宝箱', quantity: 15 }]}
    };

    this.shopItems = (Array.isArray(window.SHOP_CATALOG) && window.SHOP_CATALOG.length)
      ? window.SHOP_CATALOG : fallbackItems;

    this.redemptionCodes = window.REDEMPTION_CODES || fallbackCodes;

    this.createShopUI();
    this.setupEventListeners();
  }

  createShopUI() {
    const shopContainer = document.createElement('div');
    shopContainer.id = 'shopContainer';
    shopContainer.className = 'shop-container';
    shopContainer.style.display = 'none';
    shopContainer.innerHTML = `
      <div class="shop-panel">
        <div class="shop-header">
          <h2>星际商店</h2>
          <button class="close-btn" onclick="shop.toggleShop()">×</button>
        </div>
        <div class="shop-content">
          <div class="shop-info">
            <div class="gold-display">💰 金币: <span id="shopGoldAmount">0</span></div>
            <div class="redemption-section">
              <input type="text" id="redemptionInput" placeholder="输入兑换码..." maxlength="20">
              <button id="redemptionBtn">兑换</button>
            </div>
          </div>
          <div class="shop-items">
            <h3>商品列表</h3>
            <div class="items-grid" id="shopItemsGrid"></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(shopContainer);
  }

  setupEventListeners() {
    document.getElementById('redemptionBtn').addEventListener('click', () => this.handleRedemption());
    document.getElementById('redemptionInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleRedemption();
    });
  }

  toggleShop() {
    const wasOpen = this.isOpen;  // 记录之前的状态
    this.isOpen = !this.isOpen;
    const container = document.getElementById('shopContainer');
    container.style.display = this.isOpen ? 'flex' : 'none';
    
    if (this.isOpen) {
        this.updateShopDisplay();
        this.updateGoldDisplay();
    } else if (wasOpen) {
        // 商店关闭时自动保存
        this.autoSaveOnClose();
    }
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
            
            console.log('商店关闭时自动保存完成');
        }
    }
}

  updateShopDisplay() {
  const grid = document.getElementById('shopItemsGrid');
  grid.innerHTML = '';
  this.shopItems.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'shop-item';
    const canAfford = (inventory.gold >= item.price);
    const hasSpace = this.hasInventorySpace(item);
    
    // 新的优化布局结构
    el.innerHTML = `
  <div class="item-icon">${this.getItemIcon(item)}</div>
  <div class="shop-item-content">
    <div class="item-name">${item.name}</div>
    <div class="item-price">${item.price} 金币</div>
  </div>
  <div class="shop-item-footer">
    <button class="buy-btn ${canAfford && hasSpace ? '' : 'disabled'}"
            onclick="shop.buyItem(${index})"
            ${canAfford && hasSpace ? '' : 'disabled'}>
      ${!canAfford ? '不足' : !hasSpace ? '背包已满' : '购买'}
    </button>
  </div>
`;
    grid.appendChild(el);
  });
}

  updateGoldDisplay() {
    const el = document.getElementById('shopGoldAmount');
    if (el) el.textContent = inventory.gold;
  }

  getItemIcon(item) {
  const temp = document.createElement('div');
  temp.style.cssText = 'width:32px;height:32px;display:inline-block;position:relative;';
  
  // 检查是否为法宝类型（通过多种方式判断）
  const isTreasure = item.category === 'treasure' || 
                    item.type === 'treasure' || 
                    (window.TREASURE_BASE_DATA && window.TREASURE_BASE_DATA[item.name]);
  
  if (isTreasure && window.treasureIconRenderer?.isReady) {
    const ok = window.treasureIconRenderer.drawIcon(temp, item.name);
    if (ok) return temp.outerHTML;
  }
  
  if (item.category === 'equipment' && window.equipmentIconRenderer?.isReady) {
    const ok = window.equipmentIconRenderer.drawIcon(temp, item.equipmentName, item.quality);
    if (ok) return temp.outerHTML;
  }
  
  if (window.itemIconRenderer?.isReady) {
    const ok = window.itemIconRenderer.drawIcon(temp, item.name);
    if (ok) return temp.outerHTML;
  }
  
  return `<div style="width:32px;height:32px;background:#666;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;">${item.name.charAt(0)}</div>`;
}

  hasInventorySpace(item) {
    if (item.name === '扩充背包') return inventory.items.length < inventory.maxInventorySize;
    if (window.Catalog?.isStackable?.(item.name)) return true;
    const stackables = (typeof ItemGenerator?.getStackableItems === 'function')
      ? ItemGenerator.getStackableItems() : [];
    if (Array.isArray(stackables) && stackables.includes(item.name)) {
      for (const it of inventory.items) if (it && it.name === item.name) return true;
    }
    return inventory.items.length < inventory.maxInventorySize;
  }

  buyItem(index) {
    const item = this.shopItems[index];
    if (inventory.gold < item.price) { this.showNotification('金币不足！', 'error'); return; }
    if (!this.hasInventorySpace(item)) { this.showNotification('背包已满！', 'error'); return; }

    inventory.gold -= item.price;
    const data = this.generateItemData(item);
    const ok = data && this.addItemToInventory(data);

    if (ok) {
      this.showNotification(`购买成功：${item.name}`, 'success');
      this.updateShopDisplay();
      this.updateGoldDisplay();
      inventory.updateGoldDisplay?.();
    } else {
      inventory.gold += item.price;
      this.showNotification('购买失败！', 'error');
    }
  }

  generateItemData(shopItem) {
    switch (shopItem.category) {
      case 'consumable':
      case 'material':
      case 'special':
        return ItemGenerator.generateItem(shopItem.name, 1);
      case 'equipment':
        if (!window.EquipmentGenerator) return null;
        const eq = EquipmentGenerator.generateSpecificEquipment(shopItem.equipmentName, shopItem.quality);
        return { name: eq.name, quality: eq.quality, stats: eq.getFinalStats(), category: eq.category };
      default:
        return null;
    }
  }

  addItemToInventory(itemData) {
    return inventory.addItem(itemData);
  }

  handleRedemption() {
  const input = document.getElementById('redemptionInput');
  const code = input.value.trim().toUpperCase();
  if (!code) { this.showNotification('请输入兑换码！', 'error'); return; }

  const record = this.redemptionCodes[code];
  if (!record) { this.showNotification('无效的兑换码！', 'error'); return; }
  if (record.used) { this.showNotification('该兑换码已被使用！', 'error'); return; }

  let okAll = true;
  for (const r of (record.rewards || [])) {
    let data;
    if (r.special === 'random_treasure' && r.name === '寒霜') {
      // 改为与存档读取一致的方式 - 生成数据对象而不是Treasure实例
      const treasureData = window.Catalog?.generateTreasureBy('寒霜', 1, 1.0 + Math.random() * 1.5);
      if (!treasureData) {
        data = ItemGenerator.generateItem(r.name, r.quantity || 1);
      } else {
        // 添加special标记，让addItem方法知道这是特殊的法宝数据
        data = { ...treasureData, special: 'random_treasure' };
      }
    } else {
      data = ItemGenerator.generateItem(r.name, r.quantity || 1);
    }
    if (!this.addItemToInventory(data)) { okAll = false; break; }
  }
  
  if (okAll) {
    record.used = true;
    input.value = '';
    this.showNotification('兑换成功！奖励已发放到背包', 'success');
    // 移除延迟更新，让其与存档读取保持一致的更新时机
    if (inventory.updateInventoryDisplay) {
      inventory.updateInventoryDisplay();
    }
  } else {
    this.showNotification('背包空间不足，无法兑换全部奖励！', 'error');
  }
}

  showNotification(message, type) {
    const n = document.createElement('div');
    const color = type === 'success' ? '#00ff00' : '#ff0000';
    n.className = `shop-notification ${type}`;
    n.textContent = message;
    n.style.cssText = `
      position:fixed;top:20%;left:50%;transform:translateX(-50%);
      background:rgba(0,0,0,.9);border:2px solid ${color};border-radius:10px;
      padding:15px 25px;color:${color};font-size:16px;font-weight:bold;z-index:1001;
      animation:notificationSlide 3s ease-out forwards;`;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 3000);
  }
}

window.shop = new ShopSystem();

const shopStyle = document.createElement('style');
shopStyle.textContent = `
/* 商店容器背景优化 */
.shop-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(ellipse at center, rgba(0,0,0,0.9), rgba(10,10,30,0.95));
  backdrop-filter: blur(5px);
  z-index: 3000;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 商店面板主体 */
.shop-panel {
  background: linear-gradient(135deg, #0a0f1b 0%, #1a2332 50%, #0f1824 100%);
  border: 2px solid transparent;
  background-clip: padding-box;
  position: relative;
  border-radius: 20px;
  padding: 25px;
  width: 900px;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 
    0 0 60px rgba(255,221,0,0.4),
    0 0 100px rgba(255,221,0,0.2),
    inset 0 0 30px rgba(255,221,0,0.05);
  animation: panelSlideIn 0.4s ease-out;
}

.shop-panel::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #ffdd00, #ffa500, #ffdd00);
  border-radius: 20px;
  z-index: -1;
  animation: borderGlow 3s linear infinite;
}

@keyframes borderGlow {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

@keyframes panelSlideIn {
  from { 
    transform: translateY(-30px) scale(0.95);
    opacity: 0;
  }
  to { 
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* 头部样式优化 */
.shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(255,221,0,0.3);
  position: relative;
  padding-right: 60px;
}

.shop-header h2 {
  color: #ffdd00;
  margin: 0;
  font-size: 28px;
  font-weight: bold;
  text-shadow: 
    0 0 20px rgba(255,221,0,0.8),
    0 0 40px rgba(255,221,0,0.4);
  letter-spacing: 2px;
  animation: titlePulse 2s ease-in-out infinite;
}

@keyframes titlePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

/* 关闭按钮美化 */
.shop-panel .close-btn {
  position: absolute;
  top: -10px;
  right: 15px;
  background: linear-gradient(135deg, #ff4444, #cc0000);
  border: 2px solid #ff6666;
  color: white;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 10px rgba(255,0,0,0.3);
}

.shop-panel .close-btn:hover {
  background: linear-gradient(135deg, #ff6666, #ff0000);
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 0 20px rgba(255,0,0,0.6);
}

/* 商店内容区 */
.shop-content {
  max-height: calc(85vh - 100px);
  overflow-y: auto;
  padding-right: 10px;
}

/* 自定义滚动条 */
.shop-content::-webkit-scrollbar {
  width: 8px;
}

.shop-content::-webkit-scrollbar-track {
  background: rgba(0,20,40,0.3);
  border-radius: 4px;
}

.shop-content::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #ffdd00, #ffa500);
  border-radius: 4px;
}

.shop-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #ffff00, #ffbb00);
}

/* 商店信息区优化 */
.shop-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding: 18px;
  background: linear-gradient(135deg, rgba(255,221,0,0.08), rgba(255,165,0,0.05));
  border: 1px solid rgba(255,221,0,0.4);
  border-radius: 12px;
  backdrop-filter: blur(5px);
  box-shadow: inset 0 0 20px rgba(255,221,0,0.1);
}

/* 金币显示优化 */
.gold-display {
  font-size: 20px;
  font-weight: bold;
  color: #ffdd00;
  text-shadow: 0 0 10px rgba(255,221,0,0.6);
  display: flex;
  align-items: center;
  gap: 10px;
  animation: goldShine 3s ease-in-out infinite;
}

@keyframes goldShine {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.2); }
}

.gold-display span {
  color: #fff;
  font-size: 22px;
}

/* 兑换码区域优化 */
.redemption-section {
  display: flex;
  gap: 12px;
  align-items: center;
}

#redemptionInput {
  padding: 10px 15px;
  border: 2px solid rgba(255,221,0,0.3);
  border-radius: 8px;
  background: rgba(0,10,20,0.8);
  color: #fff;
  font-size: 14px;
  width: 180px;
  transition: all 0.3s ease;
}

#redemptionInput::placeholder {
  color: rgba(255,255,255,0.5);
}

#redemptionInput:focus {
  border-color: #ffdd00;
  outline: none;
  box-shadow: 0 0 15px rgba(255,221,0,0.3);
  background: rgba(0,20,40,0.9);
}

#redemptionBtn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #ffdd00, #ffa500);
  border: none;
  border-radius: 8px;
  color: #000;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 15px rgba(255,221,0,0.3);
}

#redemptionBtn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 25px rgba(255,221,0,0.5);
  background: linear-gradient(135deg, #ffee00, #ffb500);
}

#redemptionBtn:active {
  transform: translateY(0);
}

/* 商品列表标题 */
.shop-items h3 {
  color: #00ffff;
  font-size: 18px;
  margin-bottom: 20px;
  text-shadow: 0 0 15px rgba(0,255,255,0.6);
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* 商品网格优化 */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 10px 0;
}

/* 商品卡片美化 */
.shop-item {
  background: linear-gradient(135deg, rgba(0,20,40,0.8), rgba(10,30,50,0.6));
  border: 2px solid rgba(0,255,255,0.3);
  border-radius: 15px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.shop-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  transition: left 0.5s ease;
}

.shop-item:hover::before {
  left: 100%;
}

.shop-item:hover {
  border-color: #ffdd00;
  transform: translateY(-3px) scale(1.02);
  box-shadow: 
    0 10px 30px rgba(255,221,0,0.3),
    inset 0 0 20px rgba(255,221,0,0.1);
  background: linear-gradient(135deg, rgba(255,221,0,0.05), rgba(255,165,0,0.03));
}

/* 物品图标 */
.item-icon {
  font-size: 40px;
  margin-bottom: 12px;
  filter: drop-shadow(0 0 10px currentColor);
  animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* 物品名称 */
.item-name {
  color: #00ffff;
  font-weight: bold;
  font-size: 15px;
  margin-bottom: 8px;
  text-shadow: 0 0 8px rgba(0,255,255,0.6);
}

/* 物品价格 */
.item-price {
  color: #ffdd00;
  font-size: 16px;
  margin-bottom: 12px;
  font-weight: bold;
  text-shadow: 0 0 8px rgba(255,221,0,0.5);
}

.item-price::before {
  content: '💰 ';
  margin-right: 5px;
}

/* 购买按钮优化 */
.buy-btn {
  width: 100%;
  padding: 10px;
  background: linear-gradient(135deg, #00ff00, #00cc00);
  border: none;
  border-radius: 8px;
  color: #000;
  font-weight: bold;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 15px rgba(0,255,0,0.3);
}

.buy-btn:hover:not(.disabled) {
  transform: scale(1.05);
  box-shadow: 0 6px 25px rgba(0,255,0,0.5);
  background: linear-gradient(135deg, #33ff33, #00dd00);
}

.buy-btn:active:not(.disabled) {
  transform: scale(0.98);
}

.buy-btn.disabled {
  background: linear-gradient(135deg, #444, #333);
  color: #999;
  cursor: not-allowed;
  box-shadow: none;
}

/* 通知动画优化 */
@keyframes notificationSlide {
  0% {
    opacity: 0;
    transform: translateX(-50%) translateY(-30px) scale(0.9);
  }
  20% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  80% {
    opacity: 1;
    transform: translateX(-50%) translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(-50%) translateY(20px) scale(0.9);
  }
}

/* 响应式优化 */
@media (max-width: 768px) {
  .shop-panel {
    width: 95vw;
    padding: 20px;
  }
  
  .items-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 15px;
  }
  
  .shop-header h2 {
    font-size: 22px;
  }
  
  #redemptionInput {
    width: 140px;
  }
}

.shop-panel {
  overflow: hidden !important;
  max-height: 90vh !important;
  display: flex !important;
  flex-direction: column !important;
}
`;
document.head.appendChild(shopStyle);
