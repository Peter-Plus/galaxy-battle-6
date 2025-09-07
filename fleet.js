class FleetSystem {
  constructor() {
    this.isOpen = false;
    this.partners = [];
    this.selectedPartnerIndex = -1;
    this.createFleetUI();
    this.setupEventListeners();
    this.loadFleetData();
  }

  createFleetUI() {
    const fleetContainer = document.createElement('div');
    fleetContainer.id = 'fleetContainer';
    fleetContainer.className = 'fleet-container';
    fleetContainer.style.display = 'none';
    fleetContainer.innerHTML = `
      <div class="fleet-panel">
        <div class="fleet-header">
          <h2>舰队管理</h2>
          <button class="close-btn" onclick="fleet.toggleFleet()">×</button>
        </div>
        <div class="fleet-content">
          <div class="partner-list">
            <h3>伙伴列表</h3>
            <div class="partner-slots" id="partnerSlots">
              <div class="empty-fleet-message">
                暂无伙伴战舰
                <div class="fleet-tip">伙伴获得系统开发中...</div>
              </div>
            </div>
          </div>
          <div class="partner-details">
            <div class="partner-info" id="partnerInfo">
              <div class="no-selection">请选择伙伴战舰</div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(fleetContainer);
    this.addFleetStyles();
  }

  addFleetStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .fleet-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
      }

      .fleet-panel {
  width: 90%;
  max-width: 1000px;
  height: 80%;
  background: linear-gradient(135deg, rgba(20, 20, 40, 0.95), rgba(40, 20, 60, 0.95));
  border: 2px solid #00ffff;
  border-radius: 15px;
  box-shadow: 0 0 30px rgba(0, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  position: relative;
}

      .fleet-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        border-bottom: 1px solid rgba(0, 255, 255, 0.3);
      }

      .fleet-header h2 {
        color: #00ffff;
        font-size: 28px;
        margin: 0;
        text-shadow: 0 0 10px #00ffff;
      }

      .close-btn {
  background: rgba(255, 0, 0, 0.7);
  border: none;
  color: white;
  font-size: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 10;
}

      .close-btn:hover {
        background: rgba(255, 0, 0, 1);
        transform: scale(1.1);
      }

      .fleet-content {
        display: flex;
        flex: 1;
        padding: 20px;
        gap: 20px;
      }

      .partner-list {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .partner-list h3 {
        color: #ffaa00;
        font-size: 20px;
        margin: 0 0 15px 0;
        text-shadow: 0 0 8px #ffaa00;
      }

      .partner-slots {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
        gap: 15px;
        flex: 1;
        overflow-y: auto;
        padding: 10px;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }

      .partner-slot {
        width: 120px;
        height: 150px;
        background: linear-gradient(135deg, rgba(0, 100, 200, 0.3), rgba(100, 0, 200, 0.3));
        border: 2px solid rgba(0, 255, 255, 0.5);
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;
        position: relative;
      }

      .partner-slot:hover {
        transform: scale(1.05);
        border-color: #00ffff;
        box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
      }

      .partner-slot.selected {
        border-color: #ffaa00;
        box-shadow: 0 0 20px rgba(255, 170, 0, 0.6);
      }

      .partner-avatar {
        width: 60px;
        height: 60px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }

      .partner-name {
        font-size: 12px;
        color: white;
        text-align: center;
        margin-bottom: 5px;
      }

      .partner-level {
        font-size: 11px;
        color: #ffaa00;
        margin-bottom: 5px;
      }

      .partner-status {
        position: absolute;
        top: 5px;
        right: 5px;
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }

      .partner-status.active {
        background: #00ff00;
        box-shadow: 0 0 5px #00ff00;
      }

      .partner-status.inactive {
        background: #666;
      }

      .empty-fleet-message {
        grid-column: 1 / -1;
        text-align: center;
        color: #888;
        font-size: 18px;
        padding: 60px 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .fleet-tip {
        margin-top: 15px;
        font-size: 14px;
        color: #aaa;
        font-style: italic;
      }

      .partner-details {
        flex: 1;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 20px;
        display: flex;
        flex-direction: column;
      }

      .no-selection {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 1;
        color: #888;
        font-size: 18px;
      }

      .partner-info {
        display: flex;
        flex-direction: column;
        flex: 1;
      }

      .partner-header {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      }

      .partner-portrait {
        width: 80px;
        height: 80px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        margin-right: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32px;
      }

      .partner-basic-info h4 {
        color: #00ffff;
        font-size: 24px;
        margin: 0 0 5px 0;
      }

      .partner-basic-info .level-info {
        color: #ffaa00;
        font-size: 16px;
        margin-bottom: 5px;
      }

      .partner-basic-info .exp-bar {
        width: 200px;
        height: 8px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 4px;
        overflow: hidden;
      }

      .exp-fill {
        height: 100%;
        background: linear-gradient(90deg, #00ff00, #ffff00);
        transition: width 0.3s;
      }

      .partner-stats {
        margin-bottom: 20px;
      }

      .partner-stats h5 {
        color: #ffaa00;
        font-size: 18px;
        margin: 0 0 10px 0;
      }

      .stat-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        padding: 5px 10px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 5px;
      }

      .stat-name {
        color: #ccc;
      }

      .stat-value {
        color: white;
        font-weight: bold;
      }

      .partner-skills {
        margin-bottom: 20px;
      }

      .partner-skills h5 {
        color: #ffaa00;
        font-size: 18px;
        margin: 0 0 15px 0;
      }

      .skill-slots {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 10px;
      }

      .skill-slot {
        width: 60px;
        height: 60px;
        background: rgba(0, 0, 0, 0.5);
        border: 2px dashed rgba(255, 255, 255, 0.3);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: #666;
        transition: all 0.3s;
      }

      .skill-slot.equipped {
        background: linear-gradient(135deg, rgba(0, 200, 255, 0.3), rgba(200, 0, 255, 0.3));
        border-color: #00ffff;
        color: #00ffff;
      }

      .skill-slot:hover {
        border-color: #ffaa00;
      }

      .partner-actions {
        display: flex;
        gap: 15px;
        margin-top: auto;
      }

      .deploy-btn, .rest-btn {
        flex: 1;
        padding: 15px;
        border: none;
        border-radius: 10px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s;
      }

      .deploy-btn {
        background: linear-gradient(135deg, #00ff00, #00aa00);
        color: white;
      }

      .deploy-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 255, 0, 0.3);
      }

      .deploy-btn:disabled {
        background: #666;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      .rest-btn {
        background: linear-gradient(135deg, #ff6600, #aa4400);
        color: white;
      }

      .rest-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(255, 102, 0, 0.3);
      }

      .rest-btn:disabled {
        background: #666;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }

      @media (max-width: 768px) {
        .fleet-panel {
          width: 95%;
          height: 90%;
        }

        .fleet-content {
          flex-direction: column;
        }

        .partner-list, .partner-details {
          flex: none;
        }

        .partner-list {
          height: 40%;
        }

        .partner-details {
          height: 60%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F' && this.isOpen) {
        this.toggleFleet();
      }
    });
  }

  toggleFleet() {
    this.isOpen = !this.isOpen;
    const container = document.getElementById('fleetContainer');
    container.style.display = this.isOpen ? 'flex' : 'none';
    
    if (this.isOpen) {
      this.refreshUI();
    }
  }

  selectPartner(index) {
    this.selectedPartnerIndex = index;
    this.refreshPartnerDetails();
    this.updatePartnerSlots();
  }

  refreshUI() {
    this.updatePartnerSlots();
    this.refreshPartnerDetails();
  }

  updatePartnerSlots() {
    const slotsContainer = document.getElementById('partnerSlots');
    
    if (this.partners.length === 0) {
      slotsContainer.innerHTML = `
        <div class="empty-fleet-message">
          暂无伙伴战舰
          <div class="fleet-tip">伙伴获得系统开发中...</div>
        </div>
      `;
      return;
    }

    slotsContainer.innerHTML = this.partners.map((partner, index) => `
      <div class="partner-slot ${index === this.selectedPartnerIndex ? 'selected' : ''}" 
           onclick="fleet.selectPartner(${index})">
        <div class="partner-status ${partner.isDeployed ? 'active' : 'inactive'}"></div>
        <div class="partner-avatar">${partner.avatar || '🚀'}</div>
        <div class="partner-name">${partner.name}</div>
        <div class="partner-level">等级 ${partner.level}</div>
      </div>
    `).join('');
  }

  refreshPartnerDetails() {
    const infoContainer = document.getElementById('partnerInfo');
    
    if (this.selectedPartnerIndex === -1 || !this.partners[this.selectedPartnerIndex]) {
      infoContainer.innerHTML = '<div class="no-selection">请选择伙伴战舰</div>';
      return;
    }

    const partner = this.partners[this.selectedPartnerIndex];
    const expPercent = (partner.exp / partner.maxExp) * 100;

    infoContainer.innerHTML = `
      <div class="partner-header">
        <div class="partner-portrait">${partner.avatar || '🚀'}</div>
        <div class="partner-basic-info">
          <h4>${partner.name}</h4>
          <div class="level-info">等级 ${partner.level}</div>
          <div class="exp-bar">
            <div class="exp-fill" style="width: ${expPercent}%"></div>
          </div>
          <div style="font-size: 12px; color: #ccc; margin-top: 5px;">
            经验: ${partner.exp}/${partner.maxExp}
          </div>
        </div>
      </div>

      <div class="partner-stats">
        <h5>战舰属性</h5>
        <div class="stat-row">
          <span class="stat-name">生命值</span>
          <span class="stat-value">${partner.stats.health}</span>
        </div>
        <div class="stat-row">
          <span class="stat-name">攻击力</span>
          <span class="stat-value">${partner.stats.attack}</span>
        </div>
        <div class="stat-row">
          <span class="stat-name">防御力</span>
          <span class="stat-value">${partner.stats.defense}</span>
        </div>
        <div class="stat-row">
          <span class="stat-name">能量</span>
          <span class="stat-value">${partner.stats.energy}</span>
        </div>
      </div>

      <div class="partner-skills">
        <h5>技能槽位</h5>
        <div class="skill-slots">
          ${Array(5).fill().map((_, i) => `
            <div class="skill-slot ${partner.skills[i] ? 'equipped' : ''}">
              ${partner.skills[i] ? '⭐' : '○'}
            </div>
          `).join('')}
        </div>
      </div>

      <div class="partner-actions">
        <button class="deploy-btn" ${partner.isDeployed ? 'disabled' : ''} 
                onclick="fleet.deployPartner(${this.selectedPartnerIndex})">
          ${partner.isDeployed ? '已出战' : '出战'}
        </button>
        <button class="rest-btn" ${!partner.isDeployed ? 'disabled' : ''} 
                onclick="fleet.restPartner(${this.selectedPartnerIndex})">
          ${partner.isDeployed ? '休战' : '休战中'}
        </button>
      </div>
    `;
  }

  deployPartner(index) {
    if (!this.partners[index] || this.partners[index].isDeployed) return;
    
    this.partners[index].isDeployed = true;
    this.saveFleetData();
    this.refreshUI();
  }

  restPartner(index) {
    if (!this.partners[index] || !this.partners[index].isDeployed) return;
    
    this.partners[index].isDeployed = false;
    this.saveFleetData();
    this.refreshUI();
  }

  addPartner(partnerData) {
    const partner = {
      id: Date.now(),
      name: partnerData.name || `战舰-${this.partners.length + 1}`,
      level: partnerData.level || 1,
      exp: partnerData.exp || 0,
      maxExp: partnerData.maxExp || 100,
      avatar: partnerData.avatar || '🚀',
      stats: {
        health: partnerData.stats?.health || 100,
        attack: partnerData.stats?.attack || 20,
        defense: partnerData.stats?.defense || 10,
        energy: partnerData.stats?.energy || 50
      },
      skills: partnerData.skills || [],
      isDeployed: false
    };
    
    this.partners.push(partner);
    this.saveFleetData();
    this.refreshUI();
    return partner;
  }

  removePartner(index) {
    if (index >= 0 && index < this.partners.length) {
      this.partners.splice(index, 1);
      if (this.selectedPartnerIndex >= this.partners.length) {
        this.selectedPartnerIndex = this.partners.length - 1;
      }
      this.saveFleetData();
      this.refreshUI();
    }
  }

  saveFleetData() {
    try {
      const data = {
        partners: this.partners,
        selectedPartnerIndex: this.selectedPartnerIndex
      };
      localStorage.setItem('fleetData', JSON.stringify(data));
    } catch (e) {
      console.error('保存舰队数据失败:', e);
    }
  }

  loadFleetData() {
    try {
      const data = localStorage.getItem('fleetData');
      if (data) {
        const parsed = JSON.parse(data);
        this.partners = parsed.partners || [];
        this.selectedPartnerIndex = parsed.selectedPartnerIndex || -1;
      }
    } catch (e) {
      console.error('加载舰队数据失败:', e);
      this.partners = [];
      this.selectedPartnerIndex = -1;
    }
  }

  getDeployedPartners() {
    return this.partners.filter(partner => partner.isDeployed);
  }

  getPartnerCount() {
    return this.partners.length;
  }
}

const fleet = new FleetSystem();