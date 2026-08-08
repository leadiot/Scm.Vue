import { defineStore } from 'pinia'
import config from "@/config"
import tool from "@/utils/tool"
import { darken, getOnPrimaryColor } from "@/utils/color"

/**
 * 个性化配置统一持久化键
 * - STORAGE_KEY：大 JSON（语言 / 主题名 / 模式 / 颜色 / 布局等）
 * - STORAGE_KEY_CUSTOM_THEMES：自定义主题数组（体积较大，独立保存）
 */
export const STORAGE_KEY = "APP_SETTINGS"
export const STORAGE_KEY_CUSTOM_THEMES = "APP_CUSTOM_THEMES"

/** 从持久化读取所有个性化配置，与默认值合并 */
function loadPersistent(defaults) {
	try {
		const raw = tool.session.get(STORAGE_KEY)
		if (!raw) return { ...defaults }
		const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
		return { ...defaults, ...parsed }
	} catch (e) {
		console.warn('[globalStore] 读取持久化配置失败，使用默认值:', e)
		return { ...defaults }
	}
}

export const useGlobalStore = defineStore('global', {
	state: () => {
		const defaults = {
			locale: config.LANG,
			ismobile: false,
			home: config.HOME,
			layout: config.LAYOUT,
			consoleLayout: config.CONSOLE_LAYOUT,
			// 主题相关
			themeName: config.THEME || '',
			themeMode: 'light',
			primaryColor: config.COLOR || '#409eff',
			secondaryColor: '#909399',
			onPrimary: '#ffffff',
			onSecondary: '#ffffff',
			accentColor: '#722ed1',
			surfaceColor: '#ffffff',
			backgroundColor: '#f5f7fa',
			errorColor: '#f56c6c',
			gradient: `linear-gradient(135deg, ${config.COLOR || '#409eff'} 0%, ${darken(config.COLOR || '#409eff', 0.2)} 100%)`,
			// 布局相关
			menuIsCollapse: config.MENU_IS_COLLAPSE,
			layoutTags: config.LAYOUT_TAGS,
			// 自定义主题（独立持久化）
			customThemes: [],
		}
		const fromStorage = loadPersistent(defaults)
		try {
			const raw = tool.session.get(STORAGE_KEY_CUSTOM_THEMES)
			if (raw) fromStorage.customThemes = typeof raw === 'string' ? JSON.parse(raw) : raw
		} catch (e) {
			console.warn('[globalStore] 读取自定义主题失败:', e)
		}
		return fromStorage
	},
	getters: {
		isDarkMode: (s) => s.themeMode === 'dark',
		/** 当前生效的完整主题对象：预设主题命中则返回原配置，否则用当前颜色合成自定义主题 */
		currentTheme: (s) => {
			const presetAndCustom = [...(config.PREDEFINE_THEMES || []), ...s.customThemes]
			const matched = s.themeName && presetAndCustom.find(t => t.name === s.themeName)
			if (matched) return matched
			return {
				name: '自定义',
				primary: s.primaryColor,
				secondary: s.secondaryColor,
				onPrimary: s.onPrimary || getOnPrimaryColor(s.primaryColor, s.themeMode === 'dark'),
				onSecondary: s.onSecondary || '#ffffff',
				accent: s.accentColor,
				surface: s.surfaceColor,
				background: s.backgroundColor,
				error: s.errorColor,
				gradient: s.gradient,
				isCustom: true,
			}
		},
	},
	actions: {
		_persist() {
			const { ismobile, customThemes, ...toSave } = { ...this.$state }
			void ismobile
			void customThemes
			tool.session.set(STORAGE_KEY, toSave)
		},
		_saveCustomThemes() {
			tool.session.set(STORAGE_KEY_CUSTOM_THEMES, this.customThemes)
		},

		// ---------- 布局类 ----------
		SET_locale(value) {
			this.locale = value
			this._persist()
		},
		SET_ismobile(value) {
			this.ismobile = value
			// ismobile：纯运行时状态，不持久化
		},
		SET_home(value) {
			this.home = value
			this._persist()
		},
		SET_layout(value) {
			this.layout = value
			this._persist()
		},
		SET_consoleLayout(value) {
			this.consoleLayout = value
			this._persist()
		},
		SET_menuIsCollapse(value) {
			this.menuIsCollapse = !!value
			this._persist()
		},
		TOGGLE_menuIsCollapse() {
			this.menuIsCollapse = !this.menuIsCollapse
			this._persist()
		},
		SET_layoutTags(value) {
			this.layoutTags = !!value
			this._persist()
		},
		TOGGLE_layoutTags() {
			this.layoutTags = !this.layoutTags
			this._persist()
		},

		// ---------- 主题模式 ----------
		SET_themeMode(mode) {
			this.themeMode = mode === 'dark' ? 'dark' : 'light'
			this.onPrimary = getOnPrimaryColor(this.primaryColor, this.themeMode === 'dark')
			this._persist()
		},
		TOGGLE_themeMode() {
			this.SET_themeMode(this.themeMode === 'dark' ? 'light' : 'dark')
		},

		// ---------- 颜色 ----------
		SET_primaryColor(color, onPrimary) {
			if (!color) return
			this.primaryColor = color
			this.onPrimary = onPrimary || getOnPrimaryColor(color, this.themeMode === 'dark')
			this._persist()
		},
		SET_secondaryColor(color, onSecondary) {
			if (!color) return
			this.secondaryColor = color
			if (onSecondary) this.onSecondary = onSecondary
			this._persist()
		},
		SET_accentColor(color) {
			if (!color) return
			this.accentColor = color
			this._persist()
		},

		// ---------- 主题应用 ----------
		APPLY_theme(theme) {
			if (!theme) return
			this.themeName = theme.name || ''
			if (theme.primary) this.primaryColor = theme.primary
			this.onPrimary = theme.onPrimary || getOnPrimaryColor(this.primaryColor, this.themeMode === 'dark')
			if (theme.secondary) this.secondaryColor = theme.secondary
			if (theme.onSecondary) this.onSecondary = theme.onSecondary
			if (theme.accent) this.accentColor = theme.accent
			if (theme.surface) this.surfaceColor = theme.surface
			if (theme.background) this.backgroundColor = theme.background
			if (theme.error) this.errorColor = theme.error
			if (theme.gradient) this.gradient = theme.gradient
			this._persist()
		},
		SET_themeName(name) {
			this.themeName = name || ''
			this._persist()
		},

		// ---------- 自定义主题管理 ----------
		SAVE_customTheme(theme) {
			const idx = this.customThemes.findIndex(t => t.name === theme.name)
			if (idx >= 0) this.customThemes.splice(idx, 1, theme)
			else this.customThemes.push(theme)
			this._saveCustomThemes()
			return true
		},
		DELETE_customTheme(name) {
			const idx = this.customThemes.findIndex(t => t.name === name)
			if (idx < 0) return false
			this.customThemes.splice(idx, 1)
			this._saveCustomThemes()
			return true
		},
	},
})
