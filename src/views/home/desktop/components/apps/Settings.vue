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
            <div class="sidebar-item" :class="{ active: activeSection === 'layout' }"
                @click="activeSection = 'layout'">
                <sc-icon name="ms-dashboard" :size="20" />
                <span>{{ $t('desktop.layout') }}</span>
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
                            <h3>{{ $t('desktop.presetThemes') }}</h3>
                            <div class="theme-grid">
                                <div v-for="theme in themes" :key="theme.name" class="theme-card"
                                    :class="{ active: localConfig.currentTheme === theme.name }"
                                    @click="selectTheme(theme)">
                                    <div class="theme-preview" :style="theme.previewStyle">
                                        <div class="theme-taskbar"
                                            :style="{ backgroundColor: theme.taskbarColor }"></div>
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
                </el-scrollbar>
            </div>
        </div>
    </div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';

export default {
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
        };
    },
    computed: {
        sectionTitle() {
            const map = {
                appearance: this.$t('desktop.appearance'),
                personalization: this.$t('desktop.personalSettings'),
                layout: this.$t('desktop.layout'),
            };
            return map[this.activeSection] || '';
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
    methods: {
        cloneConfig(cfg) {
            return {
                currentTheme: cfg.currentTheme || 'default',
                backgroundType: cfg.backgroundType || 'color',
                backgroundColor: cfg.backgroundColor || '#0078d4',
                backgroundImage: cfg.backgroundImage || '',
                gradientColor1: cfg.gradientColor1 || '#667eea',
                gradientColor2: cfg.gradientColor2 || '#764ba2',
                gradientDirection: cfg.gradientDirection || 'to bottom right',
                iconColor: cfg.iconColor || '#ffffff',
                menuColor: cfg.menuColor || 'rgba(0, 0, 0, 0.9)',
                menuTextColor: cfg.menuTextColor || '#ffffff',
                taskbarColor: cfg.taskbarColor || 'rgba(0, 0, 0, 0.6)',
                taskbarTextColor: cfg.taskbarTextColor || '#ffffff',
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
            this.localConfig.menuColor = theme.menuColor || 'rgba(0, 0, 0, 0.9)';
            this.localConfig.menuTextColor = theme.menuTextColor || '#ffffff';
            this.localConfig.iconColor = theme.iconColor || '#ffffff';
            this.localConfig.windowTheme = theme.windowTheme || {};

            if (theme.backgroundType === 'color') {
                this.localConfig.backgroundColor = theme.backgroundColor;
            } else if (theme.backgroundType === 'gradient') {
                this.localConfig.gradientColor1 = theme.gradientColor1;
                this.localConfig.gradientColor2 = theme.gradientColor2;
                this.localConfig.gradientDirection = theme.gradientDirection;
            }

            this.$emit('theme-preview', { ...this.localConfig });
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
</style>
