/**
 * 前端统一日志/异常通道（方案 A 最小侵入版）
 *
 * 覆盖范围：
 *   1. Vue 代码错误（codeError）    — 通过 errorHandler.js 委托
 *   2. HTTP 请求错误（httpError）   — 通过 request.js 拦截器委托
 *   3. 全局 JS 运行时错误           — registerGlobalHandlers() 注册 window.onerror
 *   4. Promise 未捕获 reject        — registerGlobalHandlers() 注册 unhandledrejection
 *   5. 通用分级日志 debug/info/warn/error
 *
 * 输出开关：
 *   - level：'debug' | 'info' | 'warn' | 'error' | 'silent'
 *   - notify：是否同时弹 ElNotification（warn/error 级别）
 *   - 生产环境默认 level='error', notify=true；开发默认 level='debug', notify=false 只打日志
 *   - 配置可通过 applyConfig() 动态更新，支持 Pinia 持久化（globalStore APP_SETTINGS）
 */

import { ElNotification } from 'element-plus'

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 }
const DEFAULT_CONFIG = {
	level: import.meta.env.PROD ? 'error' : 'debug',
	notify: import.meta.env.PROD,
	console: true,
}

let config = { ...DEFAULT_CONFIG }

function shouldLog(level) {
	return LEVELS[level] >= LEVELS[config.level]
}

function doConsole(level, args) {
	if (!config.console) return
	const fn = level === 'debug' ? console.debug :
		level === 'info' ? console.info :
		level === 'warn' ? console.warn : console.error
	fn.call(console, `[C-SCM ${level.toUpperCase()}]`, ...args)
}

function doNotify(level, title, message) {
	if (!config.notify) return
	if (level !== 'warn' && level !== 'error') return
	try {
		ElNotification[level === 'error' ? 'error' : 'warning']({
			title: title || (level === 'error' ? '系统错误' : '系统提醒'),
			message: String(message || '').slice(0, 300),
			dangerouslyUseHTMLString: false,
		})
	} catch { /* 极端情况（SSR/preInit）保护 */ }
}

function stackTrim(stack, maxLines = 8) {
	if (!stack) return ''
	return stack.split('\n').slice(0, maxLines).join('\n')
}

const logger = {
	/* ------- 分级通用日志 ------- */
	debug(...args) {
		if (!shouldLog('debug')) return
		doConsole('debug', args)
	},
	info(...args) {
		if (!shouldLog('info')) return
		doConsole('info', args)
	},
	warn(...args) {
		if (!shouldLog('warn')) return
		doConsole('warn', args)
		doNotify('warn', '系统提醒', args.map(a => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' '))
	},
	error(...args) {
		if (!shouldLog('error')) return
		doConsole('error', args)
		doNotify('error', '系统错误', args.map(a => (a && a.stack) ? `${a.message || a}\n${stackTrim(a.stack)}` : String(a)).join(' '))
	},

	/* ------- 代码错误（Vue errorHandler 委托）------- */
	codeError(error, vm) {
		if (error && error.status) return // HTTP 错误已由 httpError 处理
		if (!shouldLog('error')) return
		const errorMap = {
			InternalError: 'Javascript引擎内部错误',
			ReferenceError: '未找到对象',
			TypeError: '使用了错误的类型或对象',
			RangeError: '使用内置对象时参数超范围',
			SyntaxError: '语法错误',
			EvalError: '错误的使用了Eval',
			URIError: 'URI错误',
		}
		const errorName = errorMap[error && error.name] || '未知错误'
		doConsole('error', [errorName, error])
		if (config.notify && vm && typeof vm.$nextTick === 'function') {
			vm.$nextTick(() => doNotify('error', errorName, error && error.message ? `${error.message}\n${stackTrim(error.stack, 5)}` : String(error)))
		}
	},

	/* ------- HTTP 请求错误（axios 拦截器委托）-------
	 * 返回值：{ handled: boolean } — 标识 是否已弹 401 登出弹窗，拦截器可据此决定是否跳额外逻辑
	 */
	httpError(error) {
		const result = { handled: false }
		if (!error || !error.response) {
			// 无响应（网络断开/超时）
			if (shouldLog('error')) {
				doConsole('error', ['HTTP 请求无响应', error && error.message || ''])
				doNotify('error', '请求错误', '请求服务器无响应，请检查网络连接或稍后重试')
			}
			return result
		}
		const status = error.response.status
		const msg = error.response.data && error.response.data.message
		if (status === 401) {
			// 401 特殊：由 request.js 原有的登出弹窗处理，这里只记日志
			if (shouldLog('warn')) doConsole('warn', [`HTTP 401 未授权，将引导重新登录`, msg || ''])
			result.handled = true
			return result
		}
		if (!shouldLog('error')) return result
		let title = '请求错误'
		let detail = msg || `Status:${status}，未知错误`
		if (status === 404) {
			detail = 'Status:404，正在请求不存在的服务器记录！'
		} else if (status === 500) {
			detail = msg || 'Status:500，服务器发生错误！'
		}
		doConsole('error', [`HTTP ${status}`, detail, error])
		doNotify('error', title, detail)
		return result
	},

	/* ------- 业务级错误（HTTP 200 但 code != 200 等）------- */
	bizError(code, message, extra) {
		if (!shouldLog('warn')) return
		doConsole('warn', [`业务错误 code=${code}`, message, extra || ''])
		doNotify('warn', `业务提示 (${code})`, message)
	},

	/* ------- 运行时配置 ------- */
	applyConfig(patch) {
		if (!patch) return
		const next = { ...config, ...patch }
		if (next.level && !LEVELS.hasOwnProperty(next.level)) {
			next.level = DEFAULT_CONFIG.level
		}
		config = next
	},
	getConfig() {
		return { ...config }
	},
	setLevel(level) {
		this.applyConfig({ level })
	},
	setNotify(on) {
		this.applyConfig({ notify: !!on })
	},

	/* ------- 全局 window 错误监听（只注册一次）------- */
	registerGlobalHandlers() {
		if (typeof window === 'undefined' || logger._registered) return
		logger._registered = true
		const onError = (msg, url, line, col, err) => {
			if (!shouldLog('error')) return
			const text = `${msg}\nat ${url}:${line}:${col}${err && err.stack ? '\n' + stackTrim(err.stack, 5) : ''}`
			doConsole('error', ['window.onerror', text])
			doNotify('error', '运行时错误', text)
		}
		const onRejection = (ev) => {
			if (!shouldLog('error')) return
			let reason = ev && ev.reason
			let desc
			if (reason && reason.status) return // axios 错误已由 httpError 处理
			if (reason && typeof reason === 'object') {
				desc = reason.message ? `${reason.message}\n${stackTrim(reason.stack, 5)}` : JSON.stringify(reason)
			} else {
				desc = String(reason || '(no reason)')
			}
			doConsole('error', ['unhandledrejection', desc])
			doNotify('error', '未处理的异步异常', desc)
		}
		window.addEventListener('error', onError)
		window.addEventListener('unhandledrejection', onRejection)
	},
}

export default logger
