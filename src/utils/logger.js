/**
 * 前端统一日志/异常通道
 *
 * 在方案 A 基础上增加：
 *   - 环形缓冲区（ring buffer）：内存留存最近 N 条日志，供面板实时查看
 *   - 发布订阅（pub/sub）：面板订阅后实时推送新日志条目
 *   - 日志上报（report）：error 级别自动批量上报后端，也支持手动触发
 *   - 日志导出（export）：导出缓冲区日志为 JSON 文件
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
 *   - report：是否自动上报 error 级日志到后端
 *   - 生产环境默认 level='error', notify=true, report=true
 *   - 开发默认 level='debug', notify=false, report=false
 *   - 配置可通过 applyConfig() 动态更新，支持 Pinia 持久化（globalStore APP_SETTINGS）
 */

import { ElNotification } from 'element-plus'
// request.js 会反向静态导入 logger，但 logger 仅在上报时才调用 http（非模块初始化期），循环引用安全
import http from '@/utils/request'

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 }
const DEFAULT_CONFIG = {
	level: import.meta.env.PROD ? 'error' : 'debug',
	notify: import.meta.env.PROD,
	report: import.meta.env.PROD,
	console: true,
}

let config = { ...DEFAULT_CONFIG }

/* ======= 环形缓冲区 ======= */
const BUFFER_SIZE = 500
const buffer = []
let bufferSeq = 0

/* ======= 发布订阅 ======= */
const subscribers = new Set()

function emit(entry) {
	// 写入缓冲区
	if (buffer.length >= BUFFER_SIZE) buffer.shift()
	buffer.push(entry)
	// 通知订阅者
	subscribers.forEach(fn => {
		try { fn(entry) } catch { /* 订阅者异常不影响主流程 */ }
	})
}

function subscribe(fn) {
	subscribers.add(fn)
	return () => subscribers.delete(fn)
}

function getEntries() {
	return [...buffer]
}

function clearEntries() {
	buffer.length = 0
}

/* ======= 上报机制 ======= */
const REPORT_ENDPOINT = '/api/scmlogfe/report'
const REPORT_BATCH_SIZE = 10
const REPORT_DEBOUNCE_MS = 5000
let reportQueue = []
let reportTimer = null

function flushReport() {
	if (reportTimer) {
		clearTimeout(reportTimer)
		reportTimer = null
	}
	if (reportQueue.length === 0) return
	const batch = reportQueue.splice(0)
	http.post(REPORT_ENDPOINT, { logs: batch }).catch(() => {
		// 上报失败静默丢弃，避免无限递归
	})
}

function scheduleReport() {
	if (reportTimer) return
	reportTimer = setTimeout(flushReport, REPORT_DEBOUNCE_MS)
}

function enqueueReport(entry) {
	if (!config.report) return
	reportQueue.push({
		time: new Date(entry.time).getTime(),
		level: entry.level,
		category: entry.category,
		message: entry.message,
		stack: entry.stack || '',
		url: entry.url || '',
	})
	if (reportQueue.length >= REPORT_BATCH_SIZE) {
		flushReport()
	} else {
		scheduleReport()
	}
}

/* ======= 核心日志构建 ======= */
function buildEntry(level, category, args) {
	const entry = {
		id: ++bufferSeq,
		time: new Date().toISOString(),
		level,
		category,
		message: '',
		data: null,
		stack: '',
		url: typeof location !== 'undefined' ? location.pathname : '',
	}
	const hasError = args.some(a => a && a.stack)
	if (hasError) {
		const err = args.find(a => a && a.stack)
		entry.message = err.message || String(err)
		entry.stack = stackTrim(err.stack, 10)
		entry.data = args.filter(a => a !== err).map(formatArg)
	} else {
		entry.message = args.map(formatArg).join(' ')
	}
	return entry
}

function formatArg(a) {
	if (a == null) return String(a)
	if (typeof a === 'string') return a
	if (typeof a === 'number' || typeof a === 'boolean') return String(a)
	if (a instanceof Error) return a.message || String(a)
	try { return JSON.stringify(a) } catch { return String(a) }
}

function stackTrim(stack, maxLines = 8) {
	if (!stack) return ''
	return stack.split('\n').slice(0, maxLines).join('\n')
}

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

/* ======= 日志分发核心 ======= */
function dispatch(level, category, args, opts = {}) {
	if (!shouldLog(level)) return
	const entry = buildEntry(level, category, args)
	doConsole(level, args)
	if (opts.notify !== false) {
		const title = opts.notifyTitle || (level === 'error' ? '系统错误' : '系统提醒')
		const msg = entry.stack ? `${entry.message}\n${stackTrim(entry.stack, 5)}` : entry.message
		doNotify(level, title, msg)
	}
	emit(entry)
	// error 级自动入上报队列
	if (level === 'error') enqueueReport(entry)
}

const logger = {
	/* ------- 分级通用日志 ------- */
	debug(...args) {
		dispatch('debug', 'app', args, { notify: false })
	},
	info(...args) {
		dispatch('info', 'app', args, { notify: false })
	},
	warn(...args) {
		dispatch('warn', 'app', args)
	},
	error(...args) {
		dispatch('error', 'app', args)
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
		dispatch('error', 'code', [errorName, error], {
			notifyTitle: errorName,
			notify: !!(vm && typeof vm.$nextTick === 'function'),
		})
	},

	/* ------- HTTP 请求错误（axios 拦截器委托）-------
	 * 返回值：{ handled: boolean } — 标识 是否已弹 401 登出弹窗，拦截器可据此决定是否跳额外逻辑
	 */
	httpError(error) {
		const result = { handled: false }
		if (!error || !error.response) {
			// 无响应（网络断开/超时）
			if (shouldLog('error')) {
				dispatch('error', 'http', ['HTTP 请求无响应', error && error.message || ''], {
					notifyTitle: '请求错误',
				})
			}
			return result
		}
		const status = error.response.status
		const msg = error.response.data && error.response.data.message
		if (status === 401) {
			// 401 特殊：由 request.js 原有的登出弹窗处理，这里只记日志
			if (shouldLog('warn')) {
				dispatch('warn', 'http', [`HTTP 401 未授权，将引导重新登录`, msg || ''], { notify: false })
			}
			result.handled = true
			return result
		}
		if (!shouldLog('error')) return result
		let detail = msg || `Status:${status}，未知错误`
		if (status === 404) {
			detail = 'Status:404，正在请求不存在的服务器记录！'
		} else if (status === 500) {
			detail = msg || 'Status:500，服务器发生错误！'
		}
		dispatch('error', 'http', [`HTTP ${status}`, detail, error], {
			notifyTitle: '请求错误',
		})
		return result
	},

	/* ------- 业务级错误（HTTP 200 但 code != 200 等）------- */
	bizError(code, message, extra) {
		if (!shouldLog('warn')) return
		dispatch('warn', 'biz', [`业务错误 code=${code}`, message, extra || ''], {
			notifyTitle: `业务提示 (${code})`,
		})
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
	setReport(on) {
		this.applyConfig({ report: !!on })
	},

	/* ------- 缓冲区 & 订阅（供面板使用）------- */
	subscribe,
	getEntries,
	clearEntries,

	/* ------- 上报 ------- */
	reportNow() {
		flushReport()
	},
	reportAll() {
		// 将整个缓冲区一次性上报
		const batch = buffer.map(e => ({
			time: new Date(e.time).getTime(),
			level: e.level,
			category: e.category,
			message: e.message,
			stack: e.stack || '',
			url: e.url || '',
		}))
		if (batch.length === 0) return
		http.post(REPORT_ENDPOINT, { logs: batch }).catch(() => {})
	},

	/* ------- 导出 ------- */
	exportLogs() {
		const data = {
			exportedAt: new Date().toISOString(),
			config: { ...config },
			entries: getEntries(),
		}
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `scm-logs-${Date.now()}.json`
		a.click()
		URL.revokeObjectURL(url)
	},

	/* ------- 全局 window 错误监听（只注册一次）------- */
	registerGlobalHandlers() {
		if (typeof window === 'undefined' || logger._registered) return
		logger._registered = true
		const onError = (msg, url, line, col, err) => {
			if (!shouldLog('error')) return
			dispatch('error', 'global', [`${msg}\nat ${url}:${line}:${col}`, err], {
				notifyTitle: '运行时错误',
			})
		}
		const onRejection = (ev) => {
			if (!shouldLog('error')) return
			let reason = ev && ev.reason
			if (reason && reason.status) return // axios 错误已由 httpError 处理
			dispatch('error', 'global', ['unhandledrejection', reason || '(no reason)'], {
				notifyTitle: '未处理的异步异常',
			})
		}
		window.addEventListener('error', onError)
		window.addEventListener('unhandledrejection', onRejection)
	},
}

export default logger
