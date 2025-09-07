const QUALITY_CONFIG = {
  names: ['普通', '优秀', '精良', '史诗', '传说', '神器'],
  colors: ['#ffffff', '#00ff00', '#0066ff', '#9933ff', '#ffaa00', '#ff0000'],
  maxQuality: 5,
  maxLevel: 5,
  scaleByQuality(base, quality) {
    const q = Math.max(0, Math.min(quality | 0, 5));
    const m = (q >= 5) ? 1 : Math.pow(2, q);
    const out = {};
    for (const [k, v] of Object.entries(base || {})) {
      out[k] = (typeof v === 'number') ? v * m : v;
    }
    return out;
  }
};

const ARTIFACT_ALIASES = {
  '破甲弹': '银色子弹',
  '原核炮': '无垠激光炮',
  '钛金甲': '霸王舰甲',
  '反伤甲': '金刚',
  '毁灭之刃': '灭世',
  '源流钢炮': '无流',
  '逐日弓': '破晓'
};

const ITEM_DEFS = Object.create(null);
Object.assign(ITEM_DEFS, {
  '血瓶': { type: 'consumable', stackable: true, description: '治疗药水', sellPrice: 50, useEffect: 'heal', quality: 0 },
  '能量瓶': { type: 'consumable', stackable: true, description: '能量药水', sellPrice: 60, useEffect: 'energy', quality: 0 },
  '强力药水': { type: 'consumable', stackable: true, description: '5秒内攻击力+20%', sellPrice: 50, useEffect: 'power_boost', quality: 0 },
  '护体药水': { type: 'consumable', stackable: true, description: '5秒内免伤+50%并提供霸体', sellPrice: 50, useEffect: 'shield_boost', quality: 0 },
  '宇宙晶核': { type: 'consumable', stackable: true, description: '神秘宇宙能量（随机晶核增强/奖励）', sellPrice: 10, useEffect: 'random_crystal', quality: 0 },
  '随机史诗装备宝箱': { type: 'container', stackable: true, description: '开启获得一件史诗装备', sellPrice: 320, lootTable: 'epic_equipment', quality: 3 },
  '随机珍稀装备宝箱': { type: 'container', stackable: true, description: '开启获得顶级稀有或神器装备', sellPrice: 1000, lootTable: 'artifact_equipment', quality: 5 },
  '阿修罗之眼': { type: 'material', stackable: true, description: '血色·阿修罗的合成材料', sellPrice: 3000, quality: 4},
  '冥王碎片':   { type: 'material', stackable: true, description: '冥王的合成材料',       sellPrice: 3000, quality: 4},
  '泰坦结晶':   { type: 'material', stackable: true, description: '泰坦之心的合成材料',   sellPrice: 3000, quality: 4 },
  '玄铁':   { type: 'material', stackable: true, description: '稀有装备合成材料', sellPrice: 200, quality: 2 },
  '炎晶':   { type: 'material', stackable: true, description: '稀有装备合成材料', sellPrice: 200, quality: 2 },
  '雷砂':   { type: 'material', stackable: true, description: '稀有装备合成材料', sellPrice: 200, quality: 2 },
  '万丝金': { type: 'material', stackable: true, description: '稀有金属',   sellPrice: 260, quality: 0 },
  '不朽木': { type: 'material', stackable: true, description: '古老树心',   sellPrice: 260, quality: 0 },
  '引雷冰': { type: 'material', stackable: true, description: '奇异寒晶',   sellPrice: 260, quality: 0 },
  '天罚火': { type: 'material', stackable: true, description: '神秘火种',   sellPrice: 260, quality: 0 },
  '落尘石': { type: 'material', stackable: true, description: '沉睡之石',   sellPrice: 260, quality: 0 },
  '神珍铁': { type: 'material', stackable: true, description: '神珍装备的珍稀合成材料', sellPrice: 2000, quality: 5 },
  '不融雪': { type: 'material', stackable: true, description: '渺沧海，尽茫茫。铁骨不融，一念寒光裂九荒。夜无疆。', sellPrice: 500, quality: 3 },
  '扩充背包': { type: 'special', stackable: true, description: '增加背包容量', sellPrice: 100, useEffect: 'expand_bag', quality: 0 },
  '孟婆汤':   { type: 'special', stackable: true, description: '重置晶核等级', sellPrice: 100, useEffect: 'reset_crystals', quality: 0 },
  '寒霜': { type: 'treasure', stackable: false, description: '传说法宝，使用后冰冻周围敌人', sellPrice: 2000, quality: 4 },
  '胜利飞燕一号': { type: 'costume', stackable: false, description: '传说品质时装，改变角色外观', sellPrice: 1000, quality: 4 },
  '成就勋章': { type: 'material', stackable: true, description: '用于在成就商店兑换物品', sellPrice: 50, quality: 1 },
  '刷新券': { type: 'special', stackable: true, description: '使用后刷新所有副本每日挑战次数', sellPrice: -500, useEffect: 'refresh_dungeon_attempts', quality: 1  },
  '新手宝箱': { type: 'container', stackable: true, description: '新手超级礼包！打开后获得神秘奖励！', sellPrice: 50, lootTable: 'rookie_chest_loot', quality: 4 }
});

const EQUIPMENT_BASE_DATA = {
  common: {
    '破甲弹': { stats: { attack: 5 }, description: '基础攻击弹药' },
    '钛金甲': { stats: { health: 50,defense: 1 }, description: '提供额外生命值的防护装甲' },
    '原核炮': { stats: { lifeSteal: 0.30 }, description: '能量武器，提供吸血' }
  },
  rare: {
    '反伤甲':   { stats: { health: 15, defense: 2.5, reflect: 0.375 }, description: '反弹部分伤害' },
    '毁灭之刃': { stats: { attack: 11.25, health: -45, defense: -2 }, description: '高攻但牺牲生存' },
    '源流钢炮': { stats: { attack: 2.5, energyRegen: 0.10 }, description: '提供持续回能' },
    '逐日弓':   { stats: { attack: 7.5, lifeSteal: -0.20, defense: 2 }, description: '攻防兼备但牺牲续航' }
  },
  artifact: {
    '血色·阿修罗': {
      stats: { attack: 120, lifeSteal: 6.2, health: -600 },
      description: '左键三发散射，平A吸血',
      passiveEffects: ['asura_triple_shot', 'asura_lifesteal']
    },
    '冥王': {
      stats: { health: 1600, lifeSteal: -1.6, defense: 80 },
      description: '免控，处决低血敌',
      passiveEffects: ['hades_immunity', 'hades_execute']
    },
    '泰坦之心': {
      stats: { health: 400, maxEnergy: 25, attack: 50, lifeSteal: 1.5, defense: 20, energyRegen: 0.5, reflect: 3.5 },
      description: '濒死复活并短暂无敌',
      passiveEffects: ['titan_revive']
    }
  }
};

const TREASURE_BASE_DATA = {
  '寒霜': {
    stats: {
      attack: 50,
      health: 200,
      maxEnergy: 10,
      defense: 15,
      energyRegen: 0.5
    },
    description: '冰封万物的神秘法宝',
    skillEffect: 'frost_freeze',
    upgradeMaterial: '不融雪',
    upgradeCosts: [2, 2, 3, 3, 3, 4, 4, 4, 6, 8],
    skillUpgradeDesc: '每次升级增加冰冻时长0.2秒'
  }
};

const SHOP_CATALOG = [
  { name: '血瓶', price: 200, category: 'consumable' },
  { name: '能量瓶', price: 350, category: 'consumable' },
  { name: '强力药水', price: 50, category: 'consumable' },
  { name: '护体药水', price: 50, category: 'consumable' },
  { name: '宇宙晶核', price: 1500, category: 'consumable' },
  { name: '孟婆汤', price: 2000, category: 'special' },
  { name: '扩充背包', price: 1000, category: 'special' },
  { name: '随机史诗装备宝箱', price: 1600, category: 'consumable' },
  { name: '随机珍稀装备宝箱', price: 20000, category: 'consumable' },
  { name: '阿修罗之眼', price: 10000, category: 'material' },
  { name: '泰坦结晶', price: 12000, category: 'material' },
  { name: '冥王碎片', price: 9000, category: 'material' },
  { name: '史诗破甲弹', price: 2000, category: 'equipment', quality: 3, equipmentName: '破甲弹' },
  { name: '史诗钛金甲', price: 1700, category: 'equipment', quality: 3, equipmentName: '钛金甲' },
  { name: '史诗原核炮', price: 1800, category: 'equipment', quality: 3, equipmentName: '原核炮' }
];

const REDEMPTION_CODES = {
  'BETA2024': { used: false, rewards: [
    { name: '血瓶', quantity: 5 }, 
    { name: '能量瓶', quantity: 3 }, 
    { name: '宇宙晶核', quantity: 2 }
  ]},
  'NEWBIE': { used: false, rewards: [
    { name: '随机史诗装备宝箱', quantity: 1 }, 
    { name: '扩充背包', quantity: 1 }
  ]},
  '121': { used: false, rewards: [{ name: '强力药水', quantity: 15 }]},
  '122': { used: false, rewards: [{ name: '护体药水', quantity: 15 }]},
  '123': { used: false, rewards: [{ name: '玄铁', quantity: 10 },{ name: '炎晶', quantity: 10 },{ name: '雷砂', quantity: 10 }]},
  '124': { used: false, rewards: [{ name: '神珍铁', quantity: 9 }]},
  '125': { used: false, rewards: [{ name: '寒霜', quantity: 1, special: 'random_treasure' }]},
  '126': { used: false, rewards: [{ name: '不融雪', quantity: 10 }]},
  '127': { used: false, rewards: [{ name: '胜利飞燕一号', quantity: 1 }]},
  '128': { used: false, rewards: [{ name: '成就勋章', quantity: 10 }] },
  '129': { used: false, rewards: [{ name: '刷新券', quantity: 10 }] },
  '48692301': { used: false, rewards: [{ name: '阿修罗之眼', quantity: 6 }]},
  '48692302': { used: false, rewards: [{ name: '泰坦结晶', quantity: 9 }]},
  '48692303': { used: false, rewards: [{ name: '冥王碎片', quantity: 6 }]},
  '48692304': { used: false, rewards: [{ name: '随机珍稀装备宝箱', quantity: 15 }]},
  '48692305': { used: false, rewards: [{ name: '扩充背包', quantity: 3 }]},
  '48692306': { used: false, rewards: [{ name: '孟婆汤', quantity: 2 }]},
  '48692307': { used: false, rewards: [{ name: '随机史诗装备宝箱', quantity: 15 }]}
};

const LOOT_TABLES = Object.create(null);

LOOT_TABLES['epic_equipment'] = function () {
  const picks = [
    ['common', '破甲弹'], ['common', '钛金甲'], ['common', '原核炮'],
    ['rare', '反伤甲'],   ['rare', '毁灭之刃'], ['rare', '源流钢炮'], ['rare', '逐日弓']
  ];
  const [cat, name] = picks[Math.floor(Math.random() * picks.length)];
  return { kind: 'equipment', payload: { name, quality: 3, category: cat } };
};

LOOT_TABLES['artifact_equipment'] = function () {
  const pool = [
    { name: '血色·阿修罗', category: 'artifact', quality: 5 },
    { name: '冥王',         category: 'artifact', quality: 5 },
    { name: '泰坦之心',     category: 'artifact', quality: 5 },
    { name: '反伤甲',       category: 'rare',     quality: 5 },
    { name: '逐日弓',       category: 'rare',     quality: 5 },
    { name: '源流钢炮',     category: 'rare',     quality: 5 },
    { name: '毁灭之刃',     category: 'rare',     quality: 5 }
  ];
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return { kind: 'equipment', payload: pick };
};

LOOT_TABLES['rookie_chest_loot'] = function () {
  return { 
    kind: 'multiple_items', 
    payload: [
      { name: '神珍铁', quantity: 1 },
      { name: '不融雪', quantity: 1 },
      { name: '能量瓶', quantity: 10 },
      { name: '刷新券', quantity: 10 }
    ]
  };
};

const Catalog = {
  registerItem(def) {
    if (!def || !def.name) return;
    const { name, ...rest } = def;
    ITEM_DEFS[name] = Object.assign(ITEM_DEFS[name] || {}, rest);
  },

  registerEquipmentBase(category, name, base) {
    if (!EQUIPMENT_BASE_DATA[category]) EQUIPMENT_BASE_DATA[category] = {};
    const cur = EQUIPMENT_BASE_DATA[category][name] || {};
    EQUIPMENT_BASE_DATA[category][name] = Object.assign(cur, base || {});
  },

  registerTreasureBase(name, base) {
    TREASURE_BASE_DATA[name] = Object.assign(TREASURE_BASE_DATA[name] || {}, base);
  },

  registerShopItem(entry) { 
    if (entry) SHOP_CATALOG.push(entry); 
  },

  registerRedeem(code, record) { 
    REDEMPTION_CODES[code] = Object.assign(REDEMPTION_CODES[code] || {}, record); 
  },

  registerIcon(kind, name, path) { 
    if (!ICONS[kind]) ICONS[kind] = {}; 
    ICONS[kind][name] = path; 
  },

  registerLootTable(key, fn) { 
    LOOT_TABLES[key] = fn; 
  },

  getItemData(name) { 
    return ITEM_DEFS[name] || null; 
  },

  getDisplayName(name, quality = 0) {
    if ((quality | 0) >= 5 && ARTIFACT_ALIASES[name]) return ARTIFACT_ALIASES[name];
    return name;
  },

  getSellPrice(entity) {
    const name = entity?.name;
    if (name && ITEM_DEFS[name] && typeof ITEM_DEFS[name].sellPrice === 'number') {
      return ITEM_DEFS[name].sellPrice | 0;
    }
    const q = Math.max(0, Math.min((entity?.quality | 0), QUALITY_CONFIG.maxQuality));
    return 40 * Math.pow(2, q);
  },

  isStackable(name) { 
    return !!ITEM_DEFS[name]?.stackable; 
  },

  getMaxStack(name) { 
    return ITEM_DEFS[name]?.maxStack ?? Infinity; 
  },

  listStackableNames() { 
    return Object.keys(ITEM_DEFS).filter(n => !!ITEM_DEFS[n]?.stackable); 
  },

  generateItem(name, quantity = 1) {
  const def = ITEM_DEFS[name];
  if (!def) throw new Error(`未知物品: ${name}`);
  return { 
    name, 
    quality: def.quality ?? 0, 
    stats: {}, 
    category: def.type,  // 确保这里正确设置了category
    quantity: Math.max(1, quantity | 0) 
  };
},

  generateEquipmentBy(name, quality) {
    let foundCat = null, base = null;
    for (const [cat, map] of Object.entries(EQUIPMENT_BASE_DATA)) {
      if (map && name in map) { 
        foundCat = cat; 
        base = map[name]; 
        break; 
      }
    }
    if (!foundCat || !base) throw new Error(`未找到装备：${name}`);
    
    const q = (foundCat === 'artifact') ? 5 : Math.max(0, Math.min((quality | 0), QUALITY_CONFIG.maxQuality));
    const stats = (foundCat === 'artifact') ? { ...base.stats } : QUALITY_CONFIG.scaleByQuality(base.stats, q);
    
    return { 
      name, 
      quality: q, 
      stats, 
      category: foundCat, 
      passiveEffects: base.passiveEffects || null, 
      description: base.description || '' 
    };
  },

  rollEquipment(category, quality) {
    const pool = EQUIPMENT_BASE_DATA[category] || {};
    const names = Object.keys(pool);
    if (!names.length) throw new Error(`装备池为空: ${category}`);
    const name = names[Math.floor(Math.random() * names.length)];
    return this.generateEquipmentBy(name, quality);
  },

  rollFromTable(key) {
    const fn = LOOT_TABLES[key];
    if (typeof fn !== 'function') throw new Error(`未定义掉落表: ${key}`);
    return fn();
  },

  getTreasureData(name) {
    return TREASURE_BASE_DATA[name] || null;
  },

  generateTreasureBy(name, level = 1, growthRate = null) {
    const base = this.getTreasureData(name);
    if (!base) throw new Error(`未找到法宝：${name}`);
    
    return {
      name,
      quality: 4,
      stats: { ...base.stats },
      category: 'treasure',
      level: level,
      growthRate: growthRate || (1.0 + Math.random() * 1.5),
      skillEffect: base.skillEffect,
      upgradeMaterial: base.upgradeMaterial,
      upgradeCosts: base.upgradeCosts,
      skillUpgradeDesc: base.skillUpgradeDesc,
      description: base.description || ''
    };
  },

  getTreasureUpgradeMaterial(treasureName) {
    const data = this.getTreasureData(treasureName);
    return data?.upgradeMaterial || '未知材料';
  },

  getTreasureUpgradeCost(treasureName, level) {
    const data = this.getTreasureData(treasureName);
    const costs = data?.upgradeCosts;
    if (!costs || level < 1 || level > costs.length) return 999;
    return costs[level - 1];
  },

  calculateTreasureStats(treasure) {
    const baseStats = this.getTreasureData(treasure.name)?.stats || treasure.stats || {};
    const level = treasure.level || 1;
    const growthRate = treasure.growthRate || 1.0;
    
    const result = {};
    for (const [key, value] of Object.entries(baseStats)) {
      const increase = (level - 1) * value * 0.1 * growthRate;
      if (key === 'energyRegen' || key === 'lifeSteal' || key === 'reflect') {
        result[key] = Number((value + increase).toFixed(2));
      } else {
        result[key] = Math.floor(value + increase);
      }
    }
    return result;
  },

  getTreasureSkillDescription(treasure) {
    if (treasure.name === '寒霜') {
      const level = treasure.level || 1;
      const freezeDuration = 2.0 + (level - 1) * 0.2;
      return `冰冻周围敌人 ${freezeDuration.toFixed(1)} 秒`;
    }
    return treasure.skillEffect || '未知技能';
  },

  buildTooltip({ name, quality = 0, stats = {}, quantity = 1 }) {
    const qualityName = QUALITY_CONFIG.names[quality] || '';
    let tip = `${this.getDisplayName(name, quality)}\n品质: ${qualityName}\n\n`;
    
    if (ITEM_DEFS[name]) {
      tip += ITEM_DEFS[name].description || '';
      if (quantity > 1) tip += `\n数量: ${quantity}`;
      return tip;
    }
    
    tip += '属性:\n';
    for (const [k, v] of Object.entries(stats)) {
      if (k === 'attack') tip += `攻击力: +${v}\n`;
      else if (k === 'lifeSteal') tip += `吸血: +${(v * 100).toFixed(1)}%\n`;
      else if (k === 'health') tip += `生命值: ${v >= 0 ? '+' : ''}${v}\n`;
      else if (k === 'defense') tip += `防御力: ${v >= 0 ? '+' : ''}${v}\n`;
      else if (k === 'reflect') tip += `反伤: +${(v * 100).toFixed(1)}%\n`;
      else if (k === 'energyRegen') tip += `回能: +${v}/秒\n`;
      else if (k === 'maxEnergy') tip += `最大能量: +${v}\n`;
      else tip += `${k}: ${v}\n`;
    }
    
    if (quality < 5) tip += '\n可与同品质同名装备合并升级';
    return tip;
  },

  getEquipmentData(name, category) {
    if (category && EQUIPMENT_BASE_DATA[category]?.[name]) {
      return EQUIPMENT_BASE_DATA[category][name];
    }
    for (const [cat, group] of Object.entries(EQUIPMENT_BASE_DATA)) {
      if (group[name]) return group[name];
    }
    return null;
  },

  getEquipmentNamesByCategory(category) {
    return Object.keys(EQUIPMENT_BASE_DATA[category] || {});
  }
};

if (typeof window !== 'undefined') {
  window.QUALITY_CONFIG = QUALITY_CONFIG;
  window.ARTIFACT_ALIASES = ARTIFACT_ALIASES;
  window.ARTIFACT_NAMES = ARTIFACT_ALIASES;
  window.EQUIPMENT_BASE_DATA = EQUIPMENT_BASE_DATA;
  window.TREASURE_BASE_DATA = TREASURE_BASE_DATA;
  window.ITEM_DEFS = ITEM_DEFS;
  window.Catalog = Catalog;
  window.SHOP_CATALOG = SHOP_CATALOG;
  window.REDEMPTION_CODES = REDEMPTION_CODES;
  window.LOOT_TABLES = LOOT_TABLES;

  window.ItemGenerator = window.ItemGenerator || {
    generateItem: (name, qty) => Catalog.generateItem(name, qty),
    getStackableItems: () => Catalog.listStackableNames(),
    getItemData: (name) => Catalog.getItemData(name)
  };

  window.EquipmentGenerator = window.EquipmentGenerator || {
    generateSpecificEquipment: (name, q) => Catalog.generateEquipmentBy(name, q),
    createEquipment: (name, cat, q) => Catalog.generateEquipmentBy(name, q),
    getEquipmentData: (name, cat) => Catalog.getEquipmentData(name, cat),
    getEquipmentNamesByCategory: (cat) => Catalog.getEquipmentNamesByCategory(cat)
  };

  window.generateRandomEquipment = window.generateRandomEquipment || ((category, q) => Catalog.rollEquipment(category, q));
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    QUALITY_CONFIG,
    ARTIFACT_ALIASES,
    EQUIPMENT_BASE_DATA,
    TREASURE_BASE_DATA,
    ITEM_DEFS,
    Catalog,
    SHOP_CATALOG,
    REDEMPTION_CODES,
    ICONS,
    LOOT_TABLES
  };
}