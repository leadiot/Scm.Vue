/**
 * 主题工具类 - 参考 Android Theme 管理
 * 
 * 功能:
 * 1. 主色调及其变体的动态生成（Primary light/dark 系列）
 * 2. 辅色调设置
 * 3. Light/Dark 模式切换
 * 4. 预设主题应用
 */

import colorTool from './color'
import tool from './tool'
import config from '@/config'

// 存储键名
const STORAGE_KEYS = {
	THEME_NAME: 'APP_THEME_NAME',
	THEME_MODE: 'APP_THEME_MODE',
	PRIMARY_COLOR: 'APP_COLOR',
	SECONDARY_COLOR: 'APP_COLOR_SECONDARY',
	CUSTOM_THEMES: 'APP_CUSTOM_THEMES',
	CURRENT_THEME: 'APP_CURRENT_THEME'
}

/**
 * 计算颜色的相对亮度（0-1）
 * 用于判断主色调是深色还是浅色
 */
function getLuminance(hexColor) {
	const hex = hexColor.replace('#', '')
	const r = parseInt(hex.substr(0, 2), 16) / 255
	const g = parseInt(hex.substr(2, 2), 16) / 255
	const b = parseInt(hex.substr(4, 2), 16) / 255
	// 使用 sRGB luminance 公式
	return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * 根据主色调明度计算合适的文字颜色
 * @param {string} primaryColor - 主色调 HEX 值
 * @param {boolean} isDarkMode - 是否为深色模式
 * @returns {string} - 文字颜色 HEX 值
 */
function getOnPrimaryColor(primaryColor, isDarkMode) {
	const luminance = getLuminance(primaryColor)
	// Dark 模式：始终使用浅色文字
	if (isDarkMode) {
		return '#d9ecff'
	}
	// Light 模式：根据主色调明度判断
	// 明度 > 0.5 的主色调（浅色）使用深色文字
	// 明度 <= 0.5 的主色调（深色）使用浅色文字
	if (luminance > 0.5) {
		// 浅色主色调（如默认蓝#409eff），使用主色调深色变体
		return colorTool.darken(primaryColor, 0.2)
	} else {
		// 深色主色调（如暗夜黑#1f1f1f），使用白色
		return '#ffffff'
	}
}

/**
 * 设置主色调及其所有变体
 * @param {string} color - 主色调 HEX 值
 */
export function setPrimaryColor(color, onPrimary) {
	const root = document.documentElement

	// 设置主色调
	root.style.setProperty('--color-primary', color)
	root.style.setProperty('--el-color-primary', color)

	// 生成 light 系列 (1-9)
	for (let i = 1; i <= 9; i++) {
		const lightColor = colorTool.lighten(color, i / 10)
		root.style.setProperty(`--color-primary-light-${i}`, lightColor)
		root.style.setProperty(`--el-color-primary-light-${i}`, lightColor)
	}

	// 生成 dark 系列 (1-5)
	for (let i = 1; i <= 5; i++) {
		const darkColor = colorTool.darken(color, i / 10)
		root.style.setProperty(`--color-primary-dark-${i}`, darkColor)
		if (i <= 2) {
			root.style.setProperty(`--el-color-primary-dark-${i}`, darkColor)
		}
	}

	// 根据主色调明度和当前模式动态设置文字颜色
	if (!onPrimary) {
		// const isDarkMode = root.classList.contains('dark')
		// onPrimary = getOnPrimaryColor(color, isDarkMode)
		onPrimary = '#ffffff';
	}
	root.style.setProperty('--color-on-primary', onPrimary)

	// 保存到本地存储
	tool.session.set(STORAGE_KEYS.PRIMARY_COLOR, color)
}

/**
 * 设置辅色调及其变体
 * @param {string} color - 辅色调 HEX 值
 */
export function setSecondaryColor(color, onSecondary) {
	const root = document.documentElement

	// 设置辅色调
	root.style.setProperty('--color-secondary', color)

	// 生成 light 系列
	for (let i = 1; i <= 9; i++) {
		const lightColor = colorTool.lighten(color, i / 10)
		root.style.setProperty(`--color-secondary-light-${i}`, lightColor)
	}

	// 生成 dark 系列
	for (let i = 1; i <= 5; i++) {
		const darkColor = colorTool.darken(color, i / 10)
		root.style.setProperty(`--color-secondary-dark-${i}`, darkColor)
	}

	// 保存到本地存储
	tool.session.set(STORAGE_KEYS.SECONDARY_COLOR, color)
}

/**
 * 设置强调色
 * @param {string} color - 强调色 HEX 值
 */
export function setAccentColor(color) {
	document.documentElement.style.setProperty('--color-accent', color)
}

/**
 * 切换主题模式 (Light/Dark)
 * @param {boolean} isDark - 是否为深色模式
 */
export function setDarkMode(isDark) {
	const root = document.documentElement

	if (isDark) {
		root.classList.add('dark')
		root.setAttribute('data-theme', 'dark')
		tool.session.set(STORAGE_KEYS.THEME_MODE, 'dark')
	} else {
		root.classList.remove('dark')
		root.setAttribute('data-theme', 'light')
		tool.session.remove(STORAGE_KEYS.THEME_MODE)
	}

	// 切换模式后重新计算文字颜色
	const currentPrimary = tool.session.get(STORAGE_KEYS.PRIMARY_COLOR) || '#409eff'
	const onPrimaryColor = getOnPrimaryColor(currentPrimary, isDark)
	root.style.setProperty('--color-on-primary', onPrimaryColor)
}

/**
 * 应用预设主题
 * @param {Object} theme - 预设主题配置
 */
export function applyTheme(theme) {
	const root = document.documentElement

	// 设置主色调
	setPrimaryColor(theme.primary, theme.onPrimary)

	// 设置辅色调
	if (theme.secondary) {
		setSecondaryColor(theme.secondary, theme.onSecondary)
	}

	// 设置强调色
	if (theme.accent) {
		setAccentColor(theme.accent)
	}

	// 设置背景色和表面色
	if (theme.background) {
		root.style.setProperty('--color-background', theme.background)
	}

	// 设置表面色
	if (theme.surface) {
		root.style.setProperty('--color-surface', theme.surface)
	}

	// 记录当前主题名称
	tool.session.set(STORAGE_KEYS.THEME_NAME, theme.name)
}

/**
 * 获取当前主题配置
 * @returns {Object} 当前主题配置
 */
export function getCurrentTheme() {
	const savedName = tool.session.get(STORAGE_KEYS.THEME_NAME) || config.THEME || '默认';

	var themes = getAllThemes();
	var matchedTheme = themes.find(t => t.name === savedName);
	if (matchedTheme) {
		return matchedTheme;
	}

	const savedColor = tool.session.get(STORAGE_KEYS.PRIMARY_COLOR) || config.COLOR || '#409eff';
	return {
		name: '自定义',
		primary: savedColor,
		secondary: tool.session.get(STORAGE_KEYS.SECONDARY_COLOR) || '#909399',
		gradient: `linear-gradient(135deg, ${colorTool.lighten(savedColor, 0.3)} 0%, ${savedColor} 100%)`
	}
}

/**
 * 判断是否为深色模式
 * @returns {boolean}
 */
export function isDarkMode() {
	return document.documentElement.classList.contains('dark') ||
		document.documentElement.getAttribute('data-theme') === 'dark'
}

/**
 * 初始化主题 - 从本地存储恢复
 */
export function initTheme() {
	const name = tool.session.get(STORAGE_KEYS.THEME_NAME);
	const theme = getTheme(name) || getCurrentTheme();
	applyTheme(theme);

	// 主题模式
	const mode = tool.session.get(STORAGE_KEYS.THEME_MODE);
	setDarkMode(mode === 'dark')
}

export function getTheme(themeName) {
	return config.PREDEFINE_THEMES.find(t => t.name === themeName);
}

/**
 * 获取所有预设主题
 * @returns {Array}
 */
export function getPresetThemes() {
	return config.PREDEFINE_THEMES
}

/**
 * 获取自定义主题列表
 * @returns {Array}
 */
export function getCustomThemes() {
	const customThemes = tool.session.get(STORAGE_KEYS.CUSTOM_THEMES)
	return customThemes ? JSON.parse(customThemes) : []
}

/**
 * 保存自定义主题
 * @param {Object} theme - 自定义主题配置
 * @returns {boolean} 是否保存成功
 */
export function saveCustomTheme(theme) {
	try {
		const customThemes = getCustomThemes()
		// 检查是否已存在同名主题
		const existingIndex = customThemes.findIndex(t => t.name === theme.name)
		if (existingIndex >= 0) {
			// 更新现有主题
			customThemes[existingIndex] = { ...theme, isCustom: true }
		} else {
			// 添加新主题
			customThemes.push({ ...theme, isCustom: true })
		}
		tool.session.set(STORAGE_KEYS.CUSTOM_THEMES, JSON.stringify(customThemes))
		return true
	} catch (error) {
		console.error('保存自定义主题失败:', error)
		return false
	}
}

/**
 * 删除自定义主题
 * @param {string} themeName - 主题名称
 * @returns {boolean} 是否删除成功
 */
export function deleteCustomTheme(themeName) {
	try {
		const customThemes = getCustomThemes()
		const filteredThemes = customThemes.filter(t => t.name !== themeName)
		tool.session.set(STORAGE_KEYS.CUSTOM_THEMES, JSON.stringify(filteredThemes))
		return true
	} catch (error) {
		console.error('删除自定义主题失败:', error)
		return false
	}
}

/**
 * 获取所有主题（预设 + 自定义）
 * @returns {Array}
 */
export function getAllThemes() {
	const customThemes = getCustomThemes()
	return [...config.PREDEFINE_THEMES, ...customThemes]
}

/**
 * 创建自定义主题
 * @param {Object} themeConfig - 主题配置
 * @returns {Object} 创建的主题对象
 */
export function createCustomTheme(themeConfig) {
	const theme = {
		name: themeConfig.name || '自定义主题',
		primary: themeConfig.primary || '#409eff',
		secondary: themeConfig.secondary || '#909399',
		accent: themeConfig.accent || '#722ed1',
		surface: themeConfig.surface || '#ffffff',
		background: themeConfig.background || '#f5f7fa',
		error: themeConfig.error || '#f56c6c',
		onPrimary: themeConfig.onPrimary || '#ffffff',
		onSecondary: themeConfig.onSecondary || '#ffffff',
		gradient: themeConfig.gradient || `linear-gradient(135deg, ${themeConfig.primary || '#409eff'} 0%, ${colorTool.darken(themeConfig.primary || '#409eff', 0.2)} 100%)`,
		description: themeConfig.description || '用户自定义主题',
		isCustom: true
	}
	return theme
}

// 默认导出
export default {
	setPrimaryColor,
	setSecondaryColor,
	setAccentColor,
	setDarkMode,
	applyTheme,
	getCurrentTheme,
	isDarkMode,
	initTheme,
	getPresetThemes,
	getCustomThemes,
	saveCustomTheme,
	deleteCustomTheme,
	getAllThemes,
	createCustomTheme
}