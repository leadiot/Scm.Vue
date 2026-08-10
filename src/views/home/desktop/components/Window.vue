<template>
	<div v-show="!window.minimized || window.animating" class="window-wrapper" :class="[windowClass, winStyleClass]"
		:style="wrapperStyle" @mousedown="handleFocus" @touchstart.passive="handleFocus"
		@contextmenu.prevent.stop="handleContextMenu">
		<div class="window"
			:class="{ maximized: window.maximized || isMobile, focused: window.focused, 'is-mobile': isMobile }"
			:style="windowStyle" ref="windowEl">
			<TitleBar :window="window" :win-style="winStyle" :header-bar-style="headerBarStyle" :is-mobile="isMobile"
				@close="$emit('close', window.id)" @minimize="$emit('minimize', window.id)"
				@maximize="$emit('maximize', window.id)" @start-drag="startDrag" />

			<div class="window-content">
				<component :is="getComponent(window.code, window.component)" v-bind="window.props || {}"
					@set-wallpaper="onSetWallpaper" @profile-updated="onProfileUpdated"
					@password-changed="onPasswordChanged" @theme-preview="onThemePreview"
					@save-settings="onSaveSettings" />
			</div>

			<div v-if="!window.maximized && !isMobile && window.resizable !== false" class="resize-handle"
				@mousedown.stop="startResize"></div>
		</div>
	</div>
</template>

<script>
import { h, defineComponent } from 'vue';
import scIcon from '@/components/scIcon/index.vue';
import TitleBar from './TitleBar.vue';
import i18n from '@/locales';
import { resolveAppComponent, mergeOptions } from './appRegistry.js';

const LoadingComponent = {
	name: 'LoadingComponent',
	render() {
		return h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: '14px' } }, i18n.global.t('desktop.loading'));
	}
};

export default {
	name: 'AppWindow',
	components: { scIcon, TitleBar },
	props: {
		window: { type: Object, required: true },
		theme: { type: Object, default: () => ({}) },
	},
	emits: ['close', 'minimize', 'maximize', 'focus', 'set-wallpaper', 'profile-updated', 'password-changed', 'theme-preview', 'save-settings', 'animation-complete'],
	provide() {
		return {
			// 允许 App 组件运行时动态更新自身窗口属性
			updateWindow: (patch) => {
				Object.assign(this.window, patch);
			},
		};
	},
	data() {
		return {
			dragData: { isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0 },
			resizeData: { isResizing: false, startX: 0, startY: 0, width: 0, height: 0, left: 0, top: 0 },
			isMobile: false,
			currentAnimation: null,
		};
	},
	computed: {
		bgColor() { return this.windowTheme.bg || '#ffffff'; },
		headerBg() { return this.windowTheme.headerBg || '#f0f0f0'; },
		titleColor() { return this.windowTitleColor; },
		borderColor() { return this.windowTheme.border || '#ddd'; },
		borderRadius() { return this.windowTheme.borderRadius || '0px'; },
		shadow() { return this.windowTheme.shadow || '0 2px 8px rgba(0,0,0,0.15)'; },
		closeBtnHover() { return this.windowTheme.closeBtnHover || '#c42b1c'; },
		minBtnHover() { return this.windowTheme.minBtnHover || 'rgba(0, 0, 0, 0.1)'; },
		maxBtnHover() { return this.windowTheme.maxBtnHover || 'rgba(0, 0, 0, 0.1)'; },
		titleHeight() { return this.windowTheme.titleHeight || '32px'; },
		buttonWidth() { return this.windowTheme.buttonWidth || '46px'; },
		winStyle() { return this.windowTheme.style || 'modern'; },
		isMacOS() { return this.winStyle === 'macos'; },
		isMac9() { return this.winStyle === 'mac9'; },
		isWinClassic() { return this.winStyle === 'winClassic'; },
		isWin7() { return this.winStyle === 'win7'; },
		windowTheme() { return this.theme; },
		windowTitleColor() {
			return this.window.focused
				? (this.windowTheme.titleColor || '#000000')
				: (this.windowTheme.titleColorInactive || '#808080');
		},
		wrapperStyle() {
			const z = this.window.zIndex || 1;
			if (this.window.maximized) return { left: '0px', top: '0px', width: '100%', height: '100%', 'z-index': z };
			return {
				left: this.window.x + 'px', top: this.window.y + 'px',
				width: this.window.width + 'px', height: this.window.height + 'px',
				'z-index': z,
			};
		},
		windowStyle() {
			const t = this.windowTheme;
			const hs = t.winClassicHeaderStart || t.xpHeaderStart || '#0058EE';
			const he = t.winClassicHeaderEnd || t.xpHeaderEnd || '#0047CC';
			const his = t.winClassicHeaderInactiveStart || t.xpHeaderInactiveStart || '#7A96DF';
			const hie = t.winClassicHeaderInactiveEnd || t.xpHeaderInactiveEnd || '#5E7EB5';
			const bs = t.winClassicBtnStart || t.xpBtnStart || '#3C8CFF';
			const be = t.winClassicBtnEnd || t.xpBtnEnd || '#0054E3';
			const bhs = t.winClassicBtnHoverStart || t.xpBtnHoverStart || '#5CA0FF';
			const bhe = t.winClassicBtnHoverEnd || t.xpBtnHoverEnd || '#1E6FE0';
			const cs = t.winClassicCloseStart || t.xpCloseStart || '#FF6B4A';
			const ce = t.winClassicCloseEnd || t.xpCloseEnd || '#C1352E';
			const chs = t.winClassicCloseHoverStart || t.xpCloseHoverStart || '#FF8B6A';
			const che = t.winClassicCloseHoverEnd || t.xpCloseHoverEnd || '#D0453E';
			return {
				'--win-bg': this.bgColor,
				'--win-header-bg': this.headerBg,
				'--win-title-color': this.titleColor,
				'--win-title-color-inactive': this.windowTheme.titleColorInactive || '#808080',
				'--win-border': this.borderColor,
				'--win-border-radius': this.borderRadius,
				'--win-shadow': this.shadow,
				'--win-close-hover': this.closeBtnHover,
				'--win-min-hover': this.minBtnHover,
				'--win-max-hover': this.maxBtnHover,
				'--win-title-height': this.titleHeight,
				'--win-button-width': this.buttonWidth,
				'--win-classic-header': t.winClassicHeader || t.xpHeader || `linear-gradient(180deg, ${hs} 0%, color-mix(in srgb, ${hs} 60%, #ffffff) 3%, ${hs} 40%, ${he} 95%, color-mix(in srgb, ${he} 85%, #000000) 100%)`,
				'--win-classic-header-inactive': t.winClassicHeaderInactive || t.xpHeaderInactive || `linear-gradient(180deg, ${his} 0%, ${hie} 100%)`,
				'--win-classic-btn': `linear-gradient(180deg, ${bs} 0%, color-mix(in srgb, ${bs} 45%, ${be}) 50%, ${be} 100%)`,
				'--win-classic-btn-hover': `linear-gradient(180deg, ${bhs} 0%, color-mix(in srgb, ${bhs} 45%, ${bhe}) 50%, ${bhe} 100%)`,
				'--win-classic-btn-active': `linear-gradient(180deg, ${be} 0%, color-mix(in srgb, ${be} 80%, #000000) 100%)`,
				'--win-classic-close': `linear-gradient(180deg, ${cs} 0%, color-mix(in srgb, ${cs} 45%, ${ce}) 50%, ${ce} 100%)`,
				'--win-classic-close-hover': `linear-gradient(180deg, ${chs} 0%, color-mix(in srgb, ${chs} 45%, ${che}) 50%, ${che} 100%)`,
				'--win-classic-btn-border': t.winClassicBtnBorder || t.xpBtnBorder || '#FFFFFF',
				'--win-classic-close-border': t.winClassicCloseBorder || t.xpCloseBorder || '#A02010',
				'--win-classic-glyph-color': t.winClassicGlyphColor || t.xpGlyphColor || '#FFFFFF',
				'--win-classic-frame': t.winClassicFrame || t.xpFrame || '#0054E3',
				'--win-classic-header-radius': t.winClassicHeaderRadius || t.xpHeaderRadius || '6px',
				'--win-classic-btn-size': t.winClassicBtnSize || t.xpBtnSize || '21px',
				'z-index': this.window.zIndex || 1,
			};
		},
		headerBarStyle() {
			return {
				height: this.titleHeight,
				lineHeight: this.titleHeight,
				background: this.headerBg,
			};
		},
		windowClass() {
			const classes = [];
			if (this.window.focused) classes.push('focused');
			if (this.window.maximized) classes.push('maximized');
			if (this.window.minimized) classes.push('minimized');
			return classes;
		},
		winStyleClass() {
			return 'style-' + this.winStyle;
		},
	},
	watch: {
		'window.animating'(newVal) {
			if (!this.isMacOS || !newVal) return;
			this.cancelCurrentAnimation();
			if (newVal === 'closing') this.animateClose();
			else if (newVal === 'minimizing') this.animateMinimize();
			else if (newVal === 'unminimizing') this.animateUnminimize();
		},
		'window.maximized': {
			handler(newVal, oldVal) {
				if (!this.isMacOS || newVal === oldVal) return;
				this.animateFLIPMaximize(newVal);
			},
			flush: 'pre', // DOM更新前读取"First"位置，nextTick后读取"Last"位置
		},
	},
	mounted() {
		this.checkMobile();
		window.addEventListener('resize', this.checkMobile);
		// macOS 窗口打开动画
		if (this.isMacOS && this.$refs.windowEl) {
			this.animateOpen();
		}
	},
	beforeUnmount() {
		window.removeEventListener('resize', this.checkMobile);
		// 兜底：若卸载时仍处于拖拽/缩放中，移除按需注册的 document 监听器
		this.unbindDragListeners();
		this.unbindResizeListeners();
	},
	methods: {
		checkMobile() { this.isMobile = window.innerWidth <= 768; },
		handleFocus() { this.$emit('focus', this.window.id); },
		handleContextMenu() { },
		onSetWallpaper(url) { this.$emit('set-wallpaper', url); },
		onProfileUpdated() { this.$emit('profile-updated'); },
		onPasswordChanged() { this.$emit('password-changed'); },
		onThemePreview(theme) { this.$emit('theme-preview', theme); },
		onSaveSettings(config) { this.$emit('save-settings', config); },
		getComponent(code, component) {
			return resolveAppComponent(code, component) || LoadingComponent;
		},
		// 以组件实例的 $options.windowOptions 作为运行时兜底（若组件在 export default 中声明了）
		applyOptionsFromComponent(comp) {
			const opts = comp?.constructor?.options?.windowOptions || comp?.windowOptions || null;
			if (opts) {
				const merged = mergeOptions(opts);
				const patch = {
					width: merged.width,
					height: merged.height,
					resizable: merged.resizable,
					minimizable: merged.minimizable,
					closable: merged.closable,
					maximizable: merged.maximizable,
					centered: merged.center,
					minWidth: merged.minWidth,
					minHeight: merged.minHeight,
					maxWidth: merged.maxWidth,
					maxHeight: merged.maxHeight,
				};
				Object.assign(this.window, patch);
			}
		},
		startDrag(e) {
			if (this.window.maximized || this.isMobile || this.currentAnimation) return;
			const clientX = e.touches ? e.touches[0].clientX : e.clientX;
			const clientY = e.touches ? e.touches[0].clientY : e.clientY;
			this.dragData = { isDragging: true, startX: clientX, startY: clientY, initialX: this.window.x, initialY: this.window.y };
			// 按需注册 document 监听器（仅拖拽期间存在，避免每窗口常驻多个全局监听器）
			this.bindDragListeners();
		},
		onDragging(e) {
			if (!this.dragData.isDragging) return;
			const clientX = e.touches ? e.touches[0].clientX : e.clientX;
			const clientY = e.touches ? e.touches[0].clientY : e.clientY;
			const dx = clientX - this.dragData.startX;
			const dy = clientY - this.dragData.startY;
			this.window.x = Math.max(-this.window.width + 100, Math.min(this.dragData.initialX + dx, window.innerWidth - 100));
			this.window.y = Math.max(0, Math.min(this.dragData.initialY + dy, window.innerHeight - 40));
		},
		stopDrag() { this.dragData.isDragging = false; this.unbindDragListeners(); },
		startResize(e) {
			if (this.currentAnimation) return;
			this.resizeData = {
				isResizing: true, startX: e.clientX, startY: e.clientY,
				width: this.window.width, height: this.window.height,
				left: this.window.x, top: this.window.y,
			};
			// 按需注册 document 监听器（仅缩放期间存在）
			this.bindResizeListeners();
		},
		onResizing(e) {
			if (!this.resizeData.isResizing) return;
			const dx = e.clientX - this.resizeData.startX;
			const dy = e.clientY - this.resizeData.startY;
			const minW = 300, minH = 200;
			this.window.width = Math.max(minW, this.resizeData.width + dx);
			this.window.height = Math.max(minH, this.resizeData.height + dy);
		},
		stopResize() { this.resizeData.isResizing = false; this.unbindResizeListeners(); },
		// 拖拽监听器按需注册/移除：仅拖拽期间挂载 document 监听，空闲时零开销
		bindDragListeners() {
			document.addEventListener('mousemove', this.onDragging);
			document.addEventListener('mouseup', this.stopDrag);
			document.addEventListener('touchmove', this.onDragging, { passive: false });
			document.addEventListener('touchend', this.stopDrag);
		},
		unbindDragListeners() {
			document.removeEventListener('mousemove', this.onDragging);
			document.removeEventListener('mouseup', this.stopDrag);
			document.removeEventListener('touchmove', this.onDragging);
			document.removeEventListener('touchend', this.stopDrag);
		},
		// 缩放监听器按需注册/移除
		bindResizeListeners() {
			document.addEventListener('mousemove', this.onResizing);
			document.addEventListener('mouseup', this.stopResize);
		},
		unbindResizeListeners() {
			document.removeEventListener('mousemove', this.onResizing);
			document.removeEventListener('mouseup', this.stopResize);
		},

		/* ================================================================
		   macOS Web Animations API 动画系统
		   FLIP 技术处理最大化/还原（GPU合成，零布局重算）
		   精灵效果(Genie)使用计算的Dock偏移量
		   ================================================================ */

		cancelCurrentAnimation() {
			if (this.currentAnimation) {
				this.currentAnimation.cancel();
				this.currentAnimation = null;
			}
		},

		// 清掉某元素上所有残留的 WAAPI 动画，避免 fill:forwards 旧动画干扰新动画
		// （如 minimize 的 forwards 锁存态在 unminimize 结束后回退导致窗口再次"消失"）
		cancelElementAnimations(el) {
			if (el && typeof el.getAnimations === 'function') {
				el.getAnimations().forEach((a) => a.cancel());
			}
		},

		// 打开动画：从88%缩放+下偏移弹入
		animateOpen() {
			const el = this.$refs.windowEl;
			if (!el) return;
			this.cancelElementAnimations(el);
			this.currentAnimation = el.animate([
				{ transform: 'scale(0.88) translateY(24px)', opacity: 0 },
				{ transform: 'scale(1) translateY(0)', opacity: 1 }
			], {
				duration: 420,
				easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
				fill: 'backwards',
			});
			this.currentAnimation.onfinish = () => { this.currentAnimation = null; };
		},

		// 关闭动画：反向缩放+淡出
		animateClose() {
			const el = this.$refs.windowEl;
			if (!el) return;
			this.cancelElementAnimations(el);
			this.currentAnimation = el.animate([
				{ transform: 'scale(1) translateY(0)', opacity: 1 },
				{ transform: 'scale(0.88) translateY(24px)', opacity: 0 }
			], {
				duration: 300,
				easing: 'cubic-bezier(0.4, 0, 1, 1)',
				fill: 'forwards',
			});
			this.currentAnimation.onfinish = () => {
				this.currentAnimation = null;
				this.$emit('animation-complete', this.window.id, 'close');
			};
		},

		// 精灵最小化：窗口被"吸入"Dock — 计算实际Dock位置偏移
		animateMinimize() {
			const el = this.$refs.windowEl;
			if (!el) return;
			this.cancelElementAnimations(el);
			const rect = el.getBoundingClientRect();
			// macOS Dock在视口底部72px区域
			const dockY = window.innerHeight - 72;
			const travelY = Math.max(0, dockY - rect.bottom);

			this.currentAnimation = el.animate([
				{ transform: 'scale(1, 1) translateY(0px)', opacity: 1, transformOrigin: 'center bottom' },
				{ transform: `scale(0.93, 0.98) translateY(${travelY * 0.06}px)`, opacity: 1, offset: 0.12, transformOrigin: 'center bottom' },
				{ transform: `scale(0.75, 0.93) translateY(${travelY * 0.18}px)`, opacity: 1, offset: 0.28, transformOrigin: 'center bottom' },
				{ transform: `scale(0.45, 0.72) translateY(${travelY * 0.40}px)`, opacity: 0.9, offset: 0.48, transformOrigin: 'center bottom' },
				{ transform: `scale(0.18, 0.35) translateY(${travelY * 0.65}px)`, opacity: 0.5, offset: 0.68, transformOrigin: 'center bottom' },
				{ transform: `scale(0.04, 0.08) translateY(${travelY * 0.88}px)`, opacity: 0.12, offset: 0.85, transformOrigin: 'center bottom' },
				{ transform: `scale(0, 0.01) translateY(${travelY}px)`, opacity: 0, transformOrigin: 'center bottom' }
			], {
				duration: 520,
				easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
				fill: 'forwards',
			});
			this.currentAnimation.onfinish = () => {
				this.currentAnimation = null;
				this.$emit('animation-complete', this.window.id, 'minimize');
			};
		},

		// 从Dock还原：精灵逆动画
		animateUnminimize() {
			const el = this.$refs.windowEl;
			if (!el) return;
			// 关键：清掉上一次 minimize 的 fill:forwards 残留动画，否则 unminimize
			// 结束后元素回退到它的 forwards 锁存态(scale0/opacity0)而再次"消失"
			this.cancelElementAnimations(el);
			const rect = el.getBoundingClientRect();
			const dockY = window.innerHeight - 72;
			const travelY = Math.max(0, dockY - rect.bottom);

			this.currentAnimation = el.animate([
				{ transform: `scale(0, 0.01) translateY(${travelY}px)`, opacity: 0, transformOrigin: 'center bottom' },
				{ transform: `scale(0.04, 0.08) translateY(${travelY * 0.88}px)`, opacity: 0.12, offset: 0.15, transformOrigin: 'center bottom' },
				{ transform: `scale(0.18, 0.35) translateY(${travelY * 0.65}px)`, opacity: 0.5, offset: 0.32, transformOrigin: 'center bottom' },
				{ transform: `scale(0.45, 0.72) translateY(${travelY * 0.40}px)`, opacity: 0.9, offset: 0.52, transformOrigin: 'center bottom' },
				{ transform: `scale(0.75, 0.93) translateY(${travelY * 0.18}px)`, opacity: 1, offset: 0.72, transformOrigin: 'center bottom' },
				{ transform: `scale(0.93, 0.98) translateY(${travelY * 0.06}px)`, opacity: 1, offset: 0.88, transformOrigin: 'center bottom' },
				{ transform: 'scale(1, 1) translateY(0px)', opacity: 1, transformOrigin: 'center bottom' }
			], {
				duration: 520,
				easing: 'cubic-bezier(0.32, 0.72, 0, 1)',
				fill: 'backwards',
			});
			this.currentAnimation.onfinish = () => {
				this.currentAnimation = null;
				this.$emit('animation-complete', this.window.id, 'unminimize');
			};
		},

		// FLIP最大化/还原：GPU合成的位置+尺寸动画，零布局重算
		animateFLIPMaximize(isMaximizing) {
			const wrapperEl = this.$el;
			const innerEl = this.$refs.windowEl;
			if (!wrapperEl || !innerEl) return;
			this.cancelCurrentAnimation();
			// 清掉上一次最大化/还原或聚焦弹跳的残留动画，避免复合顺序冲突
			this.cancelElementAnimations(wrapperEl);
			this.cancelElementAnimations(innerEl);

			// First：记录当前位置（DOM尚未更新，仍显示旧布局）
			const firstRect = wrapperEl.getBoundingClientRect();

			// 等待Vue DOM更新后读取Last位置
			this.$nextTick(() => {
				const lastRect = wrapperEl.getBoundingClientRect();

				// Invert：计算位移和缩放差值
				const dx = firstRect.left - lastRect.left;
				const dy = firstRect.top - lastRect.top;
				const scaleX = firstRect.width / lastRect.width;
				const scaleY = firstRect.height / lastRect.height;

				// 如果差异太小（窗口已是最大化尺寸），跳过动画
				if (Math.abs(dx) < 2 && Math.abs(dy) < 2 && Math.abs(scaleX - 1) < 0.02 && Math.abs(scaleY - 1) < 0.02) {
					this.$emit('animation-complete', this.window.id, isMaximizing ? 'maximize' : 'restore');
					return;
				}

				// Play：wrapper从旧位置动画到新位置（纯transform，GPU合成）
				const wrapperAnim = wrapperEl.animate([
					{ transform: `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`, transformOrigin: 'top left' },
					{ transform: 'translate(0, 0) scale(1, 1)', transformOrigin: 'top left' }
				], {
					duration: 450,
					easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
					fill: 'none',
				});

				// 内层微弹效果
				const bounceEasing = isMaximizing ? 'cubic-bezier(0.32, 0.72, 0, 1)' : 'cubic-bezier(0.16, 1, 0.3, 1)';
				const bounceFrom = isMaximizing ? 'scale(0.97)' : 'scale(1.008)';
				const bounceMid = isMaximizing ? 'scale(1.008)' : 'scale(0.992)';
				innerEl.animate([
					{ transform: bounceFrom },
					{ transform: bounceMid, offset: 0.45 },
					{ transform: 'scale(1)' }
				], {
					duration: 450,
					easing: bounceEasing,
					fill: 'none',
				});

				this.currentAnimation = wrapperAnim;
				wrapperAnim.onfinish = () => {
					this.currentAnimation = null;
					this.$emit('animation-complete', this.window.id, isMaximizing ? 'maximize' : 'restore');
				};
			});
		},

		// 聚焦微弹
		animateFocus() {
			const el = this.$refs.windowEl;
			if (!el || this.currentAnimation) return;
			const anim = el.animate([
				{ transform: 'scale(0.992)' },
				{ transform: 'scale(1.004)', offset: 0.5 },
				{ transform: 'scale(1)' }
			], {
				duration: 250,
				easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
				fill: 'none',
			});
			anim.onfinish = () => { };
		},
	},
};
</script>

<style>
.window-wrapper {
	position: absolute;
	pointer-events: auto;
}

.window {
	position: relative;
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	background: var(--win-bg);
	border: 1px solid var(--win-border);
	border-radius: var(--win-border-radius, 0px);
	box-shadow: var(--win-shadow);
	overflow: hidden;
}

.style-win11 .window {
	border-radius: 8px;
	box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.08);
}

.window.maximized {
	border-radius: 0;
	border: none;
}

/* === 通用标题栏 === */
.window-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: var(--win-title-height);
	padding: 0 4px 0 12px;
	background: var(--win-header-bg);
	cursor: move;
	user-select: none;
	-webkit-app-region: drag;
	flex-shrink: 0;
	transition: background-color 0.3s ease;
}

.window:not(.focused) .window-header {
	opacity: 0.8;
}

.window-title {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 12px;
	font-weight: 400;
	color: var(--win-title-color);
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.window:not(.focused) .window-title {
	color: var(--win-title-color-inactive);
}

.window-controls {
	display: flex;
	height: 100%;
	-webkit-app-region: no-drag;
}

.control-btn {
	width: var(--win-button-width);
	height: 100%;
	border: none;
	background: transparent;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--win-title-color);
	transition: background-color 0.1s ease;
}

.control-btn:hover {
	background-color: var(--win-min-hover);
}

.control-btn.close:hover {
	background-color: var(--win-close-hover);
	color: #fff;
}

.control-btn.close:active {
	background-color: #a0261a;
	color: #fff;
}

/* === Win7 玻璃效果 === */
.style-win7 .window-header {
	backdrop-filter: blur(10px);
}

.style-win7 .window {
	box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.2), 0 0 0 2px rgba(0, 0, 0, 0.1);
}

/* === macOS 风格 === */
.style-macos .window {
	border-radius: 10px;
	box-shadow: 0 10px 50px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.08);
	border-color: rgba(0, 0, 0, 0.1);
}

.macos-header {
	justify-content: flex-start;
	gap: 0;
}

.traffic-lights {
	display: flex;
	align-items: center;
	gap: 8px;
	padding-left: 12px;
	flex-shrink: 0;
	-webkit-app-region: no-drag;
}

.traffic-btn {
	width: 12px;
	height: 12px;
	border-radius: 50%;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
}

.traffic-btn:hover .close-x,
.traffic-btn:hover .min-line,
.traffic-btn:hover .max-path {
	opacity: 1;
}

.macos-title-center {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 12px;
	color: var(--win-title-color);
	flex: 1;
	justify-content: center;
}

.macos-title-text {
	font-weight: 500;
	font-size: 13px;
}

.title-spacer {
	width: 60px;
	flex-shrink: 0;
}

/* === Mac OS 9 经典白金风格 === */
.style-mac9 .window {
	border: 1px solid #5A5A5A;
	box-shadow: 2px 2px 12px rgba(0, 0, 0, 0.4);
}

.mac9-header {
	border-bottom: 1px solid #8A8A8A;
	padding: 0 6px !important;
	gap: 6px;
}

.mac9-title {
	flex: 1;
	text-align: center;
	font-size: 12px;
	font-weight: bold;
	color: var(--win-title-color);
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.window:not(.focused) .mac9-title {
	color: var(--win-title-color-inactive);
}

.mac9-buttons {
	display: flex;
	align-items: center;
	gap: 3px;
	-webkit-app-region: no-drag;
}

.mac9-btn {
	width: 13px;
	height: 13px;
	padding: 0;
	background: linear-gradient(180deg, #F8F8F8 0%, #D8D8D8 100%);
	border: 1px solid #6E6E6E;
	border-radius: 2px;
	box-shadow: inset 1px 1px 0 #FFFFFF, inset -1px -1px 0 #A8A8A8;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 9px;
	line-height: 1;
	color: #333333;
	-webkit-app-region: no-drag;
}

.mac9-btn:active {
	background: linear-gradient(180deg, #C8C8C8 0%, #E0E0E0 100%);
	box-shadow: inset 1px 1px 0 #A8A8A8;
}

.mac9-glyph {
	opacity: 0;
	font-weight: bold;
}

.mac9-btn:hover .mac9-glyph {
	opacity: 1;
}

/* === 经典窗口风格（颜色全部走 --win-classic-* 变量，可被主题定制） === */
.style-classic .window {
	border: 2px solid var(--win-classic-frame);
	border-top: none;
	border-radius: var(--win-border-radius);
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
}

.style-classic .window.maximized {
	border: none;
	border-radius: 0;
}

.win-xp-header {
	background: var(--win-classic-header) !important;
	padding: 0 4px 0 8px !important;
	justify-content: space-between !important;
	border-radius: var(--win-classic-header-radius) var(--win-classic-header-radius) 0 0;
	margin: -2px -2px 0 -2px;
	height: var(--win-title-height) !important;
	line-height: var(--win-title-height) !important;
}

.style-classic .window.maximized .win-xp-header {
	border-radius: 0;
	margin: 0;
}

.style-classic .window:not(.focused) .window-header {
	opacity: 1;
}

.style-classic .window:not(.focused) .win-xp-header {
	background: var(--win-classic-header-inactive) !important;
}

.win-xp-title-left {
	margin-right: 4px;
	flex-shrink: 0;
	display: flex;
	align-items: center;
}

.win-xp-title-text {
	color: var(--win-title-color) !important;
	font-size: 12px;
	font-weight: bold;
	flex: 1;
	text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.window:not(.focused) .win-xp-title-text {
	color: var(--win-title-color-inactive) !important;
}

.win-xp-buttons {
	display: flex;
	align-items: center;
	height: 100%;
	gap: 2px;
	-webkit-app-region: no-drag;
}

.win-xp-btn {
	width: var(--win-classic-btn-size);
	height: var(--win-classic-btn-size);
	border: 1px solid var(--win-classic-btn-border);
	border-radius: 3px;
	background: var(--win-classic-btn);
	color: var(--win-classic-glyph-color);
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.win-xp-btn:hover {
	background: var(--win-classic-btn-hover);
}

.win-xp-btn:active {
	background: var(--win-classic-btn-active);
}

.win-xp-btn.close-btn {
	background: var(--win-classic-close) !important;
	border-color: var(--win-classic-close-border);
	margin-left: 2px;
}

.win-xp-btn.close-btn:hover {
	background: var(--win-classic-close-hover) !important;
}

/* === 窗口内容 === */
.window-content {
	flex: 1;
	overflow: auto;
	background-color: var(--win-bg);
}

/* === 调整大小 === */
.resize-handle {
	position: absolute;
	bottom: 0;
	right: 0;
	width: 16px;
	height: 16px;
	cursor: nwse-resize;
}

.resize-handle::after {
	content: '';
	position: absolute;
	bottom: 4px;
	right: 4px;
	width: 8px;
	height: 8px;
	background: linear-gradient(135deg, transparent 50%, rgba(0, 0, 0, 0.15) 50%);
	border-radius: 0 0 6px 0;
}

/* ================================================================
	   macOS 窗口视觉样式（动画由 Web Animations API 驱动）
	   未聚焦窗口的去饱和效果 — 纯静态CSS，无transition避免repaint
	   ================================================================ */

/* macOS风格：未聚焦窗口轻微去饱和+变暗 */
.style-macos .window:not(.focused) {
	filter: saturate(0.88) brightness(0.97);
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05);
}

/* === 移动端适配 === */
.window.is-mobile {
	--win-title-height: 44px;
}

.window.is-mobile .window-header {
	cursor: default;
}

.window.is-mobile .window-title {
	font-size: 14px;
}

.window.is-mobile .control-btn {
	width: 48px;
}

@media screen and (max-width: 768px) {
	.window {
		--win-title-height: 44px;
	}

	.window-header {
		padding: 0 4px 0 16px;
	}

	.window-title {
		font-size: 14px;
	}

	.control-btn {
		width: 48px;
	}
}
</style>
