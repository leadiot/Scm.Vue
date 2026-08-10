import { defineStore } from 'pinia'
import config from "@/config"
import tool from "@/utils/tool"
import { darken, getOnPrimaryColor } from "@/utils/color"
import scm from "@/utils/scm"
import logger from "@/utils/logger"

/**
 * 个性化配置统一持久化键（使用 localStorage，跨会话保留）
 * - STORAGE_KEY：大 JSON（语言 / 主题名 / 模式 / 颜色 / 布局等）
 * - STORAGE_KEY_CUSTOM_THEMES：自定义主题数组（体积较大，独立保存）
 *
 * 事实源优先级：后端 scmsysconfig（app_* 键）> 本地 localStorage 缓存 > config 默认值。
 * 登录时由 theme.js.applyServerConfig() 拉取后端配置写入 store 并持久化到此；
 * 未登录 / 离线时用本地缓存兜底。
 */
export const STORAGE_KEY = "APP_SETTINGS"
export const STORAGE_KEY_CUSTOM_THEMES = "APP_CUSTOM_THEMES"

/** 从 localStorage 读取所有个性化配置，与默认值合并 */
function loadPersistent(defaults) {
	try {
		const raw = tool.local.get(STORAGE_KEY)
		if (!raw) return { ...defaults }
		const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
		return { ...defaults, ...parsed }
	} catch (e) {
		logger.warn('[globalStore] 读取持久化配置失败，使用默认值:', e)
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
			themeMode: 'auto',  // 颜色模式：auto（跟随系统）/ light / dark
			systemDark: false,  // 系统是否偏好深色（运行时，不持久化）
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
			// 日志通道（@/utils/logger 消费，生产默认 error+通知+上报，开发默认 debug+不通知+不上报）
			logLevel: import.meta.env.PROD ? 'error' : 'debug',
			logNotify: import.meta.env.PROD ? true : false,
			logReport: import.meta.env.PROD ? true : false,
			// 自定义主题（独立持久化）
			customThemes: [],
		}
		const fromStorage = loadPersistent(defaults)
		try {
			const raw = tool.local.get(STORAGE_KEY_CUSTOM_THEMES)
			if (raw) fromStorage.customThemes = typeof raw === 'string' ? JSON.parse(raw) : raw
		} catch (e) {
			logger.warn('[globalStore] 读取自定义主题失败:', e)
		}
		return fromStorage
	},
	getters: {
		isDarkMode: (s) => s.themeMode === 'dark' || (s.themeMode === 'auto' && s.systemDark),
		/** 当前生效的完整主题对象：预设主题命中则返回原配置，否则用当前颜色合成自定义主题 */
		currentTheme: (s) => {
			const presetAndCustom = [...(config.PREDEFINE_THEMES || []), ...s.customThemes]
			const matched = s.themeName && presetAndCustom.find(t => t.name === s.themeName)
			if (matched) return matched
			return {
				name: '自定义',
				primary: s.primaryColor,
				secondary: s.secondaryColor,
				onPrimary: s.onPrimary || getOnPrimaryColor(s.primaryColor, s.themeMode === 'dark' || (s.themeMode === 'auto' && s.systemDark)),
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
			tool.local.set(STORAGE_KEY, toSave)
		},
		_saveCustomThemes() {
			tool.local.set(STORAGE_KEY_CUSTOM_THEMES, this.customThemes)
		},
		/**
		 * 将单项配置同步到后端 scmsysconfig（fire-and-forget，不阻塞状态更新）。
		 * - 仅在已登录（存在 TOKEN）时提交；未登录的本地切换（如登录页）只持久化到 localStorage。
		 * - 失败仅告警，不影响本地状态与持久化。
		 * 集中收口：所有个性化配置的后端提交都走这里，页面无需直接调 $SCM.save_cfg。
		 */
		_syncToServer(key, value) {
			if (value === undefined || value === null || value === '') return
			if (!tool.session.get("TOKEN")) return
			scm.save_cfg([{ key, value }]).catch(e => {
				console.warn(`[globalStore] 同步后端失败 (${key}):`, e)
			})
		},

		// ---------- 布局类 ----------
		SET_locale(value) {
			this.locale = value
			this._persist()
			this._syncToServer('app_lang', value)
		},
		SET_ismobile(value) {
			this.ismobile = value
			// ismobile：纯运行时状态，不持久化
		},
		SET_home(value) {
			this.home = value
			this._persist()
			this._syncToServer('app_home', value)
		},
		SET_layout(value) {
			this.layout = value
			this._persist()
			this._syncToServer('app_layout', value)
		},
		SET_consoleLayout(value) {
			this.consoleLayout = value
			this._persist()
			this._syncToServer('app_console_layout', value)
		},
		SET_menuIsCollapse(value) {
			this.menuIsCollapse = !!value
			this._persist()
			this._syncToServer('app_menu_is_collapse', this.menuIsCollapse)
		},
		TOGGLE_menuIsCollapse() {
			this.menuIsCollapse = !this.menuIsCollapse
			this._persist()
			this._syncToServer('app_menu_is_collapse', this.menuIsCollapse)
		},
		SET_layoutTags(value) {
			this.layoutTags = !!value
			this._persist()
			this._syncToServer('app_layout_tags', this.layoutTags)
		},
		TOGGLE_layoutTags() {
			this.layoutTags = !this.layoutTags
			this._persist()
			this._syncToServer('app_layout_tags', this.layoutTags)
		},

		// ---------- 日志通道 ----------
		SET_logLevel(level) {
			const valid = ['debug', 'info', 'warn', 'error', 'silent'].includes(level) ? level : (import.meta.env.PROD ? 'error' : 'debug')
			this.logLevel = valid
			logger.setLevel(valid)
			this._persist()
			this._syncToServer('app_log_level', valid)
		},
		SET_logNotify(on) {
			this.logNotify = !!on
			logger.setNotify(!!on)
			this._persist()
			this._syncToServer('app_log_notify', on ? 'true' : 'false')
		},
		TOGGLE_logNotify() {
			this.SET_logNotify(!this.logNotify)
		},
		SET_logReport(on) {
			this.logReport = !!on
			logger.setReport(!!on)
			this._persist()
			this._syncToServer('app_log_report', on ? 'true' : 'false')
		},
		TOGGLE_logReport() {
			this.SET_logReport(!this.logReport)
		},

		// ---------- 主题模式 ----------
		SET_themeMode(mode) {
			const valid = ['auto', 'light', 'dark'].includes(mode) ? mode : 'auto'
			this.themeMode = valid
			this.onPrimary = getOnPrimaryColor(this.primaryColor, this.isDarkMode)
			this._persist()
			this._syncToServer('app_theme_mode', valid)
		},
		TOGGLE_themeMode() {
			this.SET_themeMode(this.isDarkMode ? 'light' : 'dark')
		},
		// 系统深色偏好变化（运行时状态，不持久化 / 不同步后端）
		SET_systemDark(val) {
			this.systemDark = !!val
			// auto 模式下系统偏好变化 → onPrimary 跟随重算
			if (this.themeMode === 'auto') {
				this.onPrimary = getOnPrimaryColor(this.primaryColor, this.isDarkMode)
			}
		},

		// ---------- 颜色 ----------
		SET_primaryColor(color, onPrimary) {
			if (!color) return
			this.primaryColor = color
			this.onPrimary = onPrimary || getOnPrimaryColor(color, this.themeMode === 'dark')
			this._persist()
			this._syncToServer('app_color', color)
		},
		SET_secondaryColor(color, onSecondary) {
			if (!color) return
			this.secondaryColor = color
			if (onSecondary) this.onSecondary = onSecondary
			this._persist()
			this._syncToServer('app_color_secondary', this.onSecondary)
		},
		SET_accentColor(color) {
			if (!color) return
			this.accentColor = color
			this._persist()
			this._syncToServer('app_color_accent', color)
		},

		// ---------- 主题应用 ----------
		// persistServer：是否同步后端。用户切换主题传 true（默认）；
		// 只读场景（initTheme / applyServerConfig 从后端加载）传 false 避免回写。
		APPLY_theme(theme, persistServer = true) {
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
			if (persistServer) this._syncToServer('app_theme_name', theme.name)
		},
		SET_themeName(name) {
			this.themeName = name || ''
			this._persist()
			this._syncToServer('app_theme_name', name)
		},

		// ---------- 后端配置同步（后端 scmsysconfig 为单一事实源）----------
		/**
		 * 将后端 scmsysconfig 返回的 [{key, value}] 列表应用到 store 并持久化。
		 * 仅处理用户级 app_* 键，其余键忽略。纯状态变更，不直接操作 DOM
		 * （DOM 副作用由 theme.js.initTheme() 统一处理）。
		 * key 统一小写下划线风格：app_lang / app_theme_mode / app_color / app_theme_name / app_home
		 */
		APPLY_serverConfig(items) {
			if (!Array.isArray(items)) return
			const map = {}
			items.forEach(it => { if (it && it.key) map[it.key] = it.value })

			// 主题名命中预设 / 自定义主题 → 完整应用（含 primary 等颜色）；否则仅记录主色
			const allThemes = [...(config.PREDEFINE_THEMES || []), ...this.customThemes]
			let appliedTheme = null
			if (map.app_theme_name) {
				appliedTheme = allThemes.find(t => t.name === map.app_theme_name)
			}
			if (appliedTheme) {
				this.APPLY_theme(appliedTheme, false)  // 从后端加载，不再回写后端
			} else {
				if (map.app_color) this.primaryColor = map.app_color
				if (map.app_color_secondary) this.secondaryColor = map.app_color_secondary
				if (map.app_color_accent) this.accentColor = map.app_color_accent
				if (map.app_theme_name) this.themeName = map.app_theme_name
			}
			if (map.app_theme_mode) {
				const m = map.app_theme_mode
				this.themeMode = ['auto', 'light', 'dark'].includes(m) ? m : 'auto'
			}
			if (map.app_lang) this.locale = map.app_lang
			if (map.app_home) this.home = map.app_home
			if (map.app_layout) this.layout = map.app_layout
			if (map.app_console_layout) this.consoleLayout = map.app_console_layout
			if (map.app_menu_is_collapse) this.menuIsCollapse = map.app_menu_is_collapse === 'true'
			if (map.app_layout_tags) this.layoutTags = map.app_layout_tags === 'true'
			if (map.app_log_level) this.logLevel = map.app_log_level
			if (map.app_log_notify) this.logNotify = map.app_log_notify === 'true'
			if (map.app_log_report) this.logReport = map.app_log_report === 'true'

			// 模式 / 主色变更后重算 onPrimary
			this.onPrimary = getOnPrimaryColor(this.primaryColor, this.themeMode === 'dark')
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
