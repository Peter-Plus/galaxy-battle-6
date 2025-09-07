class DailyLoginManager {
    constructor() {
        this.storageKey = 'dailyLoginTimes'; // 独立存储所有存档的登录时间
    }
    
    // 获取指定存档的上次登录时间
    getLastLoginTime(saveId) {
        try {
            const loginTimes = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
            return loginTimes[saveId] ? new Date(loginTimes[saveId]) : null;
        } catch (e) {
            console.error('读取登录时间失败:', e);
            return null;
        }
    }
    
    // 更新指定存档的登录时间（只在载入游戏时调用）
    updateLoginTime(saveId) {
        try {
            const loginTimes = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
            loginTimes[saveId] = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(loginTimes));
            console.log(`存档 ${saveId} 的登录时间已更新`);
        } catch (e) {
            console.error('保存登录时间失败:', e);
        }
    }
    
    // 检查是否需要刷新（不同日期返回true）
    needsDailyRefresh(saveId) {
        const lastLogin = this.getLastLoginTime(saveId);
        const now = new Date();
        
        if (!lastLogin) {
            console.log('首次登录该存档');
            return true;
        }
        
        // 比较日期（忽略时间）
        const lastDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());
        const currentDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const needsRefresh = lastDate.getTime() !== currentDate.getTime();
        
        console.log(`上次登录: ${lastLogin.toLocaleString()}`);
        console.log(`当前时间: ${now.toLocaleString()}`);
        console.log(`需要刷新: ${needsRefresh}`);
        
        return needsRefresh;
    }
    
    // 删除存档的登录时间记录
    removeSaveRecord(saveId) {
        try {
            const loginTimes = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
            delete loginTimes[saveId];
            localStorage.setItem(this.storageKey, JSON.stringify(loginTimes));
        } catch (e) {
            console.error('删除登录时间记录失败:', e);
        }
    }
}

// 创建全局实例
const dailyLoginManager = new DailyLoginManager();

// ========== 刷新每日次数的函数 ==========
function refreshDailyAttempts() {
    console.log('========== 刷新每日副本挑战次数 ==========');
    
    let refreshCount = 0;
    
    // 刷新时间旋涡（能量之眼、星尘轨道）
    if (typeof timeVortexManager !== 'undefined' && timeVortexManager) {
        timeVortexManager.resetDailyAttempts();
        console.log('✓ 时间旋涡挑战次数已重置');
        refreshCount++;
    }
    
    // 刷新奇迹之境（冰河时代）
    if (typeof miracleRealmManager !== 'undefined' && miracleRealmManager) {
        miracleRealmManager.resetDaily();
        console.log('✓ 奇迹之境挑战次数已重置');
        refreshCount++;
    }
    
    // 保存重置后的状态到当前存档
    if (typeof autoSave === 'function' && refreshCount > 0) {
        autoSave();
        console.log('✓ 刷新后的状态已保存');
    }
    
    return refreshCount > 0;
}
