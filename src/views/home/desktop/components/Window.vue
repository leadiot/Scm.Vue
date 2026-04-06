<template>
	<div v-if="!window.minimized" class="window" :class="{ maximized: window.maximized, focused: window.focused }"
		:style="windowStyle" @mousedown="handleFocus">
		<div class="window-header" @mousedown="startDrag">
			<div class="window-title">
				<sc-icon :name="getIconName(window.icon)" :size="16" />
				<span>{{ window.title }}</span>
			</div>
			<div class="window-controls">
				<button class="control-btn minimize" @click.stop="$emit('minimize', window.id)">
					<sc-icon name="ms-remove" :size="12" />
				</button>
				<button class="control-btn maximize" @click.stop="$emit('maximize', window.id)">
					<sc-icon :name="window.maximized ? 'ms-content_copy' : 'ms-fullscreen'" :size="12" />
				</button>
				<button class="control-btn close" @click.stop="$emit('close', window.id)">
					<sc-icon name="ms-close" :size="12" />
				</button>
			</div>
		</div>

		<div class="window-content">
			<component :is="getComponent(window.component)" />
		</div>

		<div v-if="!window.maximized" class="resize-handle" @mousedown.stop="startResize"></div>
	</div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';
import Documents from './apps/Documents.vue';
import BrowserApp from './apps/Browser.vue';
import CalculatorApp from './apps/Calculator.vue';
import CalendarApp from './apps/Calendar.vue';
import MessageApp from './apps/Message.vue';
import VideoApp from './apps/Video.vue';
import MusicApp from './apps/Music.vue';
import TerminalApp from './apps/Terminal.vue';
import PictureApp from './apps/Picture.vue';
import DownloadApp from './apps/Download.vue';

const iconMap = {
	Folder: 'ms-folder',
	Browser: 'ms-language',
	Calculator: 'ms-calculate',
	Calendar: 'ms-calendar_today',
	Message: 'ms-mail',
	VideoCamera: 'ms-videocam',
	Music: 'ms-music_note',
	Terminal: 'ms-terminal',
	Pictures: 'ms-photo_library',
	Download: 'ms-download',
	Minus: 'ms-remove',
	Close: 'ms-close',
	FullScreen: 'ms-fullscreen',
	CopyDocument: 'ms-content_copy',
};

export default {
	name: 'Window',
	components: {
		scIcon,
	},
	props: {
		window: {
			type: Object,
			required: true,
		},
	},
	emits: ['close', 'minimize', 'maximize', 'focus'],
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
		windowStyle() {
			if (this.window.maximized) {
				return {
					top: '0',
					left: '0',
					width: '100%',
					height: 'calc(100% - 48px)',
				};
			}
			return {
				top: `${this.window.y}px`,
				left: `${this.window.x}px`,
				width: `${this.window.width}px`,
				height: `${this.window.height}px`,
			};
		},
	},
	methods: {
		getIconName(iconName) {
			return iconMap[iconName] || 'ms-folder';
		},
		getComponent(componentName) {
			const components = {
				Documents,
				Browser: BrowserApp,
				Calculator: CalculatorApp,
				Calendar: CalendarApp,
				Message: MessageApp,
				Video: VideoApp,
				Music: MusicApp,
				Terminal: TerminalApp,
				Pictures: PictureApp,
				Download: DownloadApp,
			};
			return components[componentName] || Documents;
		},
		handleFocus() {
			this.$emit('focus', this.window.id);
		},
		startDrag(e) {
			if (this.window.maximized) return;
			if (e.target.closest('.window-controls')) return;

			this.isDragging = true;
			this.dragStartX = e.clientX - this.window.x;
			this.dragStartY = e.clientY - this.window.y;

			document.addEventListener('mousemove', this.handleDrag);
			document.addEventListener('mouseup', this.stopDrag);
		},
		handleDrag(e) {
			if (!this.isDragging) return;

			this.window.x = e.clientX - this.dragStartX;
			this.window.y = e.clientY - this.dragStartY;

			const maxX = window.innerWidth - this.window.width;
			const maxY = window.innerHeight - this.window.height - 48;

			this.window.x = Math.max(0, Math.min(this.window.x, maxX));
			this.window.y = Math.max(0, Math.min(this.window.y, maxY));
		},
		stopDrag() {
			this.isDragging = false;
			document.removeEventListener('mousemove', this.handleDrag);
			document.removeEventListener('mouseup', this.stopDrag);
		},
		startResize(e) {
			if (this.window.maximized) return;

			this.isResizing = true;
			this.resizeStartX = e.clientX;
			this.resizeStartY = e.clientY;
			this.resizeStartWidth = this.window.width;
			this.resizeStartHeight = this.window.height;

			document.addEventListener('mousemove', this.handleResize);
			document.addEventListener('mouseup', this.stopResize);
		},
		handleResize(e) {
			if (!this.isResizing) return;

			const deltaX = e.clientX - this.resizeStartX;
			const deltaY = e.clientY - this.resizeStartY;

			this.window.width = Math.max(400, this.resizeStartWidth + deltaX);
			this.window.height = Math.max(300, this.resizeStartHeight + deltaY);
		},
		stopResize() {
			this.isResizing = false;
			document.removeEventListener('mousemove', this.handleResize);
			document.removeEventListener('mouseup', this.stopResize);
		},
	},
};
</script>

<style scoped>
.window {
	position: absolute;
	background-color: #fff;
	border-radius: 8px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	overflow: hidden;
	display: flex;
	flex-direction: column;
	transition: box-shadow 0.3s;
}

.window.focused {
	box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
	z-index: 100;
}

.window:not(.focused) {
	z-index: 1;
}

.window.maximized {
	border-radius: 0;
}

.window-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 8px 12px;
	background-color: #f5f5f5;
	border-bottom: 1px solid #e0e0e0;
	cursor: move;
	user-select: none;
}

.window.focused .window-header {
	background-color: #e8f4ff;
}

.window-title {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 14px;
	font-weight: 500;
	color: #333;
}

.window-controls {
	display: flex;
	gap: 8px;
}

.control-btn {
	width: 24px;
	height: 24px;
	border: none;
	border-radius: 4px;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background-color 0.3s;
}

.control-btn.minimize {
	background-color: #ffbd2e;
	color: #fff;
}

.control-btn.minimize:hover {
	background-color: #ffa500;
}

.control-btn.maximize {
	background-color: #28c940;
	color: #fff;
}

.control-btn.maximize:hover {
	background-color: #00a800;
}

.control-btn.close {
	background-color: #ff5f57;
	color: #fff;
}

.control-btn.close:hover {
	background-color: #ff0000;
}

.window-content {
	flex: 1;
	overflow: auto;
	background-color: #fff;
}

.resize-handle {
	position: absolute;
	bottom: 0;
	right: 0;
	width: 12px;
	height: 12px;
	cursor: nwse-resize;
	background: linear-gradient(135deg, transparent 50%, #ccc 50%);
}
</style>
