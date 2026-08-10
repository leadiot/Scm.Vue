<template>
    <div class="settings-app app-light">
        <!-- 左侧导航栏 -->
        <div class="settings-sidebar">
            <div class="sidebar-item" :class="{ active: activeSection === 'appearance' }"
                @click="activeSection = 'appearance'">
                <sc-icon name="ms-palette" :size="20" />
                <span>{{ $t('desktop.appearance') }}</span>
            </div>
            <div class="sidebar-item" :class="{ active: activeSection === 'personalization' }"
                @click="activeSection = 'personalization'">
                <sc-icon name="ms-brush" :size="20" />
                <span>{{ $t('desktop.personalSettings') }}</span>
            </div>
            <div class="sidebar-item" :class="{ active: activeSection === 'layout' }" @click="activeSection = 'layout'">
                <sc-icon name="ms-dashboard" :size="20" />
                <span>{{ $t('desktop.layout') }}</span>
            </div>
            <div class="sidebar-divider"></div>
            <div class="sidebar-item" :class="{ active: activeSection === 'about' }" @click="activeSection = 'about'">
                <sc-icon name="ms-info" :size="20" />
                <span>{{ $t('desktop.about') }}</span>
            </div>
        </div>

        <!-- 右侧内容区 -->
        <div class="settings-content">
            <div class="content-header">
                <h2>{{ sectionTitle }}</h2>
            </div>
            <div class="content-body">
                <el-scrollbar>
                    <!-- 主题设置 -->
                    <div v-if="activeSection === 'appearance'">
                        <div class="settings-card">
                            <h3>{{ $t('desktop.style') }}</h3>
                            <p class="card-desc">{{ $t('desktop.styleDesc') }}</p>
                            <el-radio-group v-model="localConfig.style" @change="onStyleChange">
                                <el-radio-button value="system">
                                    <img src="/public/images/scm.svg"/>
                                    {{ $t('desktop.systemStyle') }}
                                </el-radio-button>
                                <el-radio-button value="windows">
                                    <img src="/public/images/windows.svg"/>
                                    {{ $t('desktop.windowsStyle') }}
                                </el-radio-button>
                                <el-radio-button value="macos">
                                    <img src="/public/images/macos.svg"/>
                                    {{ $t('desktop.macosStyle') }}
                                </el-radio-button>
                            </el-radio-group>
                        </div>

                        <div class="settings-card">
                            <h3>{{ currentStyleName }}</h3>
                            <div class="theme-grid">
                                <div v-for="theme in filteredThemes" :key="theme.name" class="theme-card"
                                    :class="{ active: localConfig.currentTheme === theme.name }"
                                    @click="selectTheme(theme)">
                                    <div class="theme-preview" :style="theme.previewStyle">
                                        <div class="theme-taskbar" :style="{ backgroundColor: theme.taskbarColor }">
                                        </div>
                                    </div>
                                    <span class="theme-label">{{ getThemeName(theme.name) }}</span>
                                    <div v-if="localConfig.currentTheme === theme.name" class="theme-check">
                                        <sc-icon name="ms-check_circle" :size="16" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 个性化设置 -->
                    <div v-if="activeSection === 'personalization'">
                        <div class="settings-card">
                            <h3>{{ $t('desktop.iconColor') }}</h3>
                            <p class="card-desc">{{ $t('desktop.iconColorDesc') }}</p>
                            <el-color-picker v-model="localConfig.iconColor" :predefine="colorList" show-alpha
                                @change="updateConfig" />
                        </div>

                        <div class="settings-card">
                            <h3>{{ $t('desktop.backgroundType') }}</h3>
                            <el-radio-group v-model="localConfig.backgroundType" @change="updateConfig">
                                <el-radio-button value="color">
                                    <sc-icon name="ms-format_color_fill" :size="16" />
                                    {{ $t('desktop.solidColor') }}
                                </el-radio-button>
                                <el-radio-button value="gradient">
                                    <sc-icon name="ms-gradient" :size="16" />
                                    {{ $t('desktop.gradient') }}
                                </el-radio-button>
                                <el-radio-button value="image">
                                    <sc-icon name="ms-image" :size="16" />
                                    {{ $t('desktop.image') }}
                                </el-radio-button>
                            </el-radio-group>
                        </div>

                        <div v-if="localConfig.backgroundType === 'color'" class="settings-card">
                            <h3>{{ $t('desktop.presetColors') }}</h3>
                            <el-color-picker v-model="localConfig.backgroundColor" :predefine="colorList" show-alpha
                                @change="updateConfig" />
                        </div>

                        <div v-if="localConfig.backgroundType === 'gradient'" class="settings-card">
                            <h3>{{ $t('desktop.gradientColors') }}</h3>
                            <div class="gradient-controls">
                                <div class="gradient-item">
                                    <label>{{ $t('desktop.gradientColor1') }}</label>
                                    <el-color-picker v-model="localConfig.gradientColor1" :predefine="colorList"
                                        show-alpha @change="updateConfig" />
                                </div>
                                <div class="gradient-item">
                                    <label>{{ $t('desktop.gradientColor2') }}</label>
                                    <el-color-picker v-model="localConfig.gradientColor2" :predefine="colorList"
                                        show-alpha @change="updateConfig" />
                                </div>
                                <div class="gradient-item">
                                    <label>{{ $t('desktop.gradientDirection') }}</label>
                                    <el-select v-model="localConfig.gradientDirection" @change="updateConfig">
                                        <el-option :label="$t('desktop.leftToRight')" value="to right" />
                                        <el-option :label="$t('desktop.topToBottom')" value="to bottom" />
                                        <el-option :label="$t('desktop.diagonal')" value="to bottom right" />
                                    </el-select>
                                </div>
                            </div>
                        </div>

                        <div v-if="localConfig.backgroundType === 'image'" class="settings-card">
                            <h3>{{ $t('desktop.backgroundImage') }}</h3>
                            <el-input v-model="localConfig.backgroundImage"
                                :placeholder="$t('desktop.imagePlaceholder')" @change="updateConfig" />
                            <div class="preset-images">
                                <div v-for="(img, index) in presetImages" :key="index" class="preset-image"
                                    :class="{ active: localConfig.backgroundImage === img }"
                                    :style="{ backgroundImage: `url(${img})` }" @click="selectImage(img)" />
                            </div>
                        </div>
                    </div>

                    <!-- 布局设置 -->
                    <div v-if="activeSection === 'layout'">
                        <div class="settings-card">
                            <h3>{{ $t('desktop.homeLayout') }}</h3>
                            <p class="card-desc">{{ $t('desktop.homeLayoutDesc') }}</p>
                            <el-select v-model="localConfig.home" @change="updateConfig">
                                <el-option :label="$t('desktop.custom')" value="/" />
                                <el-option :label="$t('desktop.console')" value="/console" />
                                <el-option :label="$t('desktop.cloudDesktop')" value="/desktop" />
                                <el-option :label="$t('desktop.monitor')" value="/monitor" />
                            </el-select>
                        </div>
                    </div>

                    <!-- 关于 -->
                    <div v-if="activeSection === 'about'">
                        <div class="about-card">
                            <div class="about-icon">
                                <sc-icon name="ms-apps" :size="48" />
                            </div>
                            <h2 class="about-title">{{ appInfo.name }}</h2>
                            <p class="about-subtitle">{{ appInfo.slogan }}</p>

                            <div class="about-info">
                                <div class="info-row">
                                    <span class="info-label">{{ $t('desktop.version') }}</span>
                                    <span class="info-value">{{ verInfo.ver_info }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">{{ $t('desktop.build') }}</span>
                                    <span class="info-value">{{ verInfo.ver_code }}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">{{ $t('desktop.buildTime') }}</span>
                                    <span class="info-value">{{ verInfo.ver_date }}</span>
                                </div>
                            </div>

                            <div class="update-section">
                                <div class="update-status">
                                    <sc-icon v-if="updateStatus === 'checking'" name="ms-refresh" :size="20"
                                        class="spin" />
                                    <sc-icon v-else-if="updateStatus === 'downloading'" name="ms-cloud_download" :size="20"
                                        class="spin" />
                                    <sc-icon v-else-if="updateStatus === 'downloaded'" name="ms-check_circle" :size="20"
                                        class="text-success" />
                                    <sc-icon v-else-if="updateStatus === 'upgrading'" name="ms-update" :size="20"
                                        class="spin" />
                                    <sc-icon v-else-if="updateStatus === 'upgraded'" name="ms-check_circle" :size="20"
                                        class="text-success" />
                                    <sc-icon v-else-if="updateStatus === 'latest'" name="ms-check_circle" :size="20"
                                        class="text-success" />
                                    <sc-icon v-else-if="updateStatus === 'available'" name="ms-update" :size="20"
                                        class="text-primary" />
                                    <sc-icon v-else-if="updateStatus === 'error'" name="ms-error" :size="20"
                                        class="text-danger" />
                                    <span>{{ updateMessage }}</span>
                                </div>

                                <div v-if="updateStatus === 'downloading'" class="update-progress">
                                    <el-progress :percentage="downloadProgress" :stroke-width="8" />
                                </div>

                                <div class="update-buttons">
                                    <el-button v-if="updateStatus === 'idle' || updateStatus === 'latest' || updateStatus === 'error'" 
                                        :loading="updateStatus === 'checking'"
                                        type="primary" @click="checkUpdate">
                                        {{ $t('desktop.checkUpdate') }}
                                    </el-button>
                                    <el-button v-if="updateStatus === 'available'" 
                                        type="success" @click="downloadUpdate">
                                        {{ $t('desktop.download') }}
                                    </el-button>
                                    <el-button v-if="updateStatus === 'downloaded'" 
                                        type="warning" @click="upgradeUpdate">
                                        {{ $t('desktop.executeUpdate') }}
                                    </el-button>
                                    <el-button v-if="updateStatus === 'upgraded'" 
                                        type="info" @click="reloadApp">
                                        {{ $t('desktop.restart') }}
                                    </el-button>
                                </div>
                            </div>

                            <div class="about-links">
                                <a href="#" class="about-link" @click.prevent="openWebsite">
                                    <sc-icon name="ms-link" :size="16" />
                                    {{ $t('desktop.officialSite') }}
                                </a>
                                <a href="#" class="about-link" @click.prevent="openHelp">
                                    <sc-icon name="ms-help" :size="16" />
                                    {{ $t('desktop.help') }}
                                </a>
                            </div>
                        </div>
                    </div>
                </el-scrollbar>
            </div>
            <div class="content-footer">
                <el-button type="primary" @click="saveSettings">
                    <sc-icon name="ms-save" :size="16" />
                    {{ $t('desktop.save') }}
                </el-button>
                <el-button @click="resetSettings">
                    <sc-icon name="ms-refresh" :size="16" />
                    {{ $t('desktop.reset') }}
                </el-button>
            </div>
        </div>
    </div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';

export default {
	windowOptions: {
		icon: 'ms-settings',
		width: 900,
		height: 620,
		resizable: true,
	},
    name: 'Settings',
    components: { scIcon },
    props: {
        config: { type: Object, default: () => ({}) },
        themes: { type: Array, default: () => [] },
        colorList: { type: Array, default: () => [] },
        presetImages: { type: Array, default: () => [] },
    },
    emits: ['theme-preview', 'save-settings'],
    data() {
        return {
            activeSection: 'appearance',
            localConfig: this.cloneConfig(this.config),
            appInfo: {},
            verInfo: {},
            updateStatus: 'idle',
            updateMessage: '',
            latestVersion: '',
            downloadProgress: 0,
        };
    },
    computed: {
        sectionTitle() {
            const map = {
                appearance: this.$t('desktop.appearance'),
                personalization: this.$t('desktop.personalSettings'),
                layout: this.$t('desktop.layout'),
                about: this.$t('desktop.about'),
            };
            return map[this.activeSection] || '';
        },
        currentStyleName() {
            const map = {
                system: this.$t('desktop.systemThemes'),
                windows: this.$t('desktop.windowsThemes'),
                macos: this.$t('desktop.macosThemes'),
            };
            return map[this.localConfig.style] || '';
        },
        filteredThemes() {
            return this.themes.filter(theme => theme.style === this.localConfig.style);
        },
    },
    watch: {
        config: {
            handler(val) {
                this.localConfig = this.cloneConfig(val);
            },
            deep: true,
        },
    },
    mounted() {
        this.appInfo = {
            code: this.appCode,
            name: 'Scm.Net',
            slogan: this.$t('desktop.aboutlogan'),
            project: 'Scm.Net',
            website: 'http://www.c-scm.net',
            content: this.$t('desktop.aboutDesc'),
            email: 'contact@cscm.net',
            qchat: '1234567890'
        };
        this.verInfo = {
            major: 1,
            minor: 0,
            patch: 0,
            build: 0,
            ver_info: '1.0.0',
            ver_code: '1.0.0',
            ver_date: '2023-01-01',
            content: ''
        };
    },
    methods: {
        cloneConfig(cfg) {
            return {
                style: cfg.style || 'system',
                currentTheme: cfg.currentTheme || 'default',
                backgroundType: cfg.backgroundType || 'color',
                backgroundColor: cfg.backgroundColor || '#0078d4',
                backgroundImage: cfg.backgroundImage || '',
                gradientColor1: cfg.gradientColor1 || '#667eea',
                gradientColor2: cfg.gradientColor2 || '#764ba2',
                gradientDirection: cfg.gradientDirection || 'to bottom right',
                iconColor: cfg.iconColor || '#ffffff',
                iconShadow: cfg.iconShadow || 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
                iconSize: cfg.iconSize || 48,
                iconBgColor: cfg.iconBgColor || 'transparent',
                iconBgRadius: cfg.iconBgRadius || '0px',
                iconBgSize: cfg.iconBgSize || '0px',
                menuColor: cfg.menuColor || 'rgba(0, 0, 0, 0.9)',
                menuTextColor: cfg.menuTextColor || '#ffffff',
                menuBorderRadius: cfg.menuBorderRadius || '0px',
                menuGlass: cfg.menuGlass || false,
                taskbarColor: cfg.taskbarColor || 'rgba(0, 0, 0, 0.6)',
                taskbarTextColor: cfg.taskbarTextColor || '#ffffff',
                taskbarBorderRadius: cfg.taskbarBorderRadius || '0px',
                taskbarGlass: cfg.taskbarGlass || false,
                taskbarStartIcon: cfg.taskbarStartIcon || 'ms-grid_view',
                startLogo: cfg.startLogo || '',
                windowTheme: cfg.windowTheme || {},
                home: cfg.home || '/',
            };
        },
        getThemeName(name) {
            return this.$t('desktop.theme' + name.charAt(0).toUpperCase() + name.slice(1));
        },
        selectTheme(theme) {
            this.localConfig.currentTheme = theme.name;
            this.localConfig.backgroundType = theme.backgroundType;
            this.localConfig.taskbarColor = theme.taskbarColor;
            this.localConfig.taskbarTextColor = theme.taskbarTextColor || '#ffffff';
            this.localConfig.taskbarBorderRadius = theme.taskbarBorderRadius || '0px';
            this.localConfig.taskbarGlass = theme.taskbarGlass || false;
            this.localConfig.taskbarStartIcon = theme.taskbarStartIcon || 'ms-grid_view';
            this.localConfig.startLogo = theme.startLogo || '';
            this.localConfig.menuColor = theme.menuColor || 'rgba(0, 0, 0, 0.9)';
            this.localConfig.menuTextColor = theme.menuTextColor || '#ffffff';
            this.localConfig.menuBorderRadius = theme.menuBorderRadius || '0px';
            this.localConfig.menuGlass = theme.menuGlass || false;
            this.localConfig.iconColor = theme.iconColor || '#ffffff';
            this.localConfig.iconShadow = theme.iconShadow || 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))';
            this.localConfig.iconSize = theme.iconSize || 48;
            this.localConfig.iconBgColor = theme.iconBgColor || 'transparent';
            this.localConfig.iconBgRadius = theme.iconBgRadius || '0px';
            this.localConfig.iconBgSize = theme.iconBgSize || '0px';
            this.localConfig.windowTheme = theme.windowTheme || {};

            if (theme.backgroundType === 'color') {
                this.localConfig.backgroundColor = theme.backgroundColor;
            } else if (theme.backgroundType === 'gradient') {
                this.localConfig.gradientColor1 = theme.gradientColor1;
                this.localConfig.gradientColor2 = theme.gradientColor2;
                this.localConfig.gradientDirection = theme.gradientDirection;
            } else if (theme.backgroundType === 'image') {
                this.localConfig.backgroundImage = theme.backgroundImage;
            }

            this.$emit('theme-preview', { ...this.localConfig });
        },
        onStyleChange() {
            // const firstTheme = this.filteredThemes[0];
            // if (firstTheme) {
            //     this.selectTheme(firstTheme);
            // }
        },
        selectImage(img) {
            this.localConfig.backgroundImage = img;
            this.updateConfig();
        },
        updateConfig() {
            this.$emit('theme-preview', { ...this.localConfig });
        },
        saveSettings() {
            this.$emit('save-settings', { ...this.localConfig });
            this.$message.success(this.$t('desktop.saveSuccess'));
        },
        resetSettings() {
            this.localConfig = this.cloneConfig(this.config);
            this.updateConfig();
            this.$message.info(this.$t('desktop.resetSuccess'));
        },
        async checkUpdate() {
            this.updateStatus = 'checking';
            this.updateMessage = this.$t('desktop.checkingUpdate');

            try {
                const res = await this.$API.scmsysupgrade.check.get();
                if (res.code === 200 && res.data) {
                    var newInfo = res.data;
                    this.latestVersion = newInfo.ver_info || '';
                    if (newInfo.build > this.verInfo.build) {
                        this.updateStatus = 'available';
                        this.updateMessage = this.$t('desktop.updateAvailable', { version: this.latestVersion });
                    } else {
                        this.updateStatus = 'latest';
                        this.updateMessage = this.$t('desktop.upToDate');
                    }
                } else {
                    this.updateStatus = 'error';
                    this.updateMessage = this.$t('desktop.checkFailed');
                }
            } catch (error) {
                this.$LOG.error('检查更新失败', error);
                this.updateStatus = 'error';
                this.updateMessage = this.$t('desktop.checkFailed');
            }
        },
        async downloadUpdate() {
            // this.updateStatus = 'downloading';
            // this.updateMessage = this.$t('desktop.downloading');
            // this.downloadProgress = 0;

            // const progressInterval = setInterval(() => {
            //     if (this.downloadProgress < 95) {
            //         this.downloadProgress += Math.random() * 15;
            //         if (this.downloadProgress > 95) this.downloadProgress = 95;
            //     }
            // }, 300);

            // try {
            //     const res = await this.$API.scmsysupgrade.download.get(this.latestVersion);
            //     clearInterval(progressInterval);
            //     this.downloadProgress = 100;
                
            //     if (res.code === 200 && res.data) {
            //         this.updateStatus = 'downloaded';
            //         this.updateMessage = this.$t('desktop.downloadComplete');
            //     } else {
            //         this.updateStatus = 'error';
            //         this.updateMessage = this.$t('desktop.downloadFailed');
            //     }
            // } catch (error) {
            //     clearInterval(progressInterval);
            //     console.error('下载失败:', error);
            //     this.updateStatus = 'error';
            //     this.updateMessage = this.$t('desktop.downloadFailed');
            // }
            window.open('https://www.c-scm.net/download', '_blank');
        },
        async upgradeUpdate() {
            this.updateStatus = 'upgrading';
            this.updateMessage = this.$t('desktop.upgrading');

            try {
                const res = await this.$API.scmsysupgrade.upgrade.get(this.latestVersion);
                if (res.code === 200 && res.data) {
                    this.updateStatus = 'upgraded';
                    this.updateMessage = this.$t('desktop.upgradeComplete');
                } else {
                    this.updateStatus = 'error';
                    this.updateMessage = this.$t('desktop.upgradeFailed');
                }
            } catch (error) {
                this.$LOG.error('升级失败', error);
                this.updateStatus = 'error';
                this.updateMessage = this.$t('desktop.upgradeFailed');
            }
        },
        reloadApp() {
            this.$message.success(this.$t('desktop.restarting'));
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        },
        openWebsite() {
            window.open('http://www.c-scm.net', '_blank');
        },
        openHelp() {
            window.open('https://gitee.com/leadiot/scm.net', '_blank');
        },
    },
};
</script>

<style scoped>
.settings-app {
    height: 100%;
    display: flex;
    background-color: #f3f3f3;
    color: #1a1a1a;
}

/* 左侧导航 */
.settings-sidebar {
    width: 240px;
    background-color: rgba(243, 243, 243, 0.95);
    border-right: 1px solid #e5e5e5;
    padding: 12px 8px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex-shrink: 0;
}

.sidebar-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    color: #1a1a1a;
    transition: background-color 0.15s;
    user-select: none;
}

.sidebar-item:hover {
    background-color: rgba(0, 0, 0, 0.04);
}

.sidebar-item.active {
    background-color: rgba(0, 0, 0, 0.06);
}

.sidebar-item.active::before {
    content: '';
    position: absolute;
    left: 4px;
    width: 3px;
    height: 16px;
    background-color: #0078d4;
    border-radius: 2px;
}

.sidebar-item {
    position: relative;
}

.sidebar-divider {
    height: 1px;
    background-color: rgba(0, 0, 0, 0.08);
    margin: 8px 16px;
}

/* 右侧内容 */
.settings-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: #f9f9f9;
}

.content-header {
    padding: 24px 32px 0;
}

.content-header h2 {
    font-size: 28px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0;
}

.content-body {
    flex: 1;
    overflow: hidden;
    padding: 16px 32px 24px;
}

.content-footer {
    padding: 16px 32px;
    background-color: #f3f3f3;
    border-top: 1px solid #e5e5e5;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

/* 设置卡片 */
.settings-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px 24px;
    margin-bottom: 12px;
    border: 1px solid #e5e5e5;
}

.settings-card h3 {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 12px 0;
}

.card-desc {
    font-size: 12px;
    color: #666;
    margin: 0 0 12px 0;
}

/* 主题网格 */
.theme-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
}

.theme-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: 10px;
    border-radius: 8px;
    border: 2px solid transparent;
    transition: all 0.2s;
    position: relative;
}

.theme-card:hover {
    background-color: rgba(0, 0, 0, 0.03);
}

.theme-card.active {
    border-color: #0078d4;
    background-color: rgba(0, 120, 212, 0.04);
}

.theme-preview {
    width: 100%;
    height: 56px;
    border-radius: 6px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}

.theme-taskbar {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 10px;
}

.theme-label {
    margin-top: 8px;
    font-size: 12px;
    color: #444;
}

.theme-check {
    position: absolute;
    top: 14px;
    right: 14px;
    color: #0078d4;
    background: #fff;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* 渐变控制 */
.gradient-controls {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.gradient-item {
    display: flex;
    align-items: center;
    gap: 12px;
}

.gradient-item label {
    font-size: 13px;
    color: #444;
    min-width: 80px;
}

/* 预设图片 */
.preset-images {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-top: 12px;
}

.preset-image {
    width: 100%;
    height: 72px;
    background-size: cover;
    background-position: center;
    border-radius: 6px;
    cursor: pointer;
    border: 2px solid transparent;
    transition: border-color 0.2s;
}

.preset-image:hover {
    border-color: #0078d4;
}

.preset-image.active {
    border-color: #0078d4;
    box-shadow: 0 0 0 2px rgba(0, 120, 212, 0.2);
}

/* 响应式 */
@media screen and (max-width: 768px) {
    .settings-sidebar {
        width: 56px;
        padding: 12px 4px;
    }

    .sidebar-item span {
        display: none;
    }

    .sidebar-item {
        justify-content: center;
        padding: 10px;
    }

    .content-header {
        padding: 16px 20px 0;
    }

    .content-header h2 {
        font-size: 22px;
    }

    .content-body {
        padding: 12px 20px 20px;
    }

    .theme-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

.about-card {
    background: #fff;
    border-radius: 12px;
    padding: 32px;
    text-align: center;
    max-width: 480px;
    margin: 0px auto;
    border: 1px solid #e5e5e5;
}

.about-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-light-2) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    color: #fff;
}

.about-title {
    font-size: 24px;
    font-weight: 600;
    color: #1a1a1a;
    margin: 0 0 8px;
}

.about-subtitle {
    font-size: 14px;
    color: #666;
    margin: 0 0 24px;
}

.about-info {
    background-color: #f8f9fa;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 24px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #e9ecef;
}

.info-row:last-child {
    border-bottom: none;
}

.info-label {
    font-size: 13px;
    color: #666;
}

.info-value {
    font-size: 13px;
    font-weight: 500;
    color: #1a1a1a;
}

.update-section {
    margin-bottom: 24px;
}

.update-status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    color: #666;
    margin-bottom: 16px;
}

.update-status .text-success {
    color: var(--el-color-success);
}

.update-status .text-primary {
    color: var(--el-color-primary);
}

.update-status .text-danger {
    color: var(--el-color-danger);
}

.update-status .spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

.update-progress {
    margin-bottom: 16px;
    width: 100%;
}

.update-buttons {
    display: flex;
    justify-content: center;
    gap: 12px;
}

.about-links {
    display: flex;
    justify-content: center;
    gap: 24px;
}

.about-link {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--el-color-primary);
    text-decoration: none;
    transition: opacity 0.2s;
}

.about-link:hover {
    opacity: 0.7;
}

@media screen and (max-width: 768px) {
    .about-card {
        margin: 20px auto;
        padding: 24px 16px;
    }

    .about-title {
        font-size: 20px;
    }
}
</style>
