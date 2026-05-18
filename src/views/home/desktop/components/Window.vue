<template>
	<div v-if="!window.minimized" class="window"
		:class="{ maximized: window.maximized || isMobile, focused: window.focused, 'is-mobile': isMobile }"
		:style="windowStyle" @mousedown="handleFocus" @touchstart="handleFocus"
		@contextmenu.prevent.stop="handleContextMenu">
		<div class="window-header" @mousedown="startDrag" @touchstart="startDrag">
			<div class="window-title">
				<sc-icon :name="window.icon" :size="16" />
				<span>{{ window.title }}</span>
			</div>
			<div class="window-controls">
				<button class="control-btn minimize" @click.stop="$emit('minimize', window.id)">
					<svg width="12" height="12" viewBox="0 0 12 12">
						<rect x="2" y="5.5" width="8" height="1" fill="none" stroke="currentColor" stroke-width="1" />
					</svg>
				</button>
				<button v-if="window.resizable !== false && !isMobile" class="control-btn maximize"
					@click.stop="$emit('maximize', window.id)">
					<svg v-if="window.maximized" width="12" height="12" viewBox="0 0 12 12">
						<rect x="3" y="1" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1" />
						<rect x="1" y="3" width="8" height="8" fill="white" stroke="currentColor" stroke-width="1.2" />
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

		<div class="window-content">
			<component :is="getComponent(window.code, window.component)" v-bind="window.props || {}"
				@set-wallpaper="onSetWallpaper" @profile-updated="onProfileUpdated" />
		</div>

		<div v-if="!window.maximized && !isMobile && window.resizable !== false" class="resize-handle"
			@mousedown.stop="startResize">
		</div>
	</div>
</template>

<script>
import { defineAsyncComponent, h } from 'vue';
import scIcon from '@/components/scIcon/index.vue';

const LoadingComponent = {
	name: 'LoadingComponent',
	render() {
		return h('div', {
			style: {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				height: '100%',
				color: '#999',
				fontSize: '14px',
			}
		}, '加载中...');
	}
};

const ErrorComponent = {
	name: 'ErrorComponent',
	render() {
		return h('div', {
			style: {
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				height: '100%',
				color: '#f56c6c',
				fontSize: '14px',
			}
		}, '组件加载失败');
	}
};

const componentCache = new Map();

export default {
	name: 'Window',
	components: {
		scIcon,
	},
	props: {
		window: { type: Object, required: true },
		theme: { type: Object, default: () => ({}) },
	},
	emits: ['close', 'minimize', 'maximize', 'focus', 'set-wallpaper', 'profile-updated'],
	data() {
		return {
			isDragging: false,
			isResizing: false,
			dragStartX: 0,
			dragStartY: 0,
			resizeStartX: 0,
			resizeStartY: 0,
			resizeStartWidth: 0,
			resizeStartHeight: 0,
		};
	},
	computed: {
		isMobile() {
			return window.innerWidth < 768;
		},
		centeredPosition() {
			if (this.isMobile || this.window.maximized) {
				return { x: 0, y: 0 };
			}
			const windowWidth = this.window.width || 800;
			const windowHeight = this.window.height || 600;
			const screenWidth = window.innerWidth;
			const screenHeight = window.innerHeight - 48;
			return {
				x: Math.max(0, (screenWidth - windowWidth) / 2),
				y: Math.max(0, (screenHeight - windowHeight) / 2),
			};
		},
		windowStyle() {
			const baseStyle = {
				'--win-bg': this.theme.bg || '#f3f3f3',
				'--win-header-bg': this.theme.headerBg || '#f3f3f3',
				'--win-title-color': this.theme.titleColor || '#1a1a1a',
				'--win-title-color-inactive': this.theme.titleColorInactive || '#666666',
				'--win-border': this.theme.border || 'rgba(0, 0, 0, 0.1)',
			};

			if (this.isMobile) {
				return {
					...baseStyle,
					top: '0',
					left: '0',
					width: '100%',
					height: '100%',
					borderRadius: '0',
				};
			}

			if (this.window.maximized) {
				return {
					...baseStyle,
					top: '0',
					left: '0',
					width: '100%',
					height: '100%',
				};
			}

			const x = this.window.centered ? this.centeredPosition.x : this.window.x;
			const y = this.window.centered ? this.centeredPosition.y : this.window.y;

			return {
				...baseStyle,
				top: `${y}px`,
				left: `${x}px`,
				width: `${this.window.width}px`,
				height: `${this.window.height}px`,
			};
		},
	},
	methods: {
		getComponent(code, component) {
			if (!component) {
				return null;
			}

			if (componentCache.has(code)) {
				return componentCache.get(code);
			}

			const loader = () => import(`./apps/${component}.vue`);

			const asyncComponent = defineAsyncComponent({
				loader,
				loadingComponent: LoadingComponent,
				errorComponent: ErrorComponent,
				delay: 200,
				timeout: 10000,
			});

			componentCache.set(code, asyncComponent);
			return asyncComponent;
		},
		onSetWallpaper(url) {
			this.$emit('set-wallpaper', url);
		},
		onProfileUpdated(profile) {
			this.$emit('profile-updated', profile);
		},
		handleFocus() {
			this.$emit('focus', this.window.id);
		},
		startDrag(e) {
			if (this.window.maximized || this.isMobile) return;
			if (e.target.closest('.window-controls')) return;

			if (this.window.centered) {
				this.window.centered = false;
				this.window.x = this.centeredPosition.x;
				this.window.y = this.centeredPosition.y;
			}

			this.isDragging = true;
			const clientX = e.touches ? e.touches[0].clientX : e.clientX;
			const clientY = e.touches ? e.touches[0].clientY : e.clientY;
			this.dragStartX = clientX - this.window.x;
			this.dragStartY = clientY - this.window.y;

			if (e.touches) {
				document.addEventListener('touchmove', this.handleDrag, { passive: false });
				document.addEventListener('touchend', this.stopDrag);
			} else {
				document.addEventListener('mousemove', this.handleDrag);
				document.addEventListener('mouseup', this.stopDrag);
			}
		},
		handleDrag(e) {
			if (!this.isDragging) return;
			e.preventDefault();

			const clientX = e.touches ? e.touches[0].clientX : e.clientX;
			const clientY = e.touches ? e.touches[0].clientY : e.clientY;

			this.window.x = clientX - this.dragStartX;
			this.window.y = clientY - this.dragStartY;

			const maxX = window.innerWidth - this.window.width;
			const maxY = window.innerHeight - this.window.height - 48;

			this.window.x = Math.max(0, Math.min(this.window.x, maxX));
			this.window.y = Math.max(0, Math.min(this.window.y, maxY));
		},
		stopDrag() {
			this.isDragging = false;
			document.removeEventListener('mousemove', this.handleDrag);
			document.removeEventListener('mouseup', this.stopDrag);
			document.removeEventListener('touchmove', this.handleDrag);
			document.removeEventListener('touchend', this.stopDrag);
		},
		startResize(e) {
			if (this.window.maximized || this.isMobile) return;
			if (this.window.resizable === false) return;

			this.isResizing = true;
			const clientX = e.touches ? e.touches[0].clientX : e.clientX;
			const clientY = e.touches ? e.touches[0].clientY : e.clientY;
			this.resizeStartX = clientX;
			this.resizeStartY = clientY;
			this.resizeStartWidth = this.window.width;
			this.resizeStartHeight = this.window.height;

			if (e.touches) {
				document.addEventListener('touchmove', this.handleResize, { passive: false });
				document.addEventListener('touchend', this.stopResize);
			} else {
				document.addEventListener('mousemove', this.handleResize);
				document.addEventListener('mouseup', this.stopResize);
			}
		},
		handleResize(e) {
			if (!this.isResizing) return;
			e.preventDefault();

			const clientX = e.touches ? e.touches[0].clientX : e.clientX;
			const clientY = e.touches ? e.touches[0].clientY : e.clientY;

			const deltaX = clientX - this.resizeStartX;
			const deltaY = clientY - this.resizeStartY;

			this.window.width = Math.max(300, this.resizeStartWidth + deltaX);
			this.window.height = Math.max(300, this.resizeStartHeight + deltaY);
		},
		stopResize() {
			this.isResizing = false;
			document.removeEventListener('mousemove', this.handleResize);
			document.removeEventListener('mouseup', this.stopResize);
			document.removeEventListener('touchmove', this.handleResize);
			document.removeEventListener('touchend', this.stopResize);
		},
		handleContextMenu(e) {
			e.preventDefault();
		},
	},
};
</script>

<style scoped>
.window {
	--win-bg: #f3f3f3;
	--win-header-bg: #f3f3f3;
	--win-title-color: #1a1a1a;
	--win-title-color-inactive: #666666;
	--win-border: rgba(0, 0, 0, 0.1);
	--win-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1);
	--win-shadow-focused: 0 16px 48px rgba(0, 0, 0, 0.2), 0 4px 16px rgba(0, 0, 0, 0.12);
	--win-title-height: 32px;
	--win-radius: 8px;

	position: absolute;
	background-color: var(--win-bg);
	border-radius: var(--win-radius);
	border: 1px solid var(--win-border);
	box-shadow: var(--win-shadow);
	overflow: hidden;
	display: flex;
	flex-direction: column;
	transition: box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.3s ease;
}

.window.focused {
	box-shadow: var(--win-shadow-focused);
	border-color: rgba(0, 0, 0, 0.08);
	z-index: 100;
}

.window:not(.focused) {
	z-index: 1;
}

.window:not(.focused) .window-header {
	background-color: var(--win-header-bg);
	opacity: 0.85;
}

.window.maximized {
	border-radius: 0;
	border: none;
}

.window-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: var(--win-title-height);
	padding: 0 4px 0 12px;
	background-color: var(--win-header-bg);
	cursor: move;
	user-select: none;
	-webkit-app-region: drag;
	transition: background-color 0.3s ease;
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
	width: 46px;
	height: 100%;
	border: none;
	background: transparent;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	color: var(--win-title-color);
	transition: background-color 0.1s ease;
	position: relative;
}

.control-btn:hover {
	background-color: rgba(0, 0, 0, 0.05);
}

.control-btn:active {
	background-color: rgba(0, 0, 0, 0.08);
}

.control-btn.close:hover {
	background-color: #c42b1c;
	color: #fff;
}

.control-btn.close:active {
	background-color: #a0261a;
	color: #fff;
}

.window-content {
	flex: 1;
	overflow: auto;
	background-color: var(--win-bg);
}

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
