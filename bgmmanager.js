class BGMManager {
    constructor() {
        // BGM文件配置
        this.bgmFiles = {
            start: 'assets/bgm/start.wav',           // 开始界面BGM
            main: 'assets/bgm/main.wav',             // 主界面BGM  
            endless: 'assets/bgm/endless.wav',       // 无尽征程BGM
            timeVortex: 'assets/bgm/time_vortex.wav', // 时空漩涡BGM (能量之眼和星尘轨道共用)
            iceAge: 'assets/bgm/ice_age.wav'         // 冰河时代BGM
        };
        
        // 音效文件配置
        this.sfxFiles = {
            click: 'assets/sfx/click.wav'            // 按键音效
        };
        
        // 音频对象
        this.audioObjects = {};
        this.sfxObjects = {};
        this.currentBGM = null;
        this.currentState = null;
        this.isMuted = false;
        this.volume = 0.5; // 默认音量
        this.sfxVolume = 0.3; // 音效音量（相对较小）
        
        // 从本地存储加载设置
        this.loadSettings();
        
        // 预加载所有BGM和音效文件
        this.preloadBGM();
        this.preloadSFX();
        
        // 监听游戏状态变化
        this.setupStateListener();
        
        // 设置全局点击音效
        this.setupClickSFX();
    }
    
    // 预加载所有BGM文件
    preloadBGM() {
        Object.keys(this.bgmFiles).forEach(key => {
            const audio = new Audio();
            audio.src = this.bgmFiles[key];
            audio.loop = true;
            audio.volume = this.isMuted ? 0 : this.volume;
            audio.preload = 'auto';
            
            // 错误处理
            audio.addEventListener('error', (e) => {
                console.warn(`BGM文件加载失败: ${key} (${this.bgmFiles[key]})`);
            });
            
            this.audioObjects[key] = audio;
        });
    }
    
    // 预加载所有音效文件
    preloadSFX() {
        Object.keys(this.sfxFiles).forEach(key => {
            const audio = new Audio();
            audio.src = this.sfxFiles[key];
            audio.volume = this.isMuted ? 0 : this.sfxVolume;
            audio.preload = 'auto';
            
            // 错误处理
            audio.addEventListener('error', (e) => {
                console.warn(`音效文件加载失败: ${key} (${this.sfxFiles[key]})`);
            });
            
            this.sfxObjects[key] = audio;
        });
    }
    
    // 播放音效
    playSFX(sfxKey) {
        if (!this.sfxObjects[sfxKey] || this.isMuted) {
            return;
        }
        
        const audio = this.sfxObjects[sfxKey];
        audio.currentTime = 0;
        audio.volume = this.sfxVolume;
        
        audio.play().catch(e => {
            // 静默处理音效播放失败，不影响用户体验
        });
    }
    
    // 设置全局点击音效
    setupClickSFX() {
        // 为主界面添加点击音效监听
        document.addEventListener('click', (e) => {
            // 只在主界面相关状态下播放音效
            if (this.currentState === 'start' || this.currentState === 'main') {
                this.playSFX('click');
            }
        });
        
        // 为右键点击添加音效（如果需要）
        document.addEventListener('contextmenu', (e) => {
            // 只在主界面相关状态下播放音效
            if (this.currentState === 'start' || this.currentState === 'main') {
                this.playSFX('click');
            }
        });
    }
    
    // 播放指定BGM
    playBGM(bgmKey) {
        if (!this.audioObjects[bgmKey] || this.isMuted) {
            return;
        }
        
        // 如果当前已经在播放相同的BGM，则不需要切换
        if (this.currentBGM === bgmKey && !this.audioObjects[bgmKey].paused) {
            return;
        }
        
        // 停止当前播放的BGM
        this.stopCurrentBGM();
        
        // 播放新的BGM
        const audio = this.audioObjects[bgmKey];
        audio.currentTime = 0;
        audio.volume = this.volume;
        
        audio.play().then(() => {
            this.currentBGM = bgmKey;
        }).catch(e => {
            if (e.name === 'NotAllowedError') {
                console.log('需要用户交互才能播放音频，请点击音乐按钮');
            }
        });
    }
    
    // 停止当前BGM
    stopCurrentBGM() {
        if (this.currentBGM && this.audioObjects[this.currentBGM]) {
            this.audioObjects[this.currentBGM].pause();
            this.audioObjects[this.currentBGM].currentTime = 0;
        }
    }
    
    // 停止所有BGM
    stopAllBGM() {
        Object.values(this.audioObjects).forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });
        this.currentBGM = null;
    }
    
    // 切换静音状态
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.updateAllVolumes();
        this.saveSettings();
        
        if (!this.isMuted) {
            // 取消静音时，尝试播放当前状态的BGM
            if (this.currentState) {
                this.handleStateChange(this.currentState);
            }
        } else {
            // 静音时停止所有BGM
            this.stopAllBGM();
        }
        
        return this.isMuted;
    }
    
    // 设置音量
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
        this.saveSettings();
    }
    
    // 设置音效音量
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateAllVolumes();
        this.saveSettings();
    }
    
    // 更新所有音频对象的音量
    updateAllVolumes() {
        const targetBGMVolume = this.isMuted ? 0 : this.volume;
        const targetSFXVolume = this.isMuted ? 0 : this.sfxVolume;
        
        Object.values(this.audioObjects).forEach(audio => {
            audio.volume = targetBGMVolume;
        });
        
        Object.values(this.sfxObjects).forEach(audio => {
            audio.volume = targetSFXVolume;
        });
    }
    
    // 根据游戏状态播放对应BGM
    handleStateChange(gameState) {
        this.currentState = gameState;
        
        // 更新音乐按钮显示状态
        this.updateMusicButtonVisibility(gameState);
        
        if (this.isMuted) {
            this.stopAllBGM();
            return;
        }
        
        switch(gameState) {
            case 'start':
                this.playBGM('start');
                break;
            case 'main':
                this.playBGM('main');
                break;
            case 'endless':
                this.playBGM('endless');
                break;
            case 'energy_eye':
            case 'stardust_orbit':
                this.playBGM('timeVortex');
                break;
            case 'ICE_AGE':
                this.playBGM('iceAge');
                break;
            default:
                this.stopAllBGM();
                break;
        }
    }
    
    // 更新音乐按钮的显示状态
    updateMusicButtonVisibility(gameState) {
        const musicBtn = document.getElementById('musicToggleBtn');
        if (!musicBtn) return;
        
        // 只在开始界面和主界面显示音乐按钮
        if (gameState === 'start' || gameState === 'main') {
            musicBtn.style.display = 'flex';
        } else {
            musicBtn.style.display = 'none';
        }
    }
    
    // 设置游戏状态监听器
    setupStateListener() {
        const initializeBGM = () => {
            if (typeof gameStateManager !== 'undefined') {
                // 监听setState方法
                const originalSetState = gameStateManager.setState.bind(gameStateManager);
                gameStateManager.setState = (newState) => {
                    originalSetState(newState);
                    this.handleStateChange(newState);
                };
                
                // 监听handleStateChange方法
                const originalHandleStateChange = gameStateManager.handleStateChange.bind(gameStateManager);
                gameStateManager.handleStateChange = () => {
                    originalHandleStateChange();
                    this.handleStateChange(gameStateManager.currentState);
                };
                
                // 定期检查状态变化（备用方案）
                let lastKnownState = gameStateManager.currentState;
                setInterval(() => {
                    if (gameStateManager.currentState !== lastKnownState) {
                        lastKnownState = gameStateManager.currentState;
                        this.handleStateChange(gameStateManager.currentState);
                    }
                }, 1000);
                
                // 立即处理当前状态
                if (gameStateManager.currentState) {
                    this.handleStateChange(gameStateManager.currentState);
                }
            } else {
                setTimeout(initializeBGM, 200);
            }
        };
        
        setTimeout(initializeBGM, 500);
    }
    
    // 保存设置到本地存储
    saveSettings() {
        const settings = {
            isMuted: this.isMuted,
            volume: this.volume,
            sfxVolume: this.sfxVolume
        };
        localStorage.setItem('galacticWarshipBGMSettings', JSON.stringify(settings));
    }
    
    // 从本地存储加载设置
    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('galacticWarshipBGMSettings') || '{}');
            this.isMuted = settings.isMuted || false;
            this.volume = settings.volume !== undefined ? settings.volume : 0.5;
            this.sfxVolume = settings.sfxVolume !== undefined ? settings.sfxVolume : 0.3;
        } catch (e) {
            this.isMuted = false;
            this.volume = 0.5;
            this.sfxVolume = 0.3;
        }
    }
    
    // 获取当前状态信息
    getStatus() {
        return {
            currentBGM: this.currentBGM,
            currentState: this.currentState,
            isMuted: this.isMuted,
            volume: this.volume,
            sfxVolume: this.sfxVolume,
            isPlaying: this.currentBGM && !this.audioObjects[this.currentBGM].paused
        };
    }
}

// 创建全局BGM管理器实例
const bgmManager = new BGMManager();

// 在主界面添加音乐控制按钮
function addMusicToggleButton() {
    // 检查是否已经存在按钮
    if (document.getElementById('musicToggleBtn')) {
        return;
    }
    
    // 创建音乐控制按钮
    const musicBtn = document.createElement('button');
    musicBtn.id = 'musicToggleBtn';
    musicBtn.className = 'music-toggle-btn';
    musicBtn.innerHTML = bgmManager.isMuted ? '🔇' : '♪';
    musicBtn.title = bgmManager.isMuted ? '开启音乐' : '关闭音乐';
    
    // 按钮样式
    musicBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border: 2px solid #00ffff;
        border-radius: 50%;
        background: rgba(0, 20, 40, 0.8);
        color: #00ffff;
        font-size: 20px;
        cursor: pointer;
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        backdrop-filter: blur(5px);
        box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);
    `;
    
    // 悬停效果
    musicBtn.addEventListener('mouseenter', () => {
        musicBtn.style.background = 'rgba(0, 255, 255, 0.2)';
        musicBtn.style.boxShadow = '0 0 25px rgba(0, 255, 255, 0.6)';
        musicBtn.style.transform = 'scale(1.1)';
    });
    
    musicBtn.addEventListener('mouseleave', () => {
        musicBtn.style.background = 'rgba(0, 20, 40, 0.8)';
        musicBtn.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.3)';
        musicBtn.style.transform = 'scale(1)';
    });
    
    // 点击事件
    musicBtn.addEventListener('click', () => {
        // 首次点击时尝试启用音频上下文
        Object.values(bgmManager.audioObjects).forEach(audio => {
            if (audio.readyState < 2) {
                audio.load();
            }
        });
        
        const isMuted = bgmManager.toggleMute();
        musicBtn.innerHTML = isMuted ? '🔇' : '♪';
        musicBtn.title = isMuted ? '开启音乐' : '关闭音乐';
        
        // 点击动画
        musicBtn.style.transform = 'scale(0.9)';
        setTimeout(() => {
            musicBtn.style.transform = musicBtn.matches(':hover') ? 'scale(1.1)' : 'scale(1)';
        }, 150);
    });
    
    document.body.appendChild(musicBtn);
}

// 页面加载完成后添加音乐按钮
document.addEventListener('DOMContentLoaded', () => {
    addMusicToggleButton();
});

// 如果页面已经加载完成，立即添加按钮
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addMusicToggleButton);
} else {
    addMusicToggleButton();
}

// 导出全局变量
window.bgmManager = bgmManager;

// 调试函数（保留少量用于故障排除）
window.debugBGM = () => {
    console.log('=== BGM调试信息 ===');
    console.log('当前状态:', bgmManager.currentState);
    console.log('当前BGM:', bgmManager.currentBGM);
    console.log('是否静音:', bgmManager.isMuted);
    console.log('BGM音量:', bgmManager.volume);
    console.log('音效音量:', bgmManager.sfxVolume);
    
    Object.keys(bgmManager.audioObjects).forEach(key => {
        const audio = bgmManager.audioObjects[key];
        console.log(`BGM ${key}:`, {
            src: audio.src,
            readyState: audio.readyState,
            paused: audio.paused,
            duration: audio.duration,
            volume: audio.volume
        });
    });
    
    Object.keys(bgmManager.sfxObjects).forEach(key => {
        const audio = bgmManager.sfxObjects[key];
        console.log(`SFX ${key}:`, {
            src: audio.src,
            readyState: audio.readyState,
            volume: audio.volume
        });
    });
};

window.testBGM = (bgmKey) => {
    bgmManager.playBGM(bgmKey);
};

window.testSFX = (sfxKey) => {
    bgmManager.playSFX(sfxKey);
};