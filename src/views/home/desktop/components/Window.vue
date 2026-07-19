<template>
	<div v-if="!window.minimized" class="window-wrapper" :class="[windowClass, winStyleClass]" :style="wrapperStyle" @mousedown="handleFocus" @touchstart.passive="handleFocus" @contextmenu.prevent.stop="handleContextMenu">
		<div class="window" :class="{ maximized: window.maximized || isMobile, focused: window.focused, 'is-mobile': isMobile }" :style="windowStyle" ref="windowEl">
			<!-- macOS 风格标题栏（左侧红黄绿按钮，标题居中） -->
			<template v-if="isMacOS">
				<div class="window-header macos-header" :style="headerBarStyle" @mousedown="startDrag" @touchstart.passive="startDrag">
					<div class="traffic-lights">
						<div class="traffic-btn close-btn" @click.stop="$emit('close', window.id)">
							<svg width="12" height="12" viewBox="0 0 12 12">
								<circle cx="6" cy="6" r="6" fill="#ff5f57"/>
								<path d="M3.8,3.8 L8.2,8.2 M8.2,3.8 L3.8,8.2" stroke="#8b0000" stroke-width="1" opacity="0" class="close-x" />
							</svg>
						</div>
						<div class="traffic-btn min-btn" @click.stop="$emit('minimize', window.id)">
							<svg width="12" height="12" viewBox="0 0 12 12">
								<circle cx="6" cy="6" r="6" fill="#ffbd2e"/>
								<line x1="3" y1="6" x2="9" y2="6" stroke="#995900" stroke-width="1" opacity="0" class="min-line" />
							</svg>
						</div>
						<div class="traffic-btn max-btn" @click.stop="$emit('maximize', window.id)">
							<svg width="12" height="12" viewBox="0 0 12 12">
								<circle cx="6" cy="6" r="6" fill="#28c840"/>
								<path d="M4,3 L4,9 M4,3 L3,3 L3,9 L9,9 L9,8 M4,3 L9,3 L9,9" stroke="#006600" stroke-width="1" opacity="0" class="max-path" />
							</svg>
						</div>
					</div>
					<div class="macos-title-center">
						<sc-icon :name="window.icon || 'ms-grid_view'" :size="16" />
						<span class="macos-title-text">{{ window.title }}</span>
					</div>
					<div class="title-spacer"></div>
				</div>
			</template>

			<!-- WinXP 经典风格标题栏 -->
			<template v-else-if="isWinXP">
				<div class="window-header winxp-header" :style="headerBarStyle" @mousedown="startDrag" @touchstart.passive="startDrag">
					<div class="winxp-title-left">
						<sc-icon :name="window.icon || 'ms-grid_view'" :size="14" color="#ffffff" />
					</div>
					<span class="winxp-title-text">{{ window.title }}</span>
					<div class="winxp-buttons">
						<button class="winxp-btn min-btn" title="最小化" @click.stop="$emit('minimize', window.id)">
							<svg width="8" height="8" viewBox="0 0 8 8"><rect x="0.5" y="3.5" width="7" height="1.5" rx="0.5" fill="currentColor"/></svg>
						</button>
						<button class="winxp-btn max-btn" title="最大化" @click.stop="$emit('maximize', window.id)">
							<svg width="9" height="9" viewBox="0 0 9 9" v-if="!window.maximized">
								<rect x="0.5" y="0.5" width="8" height="8" rx="0.5" fill="none" stroke="currentColor" stroke-width="1.2"/>
							</svg>
							<svg width="9" height="9" viewBox="0 0 9 9" v-else>
								<rect x="1" y="2.5" width="6.5" height="6" rx="0.5" fill="none" stroke="currentColor" stroke-width="1.2"/>
								<rect x="0" y="0" width="6.5" height="6" rx="0.5" fill="#000080"/>
							</svg>
						</button>
						<button class="winxp-btn close-btn" title="关闭" @click.stop="$emit('close', window.id)">
							<svg width="8" height="8" viewBox="0 0 8 8"><path d="M1,1 L7,7 M7,1 L1,7" stroke="currentColor" stroke-width="1.2"/></svg>
						</button>
					</div>
				</div>
			</template>

			<!-- 通用 Windows 风格标题栏 (win7/win10/win11/default) -->
			<template v-else>
				<div class="window-header" :style="headerBarStyle" @mousedown="startDrag" @touchstart.passive="startDrag">
					<div class="window-title">
						<sc-icon :name="window.icon || 'ms-grid_view'" :size="16" />
						<span>{{ window.title }}</span>
					</div>
					<div class="window-controls">
						<button class="control-btn minimize" @click.stop="$emit('minimize', window.id)">
							<svg width="12" height="12" viewBox="0 0 12 12"><rect x="2" y="5.5" width="8" height="1" fill="none" stroke="currentColor" stroke-width="1" /></svg>
						</button>
						<button v-if="window.resizable !== false && !isMobile" class="control-btn maximize" @click.stop="$emit('maximize', window.id)">
							<svg v-if="window.maximized" width="12" height="12" viewBox="0 0 12 12">
								<rect x="3" y="1" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1" />
								<rect x="1" y="3" width="8" height="8" fill="var(--win-bg, #ffffff)" stroke="currentColor" stroke-width="1.2" />
							</svg>
							<svg v-else width="12" height="12" viewBox="0 0 12 12">
								<rect x="1" y="1" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.2" />
							</svg>
						</button>
						<button class="control-btn close" @click.stop="$emit('close', window.id)">
							<svg width="12" height="12" viewBox="0 0 12 12">
								<line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" stroke-width="1.2" />
								<line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" stroke-width="1.2" />
							</svg>
						</button>
					</div>
				</div>
			</template>

			<div class="window-content">
				<component :is="getComponent(window.code, window.component)" v-bind="window.props || {}"
					@set-wallpaper="onSetWallpaper" @profile-updated="onProfileUpdated"
					@password-changed="onPasswordChanged" @theme-preview="onThemePreview"
					@save-settings="onSaveSettings" />
			</div>

			<div v-if="!window.maximized && !isMobile && window.resizable !== false" class="resize-handle" @mousedown.stop="startResize"></div>
		</div>
	</div>
</template>

<script>
	import { defineAsyncComponent, h, markRaw } from 'vue';
	import scIcon from '@/components/scIcon/index.vue';

	const LoadingComponent = {
		name: 'LoadingComponent',
		render() {
			return h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999', fontSize: '14px' } }, '加载中...');
		}
	};

	export default {
		name: 'AppWindow',
		components: { scIcon },
		props: {
			window: { type: Object, required: true },
			theme: { type: Object, default: () => ({}) },
		},
		emits: ['close', 'minimize', 'maximize', 'focus', 'set-wallpaper', 'profile-updated', 'password-changed', 'theme-preview', 'save-settings'],
		data() {
			return {
				dragData: { isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0 },
				resizeData: { isResizing: false, startX: 0, startY: 0, width: 0, height: 0, left: 0, top: 0 },
				componentCache: {},
				isMobile: false,
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
			isWinXP() { return this.winStyle === 'xp'; },
			isWin7() { return this.winStyle === 'win7'; },
			windowTheme() { return this.theme; },
			windowTitleColor() {
				return this.window.focused
					? (this.windowTheme.titleColor || '#000000')
					: (this.windowTheme.titleColorInactive || '#808080');
			},
			wrapperStyle() {
				if (this.window.maximized) return { left: '0px', top: '0px', width: '100%', height: '100%' };
				return {
					left: this.window.x + 'px', top: this.window.y + 'px',
					width: this.window.width + 'px', height: this.window.height + 'px',
				};
			},
			windowStyle() {
				const t = this.windowTheme;
				const hs = t.xpHeaderStart || '#0058EE';
				const he = t.xpHeaderEnd || '#0047CC';
				const his = t.xpHeaderInactiveStart || '#7A96DF';
				const hie = t.xpHeaderInactiveEnd || '#5E7EB5';
				const bs = t.xpBtnStart || '#3C8CFF';
				const be = t.xpBtnEnd || '#0054E3';
				const bhs = t.xpBtnHoverStart || '#5CA0FF';
				const bhe = t.xpBtnHoverEnd || '#1E6FE0';
				const cs = t.xpCloseStart || '#FF6B4A';
				const ce = t.xpCloseEnd || '#C1352E';
				const chs = t.xpCloseHoverStart || '#FF8B6A';
				const che = t.xpCloseHoverEnd || '#D0453E';
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
					// XP 经典风格变量（.style-xp 消费，缺省回退 Luna 蓝）
					'--xp-header': t.xpHeader || `linear-gradient(180deg, ${hs} 0%, color-mix(in srgb, ${hs} 60%, #ffffff) 3%, ${hs} 40%, ${he} 95%, color-mix(in srgb, ${he} 85%, #000000) 100%)`,
					'--xp-header-inactive': t.xpHeaderInactive || `linear-gradient(180deg, ${his} 0%, ${hie} 100%)`,
					'--xp-btn': `linear-gradient(180deg, ${bs} 0%, color-mix(in srgb, ${bs} 45%, ${be}) 50%, ${be} 100%)`,
					'--xp-btn-hover': `linear-gradient(180deg, ${bhs} 0%, color-mix(in srgb, ${bhs} 45%, ${bhe}) 50%, ${bhe} 100%)`,
					'--xp-btn-active': `linear-gradient(180deg, ${be} 0%, color-mix(in srgb, ${be} 80%, #000000) 100%)`,
					'--xp-close': `linear-gradient(180deg, ${cs} 0%, color-mix(in srgb, ${cs} 45%, ${ce}) 50%, ${ce} 100%)`,
					'--xp-close-hover': `linear-gradient(180deg, ${chs} 0%, color-mix(in srgb, ${chs} 45%, ${che}) 50%, ${che} 100%)`,
					'--xp-btn-border': t.xpBtnBorder || '#FFFFFF',
					'--xp-close-border': t.xpCloseBorder || '#A02010',
					'--xp-glyph-color': t.xpGlyphColor || '#FFFFFF',
					'--xp-frame': t.xpFrame || '#0054E3',
					'--xp-header-radius': t.xpHeaderRadius || '6px',
					'--xp-btn-size': t.xpBtnSize || '21px',
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
		mounted() {
			this.checkMobile();
			window.addEventListener('resize', this.checkMobile);
			document.addEventListener('mousemove', this.onDragging);
			document.addEventListener('mouseup', this.stopDrag);
			document.addEventListener('mousemove', this.onResizing);
			document.addEventListener('mouseup', this.stopResize);
			document.addEventListener('touchmove', this.onDragging, { passive: false });
			document.addEventListener('touchend', this.stopDrag);
		},
		beforeUnmount() {
			window.removeEventListener('resize', this.checkMobile);
			document.removeEventListener('mousemove', this.onDragging);
			document.removeEventListener('mouseup', this.stopDrag);
			document.removeEventListener('mousemove', this.onResizing);
			document.removeEventListener('mouseup', this.stopResize);
			document.removeEventListener('touchmove', this.onDragging);
			document.removeEventListener('touchend', this.stopDrag);
		},
		methods: {
			checkMobile() { this.isMobile = window.innerWidth <= 768; },
			handleFocus() { this.$emit('focus', this.window.id); },
			handleContextMenu() {},
			onSetWallpaper(url) { this.$emit('set-wallpaper', url); },
			onProfileUpdated() { this.$emit('profile-updated'); },
			onPasswordChanged() { this.$emit('password-changed'); },
			onThemePreview(theme) { this.$emit('theme-preview', theme); },
			onSaveSettings(config) { this.$emit('save-settings', config); },
		getComponent(code, component) {
			if (!this.componentCache[code]) {
				this.componentCache[code] = markRaw(this.resolveComponent(code, component));
			}
			return this.componentCache[code];
		},
			resolveComponent(code, component) {
				const modules = import.meta.glob('@/views/**/*.vue');
				const paths = [`@/views/${component}.vue`, `@/views/${component}/index.vue`];
				for (const path of paths) {
					if (modules[path]) return defineAsyncComponent(modules[path]);
				}
				const moduleKeys = Object.keys(modules);
				for (const key of moduleKeys) {
					if (key.includes(`/${component}.vue`) || key.includes(`/${component}/index.vue`)) {
						return defineAsyncComponent(modules[key]);
					}
				}
				return LoadingComponent;
			},
			startDrag(e) {
				if (this.window.maximized || this.isMobile) return;
				const clientX = e.touches ? e.touches[0].clientX : e.clientX;
				const clientY = e.touches ? e.touches[0].clientY : e.clientY;
				this.dragData = { isDragging: true, startX: clientX, startY: clientY, initialX: this.window.x, initialY: this.window.y };
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
			stopDrag() { this.dragData.isDragging = false; },
			startResize(e) {
				this.resizeData = {
					isResizing: true, startX: e.clientX, startY: e.clientY,
					width: this.window.width, height: this.window.height,
					left: this.window.x, top: this.window.y,
				};
			},
			onResizing(e) {
				if (!this.resizeData.isResizing) return;
				const dx = e.clientX - this.resizeData.startX;
				const dy = e.clientY - this.resizeData.startY;
				const minW = 300, minH = 200;
				this.window.width = Math.max(minW, this.resizeData.width + dx);
				this.window.height = Math.max(minH, this.resizeData.height + dy);
			},
			stopResize() { this.resizeData.isResizing = false; },
		},
	};
</script>

<style scoped>
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

	.control-btn:hover { background-color: var(--win-min-hover); }
	.control-btn.close:hover { background-color: var(--win-close-hover); color: #fff; }
	.control-btn.close:active { background-color: #a0261a; color: #fff; }

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
	.traffic-btn:hover .max-path { opacity: 1; }

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

	/* === WinXP 经典风格（颜色全部走 --xp-* 变量，可被主题定制） === */
	.style-xp .window {
		border: 2px solid var(--xp-frame);
		border-top: none;
		border-radius: var(--win-border-radius);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
	}

	.style-xp .window.maximized {
		border: none;
		border-radius: 0;
	}

	.winxp-header {
		background: var(--xp-header) !important;
		padding: 0 4px 0 8px !important;
		justify-content: space-between !important;
		border-radius: var(--xp-header-radius) var(--xp-header-radius) 0 0;
		margin: -2px -2px 0 -2px;
		height: var(--win-title-height) !important;
		line-height: var(--win-title-height) !important;
	}

	.style-xp .window.maximized .winxp-header {
		border-radius: 0;
		margin: 0;
	}

	.style-xp .window:not(.focused) .window-header {
		opacity: 1;
	}

	.style-xp .window:not(.focused) .winxp-header {
		background: var(--xp-header-inactive) !important;
	}

	.winxp-title-left { margin-right: 4px; flex-shrink: 0; display: flex; align-items: center; }

	.winxp-title-text {
		color: var(--win-title-color) !important;
		font-size: 12px;
		font-weight: bold;
		flex: 1;
		text-shadow: 0 1px 1px rgba(0, 0, 0, 0.3);
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	.window:not(.focused) .winxp-title-text {
		color: var(--win-title-color-inactive) !important;
	}

	.winxp-buttons {
		display: flex;
		align-items: center;
		height: 100%;
		gap: 2px;
		-webkit-app-region: no-drag;
	}

	.winxp-btn {
		width: var(--xp-btn-size);
		height: var(--xp-btn-size);
		border: 1px solid var(--xp-btn-border);
		border-radius: 3px;
		background: var(--xp-btn);
		color: var(--xp-glyph-color);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.3);
	}
	.winxp-btn:hover { background: var(--xp-btn-hover); }
	.winxp-btn:active { background: var(--xp-btn-active); }
	.winxp-btn.close-btn {
		background: var(--xp-close) !important;
		border-color: var(--xp-close-border);
		margin-left: 2px;
	}
	.winxp-btn.close-btn:hover { background: var(--xp-close-hover) !important; }

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

	/* === 移动端适配 === */
	.window.is-mobile { --win-title-height: 44px; }
	.window.is-mobile .window-header { cursor: default; }
	.window.is-mobile .window-title { font-size: 14px; }
	.window.is-mobile .control-btn { width: 48px; }

	@media screen and (max-width: 768px) {
		.window { --win-title-height: 44px; }
		.window-header { padding: 0 4px 0 16px; }
		.window-title { font-size: 14px; }
		.control-btn { width: 48px; }
	}
</style>
