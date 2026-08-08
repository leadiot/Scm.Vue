/**
 * 颜色工具类
 *
 * 对外两种使用方式：
 *   1) 默认对象导出：import colorTool from '@/utils/color' —— 旧代码全部兼容
 *   2) 具名函数导出：import { getLuminance, getOnPrimaryColor, darken, lighten } from '@/utils/color'
 *      便于 Pinia store / theme.js 等场景按需复用，无需 this 绑定。
 */

/* ========================================================================== */
/*                              内部辅助                                       */
/* ========================================================================== */

/**
 * HEX → [r, g, b]（十进制 0-255）
 * @param {string} str 如 "#409eff" 或 "409eff"
 * @returns {[number,number,number]}
 */
export function HexToRgb(str) {
	str = (str || '').replace('#', '')
	var hxs = str.match(/.{2}/g) || ['00', '00', '00']
	for (var i = 0; i < 3; i++) hxs[i] = parseInt(hxs[i], 16) || 0
	return hxs
}

/**
 * RGB → HEX
 * @param {number} a red 0-255
 * @param {number} b green 0-255
 * @param {number} c blue 0-255
 * @returns {string} "#rrggbb"
 */
export function RgbToHex(a, b, c) {
	var hexs = [a.toString(16), b.toString(16), c.toString(16)]
	for (var i = 0; i < 3; i++) {
		if (hexs[i].length === 1) hexs[i] = '0' + hexs[i]
	}
	return '#' + hexs.join('')
}

/**
 * 加深颜色
 * @param {string} color HEX
 * @param {number} level 0 ~ 1
 */
export function darken(color, level) {
	var rgbc = HexToRgb(color)
	for (var i = 0; i < 3; i++) rgbc[i] = Math.floor(rgbc[i] * (1 - level))
	return RgbToHex(rgbc[0], rgbc[1], rgbc[2])
}

/**
 * 变浅颜色
 * @param {string} color HEX
 * @param {number} level 0 ~ 1
 */
export function lighten(color, level) {
	var rgbc = HexToRgb(color)
	for (var i = 0; i < 3; i++) rgbc[i] = Math.floor((255 - rgbc[i]) * level + rgbc[i])
	return RgbToHex(rgbc[0], rgbc[1], rgbc[2])
}

/* ========================================================================== */
/*                     可复用：明度 / onPrimary 计算                          */
/* ========================================================================== */

/**
 * sRGB 相对亮度（0 ~ 1）—— 用于判断主色是深色还是浅色
 * 参考 WCAG 2.1 luminance 公式
 */
export function getLuminance(hexColor) {
	const hex = (hexColor || '').replace('#', '')
	if (hex.length !== 6) return 0
	const r = parseInt(hex.substr(0, 2), 16) / 255
	const g = parseInt(hex.substr(2, 2), 16) / 255
	const b = parseInt(hex.substr(4, 2), 16) / 255
	return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * 根据主色 + 是否 Dark Mode，计算主色上的文字颜色（onPrimary）
 * @param {string} primaryColor HEX
 * @param {boolean} isDarkMode 是否 Dark Mode
 * @returns {string} HEX 颜色值
 */
export function getOnPrimaryColor(primaryColor, isDarkMode) {
	// Dark 模式：统一用浅色文字
	if (isDarkMode) return '#d9ecff'
	// Light 模式：主色明度高（浅色主色）→ 用深色文字；反之 → 白色
	return getLuminance(primaryColor) > 0.5
		? darken(primaryColor, 0.2)
		: '#ffffff'
}

/* ========================================================================== */
/*                         默认对象导出（保持旧代码兼容）                      */
/* ========================================================================== */

export default {
	HexToRgb,
	RgbToHex,
	darken,
	lighten,
	getLuminance,
	getOnPrimaryColor,
}
