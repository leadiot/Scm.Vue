/**
 * 主题工具类（DOM 层适配）
 *
 * 职责：
 *   1. DOM 副作用：写 CSS 变量、切换 HTML class/data-theme
 *   2. 状态 & 持久化：全部委托给 stores/global.js（单一事实源）
 *   3. 对外兼容老函数签名，setting.vue / desktop/index.vue 等老调用方无感
 */

import { darken, lighten, getLuminance, getOnPrimaryColor } from './color'
import config from '@/config'
import { useGlobalStore } from '@/stores/global'

/* -------------------------------------------------------------------------- */
/*                              对外：颜色写入 DOM                              */
/* -------------------------------------------------------------------------- */

/**
 * 写入主色调及其所有变体（直接写 root style）
 * @param {string} color 主色 HEX
 * @param {string} [onPrimary] 主色上的文字色；未传则默认 #ffffff
 */
export function setPrimaryColor(color, onPrimary) {
	const root = document.documentElement
	if (!color) return

	root.style.setProperty('--color-primary', color)
	root.style.setProperty('--el-color-primary', color)

	for (let i = 1; i <= 9; i++) {
		const lightColor = lighten(color, i / 10)
		root.style.setProperty(`--color-primary-light-${i}`, lightColor)
		root.style.setProperty(`--el-color-primary-light-${i}`, lightColor)
	}
	for (let i = 1; i <= 5; i++) {
		const darkColor = darken(color, i / 10)
		root.style.setProperty(`--color-primary-dark-${i}`, darkColor)
		if (i <= 2) root.style.setProperty(`--el-color-primary-dark-${i}`, darkColor)
	}

	root.style.setProperty('--color-on-primary', onPrimary || '#ffffff')
}

/** 写入辅色调及其 light/dark 变体 */
export function setSecondaryColor(color /*, onSecondary*/) {
	const root = document.documentElement
	if (!color) return
	root.style.setProperty('--color-secondary', color)
	for (let i = 1; i <= 9; i++) {
		root.style.setProperty(`--color-secondary-light-${i}`, lighten(color, i / 10))
	}
	for (let i = 1; i <= 5; i++) {
		root.style.setProperty(`--color-secondary-dark-${i}`, darken(color, i / 10))
	}
}

/** 写入强调色 */
export function setAccentColor(color) {
	if (color) document.documentElement.style.setProperty('--color-accent', color)
}

/* -------------------------------------------------------------------------- */
/*                              对外：Light/Dark 模式                          */
/* -------------------------------------------------------------------------- */

/**
 * 切换 Light/Dark 模式：改 HTML class + data-theme + 同步 globalStore（自动持久化）
 */
export function setDarkMode(isDark) {
	const store = useGlobalStore()
	const root = document.documentElement

	isDark = !!isDark
	if (isDark) {
		root.classList.add('dark')
		root.setAttribute('data-theme', 'dark')
	} else {
		root.classList.remove('dark')
		root.setAttribute('data-theme', 'light')
	}

	store.SET_themeMode(isDark ? 'dark' : 'light')
}

/* -------------------------------------------------------------------------- */
/*                              对外：应用完整主题                              */
/* -------------------------------------------------------------------------- */

/** 应用主题对象：DOM 写入 + store 状态更新（会自动持久化） */
export function applyTheme(theme) {
	if (!theme) return
	const store = useGlobalStore()
	const root = document.documentElement

	setPrimaryColor(theme.primary, theme.onPrimary)
	if (theme.secondary) setSecondaryColor(theme.secondary, theme.onSecondary)
	if (theme.accent) setAccentColor(theme.accent)
	if (theme.background) root.style.setProperty('--color-background', theme.background)
	if (theme.surface) root.style.setProperty('--color-surface', theme.surface)

	store.APPLY_theme(theme)
}

/* -------------------------------------------------------------------------- */
/*                              对外：查询 & 初始化                            */
/* -------------------------------------------------------------------------- */

export function getCurrentTheme() {
	return useGlobalStore().currentTheme
}

export function isDarkMode() {
	return document.documentElement.classList.contains('dark') ||
		document.documentElement.getAttribute('data-theme') === 'dark'
}

/**
 * 初始化主题（在 App.vue setup() 中调用一次，Pinia 就绪后）
 * 顺序：先写 HTML dark class → 再写主题 CSS 变量（保证 onPrimary 不会被通用算法覆盖）
 */
export function initTheme() {
	const store = useGlobalStore()
	const root = document.documentElement

	const isDark = store.isDarkMode
	if (isDark) {
		root.classList.add('dark')
		root.setAttribute('data-theme', 'dark')
	} else {
		root.classList.remove('dark')
		root.setAttribute('data-theme', 'light')
	}

	applyTheme(store.currentTheme)
}

/** 预设主题查找（兼容老调用方） */
export function getTheme(themeName) {
	return config.PREDEFINE_THEMES.find(t => t.name === themeName)
}
export function getPresetThemes() {
	return config.PREDEFINE_THEMES
}

/* -------------------------------------------------------------------------- */
/*                         对外：自定义主题增删查（委托 store）                 */
/* -------------------------------------------------------------------------- */

export function getCustomThemes() {
	return useGlobalStore().customThemes
}
export function saveCustomTheme(theme) {
	return useGlobalStore().SAVE_customTheme(theme)
}
export function deleteCustomTheme(name) {
	return useGlobalStore().DELETE_customTheme(name)
}
export function getAllThemes() {
	const store = useGlobalStore()
	return [...(config.PREDEFINE_THEMES || []), ...store.customThemes]
}

/**
 * 按标准结构创建一个自定义主题对象
 */
export function createCustomTheme(themeConfig) {
	if (!themeConfig) return null
	const primary = themeConfig.primary || '#409eff'
	return {
		name: themeConfig.name || '自定义主题',
		primary: primary,
		secondary: themeConfig.secondary || '#909399',
		accent: themeConfig.accent || '#722ed1',
		surface: themeConfig.surface || '#ffffff',
		background: themeConfig.background || '#f5f7fa',
		error: themeConfig.error || '#f56c6c',
		onPrimary: themeConfig.onPrimary || '#ffffff',
		onSecondary: themeConfig.onSecondary || '#ffffff',
		gradient: themeConfig.gradient || `linear-gradient(135deg, ${primary} 0%, ${darken(primary, 0.2)} 100%)`,
		description: themeConfig.description || '',
		isCustom: true,
	}
}

/* -------------------------------------------------------------------------- */
/*                              兼容：老 default import                        */
/* -------------------------------------------------------------------------- */

export default {
	setPrimaryColor,
	setSecondaryColor,
	setAccentColor,
	setDarkMode,
	applyTheme,
	getCurrentTheme,
	isDarkMode,
	initTheme,
	getTheme,
	getPresetThemes,
	getCustomThemes,
	saveCustomTheme,
	deleteCustomTheme,
	getAllThemes,
	createCustomTheme,
	getLuminance,
	getOnPrimaryColor,
}
