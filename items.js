// items.js —— 统一的物品和装备处理（合并 equipments.js + items.js）

(function () {
  // ==================== 装备部分（来自 equipments.js） ====================
  
  // 检查catalog.js是否已加载
  if (!window.Catalog || !window.QUALITY_CONFIG || !window.EQUIPMENT_BASE_DATA) {
    console.error('items.js 需要先加载 catalog.js');
    return;
  }

  // 使用catalog.js中的数据
  const QUALITY_CONFIG = window.QUALITY_CONFIG;
  const EQUIPMENT_BASE_DATA = window.EQUIPMENT_BASE_DATA;
  const ARTIFACT_ALIASES = window.ARTIFACT_ALIASES;

  class Equipment {
    constructor(name, category, quality, stats, passiveEffects = null) {
      this.name = name;
      this.category = category;
      this.quality = quality;
      this.stats = stats;
      this.passiveEffects = passiveEffects;
    }
    
    getDisplayName() {
      return window.Catalog.getDisplayName(this.name, this.quality);
    }
    
    getFinalStats() {
      if (this.category === 'artifact') return { ...this.stats };
      const out = {};
      for (const k in this.stats) {
        out[k] = this.stats[k] * Math.pow(2, this.quality);
      }
      return out;
    }
  }

  class EquipmentGenerator {
    static _pool(category) {
      return EQUIPMENT_BASE_DATA[category] || null;
    }
    
    static generateRandomEquipment(category, quality) {
      const pool = this._pool(category);
      if (!pool) throw new Error(`未知装备类别: ${category}`);
      if (quality < 0 || quality > QUALITY_CONFIG.maxLevel) throw new Error(`品质超出范围: ${quality}`);
      const names = Object.keys(pool);
      const name = names[Math.floor(Math.random() * names.length)];
      return this.createEquipment(name, category, quality);
    }
    
    static createEquipment(name, category, quality) {
      const data = window.Catalog.getEquipmentData(name, category);
      if (!data) throw new Error(`未找到装备: ${name}${category ? ` (${category})` : ''}`);
      const finalQuality = (category === 'artifact') ? 5 : quality;
      return new Equipment(name, category, finalQuality, data.stats, data.passiveEffects);
    }
    
    static getEquipmentData(name, category) {
      return window.Catalog.getEquipmentData(name, category);
    }
    
    static getEquipmentNamesByCategory(category) {
      return window.Catalog.getEquipmentNamesByCategory(category);
    }
    
    static generateSpecificEquipment(name, quality) {
      for (const [cat, group] of Object.entries(EQUIPMENT_BASE_DATA)) {
        if (group[name]) return this.createEquipment(name, cat, quality);
      }
      throw new Error(`未找到装备: ${name}`);
    }
  }

  class EquipmentUtils {
    static isArtifact(e) { 
      return e.category === 'artifact' || e.quality === 5; 
    }
    
    static canMerge(e1, e2) { 
      return e1.name === e2.name && e1.quality === e2.quality && e1.quality < 5; 
    }
    
    static mergeEquipments(e1, e2) {
      if (!this.canMerge(e1, e2)) throw new Error('装备无法合并');
      return EquipmentGenerator.createEquipment(e1.name, e1.category, e1.quality + 1);
    }
    
    static getSellPrice(equipment) {
      // 使用catalog.js中的统一价格计算
      return window.Catalog.getSellPrice(equipment);
    }
  }

  // ==================== 物品部分（来自 items.js） ====================

  var ITEM_TYPES = {
    CONSUMABLE: 'consumable',
    MATERIAL: 'material',
    SPECIAL: 'special',
    CONTAINER: 'container'
  };

  function has(fn) { return typeof fn === 'function'; }

  // ===== 物品数据访问 =====
  var ItemGenerator = (function () {
    function IG() {}
    IG.generateItem = function (name, quantity) { return Catalog.generateItem(name, quantity || 1); };
    IG.getItemData = function (name) { return Catalog.getItemData(name); };
    IG.getStackableItems = function () { return Catalog.listStackableNames(); };
    return IG;
  })();

  // ===== 物品使用 =====
  var ItemEffectHandler = (function () {
    function IEH() {}

    IEH.handleItemUse = function (name, item, itemIndex, inventory) {
  var data = ItemGenerator.getItemData(name);
  if (!data || !data.useEffect) return false;
  switch (data.useEffect) {
    case 'heal': return IEH._healPercent(0.25, item, itemIndex, inventory);
    case 'energy': return IEH._restoreEnergy(item, itemIndex, inventory);
    case 'random_crystal': return IEH._openCrystalChoice(item, itemIndex, inventory);
    case 'expand_bag': return IEH._expandInventory(20, item, itemIndex, inventory);
    case 'reset_crystals': return IEH._resetCrystals(item, itemIndex, inventory);
    case 'power_boost': return IEH._simpleBuff('power', item, itemIndex, inventory);
    case 'shield_boost': return IEH._simpleBuff('shield', item, itemIndex, inventory);
    case 'refresh_dungeon_attempts': return IEH._refreshDungeonAttempts(item, itemIndex, inventory); // 新增
    default: return false;
  }
};

  IEH._refreshDungeonAttempts = function (item, idx, inv) {
  if ((item.quantity || 1) <= 0) return false;
  
  // 刷新时空漩涡的挑战次数（能源之眼、星尘轨道）
  if (typeof timeVortexManager !== 'undefined' && timeVortexManager) {
    timeVortexManager.usedAttempts.energyEye = 0;
    timeVortexManager.usedAttempts.stardustOrbit = 0;
    timeVortexManager.updateAttemptsDisplay();
    timeVortexManager.saveToCurrentSave();
  }
  
  // 刷新奇迹之境的挑战次数（冰河时代）
  if (typeof miracleRealmManager !== 'undefined' && miracleRealmManager) {
    miracleRealmManager.usedAttempts.iceAge = 0;
    miracleRealmManager.updateAttemptsDisplay();
    miracleRealmManager.saveToCurrentSave();
  }
  
  // 显示成功消息
  if (has(inv.showNotification)) {
    inv.showNotification('副本挑战次数已刷新！', 'success');
  }
  
  // 消耗物品
  IEH._consume(item, idx, inv);
  
  // 自动保存
  if (typeof autoSave === 'function') {
    autoSave();
  }
  
  return true;
};

    IEH._consume = function (item, idx, inv) {
      if (idx === 'consumable') {
        if (item.quantity && item.quantity > 1) item.quantity--;
        else inv.consumableSlot = null;
      } else if (typeof idx === 'number') {
        if (item.quantity && item.quantity > 1) item.quantity--;
        else inv.items.splice(idx, 1);
      }
      if (has(inv.updateInventoryDisplay)) inv.updateInventoryDisplay();
      if (has(inv.updateConsumableDisplay)) inv.updateConsumableDisplay();
    };

    IEH._healPercent = function (p, item, idx, inv) {
      if ((item.quantity || 1) <= 0) return false;
      
      var playerObj = window.player || (typeof player !== 'undefined' ? player : null);
      if (!playerObj) return false;
      
      var v = playerObj.maxHealth * p;
      playerObj.heal(v);
      IEH._consume(item, idx, inv);
      return true;
    };

    IEH._restoreEnergy = function (item, idx, inv) {
      if ((item.quantity || 1) <= 0) return false;
      
      var playerObj = window.player || (typeof player !== 'undefined' ? player : null);
      if (!playerObj) return false;
      
      playerObj.energy = playerObj.maxEnergy;
      if (has(window.updateEnergyBar)) window.updateEnergyBar();
      IEH._consume(item, idx, inv);
      return true;
    };

    IEH._openCrystalChoice = function (item, idx, inv) {
      if ((item.quantity || 1) <= 0) return false;
      IEH._consume(item, idx, inv);
      IEH._openCrystalChoiceUI(inv);
      return true;
    };

    IEH._expandInventory = function (extra, item, idx, inv) {
      if ((item.quantity || 1) <= 0) return false;
      inv.maxInventorySize += extra;
      if (has(inv.expandInventory)) inv.expandInventory();
      if (has(inv.showNotification)) inv.showNotification('背包容量 +' + extra, 'success');
      IEH._consume(item, idx, inv);
      return true;
    };

    // 精简版：药水buff功能（移除所有提示）
    IEH._simpleBuff = function(type, item, idx, inv) {
      if ((item.quantity || 1) <= 0) return false;
      
      // 兼容多种player访问方式
      var playerObj = window.player || (typeof player !== 'undefined' ? player : null);
      if (!playerObj) return false;
      
      try {
        if (type === 'power') {
          // 强力药水：5秒内攻击力+20%
          if (typeof playerObj.applyPowerBoost === 'function') {
            playerObj.applyPowerBoost(0.2, 5000);
          } else {
            // 降级方案：直接设置属性
            playerObj.powerBoostActive = true;
            playerObj.powerBoostMultiplier = 1.2;
            playerObj.powerBoostEndTime = Date.now() + 5000;
          }
        } else if (type === 'shield') {
          // 护体药水：5秒内免伤+50%、并提供霸体
          if (typeof playerObj.applyShieldBoost === 'function') {
            playerObj.applyShieldBoost(0.5, 5000);
          } else {
            // 降级方案：直接设置属性
            playerObj.shieldBoostActive = true;
            playerObj.shieldBoostReduction = 0.5;
            playerObj.shieldBoostEndTime = Date.now() + 5000;
            playerObj.hasHyperArmor = true;
          }
        }
        
        // 消耗物品
        IEH._consume(item, idx, inv);
        return true;
        
      } catch (error) {
        return false;
      }
    };

    // 孟婆汤：返还晶核并重置所有晶核等级和加成
    IEH._resetCrystals = function (item, idx, inv) {
      if ((item.quantity || 1) <= 0) return false;

      // 检查全局变量并计算返还数量
      var currentExplosion, currentSurvival, currentTactical, total;
      
      try {
        currentExplosion = (typeof explosionCoreCount !== 'undefined') ? explosionCoreCount : 0;
        currentSurvival = (typeof survivalCoreCount !== 'undefined') ? survivalCoreCount : 0;
        currentTactical = (typeof tacticalCoreCount !== 'undefined') ? tacticalCoreCount : 0;
        total = currentExplosion + currentSurvival + currentTactical;
      } catch (e) {
        currentExplosion = window.explosionCoreCount || 0;
        currentSurvival = window.survivalCoreCount || 0;
        currentTactical = window.tacticalCoreCount || 0;
        total = currentExplosion + currentSurvival + currentTactical;
      }

      // 返还晶核到背包 - 使用Catalog生成物品
      if (total > 0) {
        var reward;
        try {
          reward = window.Catalog.generateItem('宇宙晶核', total);
          
          if (!inv.addItem(reward)) {
            if (has(inv.showNotification)) inv.showNotification('背包空间不足，无法返还晶核', 'error');
            return false;
          }
        } catch (error) {
          if (has(inv.showNotification)) inv.showNotification('返还晶核失败', 'error');
          return false;
        }
      }

      // 清零所有晶核等级
      try {
        if (typeof explosionCoreCount !== 'undefined') explosionCoreCount = 0;
        if (typeof survivalCoreCount !== 'undefined') survivalCoreCount = 0;
        if (typeof tacticalCoreCount !== 'undefined') tacticalCoreCount = 0;
        
        window.explosionCoreCount = 0;
        window.survivalCoreCount = 0;
        window.tacticalCoreCount = 0;
      } catch (e) {}

      // 清零累计加成
      try {
        if (typeof totalExplosionBonus !== 'undefined') totalExplosionBonus = 0;
        if (typeof totalSurvivalLifeStealBonus !== 'undefined') totalSurvivalLifeStealBonus = 0;
        if (typeof totalSurvivalHealthBonus !== 'undefined') totalSurvivalHealthBonus = 0;
        if (typeof totalTacticalCooldownBonus !== 'undefined') totalTacticalCooldownBonus = 0;
        if (typeof totalTacticalEnergyBonus !== 'undefined') totalTacticalEnergyBonus = 0;
        
        window.totalExplosionBonus = 0;
        window.totalSurvivalLifeStealBonus = 0;
        window.totalSurvivalHealthBonus = 0;
        window.totalTacticalCooldownBonus = 0;
        window.totalTacticalEnergyBonus = 0;
      } catch (e) {}

      // 重置吸血倍率
      try {
        if (typeof lifeStealMultiplier !== 'undefined') lifeStealMultiplier = 1;
        window.lifeStealMultiplier = 1;
      } catch (e) {}

      // 重置技能冷却时间
      try {
        if (typeof maxSkillCooldowns !== 'undefined' && typeof baseCooldowns !== 'undefined') {
          Object.keys(maxSkillCooldowns).forEach(function(key) {
            if (baseCooldowns[key]) {
              maxSkillCooldowns[key] = baseCooldowns[key];
            }
          });
        }
      } catch (e) {}

      // 重新计算装备属性
      var currentEquipmentStats = {
        attack: 0, lifeSteal: 0, health: 0, defense: 0, reflect: 0,
        energyRegen: 0, maxEnergy: 0, hasAsura: false, hasHades: false, hasTitan: false
      };

      if (inv && inv.equippedItems && Array.isArray(inv.equippedItems)) {
        inv.equippedItems.forEach(function(it) {
          if (!it) return;
          currentEquipmentStats.attack += it.stats.attack || 0;
          currentEquipmentStats.lifeSteal += it.stats.lifeSteal || 0;
          currentEquipmentStats.health += it.stats.health || 0;
          currentEquipmentStats.defense += it.stats.defense || 0;
          currentEquipmentStats.reflect += it.stats.reflect || 0;
          currentEquipmentStats.energyRegen += it.stats.energyRegen || 0;
          currentEquipmentStats.maxEnergy += it.stats.maxEnergy || 0;
          if (it.name === '血色·阿修罗') currentEquipmentStats.hasAsura = true;
          if (it.name === '冥王') currentEquipmentStats.hasHades = true;
          if (it.name === '泰坦之心') currentEquipmentStats.hasTitan = true;
        });
      }

      // 更新玩家属性
      if (typeof window.updatePlayerStats === 'function') {
        try {
          window.updatePlayerStats(currentEquipmentStats);
        } catch (error) {}
      }

      // 重新计算攻击力
      try {
        if (typeof baseAttackPower !== 'undefined') {
          attackPower = baseAttackPower + currentEquipmentStats.attack;
          var attackEl = document.getElementById('attack');
          if (attackEl) attackEl.textContent = attackPower;
        }
      } catch (e) {}

      // 更新UI显示
      try {
        if (has(inv.updateCrystalLevels)) inv.updateCrystalLevels();
        if (has(inv.updateInventoryDisplay)) inv.updateInventoryDisplay();
        if (has(inv.updateGoldDisplay)) inv.updateGoldDisplay();
      } catch (e) {}

      IEH._consume(item, idx, inv);

      if (has(inv.showNotification)) {
        var message = total > 0 ? 
          '已重置晶核，返还 ' + total + ' 个宇宙晶核' : 
          '已重置晶核（无晶核返还）';
        inv.showNotification(message, 'success');
      }

      return true;
    };

    IEH._openCrystalChoiceUI = function (inv) {
      var w = document.createElement('div');
      w.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:1002;';
      w.innerHTML =
        '<div style="background:#111;border:2px solid #00ffff;border-radius:12px;padding:18px;min-width:320px;box-shadow:0 0 24px #00ffff;">' +
          '<h3 style="margin:0 0 10px;color:#00ffff;">选择晶核</h3>' +
          '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">' +
            '<button data-type="explosion" style="padding:10px;border:1px solid #ff4444;border-radius:8px;background:#220000;color:#ff6666;cursor:pointer;">爆发 +1</button>' +
            '<button data-type="survival" style="padding:10px;border:1px solid #44ff44;border-radius:8px;background:#002200;color:#66ff66;cursor:pointer;">生存 +1</button>' +
            '<button data-type="tactical" style="padding:10px;border:1px solid #4488ff;border-radius:8px;background:#001533;color:#66aaff;cursor:pointer;">战术 +1</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(w);

      w.addEventListener('click', function (e) {
        var btn = e.target.closest && e.target.closest('button[data-type]');
        if (!btn) { 
          if (e.target === w) w.remove(); 
          return; 
        }
        
        var type = btn.getAttribute('data-type');
        
        try {
          if (typeof window.selectCrystalCore === 'function') {
            window.selectCrystalCore(type, true);
          } else {
            IEH._handleCrystalSelectionFallback(type, inv);
          }
        } catch (error) {
          IEH._handleCrystalSelectionFallback(type, inv);
        }
        
        w.remove();
      });
    };

    // 备用的晶核选择处理函数
    IEH._handleCrystalSelectionFallback = function(type, inv) {
      var DIMINISHING_FACTOR = 0.95;
      
      if (typeof window.totalExplosionBonus === 'undefined') window.totalExplosionBonus = 0;
      if (typeof window.totalSurvivalLifeStealBonus === 'undefined') window.totalSurvivalLifeStealBonus = 0;
      if (typeof window.totalSurvivalHealthBonus === 'undefined') window.totalSurvivalHealthBonus = 0;
      if (typeof window.totalTacticalCooldownBonus === 'undefined') window.totalTacticalCooldownBonus = 0;
      if (typeof window.totalTacticalEnergyBonus === 'undefined') window.totalTacticalEnergyBonus = 0;
      
      switch(type) {
        case 'explosion':
          if (typeof explosionCoreCount !== 'undefined') explosionCoreCount++;
          else window.explosionCoreCount = (window.explosionCoreCount || 0) + 1;
          
          var currentCount = (typeof explosionCoreCount !== 'undefined') ? explosionCoreCount : window.explosionCoreCount;
          var explosionBonus = 0.05 * Math.pow(DIMINISHING_FACTOR, currentCount - 1);
          
          if (typeof totalExplosionBonus !== 'undefined') {
            totalExplosionBonus += explosionBonus;
          } else {
            window.totalExplosionBonus += explosionBonus;
          }
          
          if (typeof baseAttackPower !== 'undefined' && typeof attackPower !== 'undefined') {
            var equipmentAttack = 0;
            if (typeof equipmentStats !== 'undefined') {
              equipmentAttack = equipmentStats.attack || 0;
            }
            attackPower = Math.floor((baseAttackPower + equipmentAttack) * (1 + window.totalExplosionBonus));
            
            var attackEl = document.getElementById('attack');
            if (attackEl) attackEl.textContent = attackPower;
          }
          break;
          
        case 'survival':
          if (typeof survivalCoreCount !== 'undefined') survivalCoreCount++;
          else window.survivalCoreCount = (window.survivalCoreCount || 0) + 1;
          
          var currentSurvivalCount = (typeof survivalCoreCount !== 'undefined') ? survivalCoreCount : window.survivalCoreCount;
          var survivalBonus = 0.05 * Math.pow(DIMINISHING_FACTOR, currentSurvivalCount - 1);
          
          if (typeof totalSurvivalLifeStealBonus !== 'undefined') {
            totalSurvivalLifeStealBonus += survivalBonus;
            totalSurvivalHealthBonus += survivalBonus;
          } else {
            window.totalSurvivalLifeStealBonus += survivalBonus;
            window.totalSurvivalHealthBonus += survivalBonus;
          }
          
          if (typeof lifeStealMultiplier !== 'undefined') {
            lifeStealMultiplier = 1 + window.totalSurvivalLifeStealBonus;
          } else {
            window.lifeStealMultiplier = 1 + window.totalSurvivalLifeStealBonus;
          }
          
          if (typeof window.updatePlayerStats === 'function' && typeof equipmentStats !== 'undefined') {
            window.updatePlayerStats(equipmentStats);
          }
          break;
          
        case 'tactical':
          if (typeof tacticalCoreCount !== 'undefined') tacticalCoreCount++;
          else window.tacticalCoreCount = (window.tacticalCoreCount || 0) + 1;
          
          var currentTacticalCount = (typeof tacticalCoreCount !== 'undefined') ? tacticalCoreCount : window.tacticalCoreCount;
          var tacticalCooldownBonus = 0.05 * Math.pow(DIMINISHING_FACTOR, currentTacticalCount - 1);
          var tacticalEnergyBonus = 0.05 * Math.pow(DIMINISHING_FACTOR, currentTacticalCount - 1);
          
          if (typeof totalTacticalCooldownBonus !== 'undefined') {
            totalTacticalCooldownBonus += tacticalCooldownBonus;
            totalTacticalEnergyBonus += tacticalEnergyBonus;
          } else {
            window.totalTacticalCooldownBonus += tacticalCooldownBonus;
            window.totalTacticalEnergyBonus += tacticalEnergyBonus;
          }
          
          if (typeof maxSkillCooldowns !== 'undefined' && typeof baseCooldowns !== 'undefined') {
            var cooldownReduction = 1 - window.totalTacticalCooldownBonus;
            Object.keys(maxSkillCooldowns).forEach(function(key) {
              if (baseCooldowns[key]) {
                maxSkillCooldowns[key] = Math.floor(baseCooldowns[key] * cooldownReduction);
              }
            });
          }
          
          // 兼容多种player访问方式
          var playerObj = window.player || (typeof player !== 'undefined' ? player : null);
          if (playerObj && typeof equipmentStats !== 'undefined') {
            playerObj.energyRegen = 3 + (equipmentStats.energyRegen || 0) + window.totalTacticalEnergyBonus;
          }
          break;
      }
      
      if (inv && typeof inv.updateCrystalLevels === 'function') {
        inv.updateCrystalLevels();
      }
      
      if (typeof particles !== 'undefined' && typeof mouseX !== 'undefined' && typeof mouseY !== 'undefined') {
        for (let i = 0; i < 30; i++) {
          var color = type === 'explosion' ? '#ff4444' : 
                     type === 'survival' ? '#44ff44' : '#4444ff';
          particles.push(new Particle(mouseX, mouseY, color));
        }
      }
    };

    return IEH;
  })();

  // ===== 容器：严格通过 Catalog 掉落表 =====
  var ContainerHandler = (function () {
    function CH() {}
    CH.handleContainerOpen = function (name, item, itemIndex, inv) {
      var def = ItemGenerator.getItemData(name);
      if (!def || !def.lootTable) return false;
      if ((item.quantity || 1) <= 0) return false;

      var r = Catalog.rollFromTable(def.lootTable);
      var loot = null;

      if (r && r.kind === 'equipment') {
        var p = r.payload;
        var eq = Catalog.generateEquipmentBy(p.name, p.quality);
        
        // 如果有Equipment类，使用它来计算最终属性
        if (window.Equipment && window.EquipmentGenerator) {
          var equipObj = window.EquipmentGenerator.createEquipment(p.name, p.category, p.quality);
          var finalStats = equipObj.getFinalStats();
          loot = { name: eq.name, quality: eq.quality, stats: finalStats, category: eq.category };
        } else {
          loot = { name: eq.name, quality: eq.quality, stats: eq.stats, category: eq.category };
        }
      } else if (r && r.kind === 'item') {
        var pi = r.payload;
        loot = Catalog.generateItem(pi.name, pi.quantity || 1);
      } else if (r && r.kind === 'multiple_items') {
 
  var allSuccess = true;
  var rewards = [];
  
  for (var i = 0; i < r.payload.length; i++) {
    var rewardData = r.payload[i];
    var loot = Catalog.generateItem(rewardData.name, rewardData.quantity || 1);
    
    if (inv.addItem(loot)) {
      rewards.push(loot.name + (loot.quantity > 1 ? ('*' + loot.quantity) : ''));
    } else {
      allSuccess = false;
      break;
    }
  }
  
  if (allSuccess) {
    ItemEffectHandler._consume(item, itemIndex, inv);
    if (has(inv.showNotification)) {
      inv.showNotification('获得：' + rewards.join('、'), 'success');
    }
    return true;
  } else {
    if (has(inv.showNotification)) {
      inv.showNotification('背包空间不足，无法开启宝箱', 'error');
    }
    return false;
  }
      } else  {
        return false;
      }

      if (loot && inv.addItem(loot)) {
        ItemEffectHandler._consume(item, itemIndex, inv);
        if (has(inv.showNotification)) inv.showNotification('获得：' + loot.name, 'success');
        return true;
      }
      return false;
    };
    return CH;
  })();

  // ===== 合成：材料 → 对应神器（3 份） =====
  var CraftingHandler = (function () {
    function CFH() {}
    CFH.handleCrafting = function (materialName, inv) {
      var data = ItemGenerator.getItemData(materialName);
      if (!data || !data.craftTarget) return false;
      var have = inv.countMaterial(materialName);
      if (have < data.craftAmount) {
        if (has(inv.showNotification)) inv.showNotification('合成失败：需要' + data.craftAmount + '个' + materialName, 'error');
        return false;
      }
      
      var eq = Catalog.generateEquipmentBy(data.craftTarget, 5);
      
      // 如果有Equipment类，使用它来计算最终属性
      if (window.Equipment && window.EquipmentGenerator) {
        var equipObj = window.EquipmentGenerator.createEquipment(data.craftTarget, 'artifact', 5);
        var finalStats = equipObj.getFinalStats();
        var item = { name: eq.name, quality: eq.quality, stats: finalStats, category: eq.category };
      } else {
        var item = { name: eq.name, quality: eq.quality, stats: eq.stats, category: eq.category };
      }
      
      if (inv.addItem(item)) {
        inv.removeMaterials(materialName, data.craftAmount);
        if (has(inv.updateInventoryDisplay)) inv.updateInventoryDisplay();
        if (has(inv.showNotification)) inv.showNotification('合成成功：' + data.craftTarget, 'success');
        return true;
      }
      return false;
    };
    return CFH;
  })();

  // ==================== 全局导出 ====================
  
  // 装备相关导出
  window.Equipment = Equipment;
  window.EquipmentGenerator = EquipmentGenerator;
  window.EquipmentUtils = EquipmentUtils;

  // 物品相关导出
  window.ItemGenerator = ItemGenerator;
  window.ItemEffectHandler = ItemEffectHandler;
  window.ContainerHandler = ContainerHandler;
  window.CraftingHandler = CraftingHandler;
  window.ITEM_TYPES = ITEM_TYPES;

  // 兼容老版本的函数
  window.generateRandomEquipment = function (category, quality) {
    const eq = EquipmentGenerator.generateRandomEquipment(category, quality);
    return { 
      name: eq.name, 
      quality: eq.quality, 
      stats: eq.getFinalStats(), 
      category: eq.category 
    };
  };

})();