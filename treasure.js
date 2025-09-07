class Treasure {
  constructor(data) {
    this.name = data.name;
    this.quality = data.quality || 0;
    this.stats = data.stats || {};
    this.category = 'treasure';
    this.level = data.level || 1;
    this.growthRate = data.growthRate || 1.0;
    this.cooldownLeft = 0;
    this.maxCooldown = 30000;
    this.skillEffect = data.skillEffect || null;
    this.description = data.description || '';
    this.imagePath = data.imagePath || `treasure/${this.name}.png`;
  }

  getFinalStats() {
    const finalStats = {};
    for (const [key, value] of Object.entries(this.stats)) {
      const increase = (this.level - 1) * value * 0.1 * this.growthRate;
      if (key === 'energyRegen' || key === 'lifeSteal' || key === 'reflect') {
        finalStats[key] = Number((value + increase).toFixed(2));
      } else {
        finalStats[key] = Math.floor(value + increase);
      }
    }
    return finalStats;
  }

  canUse() {
    return this.cooldownLeft <= 0;
  }

  use(player, enemies) {
    if (!this.canUse()) return false;
    
    if (this.skillEffect === 'frost_freeze') {
      this.frostFreezeEffect(player, enemies, this.level);
    } else if (typeof this.skillEffect === 'function') {
      this.skillEffect(player, enemies, this.level);
    }
    
    this.cooldownLeft = this.maxCooldown;
    return true;
  }

  frostFreezeEffect(player, enemies, level) {
    const duration = 3000 * (1 + 0.1 * level);
    const radius = 350;
    
    this.createFrostSkillEffect(player);
    
    enemies.forEach(enemy => {
      if (enemy && enemy.x !== undefined && enemy.y !== undefined && player.x !== undefined && player.y !== undefined) {
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= radius) {
          enemy.frozen = true;
          enemy.frozenTime = duration;
          
          // 为被冰冻的敌人创建Canvas特效
          this.createEnemyCanvasFrostEffect(enemy);
        }
      }
    });

    if (!window.frostZones) window.frostZones = [];
    window.frostZones.push({
        x: player.x,
        y: player.y,
        radius: radius,
        duration: duration,
        startTime: Date.now(),
        activeTime: 1000
    });

    if (window.game && window.game.showNotification) {
      window.game.showNotification('寒霜：冰冻敌人！', 'info');
    }
  }

  createEnemyCanvasFrostEffect(enemy) {
    // 为敌人添加冰冻特效数据
    enemy.frostEffect = {
      startTime: Date.now(),
      duration: enemy.frozenTime,
      crystals: []
    };
    
    // 创建围绕敌人的冰晶
    for (let i = 0; i < 8; i++) {
      const angle = (i * 45) * Math.PI / 180;
      const distance = 40 + Math.random() * 20;
      enemy.frostEffect.crystals.push({
        x: enemy.x + Math.cos(angle) * distance,
        y: enemy.y + Math.sin(angle) * distance,
        size: 8 + Math.random() * 6,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 4,
        floatOffset: Math.random() * Math.PI * 2
      });
    }
  }

  createEnemyFrostEffect(enemy) {
    // 移除之前的冰冻特效
    const existingEffect = enemy.element.querySelector('.enemy-frost-effect');
    if (existingEffect) {
      existingEffect.remove();
    }
    
    // 设置敌人元素为相对定位
    enemy.element.style.position = 'relative';
    enemy.element.style.overflow = 'visible';
    
    // 创建特效容器
    const effectDiv = document.createElement('div');
    effectDiv.className = 'enemy-frost-effect';
    
    // 创建冰环
    const ring = document.createElement('div');
    ring.className = 'enemy-frost-ring';
    effectDiv.appendChild(ring);
    
    // 创建6个冰晶
    for (let i = 0; i < 6; i++) {
      const crystal = document.createElement('div');
      crystal.className = 'enemy-frost-crystal';
      
      const angle = (i * 60) * Math.PI / 180;
      const distance = 25 + Math.random() * 10;
      const size = 6 + Math.random() * 4;
      
      crystal.style.cssText += `
        width: ${size}px !important;
        height: ${size}px !important;
        left: 50% !important;
        top: 50% !important;
        transform: translate(-50%, -50%) translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) rotate(${Math.random() * 360}deg) !important;
        animation-delay: ${i * 0.3}s !important;
      `;
      
      effectDiv.appendChild(crystal);
    }
    
    // 添加特效到敌人
    enemy.element.appendChild(effectDiv);
    
    // 清理特效
    setTimeout(() => {
      if (effectDiv && effectDiv.parentNode) {
        effectDiv.remove();
      }
      if (enemy.element) {
        enemy.element.style.filter = '';
      }
    }, enemy.frozenTime || 3000);
  }


  createFrostSkillEffect(player) {
    const radius = 300;
    
    const effect = {
        x: player.x,
        y: player.y,
        radius: radius,
        startTime: Date.now(),
        duration: 1000,
        crystals: []
    };
    
    for (let i = 0; i < 12; i++) {
        const angle = (i * 30) * Math.PI / 180;
        const distance = 50 + Math.random() * (radius - 50);
        effect.crystals.push({
            x: player.x + Math.cos(angle) * distance,
            y: player.y + Math.sin(angle) * distance,
            rotation: Math.random() * 360,
            size: 15 + Math.random() * 10,
            delay: i * 80
        });
    }
    
    if (!window.frostEffects) window.frostEffects = [];
    window.frostEffects.push(effect);
}

  updateCooldown(deltaTime) {
    if (this.cooldownLeft > 0) {
      this.cooldownLeft = Math.max(0, this.cooldownLeft - deltaTime);
    }
  }

  getCooldownPercent() {
    return this.cooldownLeft / this.maxCooldown;
  }

  createElement() {
  const el = document.createElement('div');
  el.className = 'item treasure';
  const color = window.QUALITY_CONFIG?.colors?.[this.quality] || '#ffffff';
  
  el.style.cssText = `
    width: 50px; height: 50px; 
    border: 2px solid ${color}; 
    border-radius: 8px; 
    background: radial-gradient(circle, ${color}22, transparent);
    display: flex; align-items: center; justify-content: center;
    position: relative; cursor: pointer;
    box-shadow: 0 0 10px ${color}44;
  `;

  const iconContainer = document.createElement('div');
  iconContainer.style.cssText = 'width: 32px; height: 32px; position: relative;';
  
  if (window.treasureIconRenderer?.isReady) {
    const ok = window.treasureIconRenderer.drawIcon(iconContainer, this.name);
    if (!ok) {
      iconContainer.style.background = '#666';
      iconContainer.style.borderRadius = '4px';
      iconContainer.style.display = 'flex';
      iconContainer.style.alignItems = 'center';
      iconContainer.style.justifyContent = 'center';
      iconContainer.style.color = '#fff';
      iconContainer.style.fontWeight = 'bold';
      iconContainer.textContent = this.name.charAt(0);
    }
  } else {
    iconContainer.style.background = '#666';
    iconContainer.style.borderRadius = '4px';
    iconContainer.style.display = 'flex';
    iconContainer.style.alignItems = 'center';
    iconContainer.style.justifyContent = 'center';
    iconContainer.style.color = '#fff';
    iconContainer.style.fontWeight = 'bold';
    iconContainer.textContent = this.name.charAt(0);
  }
  
  el.appendChild(iconContainer);

  if (this.cooldownLeft > 0) {
    const overlay = document.createElement('div');
    const percent = this.getCooldownPercent();
    overlay.style.cssText = `
      position: absolute; top: 0; left: 0; right: 0;
      height: ${percent * 100}%; background: rgba(0,0,0,0.7);
      border-radius: 6px 6px 0 0;
    `;
    el.appendChild(overlay);
  }

  el.title = this.getTooltip();
  return el;
}

  getTooltip() {
  const qualityName = window.QUALITY_CONFIG?.names?.[this.quality] || '未知';
  const finalStats = this.getFinalStats();
  
  let tip = `${this.name}\n品质: ${qualityName}\n等级: ${this.level}\n成长率: ${this.growthRate.toFixed(1)}\n\n属性:\n`;
  
  for (const [k, v] of Object.entries(finalStats)) {
    if (k === 'attack') tip += `攻击力: +${v}\n`;
    else if (k === 'health') tip += `生命值: +${v}\n`;
    else if (k === 'maxEnergy') tip += `能量值: +${v}\n`;
    else if (k === 'defense') tip += `防御力: +${v}\n`;
    else if (k === 'energyRegen') tip += `回能: +${v}/秒\n`;
    else tip += `${k}: ${v}\n`;
  }

  if (this.cooldownLeft > 0) {
    tip += `\n冷却中: ${Math.ceil(this.cooldownLeft / 1000)}秒`;
  }

  return tip;
}

  buildTooltip() {
    const qualityName = window.QUALITY_CONFIG?.names?.[this.quality] || '未知';
    const finalStats = this.getFinalStats();
    
    let tip = `${this.name}\n品质: ${qualityName}\n等级: ${this.level}\n成长率: ${this.growthRate.toFixed(1)}\n\n属性:\n`;
    
    for (const [k, v] of Object.entries(finalStats)) {
      if (k === 'attack') tip += `攻击力: +${v}\n`;
      else if (k === 'health') tip += `生命值: +${v}\n`;
      else if (k === 'maxEnergy') tip += `能量值: +${v}\n`;
      else if (k === 'defense') tip += `防御力: +${v}\n`;
      else if (k === 'energyRegen') tip += `回能: +${v}/秒\n`;
      else tip += `${k}: ${v}\n`;
    }

    if (this.cooldownLeft > 0) {
      tip += `\n冷却中: ${Math.ceil(this.cooldownLeft / 1000)}秒`;
    }

    return tip;
  }
  toSaveData() {
    return {
        name: this.name,
        quality: this.quality,
        stats: this.stats,
        category: this.category,
        level: this.level,
        growthRate: this.growthRate,
        cooldownLeft: this.cooldownLeft,
        maxCooldown: this.maxCooldown,
        skillEffect: this.skillEffect,
        description: this.description
    };
}

static fromSaveData(data) {
    const treasure = new Treasure({
        name: data.name,
        quality: data.quality,
        stats: data.stats,
        level: data.level,
        growthRate: data.growthRate,
        skillEffect: data.skillEffect,
        description: data.description
    });
    
    treasure.cooldownLeft = data.cooldownLeft || 0;
    treasure.maxCooldown = data.maxCooldown || 30000;
    
    return treasure;
}
}

const TreasureGenerator = {
  generateTreasure: function(name, level = 1, growthRate = null) {
    const data = window.Catalog?.getTreasureData(name);
    if (!data) throw new Error(`未知法宝: ${name}`);
    
    return new Treasure({
      name: name,
      quality: 4,
      stats: data.stats,
      level: level,
      growthRate: growthRate || (1.0 + Math.random() * 1.5),
      skillEffect: data.skillEffect,
      description: data.description
    });
  },

  generateRandomFrost: function() {
    const growthRate = 1.0 + Math.random() * 1.5;
    return this.generateTreasure('寒霜', 1, growthRate);
  }
};

if (typeof window !== 'undefined') {
  window.Treasure = Treasure;
  window.TreasureGenerator = TreasureGenerator;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Treasure, TreasureGenerator };
}