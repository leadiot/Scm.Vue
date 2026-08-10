/**
 * loadJS 异步加载远程JS
 * @param {string} src - 必填，需要加载的URL路径
 * @param {string} keyName - 必填，唯一key和JS返回的全局对象名
 * @param {string} [callbackName] - 非必填，如果远程JS有callback，则可更有效的判断是否完成加载
 * @param {Object} [options] - 非必填，加载选项
 * @param {boolean} [options.force=false] - 强制重新加载：移除已存在的标签和旧全局变量
 * @param {boolean} [options.cacheBust=false] - 给URL追加时间戳参数，绕过浏览器HTTP缓存
 * @param {number} [options.timeout=10000] - 超时时间（毫秒）
 * @returns {Promise<any>} resolve 返回 window[keyName]
 */
// 进行中的 Promise 缓存，防止并发重复加载同一资源
const loadingCache = new Map();

// 给 URL 追加时间戳参数，绕过浏览器缓存
function appendCacheBust(src) {
	const sep = src.includes('?') ? '&' : '?';
	return `${src}${sep}_=${Date.now()}`;
}

export function loadJS(src, keyName, callbackName, options = {}) {
	const { force = false, cacheBust = false, timeout = 10000 } = options;

	// 强制重载：移除旧标签、清除旧全局变量、清除缓存
	if (force) {
		const existing = document.head.querySelector(`script[loadKey="${keyName}"]`);
		if (existing && existing.parentNode) {
			existing.parentNode.removeChild(existing);
		}
		// 清除旧的全局变量，避免 resolve 到旧数据
		try {
			delete window[keyName];
		} catch {
			window[keyName] = undefined;
		}
		loadingCache.delete(keyName);
	}

	// 已在加载中：复用同一个 Promise，避免并发创建多个 script 标签
	if (loadingCache.has(keyName)) {
		return loadingCache.get(keyName);
	}

	const promise = new Promise((resolve, reject) => {
		// 命中已加载过的标签：直接返回全局变量
		const has = document.head.querySelector(`script[loadKey="${keyName}"]`);
		if (has) {
			return resolve(window[keyName]);
		}

		const finalSrc = cacheBust ? appendCacheBust(src) : src;

		const script = document.createElement("script");
		script.async = true;
		script.src = finalSrc;
		script.setAttribute("loadKey", keyName);

		// 超时定时器
		const timeoutId = setTimeout(() => {
			cleanup();
			reject(new Error(`loadJS timeout: ${src}`));
		}, timeout);

		const cleanup = () => {
			clearTimeout(timeoutId);
			script.onload = null;
			script.onerror = null;
			loadingCache.delete(keyName);
		};

		script.onload = () => {
			cleanup();
			// onload 触发时脚本已执行完毕，window[keyName] 应已就绪
			// setTimeout 50ms 兜底处理脚本内部异步赋值的边缘情况
			setTimeout(() => resolve(window[keyName]), 50);
		};

		script.onerror = () => {
			cleanup();
			// 移除失败的 script 标签，允许后续重试
			if (script.parentNode) {
				script.parentNode.removeChild(script);
			}
			reject(new Error(`loadJS failed: ${src}`));
		};

		// callback 模式：必须在 script 插入 DOM 之前注册回调
		// 这样远程JS执行时调用 window[callbackName]() 才能命中
		if (callbackName) {
			window[callbackName] = () => {
				cleanup();
				resolve(window[keyName]);
			};
		}

		document.head.appendChild(script);
	});

	loadingCache.set(keyName, promise);
	return promise;
}

/**
 * loadCSS 异步加载远程css
 * @param {string} src - 必填，需要加载的URL路径
 * @param {string} keyName - 必填，唯一key
 * @param {Object} [options] - 非必填，加载选项
 * @param {boolean} [options.force=false] - 强制重新加载：移除已存在的标签
 * @param {boolean} [options.cacheBust=false] - 给URL追加时间戳参数，绕过浏览器HTTP缓存
 * @param {number} [options.timeout=10000] - 超时时间（毫秒）
 * @returns {Promise<void>}
 */
export function loadCSS(src, keyName, options = {}) {
	const { force = false, cacheBust = false, timeout = 10000 } = options;

	// 强制重载：移除旧标签、清除缓存
	if (force) {
		const existing = document.head.querySelector(`link[loadKey="${keyName}"]`);
		if (existing && existing.parentNode) {
			existing.parentNode.removeChild(existing);
		}
		loadingCache.delete(keyName);
	}

	// 已在加载中：复用同一个 Promise
	if (loadingCache.has(keyName)) {
		return loadingCache.get(keyName);
	}

	const promise = new Promise((resolve, reject) => {
		const has = document.head.querySelector(`link[loadKey="${keyName}"]`);
		if (has) {
			return resolve();
		}

		const finalSrc = cacheBust ? appendCacheBust(src) : src;

		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = finalSrc;
		link.setAttribute("loadKey", keyName);

		const timeoutId = setTimeout(() => {
			cleanup();
			reject(new Error(`loadCSS timeout: ${src}`));
		}, timeout);

		const cleanup = () => {
			clearTimeout(timeoutId);
			link.onload = null;
			link.onerror = null;
			loadingCache.delete(keyName);
		};

		link.onload = () => {
			cleanup();
			resolve();
		};

		link.onerror = () => {
			cleanup();
			if (link.parentNode) {
				link.parentNode.removeChild(link);
			}
			reject(new Error(`loadCSS failed: ${src}`));
		};

		document.head.appendChild(link);
	});

	loadingCache.set(keyName, promise);
	return promise;
}
