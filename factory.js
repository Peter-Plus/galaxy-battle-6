class FactorySystem {
  constructor() {
    this.isOpen = false;
    this.selectedRecipe = null;
    this.createFactoryUI();
  }

createFactoryUI() {
    const factoryContainer = document.createElement('div');
    factoryContainer.id = 'factoryContainer';
    factoryContainer.className = 'factory-container';
    factoryContainer.style.display = 'none';
    factoryContainer.innerHTML = `
      <div class="factory-panel">
        <div class="factory-glow-effect"></div>
        <div class="factory-header">
          <div class="factory-title-wrapper">
            <div class="factory-title-icon">⚙️</div>
            <h2>星际工厂</h2>
            <div class="factory-title-subtitle"></div>
          </div>
          <button class="factory-close-btn" onclick="factory.toggleFactory()">
            <span class="close-icon">✕</span>
          </button>
        </div>
        
        <div class="factory-content">
          <div class="factory-left">
            <div class="crafting-area">
              <div class="section-title">
                <span class="section-icon">🔨</span>
                <h3>合成区域</h3>
                <div class="section-line"></div>
              </div>
              
              <div class="crafting-grid">
                <div class="material-slots" id="materialSlots">
                  <div class="slot-container">
                    <div class="result-slot" onclick="factory.selectRecipe()" id="resultSlot">
                      <div class="slot-inner">
                        <div class="empty-slot">
                          <span class="empty-icon">?</span>
                          <span class="empty-text">点击选择</span>
                        </div>
                      </div>
                      <div class="slot-glow"></div>
                    </div>
                  </div>
                </div>
                
                <div class="ingredient-slots" id="ingredientSlots">
                  <div class="ingredients-grid">
                    <div class="ingredient-slot">
                      <div class="ingredient-item">
                        <div class="item-icon"></div>
                        <div class="item-name">-</div>
                        <div class="item-count">0/0</div>
                      </div>
                    </div>
                    <div class="ingredient-slot">
                      <div class="ingredient-item">
                        <div class="item-icon"></div>
                        <div class="item-name">-</div>
                        <div class="item-count">0/0</div>
                      </div>
                    </div>
                    <div class="ingredient-slot">
                      <div class="ingredient-item">
                        <div class="item-icon"></div>
                        <div class="item-name">-</div>
                        <div class="item-count">0/0</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button class="craft-btn disabled" onclick="factory.craft()" id="craftBtn" disabled>
              <span class="craft-icon">⚡</span>
              <span class="craft-text">开始合成</span>
              <div class="craft-btn-glow"></div>
            </button>
          </div>
          
          <div class="factory-right">
            <div class="section-title">
              <span class="section-icon">🎒</span>
              <h3>背包物品</h3>
              <div class="section-line"></div>
            </div>
            <div class="factory-inventory" id="factoryInventory"></div>
          </div>
        </div>
      </div>
      
      <div class="recipe-modal" id="recipeModal" style="display:none;">
        <div class="recipe-modal-backdrop"></div>
        <div class="recipe-modal-content">
          <div class="recipe-modal-header">
            <div class="modal-title-wrapper">
              <span class="modal-icon">📜</span>
              <h3>选择合成配方</h3>
            </div>
            <button class="modal-close-btn" onclick="factory.closeRecipeModal()">
              <span>✕</span>
            </button>
          </div>
          <div class="recipe-list" id="recipeList"></div>
        </div>
      </div>
    `;
    document.body.appendChild(factoryContainer);
    
    // 添加美化样式
    const factoryStyle = document.createElement('style');
    factoryStyle.textContent = `
      /* 主容器样式 */
      .factory-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: radial-gradient(circle at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.98) 100%);
        backdrop-filter: blur(10px);
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

      /* 主面板样式 */
      .factory-panel {
  width: 90vw; /* 从可能的更大值改为 90vw */
  max-width: 1200px;
  height: 85vh; /* 添加高度限制 */
  max-height: 800px;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border: 3px solid rgba(0, 255, 255, 0.6);
  border-radius: 20px;
  padding: 25px;
  position: relative;
  overflow: hidden; /* 确保面板不会产生滚动条 */
  box-shadow: 
    0 0 50px rgba(0, 255, 255, 0.3),
    inset 0 0 50px rgba(0, 0, 0, 0.3);
}


      .factory-panel::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(45deg, #ffaa00, #ff6600, #ffaa00, #00ffff);
        border-radius: 20px;
        z-index: -1;
        animation: borderRotate 3s linear infinite;
        background-size: 300% 300%;
      }

      @keyframes borderRotate {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      /* 发光效果 */
      .factory-glow-effect {
        position: absolute;
        top: -100px;
        left: 50%;
        transform: translateX(-50%);
        width: 600px;
        height: 200px;
        background: radial-gradient(ellipse at center, rgba(255, 170, 0, 0.2) 0%, transparent 70%);
        filter: blur(40px);
        pointer-events: none;
      }

      /* 头部样式 */
      .factory-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        padding-bottom: 20px;
        border-bottom: 2px solid rgba(255, 170, 0, 0.3);
        position: relative;
      }

      .factory-header::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 50%;
        transform: translateX(-50%);
        width: 100px;
        height: 2px;
        background: linear-gradient(90deg, transparent, #ffaa00, transparent);
        animation: shimmer 2s ease-in-out infinite;
      }

      @keyframes shimmer {
        0%, 100% { width: 100px; opacity: 0.5; }
        50% { width: 200px; opacity: 1; }
      }

      .factory-title-wrapper {
        display: flex;
        align-items: center;
        gap: 15px;
      }

      .factory-title-icon {
        font-size: 36px;
        animation: rotate 4s linear infinite;
      }

      @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      .factory-header h2 {
        color: #ffaa00;
        margin: 0;
        font-size: 32px;
        font-weight: 800;
        text-shadow: 
          0 0 20px rgba(255, 170, 0, 0.8),
          0 0 40px rgba(255, 170, 0, 0.4);
        letter-spacing: 2px;
      }

      .factory-title-subtitle {
        color: rgba(255, 170, 0, 0.6);
        font-size: 12px;
        letter-spacing: 4px;
        margin-top: 5px;
      }

      /* 关闭按钮样式 */
      .factory-close-btn {
        width: 45px;
        height: 45px;
        border-radius: 50%;
        background: linear-gradient(145deg, #ff4444, #cc0000);
        border: 2px solid rgba(255, 68, 68, 0.3);
        color: white;
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        box-shadow: 
          0 0 20px rgba(255, 68, 68, 0.4),
          inset 0 0 10px rgba(0, 0, 0, 0.3);
      }

      .factory-close-btn:hover {
        transform: scale(1.1) rotate(90deg);
        box-shadow: 
          0 0 30px rgba(255, 68, 68, 0.6),
          inset 0 0 15px rgba(255, 255, 255, 0.2);
      }

      /* 内容区域 */
      .factory-content {
  display: grid;
  grid-template-columns: 0.6fr 1fr; /* 左侧更小，右侧更大 */
  gap: 30px; /* 从 40px 改为 30px */
  height: calc(100% - 80px); /* 确保不超出父容器 */
}

      /* 左侧合成区域 */
      .factory-left {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .crafting-area {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 15px;
        padding: 15px;
        border: 1px solid rgba(255, 170, 0, 0.2);
      }

      /* 区域标题样式 */
      .section-title {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 15px;
        position: relative;
      }

      .section-icon {
        font-size: 24px;
      }

      .section-title h3 {
        color: #00ffff;
        margin: 0;
        font-size: 20px;
        text-shadow: 0 0 15px rgba(0, 255, 255, 0.6);
        letter-spacing: 1px;
      }

      .section-line {
        flex: 1;
        height: 2px;
        background: linear-gradient(90deg, rgba(0, 255, 255, 0.5), transparent);
        margin-left: 15px;
      }

      /* 合成网格 */
      .crafting-grid {
        padding: 15px;
        background: linear-gradient(135deg, rgba(255, 170, 0, 0.05) 0%, rgba(0, 255, 255, 0.05) 100%);
        border: 1px solid rgba(255, 170, 0, 0.3);
        border-radius: 12px;
        position: relative;
        overflow: hidden;
      }

      .crafting-grid::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        animation: sweep 3s ease-in-out infinite;
      }

      @keyframes sweep {
        0% { left: -100%; }
        100% { left: 100%; }
      }

      /* 材料槽样式 */
      .material-slots {
        display: flex;
        justify-content: center;
        margin-bottom: 20px;
      }

      .slot-container {
        text-align: center;
      }

      .slot-label {
        color: #00ffff;
        font-size: 14px;
        margin-bottom: 15px;
        text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .label-icon {
        font-size: 18px;
      }

      /* 结果槽样式 */
      .result-slot {
        width: 100px;
        height: 100px;
        border: 3px solid #00ff00;
        border-radius: 15px;
        background: radial-gradient(circle at center, rgba(0, 255, 0, 0.1) 0%, rgba(0, 255, 0, 0.05) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .slot-inner {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 1;
      }

      .result-slot:hover {
        transform: scale(1.05);
        box-shadow: 
          0 0 30px rgba(0, 255, 0, 0.6),
          inset 0 0 20px rgba(0, 255, 0, 0.2);
      }

      .slot-glow {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 150%;
        height: 150%;
        background: radial-gradient(circle, rgba(0, 255, 0, 0.3), transparent);
        opacity: 0;
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }

      .empty-slot {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .empty-icon {
        color: rgba(255, 255, 255, 0.3);
        font-size: 36px;
        font-weight: bold;
      }

      .empty-text {
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
      }

      /* 材料网格 */
      .ingredients-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
      }

      .ingredient-slot {
        border: 2px solid rgba(100, 100, 100, 0.5);
        border-radius: 12px;
        padding: 15px;
        background: rgba(0, 0, 0, 0.4);
        text-align: center;
        transition: all 0.3s ease;
        width: 100px;   /* 设置宽度 */
        height: 140px;
      }

      .ingredient-slot.sufficient {
        border-color: #00ff00;
        background: linear-gradient(135deg, rgba(0, 255, 0, 0.1) 0%, rgba(0, 255, 0, 0.05) 100%);
        box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
      }

      .ingredient-slot.insufficient {
        border-color: #ff4444;
        background: linear-gradient(135deg, rgba(255, 68, 68, 0.1) 0%, rgba(255, 68, 68, 0.05) 100%);
        box-shadow: 0 0 15px rgba(255, 68, 68, 0.3);
      }

      .ingredient-item .item-icon {
        margin-bottom: 8px;
      }

      .ingredient-item .item-name {
        font-size: 12px;
        color: #fff;
        margin-bottom: 8px;
      }

      .ingredient-item .item-count {
        font-size: 16px;
        font-weight: bold;
      }

      .ingredient-item .item-count.sufficient {
        color: #00ff00;
        text-shadow: 0 0 10px rgba(0, 255, 0, 0.6);
      }

      .ingredient-item .item-count.insufficient {
        color: #ff4444;
        text-shadow: 0 0 10px rgba(255, 68, 68, 0.6);
      }

      /* 合成按钮 */
      .craft-btn {
        width: 100%;
        padding: 20px;
        background: linear-gradient(135deg, #00ff00 0%, #00cc00 50%, #00aa00 100%);
        border: none;
        border-radius: 12px;
        color: #000;
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        text-transform: uppercase;
        letter-spacing: 2px;
      }

      .craft-icon {
        font-size: 24px;
      }

      .craft-btn:hover:not(.disabled) {
        transform: translateY(-2px);
        box-shadow: 
          0 10px 30px rgba(0, 255, 0, 0.4),
          0 0 60px rgba(0, 255, 0, 0.3);
      }

      .craft-btn.disabled {
        background: linear-gradient(135deg, #444, #333);
        cursor: not-allowed;
        opacity: 0.6;
      }

      .craft-btn-glow {
        position: absolute;
        top: 50%;
        left: -100%;
        transform: translateY(-50%);
        width: 100%;
        height: 200%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        transition: left 0.5s ease;
      }

      .craft-btn:hover:not(.disabled) .craft-btn-glow {
        left: 100%;
      }

      /* 右侧背包区域 */
      .factory-right {
        display: flex;
        flex-direction: column;
      }

      /* 搜索框 */
      .inventory-search {
        margin-bottom: 20px;
      }

      .search-input {
        width: 100%;
        padding: 12px 20px;
        background: rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(0, 255, 255, 0.3);
        border-radius: 8px;
        color: white;
        font-size: 14px;
        transition: all 0.3s ease;
      }

      .search-input:focus {
        outline: none;
        border-color: #00ffff;
        box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
      }

      .search-input::placeholder {
        color: rgba(255, 255, 255, 0.3);
      }

      /* 背包网格 */
      .factory-inventory {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 10px;
  max-height: 450px; /* 增加高度从 400px 到 450px */
  height: 450px; /* 添加固定高度 */
  overflow-y: auto; /* 确保垂直滚动 */
  overflow-x: hidden; /* 隐藏水平滚动 */
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 12px;
}

      /* 自定义滚动条 */
      .factory-inventory::-webkit-scrollbar {
        width: 12px;
      }

      .factory-inventory::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 6px;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.factory-inventory::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #00ffff, #0088ff);
  border-radius: 6px;
  border: 1px solid rgba(0, 255, 255, 0.3);
}

.factory-inventory::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #33ffff, #3399ff);
}

      /* 物品样式 */
      .factory-item {
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.6), rgba(20, 20, 40, 0.8));
        border: 2px solid rgba(100, 100, 100, 0.3);
        border-radius: 10px;
        padding: 12px 8px;
        text-align: center;
        transition: all 0.3s ease;
        cursor: pointer;
        position: relative;
        overflow: hidden;
      }

      .factory-item::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .factory-item:hover {
        border-color: #ffaa00;
        background: linear-gradient(135deg, rgba(255, 170, 0, 0.1), rgba(255, 170, 0, 0.2));
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(255, 170, 0, 0.3);
      }

      .factory-item:hover::before {
        opacity: 1;
      }

      .factory-item.filtered-out {
        opacity: 0.3;
        pointer-events: none;
      }

      .factory-item .item-icon {
        margin-bottom: 8px;
      }

      .factory-item .item-name {
        font-size: 12px;
        margin-bottom: 4px;
        font-weight: 600;
      }

      .factory-item .item-quantity {
        font-size: 11px;
        color: #ffaa00;
        font-weight: bold;
        text-shadow: 0 0 5px rgba(255, 170, 0, 0.5);
      }

      /* 品质颜色 */
      .quality-0 { color: #ffffff; }
      .quality-1 { 
        color: #00ff00; 
        text-shadow: 0 0 8px rgba(0, 255, 0, 0.6);
      }
      .quality-2 { 
        color: #0099ff; 
        text-shadow: 0 0 8px rgba(0, 153, 255, 0.6);
      }
      .quality-3 { 
        color: #cc66ff; 
        text-shadow: 0 0 8px rgba(204, 102, 255, 0.6);
      }
      .quality-4 { 
        color: #ffaa00; 
        text-shadow: 0 0 8px rgba(255, 170, 0, 0.6);
      }
      .quality-5 { 
        color: #ff3333; 
        text-shadow: 0 0 8px rgba(255, 51, 51, 0.6);
      }

      /* 配方模态框 */
      .recipe-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 4000;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .recipe-modal-backdrop {
        position: absolute;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
      }

      .recipe-modal-content {
        background: linear-gradient(145deg, #1a1a2e, #16213e);
        border: 2px solid #00ffff;
        border-radius: 20px;
        padding: 30px;
        width: 90%;
        max-width: 800px;
        max-height: 75vh;
        overflow-y: auto;
        position: relative;
        z-index: 1;
        box-shadow: 
          0 0 50px rgba(0, 255, 255, 0.4),
          inset 0 0 30px rgba(0, 255, 255, 0.1);
        animation: modalSlideIn 0.3s ease-out;
      }

      @keyframes modalSlideIn {
        from { transform: scale(0.9); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }

      .recipe-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 2px solid rgba(0, 255, 255, 0.3);
      }

      .modal-title-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .modal-icon {
        font-size: 28px;
      }

      .recipe-modal-header h3 {
        color: #00ffff;
        margin: 0;
        font-size: 24px;
        text-shadow: 0 0 15px rgba(0, 255, 255, 0.8);
      }

      .modal-close-btn {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(255, 68, 68, 0.8);
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .modal-close-btn:hover {
        background: #ff4444;
        transform: rotate(90deg) scale(1.1);
      }

      /* 配方分类标签 */
      .recipe-categories {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        padding: 10px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 10px;
      }

      .category-btn {
        padding: 8px 20px;
        background: rgba(0, 255, 255, 0.1);
        border: 1px solid rgba(0, 255, 255, 0.3);
        border-radius: 8px;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;
      }

      .category-btn:hover {
        background: rgba(0, 255, 255, 0.2);
        color: white;
      }

      .category-btn.active {
        background: linear-gradient(135deg, rgba(0, 255, 255, 0.3), rgba(0, 255, 255, 0.2));
        border-color: #00ffff;
        color: #00ffff;
        box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
      }

      /* 配方列表 */
      .recipe-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .recipe-item {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 20px;
        background: linear-gradient(135deg, rgba(0, 255, 255, 0.05), rgba(0, 255, 255, 0.1));
        border: 2px solid rgba(0, 255, 255, 0.3);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      .recipe-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.2), transparent);
        transition: left 0.5s ease;
      }

      .recipe-item:hover {
        background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(0, 255, 255, 0.3));
        transform: translateX(5px);
        box-shadow: 
          0 5px 20px rgba(0, 255, 255, 0.3),
          inset 0 0 20px rgba(0, 255, 255, 0.1);
      }

      .recipe-item:hover::before {
        left: 100%;
      }

      .recipe-icon {
        width: 60px;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .recipe-info {
        flex: 1;
      }

      .recipe-name {
        font-size: 18px;
        font-weight: bold;
        color: #fff;
        margin-bottom: 8px;
        text-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
      }

      .recipe-materials {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.7);
        line-height: 1.6;
      }

      /* 通知样式 */
      .factory-notification {
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 40, 0.95));
        border-radius: 12px;
        padding: 20px 35px;
        font-size: 18px;
        font-weight: bold;
        z-index: 10001;
        animation: notificationSlide 3s ease-out forwards;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      }

      .factory-notification.success {
        border: 2px solid #00ff00;
        color: #00ff00;
        box-shadow: 
          0 0 30px rgba(0, 255, 0, 0.4),
          inset 0 0 20px rgba(0, 255, 0, 0.1);
      }

      .factory-notification.error {
        border: 2px solid #ff4444;
        color: #ff4444;
        box-shadow: 
          0 0 30px rgba(255, 68, 68, 0.4),
          inset 0 0 20px rgba(255, 68, 68, 0.1);
      }

      @keyframes notificationSlide {
        0% {
          opacity: 0;
          transform: translateX(-50%) translateY(-30px);
        }
        10% {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        90% {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        100% {
          opacity: 0;
          transform: translateX(-50%) translateY(-30px);
        }
      }

      /* 响应式布局 */
      @media (max-width: 768px) {
        .factory-panel {
          width: 95%;
          padding: 20px;
        }

        .factory-content {
          grid-template-columns: 1fr;
        }

        .factory-header h2 {
          font-size: 24px;
        }

        .ingredients-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .factory-inventory {
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        }
      }

      /* 加载动画 */
      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(0, 255, 255, 0.3);
        border-top: 4px solid #00ffff;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 20px auto;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* 工具提示 */
      .tooltip {
        position: absolute;
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 40, 0.95));
        border: 1px solid rgba(0, 255, 255, 0.5);
        border-radius: 8px;
        padding: 10px 15px;
        color: white;
        font-size: 12px;
        z-index: 10000;
        pointer-events: none;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
        animation: tooltipFade 0.2s ease-in;
      }

      @keyframes tooltipFade {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
      }

      body, html {
  overflow: hidden !important;
}

/* 确保工厂容器不会导致滚动 */
.factory-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(circle at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.98) 100%);
  backdrop-filter: blur(10px);
  z-index: 3000;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease-out;
  overflow: hidden; /* 添加这行 */
}
    `;
    document.head.appendChild(factoryStyle);

    // 初始化分类按钮事件
    setTimeout(() => {
      const categoryBtns = document.querySelectorAll('.category-btn');
      categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          categoryBtns.forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
          this.filterRecipesByCategory(e.target.dataset.category);
        });
      });
    }, 100);
  }

  // 新增：过滤配方功能
  filterRecipesByCategory(category) {
    const recipes = this.getRecipes();
    const filteredRecipes = category === 'all' 
      ? recipes 
      : recipes.filter(r => r.category === category);
    this.displayRecipes(filteredRecipes);
  }

  toggleFactory() {
    const wasOpen = this.isOpen;
    this.isOpen = !this.isOpen;
    const container = document.getElementById('factoryContainer');
    container.style.display = this.isOpen ? 'flex' : 'none';
    
    if (this.isOpen) {
      this.updateFactoryInventory();
      this.updateDisplay();
    } else if (wasOpen) {
      this.autoSaveOnClose();
    }
  }

  autoSaveOnClose() {
    if (typeof currentSaveId !== 'undefined' && currentSaveId && 
        typeof gameRunning !== 'undefined' && gameRunning &&
        typeof gameStateManager !== 'undefined' && gameStateManager.isInGame()) {
        
        if (typeof autoSave === 'function') {
            autoSave();
        } else if (typeof saveGame === 'function') {
            const saves = JSON.parse(localStorage.getItem('galacticWarshipSaves') || '{}');
            const currentSave = saves[currentSaveId];
            if (currentSave) {
                saveGame(currentSave.name, currentSaveId);
            }
        }
    }
  }

  getRecipes() {
  return [
    {
      id: 'bloodAsura',
      name: '血色·阿修罗',
      category: 'equipment',
      quality: 5,
      materials: [
        { name: '阿修罗之眼', quantity: 3 },
        { name: '炎晶', quantity: 10 },
        { name: '神珍铁', quantity: 1 }
      ]
    },
    {
      id: 'hades',
      name: '冥王',
      category: 'equipment', 
      quality: 5,
      materials: [
        { name: '冥王碎片', quantity: 3 },
        { name: '玄铁', quantity: 10 },
        { name: '神珍铁', quantity: 1 }
      ]
    },
    {
      id: 'titanHeart',
      name: '泰坦之心',
      category: 'equipment',
      quality: 5,
      materials: [
        { name: '泰坦结晶', quantity: 3 },
        { name: '雷砂', quantity: 10 },
        { name: '神珍铁', quantity: 1 }
      ]
    },
    {
      id: 'frostTreasure',
      name: '寒霜',
      category: 'treasure',
      quality: 4,
      materials: [
        { name: '不融雪', quantity: 2 },
        { name: '能量瓶', quantity: 10 },
        { name: '玄铁', quantity: 15 }
      ]
    },
    {
      id: 'epicDestroyer',
      name: '毁灭之刃',
      category: 'equipment',
      quality: 3,
      materials: [
        { name: '破甲弹', quantity: 1, requiredQuality: 3 },
        { name: '玄铁', quantity: 5 },
        { name: '雷砂', quantity: 3 }
      ]
    },
    {
      id: 'epicReflect',
      name: '反伤甲',
      category: 'equipment',
      quality: 3,
      materials: [
        { name: '钛金甲', quantity: 1, requiredQuality: 3 },
        { name: '炎晶', quantity: 2 },
        { name: '雷砂', quantity: 7 }
      ]
    },
    {
      id: 'epicCannon',
      name: '源流钢炮',
      category: 'equipment',
      quality: 3,
      materials: [
        { name: '原核炮', quantity: 1, requiredQuality: 3 },
        { name: '玄铁', quantity: 3 },
        { name: '雷砂', quantity: 6 }
      ]
    },
    {
      id: 'epicBow',
      name: '逐日弓',
      category: 'equipment',
      quality: 3,
      materials: [
        { name: '破甲弹', quantity: 1, requiredQuality: 2 },
        { name: '钛金甲', quantity: 1, requiredQuality: 2 },
        { name: '炎晶', quantity: 9 }
      ]
    },
    {
      id: 'powerPotion',
      name: '强力药水',
      category: 'consumable',
      quality: 0,
      materials: [
        { name: '血瓶', quantity: 1 },
        { name: '能量瓶', quantity: 1 },
        { name: '雷砂', quantity: 1 }
      ]
    },
    {
      id: 'shieldPotion',
      name: '护体药水',
      category: 'consumable',
      quality: 0,
      materials: [
        { name: '血瓶', quantity: 1 },
        { name: '能量瓶', quantity: 1 },
        { name: '炎晶', quantity: 1 }
      ]
    }
  ];
}

  selectRecipe() {
    const modal = document.getElementById('recipeModal');
    modal.style.display = 'flex';
    this.displayRecipes(this.getRecipes());
  }

  closeRecipeModal() {
    const modal = document.getElementById('recipeModal');
    modal.style.display = 'none';
  }

  displayRecipes(recipes = null) {
    const list = document.getElementById('recipeList');
    list.innerHTML = '';
    
    const recipesToShow = recipes || this.getRecipes();
    
    recipesToShow.forEach(recipe => {
      const canCraft = this.canCraft(recipe);
      const el = document.createElement('div');
      el.className = 'recipe-item';
      el.onclick = () => this.chooseRecipe(recipe);
      
      const icon = this.getRecipeIcon(recipe);
      const qualityClass = this.getQualityClass(recipe.quality || 0);
      
      el.innerHTML = `
        <div class="recipe-icon">${icon}</div>
        <div class="recipe-info">
          <div class="recipe-name ${qualityClass}">${recipe.name}</div>
          <div class="recipe-materials">
            需要: ${recipe.materials.map(mat => 
              `${mat.name}${mat.requiredQuality ? `(${this.getQualityName(mat.requiredQuality)})` : ''} ×${mat.quantity}`
            ).join(', ')}
          </div>
        </div>
        ${canCraft ? '<span style="color: #00ff00;">✓</span>' : '<span style="color: #ff4444;">✗</span>'}
      `;
      
      list.appendChild(el);
    });
  }
//不再用了？
  updateRecipeList() {
    const list = document.getElementById('recipeList');
    list.innerHTML = '';
    
    this.getRecipes().forEach(recipe => {
      const el = document.createElement('div');
      el.className = 'recipe-item';
      el.onclick = () => this.chooseRecipe(recipe);
      
      const icon = this.getRecipeIcon(recipe);
      
      el.innerHTML = `
        <div class="recipe-icon">${icon}</div>
        <div class="recipe-info">
          <div class="recipe-name">${recipe.name}</div>
          <div class="recipe-materials">
            ${recipe.materials.map(mat => 
              `${mat.name}${mat.requiredQuality ? `(${this.getQualityName(mat.requiredQuality)})` : ''} ×${mat.quantity}`
            ).join(', ')}
          </div>
        </div>
      `;
      
      list.appendChild(el);
    });
  }

  getQualityName(quality) {
    const names = ['普通', '优秀', '精良', '史诗', '传说', '神器'];
    return names[quality] || '未知';
  }

  chooseRecipe(recipe) {
    this.selectedRecipe = recipe;
    this.closeRecipeModal();
    this.updateDisplay();
  }

  updateDisplay() {
    this.updateResultSlot();
    this.updateIngredientSlots();
    this.updateCraftButton();
  }

  updateResultSlot() {
    const resultSlot = document.getElementById('resultSlot');
    if (this.selectedRecipe) {
      const icon = this.getRecipeIcon(this.selectedRecipe);
      const qualityClass = this.getQualityClass(this.selectedRecipe.quality || 0);
      resultSlot.innerHTML = `
        <div class="slot-inner">
          <div class="slot-item">
            <div class="item-icon">${icon}</div>
            <div class="item-name ${qualityClass}">${this.selectedRecipe.name}</div>
          </div>
        </div>
        <div class="slot-glow"></div>
      `;
    } else {
      resultSlot.innerHTML = `
        <div class="slot-inner">
          <div class="empty-slot">
            <span class="empty-icon">?</span>
            <span class="empty-text">点击选择</span>
          </div>
        </div>
        <div class="slot-glow"></div>
      `;
    }
  }


  updateIngredientSlots() {
    const grid = document.querySelector('.ingredients-grid');
    if (!grid) return;
    
    // 始终显示3个材料槽
    const slots = grid.querySelectorAll('.ingredient-slot');
    
    if (!this.selectedRecipe) {
      // 未选择配方时，显示空槽
      slots.forEach(slot => {
        slot.className = 'ingredient-slot';
        slot.innerHTML = `
          <div class="ingredient-item">
            <div class="item-icon"></div>
            <div class="item-name">-</div>
            <div class="item-count">0/0</div>
          </div>
        `;
      });
      return;
    }
    
    // 有配方时，更新材料显示
    this.selectedRecipe.materials.forEach((material, index) => {
      if (index < slots.length) {
        const available = this.countMaterial(material.name, material.requiredQuality);
        const needed = material.quantity;
        const hasEnough = available >= needed;
        
        const slot = slots[index];
        slot.className = `ingredient-slot ${hasEnough ? 'sufficient' : 'insufficient'}`;
        
        const icon = this.getMaterialIcon(material.name);
        
        slot.innerHTML = `
          <div class="ingredient-item">
            <div class="item-icon">${icon}</div>
            <div class="item-name">${material.name}${material.requiredQuality ? `(${this.getQualityName(material.requiredQuality)})` : ''}</div>
            <div class="item-count ${hasEnough ? 'sufficient' : 'insufficient'}">${available}/${needed}</div>
          </div>
        `;
      }
    });
    
    // 如果材料少于3个，剩余的槽位显示为空
    for (let i = this.selectedRecipe.materials.length; i < slots.length; i++) {
      slots[i].className = 'ingredient-slot';
      slots[i].innerHTML = `
        <div class="ingredient-item">
          <div class="item-icon"></div>
          <div class="item-name">-</div>
          <div class="item-count">0/0</div>
        </div>
      `;
    }
  }

  countMaterial(name, requiredQuality = null) {
    if (!inventory || !inventory.items) return 0;
    
    let count = 0;
    for (const item of inventory.items) {
      if (!item || item.name !== name) continue;
      
      if (requiredQuality !== null && item.quality !== requiredQuality) continue;
      
      count += item.quantity || 1;
    }
    return count;
  }

  updateCraftButton() {
    const btn = document.getElementById('craftBtn');
    const canCraft = this.canCraft();
    
    btn.disabled = !canCraft;
    btn.className = canCraft ? 'craft-btn' : 'craft-btn disabled';
  }

  canCraft(recipe = null) {
    const checkRecipe = recipe || this.selectedRecipe;
    if (!checkRecipe) return false;
    
    for (const material of checkRecipe.materials) {
        const available = this.countMaterial(material.name, material.requiredQuality);
        if (available < material.quantity) return false;
    }
    return true;
  }

  craft() {
    if (!this.selectedRecipe || !this.canCraft()) return;
    
    // 消耗材料
    for (const material of this.selectedRecipe.materials) {
        this.consumeMaterial(material.name, material.quantity, material.requiredQuality);
    }
    
    // 创建结果物品
    const resultItem = this.createResultItem();
    if (resultItem) {
        inventory.addItem(resultItem);
        this.showNotification(`成功合成 ${this.selectedRecipe.name}！`, 'success');
    } else {
        this.showNotification(`合成失败：无法创建 ${this.selectedRecipe.name}`, 'error');
    }
    
    // 更新显示
    this.updateFactoryInventory();
    this.updateDisplay();
    
    // 自动保存
    if (typeof autoSave === 'function') {
        autoSave();
    }
  }

  createResultItem() {
    if (this.selectedRecipe.category === 'equipment') {
      try {
        const eq = window.Catalog.generateEquipmentBy(this.selectedRecipe.name, this.selectedRecipe.quality);
        return {
          name: eq.name,
          quality: eq.quality,
          stats: eq.stats,
          category: eq.category
        };
      } catch (e) {
        return null;
      }
    } else if (this.selectedRecipe.category === 'treasure') {
      try {
        const treasure = window.Catalog.generateTreasureBy(this.selectedRecipe.name, 1, 1.0 + Math.random() * 1.5);
        return treasure;
      } catch (e) {
        return null;
      }
    } else {
      return window.Catalog.generateItem(this.selectedRecipe.name, 1);
    }
  }

  consumeMaterial(name, quantity, requiredQuality = null) {
    let remaining = quantity;
    for (let i = inventory.items.length - 1; i >= 0 && remaining > 0; i--) {
      const item = inventory.items[i];
      if (!item || item.name !== name) continue;
      
      if (requiredQuality !== null && item.quality !== requiredQuality) continue;
      
      const toConsume = Math.min(remaining, item.quantity || 1);
      item.quantity = (item.quantity || 1) - toConsume;
      remaining -= toConsume;
      
      if (item.quantity <= 0) {
        inventory.items.splice(i, 1);
      }
    }
  }

  updateFactoryInventory() {
    const grid = document.getElementById('factoryInventory');
    grid.innerHTML = '';
    
    if (!inventory || !inventory.items) return;
    
    inventory.items.forEach((item, index) => {
      if (!item) return;
      const el = document.createElement('div');
      el.className = 'factory-item';
      
      const icon = this.getItemIcon(item);
      const quantity = item.quantity > 1 ? `×${item.quantity}` : '';
      const qualityClass = this.getQualityClass(item.quality || 0);
      
      el.innerHTML = `
        <div class="item-icon">${icon}</div>
        <div class="item-name ${qualityClass}">${item.name}</div>
        <div class="item-quantity">${quantity}</div>
      `;
      
      grid.appendChild(el);
    });
  }

  getQualityClass(quality) {
    const classes = ['quality-0', 'quality-1', 'quality-2', 'quality-3', 'quality-4', 'quality-5'];
    return classes[quality] || 'quality-0';
  }

  getRecipeIcon(recipe) {
    if (recipe.category === 'equipment') {
      return this.getEquipmentIcon(recipe.name, recipe.quality);
    } else if (recipe.category === 'treasure') {
      return this.getTreasureIcon(recipe.name);
    } else {
      return this.getMaterialIcon(recipe.name);
    }
  }

  getTreasureIcon(name) {
    const temp = document.createElement('div');
    temp.style.cssText = 'width:32px;height:32px;display:inline-block;position:relative;';
    
    if (window.treasureIconRenderer?.isReady) {
      const ok = window.treasureIconRenderer.drawIcon(temp, name);
      if (ok) return temp.outerHTML;
    }
    
    return this.getDefaultIcon(name);
  }

  getEquipmentIcon(name, quality) {
    const temp = document.createElement('div');
    temp.style.cssText = 'width:32px;height:32px;display:inline-block;position:relative;';
    
    if (window.equipmentIconRenderer?.isReady) {
      const ok = window.equipmentIconRenderer.drawIcon(temp, name, quality);
      if (ok) return temp.outerHTML;
    }
    
    return this.getDefaultIcon(name);
  }

  getMaterialIcon(name) {
    const temp = document.createElement('div');
    temp.style.cssText = 'width:32px;height:32px;display:inline-block;position:relative;';
    
    if (window.itemIconRenderer?.isReady) {
      const ok = window.itemIconRenderer.drawIcon(temp, name);
      if (ok) return temp.outerHTML;
    }
    
    return this.getDefaultIcon(name);
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
    
    // 检查是否为装备且为已知装备类型
    if (this.isItemEquipment(item) && window.equipmentIconRenderer?.isReady) {
      const ok = window.equipmentIconRenderer.drawIcon(temp, item.name, item.quality || 0);
      if (ok) return temp.outerHTML;
    }
    
    // 如果不是装备或装备图标渲染失败，尝试物品图标
    if (window.itemIconRenderer?.isReady) {
      const ok = window.itemIconRenderer.drawIcon(temp, item.name);
      if (ok) return temp.outerHTML;
    }
    
    return this.getDefaultIcon(item.name);
  }

  isItemEquipment(item) {
    // 检查category是否为装备类型
    if (item.category === 'equipment' || 
        item.category === 'common' || 
        item.category === 'rare' || 
        item.category === 'artifact') {
      return true;
    }
    
    // 检查是否为已知装备名称
    if (window.equipmentIconRenderer && window.equipmentIconRenderer.iconConfig) {
      return Object.prototype.hasOwnProperty.call(window.equipmentIconRenderer.iconConfig, item.name);
    }
    
    // 备用已知装备列表
    const knownEquipments = [
      '破甲弹', '原核炮', '钛金甲', '反伤甲', '毁灭之刃', '源流钢炮', '透日弓',
      '血色·阿修罗', '冥王', '泰坦之心'
    ];
    
    return knownEquipments.includes(item.name);
  }

  getDefaultIcon(name) {
    const firstChar = name.charAt(0);
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7b731', '#5f27cd'];
    const color = colors[name.charCodeAt(0) % colors.length];
    
    return `<div style="
      width:32px;
      height:32px;
      background: linear-gradient(135deg, ${color}88, ${color}44);
      border: 1px solid ${color};
      border-radius:6px;
      display:flex;
      align-items:center;
      justify-content:center;
      color:#fff;
      font-weight:bold;
      font-size:16px;
      text-shadow: 0 0 5px rgba(0,0,0,0.5);
    ">${firstChar}</div>`;
  }

  showNotification(message, type) {
    const n = document.createElement('div');
    n.className = `factory-notification ${type}`;
    n.textContent = message;
    document.body.appendChild(n);
    setTimeout(() => n.remove(), 3000);
  }
}

window.factory = new FactorySystem();