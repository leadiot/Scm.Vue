import { useDraggable } from 'vue-draggable-plus';

/**
 * 命令式拖拽创建（替代 sortablejs 的 Sortable.create）
 * 在组件的 mounted() 钩子中调用，返回实例含 destroy/option/toArray 等方法
 * @param {HTMLElement} el - 目标 DOM 元素
 * @param {Object} options - sortablejs 兼容选项（animation, handle, ghostClass, onEnd 等）
 * @returns {{ destroy: Function, option: Function, toArray: Function, save: Function, start: Function, pause: Function, resume: Function }}
 */
export function createSortable(el, options = {}) {
	return useDraggable(el, options);
}
