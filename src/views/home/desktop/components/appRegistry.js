import { defineAsyncComponent, markRaw } from 'vue';

// 模块级：视图组件映射表（构建期一次性求值，避免每个窗口/调用方重复调用 import.meta.glob）
const viewModules = import.meta.glob('@/views/**/*.vue');
// 已解析的异步组件缓存（跨窗口共享，非响应式）
const componentCache = new Map();
// 已预加载的模块缓存（openApp 读取 windowOptions 用）
const moduleCache = new Map();

/**
 * 根据 component 名查找视图模块的原始路径（匹配到第一个就返回）
 */
function findModulePath(componentName) {
	const directPaths = [`@/views/${componentName}.vue`, `@/views/${componentName}/index.vue`];
	for (const p of directPaths) {
		if (viewModules[p]) return p;
	}
	const keys = Object.keys(viewModules);
	for (const key of keys) {
		if (key.endsWith(`/${componentName}.vue`) || key.endsWith(`/${componentName}/index.vue`)) {
			return key;
		}
	}
	return null;
}

/**
 * 默认窗口属性（组件未声明 windowOptions 时的兜底）
 */
const DEFAULT_WIN_OPTIONS = {
	icon: null,
	width: 800,
	height: 600,
	resizable: true,
	minimizable: true,
	closable: true,
	maximizable: true,
	center: true,
	minWidth: 300,
	minHeight: 200,
	maxWidth: null,
	maxHeight: null,
};

function mergeOptions(opts) {
	return { ...DEFAULT_WIN_OPTIONS, ...(opts || {}) };
}

/**
 * 预加载指定 component 对应的模块（返回其 default 导出对象）
 * 用来在打开窗口前读取组件自身声明的 windowOptions
 */
export async function preloadComponentModule(componentName) {
	const key = componentName;
	if (moduleCache.has(key)) return moduleCache.get(key);
	const path = findModulePath(componentName);
	if (!path) {
		moduleCache.set(key, null);
		return null;
	}
	// viewModules[path] 是一个返回 Promise<Module> 的函数
	const mod = await viewModules[path]();
	moduleCache.set(key, mod);
	return mod;
}

/**
 * 读取组件自身声明的窗口属性（preload 后调用）
 * 包含 icon、width、height、resizable 等
 */
export function getWindowOptionsFromModule(mod, fallback = {}) {
	const opts = mod?.default?.windowOptions || null;
	return mergeOptions({ ...fallback, ...opts });
}

/**
 * 同步接口：获取组件的异步定义组件实例（Window.vue 渲染用）
 * 逻辑与原 Window.vue resolveComponent 保持一致
 */
export function resolveAppComponent(code, componentName) {
	const cacheKey = `${code}::${componentName}`;
	if (componentCache.has(cacheKey)) return componentCache.get(cacheKey);
	const paths = [`@/views/${componentName}.vue`, `@/views/${componentName}/index.vue`];
	for (const p of paths) {
		if (viewModules[p]) {
			const comp = markRaw(defineAsyncComponent(viewModules[p]));
			componentCache.set(cacheKey, comp);
			return comp;
		}
	}
	const keys = Object.keys(viewModules);
	for (const key of keys) {
		if (key.endsWith(`/${componentName}.vue`) || key.endsWith(`/${componentName}/index.vue`)) {
			const comp = markRaw(defineAsyncComponent(viewModules[key]));
			componentCache.set(cacheKey, comp);
			return comp;
		}
	}
	return null;
}

export { DEFAULT_WIN_OPTIONS, mergeOptions, findModulePath };
