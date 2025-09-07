class MainScreen {
    constructor(){this.createMainUI();window.addEventListener('load',()=>this.centerCard(2));}
    centerCard(i){const c=document.getElementById('modesScrollContainer');if(!c)return;const a=c.querySelectorAll('.mode-card-portrait');if(!a[i])return;const t=a[i],x=t.offsetLeft-(c.clientWidth-t.clientWidth)/2;c.scrollTo({left:x,behavior:'auto'});}

    createMainUI(){
  const c=document.createElement('div');
  c.id='mainContainer';c.className='main-container';c.style.display='none';
  c.innerHTML=`
  <div class="main-overlay">
    <div class="main-content-wrapper">
      <div class="main-header"><h1 class="main-title"><span class="title-text">银河战舰</span><span class="title-subtitle">GALAXY BATTLESHIP</span></h1></div>
      <div class="main-body">
        <div class="modes-scroll-wrapper">
          <button class="scroll-btn left" onclick="mainScreen.scrollModes(-1)">&#9664;</button>
          <div class="modes-scroll-container" id="modesScrollContainer">
            <button class="mode-card-portrait locked-mode" onclick="mainScreen.showComingSoon('次元裂缝')">
              <div class="card-glow"></div>
              <div class="portrait-thumb"><img src="assets/dimension_rift.png"></div>
              <div class="portrait-info"><div class="portrait-title">次元裂缝</div><div class="portrait-sub">挑战副本·角色技能突破</div></div>
              <div class="locked-overlay">
                <div class="lock-icon">🔒</div>
                <div class="coming-soon">敬请期待</div>
              </div>
            </button>
            <button class="mode-card-portrait" onclick="mainScreen.openMiracleRealm()">
              <div class="card-glow"></div>
              <div class="portrait-thumb"><img src="assets/miracle_realm.png"></div>
              <div class="portrait-info"><div class="portrait-title">奇迹之境</div><div class="portrait-sub">日常副本·获取法宝材料</div></div>
              <div class="card-border"></div>
            </button>
            <button class="mode-card-portrait" onclick="mainScreen.startEndless()">
              <div class="card-glow"></div>
              <div class="portrait-thumb"><img src="assets/endless.png"></div>
              <div class="portrait-info"><div class="portrait-title">无尽征程</div><div class="portrait-sub">主线模式·获取经验、金币、装备和宇宙晶核</div></div>
              <div class="card-border"></div>
            </button>
            <button class="mode-card-portrait" onclick="mainScreen.openTimeVortex()">
              <div class="card-glow"></div>
              <div class="portrait-thumb"><img src="assets/time_vortex.png"></div>
              <div class="portrait-info"><div class="portrait-title">时空漩涡</div><div class="portrait-sub">日常副本·获取材料、消耗品</div></div>
              <div class="card-border"></div>
            </button>
            <button class="mode-card-portrait locked-mode" onclick="mainScreen.showComingSoon('失落星域')">
              <div class="card-glow"></div>
              <div class="portrait-thumb"><img src="assets/lost_starfield.png"></div>
              <div class="portrait-info"><div class="portrait-title">失落星域</div><div class="portrait-sub">挑战副本·舰队升级</div></div>
              <div class="locked-overlay">
                <div class="lock-icon">🔒</div>
                <div class="coming-soon">敬请期待</div>
              </div>
            </button>
          </div>
          <button class="scroll-btn right" onclick="mainScreen.scrollModes(1)">&#9654;</button>
        </div>
      </div>
      <div class="main-footer">
        <div class="quick-actions">
          <button class="quick-action-btn" onclick="mainScreen.openInventory()">
            <div class="btn-glow"></div>
            <img src="assets/inventory.png"><span>背包</span>
          </button>
          <button class="quick-action-btn" onclick="mainScreen.openShop()">
            <div class="btn-glow"></div>
            <img src="assets/shop.png"><span>商店</span>
          </button>
          <button class="quick-action-btn" onclick="mainScreen.openFactory()">
            <div class="btn-glow"></div>
            <img src="assets/factory.png"><span>工厂</span>
          </button>
          <button class="quick-action-btn" onclick="mainScreen.openFleet()">
            <div class="btn-glow"></div>
            <img src="assets/fleet.png"><span>舰队</span>
          </button>
          <button class="quick-action-btn" onclick="mainScreen.openTreasure()">
            <div class="btn-glow"></div>
            <img src="assets/treasure.png"><span>法宝</span>
          </button>
          <button class="quick-action-btn" onclick="mainScreen.openAchievement()">
            <div class="btn-glow"></div>
            <img src="assets/achievement.png"><span>成就</span>
          </button>
        </div>
      </div>
    </div>
  </div>`;document.body.appendChild(c);this.addStyles();
}

    scrollModes(d){
        const el=document.getElementById('modesScrollContainer');
        if(!el)return;
        el.scrollBy({left:d*260,behavior:'smooth'});
    }

    show(){
        const mainContainer = document.getElementById('mainContainer');
        if (mainContainer) {
            mainContainer.style.display = 'block';
        }
        this.updateDungeonStatus();
    }

    updateDungeonStatus() {
    const timeVortexBtn = document.querySelector('[onclick*="openTimeVortex"]');
    if (timeVortexBtn) {
        const existingStatusTag = timeVortexBtn.querySelector('.status-tag');
        if (existingStatusTag) {
            existingStatusTag.remove();
        }
    }
}

    startEndless() {
        gameStateManager.goToEndless();
    }

    openMiracleRealm() {
        this.hide();
        if (typeof miracleRealmManager !== 'undefined') {
            miracleRealmManager.open();
        }
    }

    openTimeVortex() {
        if (typeof timeVortexManager !== 'undefined' && timeVortexManager.open) {
            timeVortexManager.open();
        }
    }

    openInventory() {
        if (typeof inventory !== 'undefined' && inventory.toggleInventory) {
            inventory.toggleInventory();
        }
    }

    openShop() {
        if (typeof shop !== 'undefined' && shop.toggleShop) {
            shop.toggleShop();
        }
    }

    openFactory() {
        if (typeof factory !== 'undefined' && factory.toggleFactory) {
            factory.toggleFactory();
        }
    }

    openFleet() {
        if (typeof fleet !== 'undefined' && fleet.toggleFleet) {
            fleet.toggleFleet();
        }
    }

    openTreasure() {
        if (typeof treasureManager !== 'undefined' && treasureManager.toggleTreasure) {
            treasureManager.toggleTreasure();
        }
    }

    openAchievement() {
    if (typeof achievementSystem !== 'undefined' && achievementSystem.toggleAchievement) {
        achievementSystem.toggleAchievement();
    }
}

    addStyles(){
  const s=document.createElement('style');s.textContent=`
  /* 主界面背景和布局 - Version 4 更合理的布局 */
  .main-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    background: 
      radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 80%, rgba(120, 219, 255, 0.2) 0%, transparent 50%),
      linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%);
    z-index: 1000;
    overflow: hidden;
  }

  .main-overlay {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .main-overlay::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="%23ffffff" opacity="0.05"/><circle cx="80" cy="40" r="0.5" fill="%23ffffff" opacity="0.03"/><circle cx="40" cy="60" r="1.5" fill="%23ffffff" opacity="0.04"/><circle cx="70" cy="80" r="1" fill="%23ffffff" opacity="0.02"/><circle cx="10" cy="90" r="0.8" fill="%23ffffff" opacity="0.06"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
    animation: shimmer 20s linear infinite;
    pointer-events: none;
    z-index: -1;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100px) translateY(-100px); }
    100% { transform: translateX(100px) translateY(100px); }
  }

  /* 布局容器 - 固定比例分配 */
  .main-content-wrapper {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr auto;
    grid-template-areas: 
      "header"
      "body"
      "footer";
    padding: 20px;
    box-sizing: border-box;
    min-height: 0;
  }

  .main-header {
    grid-area: header;
    text-align: center;
    margin-bottom: 20px;
  }

  .main-body {
    grid-area: body;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
    overflow: hidden;
  }

  .main-footer {
    grid-area: footer;
    margin-top: 20px;
  }

  .quick-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    max-width: 700px;
    margin: 0 auto;
    flex-wrap: wrap;
  }

  /* 游戏模式滚动容器 - 保持原有外观但优化尺寸 */
  .modes-scroll-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    max-width: 1100px;
    margin: 0 auto;
    width: 100%;
    height: 100%;
    max-height: 400px;
  }
  
  .modes-scroll-container {
    display: flex;
    gap: 25px;
    overflow-x: auto;
    scroll-behavior: smooth;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 15px 10px 20px 10px;
    flex: 1;
    align-items: center;
    mask: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
  }
  
  .modes-scroll-container::-webkit-scrollbar { display: none; }

  /* 滚动按钮 - 保持美化效果 */
  .scroll-btn {
    background: linear-gradient(145deg, rgba(0, 255, 255, 0.1), rgba(0, 100, 255, 0.15));
    color: #00FFFF;
    border: 2px solid rgba(0, 255, 255, 0.3);
    font-size: 26px;
    width: 50px;
    height: 80px;
    border-radius: 15px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }

  .scroll-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  
  .scroll-btn:hover {
    background: linear-gradient(145deg, rgba(0, 255, 255, 0.2), rgba(0, 100, 255, 0.3));
    border-color: rgba(0, 255, 255, 0.6);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 255, 255, 0.3);
  }

  .scroll-btn:hover::before {
    left: 100%;
  }
  
  .scroll-btn.left { margin-right: 15px; }
  .scroll-btn.right { margin-left: 15px; }

  /* 游戏模式卡片 - 恢复合适尺寸 */
  .mode-card-portrait {
    width: 200px;
    height: 280px;
    border-radius: 18px;
    background: linear-gradient(145deg, 
      rgba(255, 255, 255, 0.1) 0%,
      rgba(255, 255, 255, 0.05) 50%,
      rgba(255, 255, 255, 0.02) 100%);
    border: 1px solid rgba(0, 255, 255, 0.2);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 14px;
    padding: 18px 14px;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(15px);
    flex-shrink: 0;
  }

  /* 卡片发光效果 */
  .card-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(from 0deg, transparent, rgba(0, 255, 255, 0.1), transparent 30%);
    animation: rotate 4s linear infinite;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  @keyframes rotate {
    100% { transform: rotate(360deg); }
  }

  .mode-card-portrait:hover .card-glow {
    opacity: 1;
  }

  /* 卡片边框动画 */
  .card-border {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 18px;
    padding: 2px;
    background: linear-gradient(45deg, rgba(0, 255, 255, 0.5), rgba(255, 0, 255, 0.3), rgba(0, 255, 255, 0.5));
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .mode-card-portrait:hover .card-border {
    opacity: 1;
  }
  
  .mode-card-portrait:hover {
    transform: translateY(-6px) scale(1.02);
    background: linear-gradient(145deg, 
      rgba(255, 255, 255, 0.15) 0%,
      rgba(0, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.08) 100%);
    border-color: rgba(0, 255, 255, 0.5);
    box-shadow: 
      0 18px 35px rgba(0, 255, 255, 0.2),
      0 0 0 1px rgba(0, 255, 255, 0.3) inset;
  }

  /* 图片容器 */
  .portrait-thumb {
    width: 150px;
    height: 150px;
    border-radius: 14px;
    background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(0, 255, 255, 0.2);
  }

  .portrait-thumb::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }

  .mode-card-portrait:hover .portrait-thumb::before {
    transform: translateX(100%);
  }
  
  .portrait-thumb img {
    max-width: 90%;
    max-height: 90%;
    display: block;
    border-radius: 10px;
    transition: transform 0.3s ease;
  }

  .mode-card-portrait:hover .portrait-thumb img {
    transform: scale(1.05);
  }

  /* 卡片信息文字 */
  .portrait-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    z-index: 2;
  }
  
  .portrait-title {
    font-size: 18px;
    color: #00FFFF;
    font-weight: 800;
    letter-spacing: 0.5px;
    text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
    transition: all 0.3s ease;
  }

  .mode-card-portrait:hover .portrait-title {
    color: #FFFFFF;
    text-shadow: 0 0 20px rgba(0, 255, 255, 0.8);
  }
  
  .portrait-sub {
    font-size: 12px;
    color: #A0C4FF;
    text-align: center;
    transition: color 0.3s ease;
    line-height: 1.3;
  }

  .mode-card-portrait:hover .portrait-sub {
    color: #E0E0E0;
  }

  /* 锁定状态美化 */
  .locked-mode {
    opacity: 0.7;
    position: relative;
  }

  .locked-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.3), rgba(50, 50, 50, 0.3));
    border-radius: 18px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    backdrop-filter: blur(5px);
  }

  .lock-icon {
    font-size: 30px;
    filter: grayscale(1) brightness(0.7);
  }

  .coming-soon {
    color: #FFD700;
    font-size: 15px;
    font-weight: 600;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  /* 底部快捷按钮 - 单行排列 */
  .quick-action-btn {
    background: linear-gradient(145deg, rgba(0, 255, 255, 0.1), rgba(0, 150, 255, 0.1));
    border: 1px solid rgba(0, 255, 255, 0.3);
    border-radius: 14px;
    padding: 14px 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
    min-width: 80px;
  }

  .btn-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at center, rgba(0, 255, 255, 0.2) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .quick-action-btn:hover .btn-glow {
    opacity: 1;
  }
  
  .quick-action-btn:hover {
    background: linear-gradient(145deg, rgba(0, 255, 255, 0.2), rgba(0, 150, 255, 0.2));
    border-color: rgba(0, 255, 255, 0.6);
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 255, 255, 0.2);
  }
  
  .quick-action-btn img {
    width: 32px;
    height: 32px;
    transition: transform 0.3s ease;
    filter: drop-shadow(0 0 5px rgba(0, 255, 255, 0.3));
  }

  .quick-action-btn:hover img {
    transform: scale(1.1);
    filter: drop-shadow(0 0 10px rgba(0, 255, 255, 0.6));
  }
  
  .quick-action-btn span {
    font-size: 12px;
    color: #A0C4FF;
    font-weight: 500;
    transition: color 0.3s ease;
  }

  .quick-action-btn:hover span {
    color: #FFFFFF;
  }

  /* 状态标签 */
  .status-tag {
    position: absolute;
    top: 10px;
    right: 10px;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: 600;
    z-index: 3;
  }

  .status-tag.available {
    background: linear-gradient(45deg, #00FF88, #00CC66);
    color: white;
    box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
  }

  .status-tag.locked {
    background: linear-gradient(45deg, #FF6B6B, #FF5252);
    color: white;
    box-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
  }

  .status-tag.exhausted {
    background: linear-gradient(45deg, #FFA726, #FF9800);
    color: white;
    box-shadow: 0 0 10px rgba(255, 167, 38, 0.5);
  }

  /* 响应式设计 */
  @media (max-width: 1200px) {
    .mode-card-portrait {
      width: 180px;
      height: 260px;
    }
    
    .portrait-thumb {
      width: 135px;
      height: 135px;
    }
    
    .modes-scroll-container {
      gap: 20px;
    }
  }

  @media (max-width: 768px) {
    .main-content-wrapper {
      padding: 15px;
      grid-template-rows: auto 1fr auto;
    }

    .mode-card-portrait {
      width: 160px;
      height: 240px;
      gap: 12px;
      padding: 15px 12px;
    }
    
    .portrait-thumb {
      width: 120px;
      height: 120px;
    }
    
    .modes-scroll-container {
      gap: 16px;
    }

    .portrait-title {
      font-size: 16px;
    }

    .portrait-sub {
      font-size: 11px;
    }

    .quick-actions {
      gap: 15px;
    }

    .quick-action-btn {
      min-width: 70px;
      padding: 12px 10px;
    }

    .quick-action-btn img {
      width: 28px;
      height: 28px;
    }

    .scroll-btn {
      width: 45px;
      height: 70px;
      font-size: 22px;
    }
  }

  @media (max-height: 700px) {
    .main-content-wrapper {
      padding: 12px;
    }

    .main-header {
      margin-bottom: 15px;
    }

    .main-footer {
      margin-top: 15px;
    }

    .mode-card-portrait {
      height: 220px;
    }

    .portrait-thumb {
      width: 120px;
      height: 120px;
    }
  }

  @media (max-height: 600px) {
    .mode-card-portrait {
      width: 150px;
      height: 200px;
      gap: 10px;
      padding: 12px 10px;
    }

    .portrait-thumb {
      width: 100px;
      height: 100px;
    }

    .portrait-title {
      font-size: 15px;
    }

    .portrait-sub {
      font-size: 10px;
    }

    .quick-action-btn {
      padding: 10px 8px;
      min-width: 65px;
    }

    .quick-action-btn img {
      width: 24px;
      height: 24px;
    }

    .quick-action-btn span {
      font-size: 11px;
    }
  }
  `;document.head.appendChild(s);
}

    // 新增显示"敬请期待"提示的方法
    showComingSoon(modeName) {
        // 创建提示弹窗
        const toast = document.createElement('div');
        toast.className = 'coming-soon-toast';
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">🚀</span>
                <span class="toast-text">${modeName} 即将开放，敬请期待！</span>
            </div>
        `;
        toast.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(145deg, rgba(0, 255, 255, 0.9), rgba(0, 150, 255, 0.9));
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 255, 255, 0.3);
            z-index: 10000;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            animation: toastIn 0.3s ease-out;
        `;
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes toastIn {
                from {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
            }
            .toast-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .toast-icon {
                font-size: 24px;
            }
            .toast-text {
                font-size: 16px;
                font-weight: 600;
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(toast);
        
        // 3秒后自动消失
        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease-in forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
        
        // 添加退出动画
        style.textContent += `
            @keyframes toastOut {
                from {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                to {
                    opacity: 0;
                    transform: translate(-50%, -50%) scale(0.8);
                }
            }
        `;
    }

    hide() {
        const mainContainer = document.getElementById('mainContainer');
        if (mainContainer) {
            mainContainer.style.display = 'none';
        }
    }
}

const mainScreen = new MainScreen();