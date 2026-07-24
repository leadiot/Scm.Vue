<template>
	<!-- macOS 风格标题栏（左侧红黄绿按钮，标题居中） -->
	<template v-if="winStyle === 'macos'">
		<div class="window-header macos-header" :style="headerBarStyle" @mousedown="$emit('start-drag', $event)" @touchstart.passive="$emit('start-drag', $event)">
			<div class="traffic-lights">
				<div class="traffic-btn close-btn" @click.stop="$emit('close')">
					<svg width="12" height="12" viewBox="0 0 12 12">
						<circle cx="6" cy="6" r="6" fill="#ff5f57"/>
						<path d="M3.8,3.8 L8.2,8.2 M8.2,3.8 L3.8,8.2" stroke="#8b0000" stroke-width="1" opacity="0" class="close-x" />
					</svg>
				</div>
				<div class="traffic-btn min-btn" @click.stop="$emit('minimize')">
					<svg width="12" height="12" viewBox="0 0 12 12">
						<circle cx="6" cy="6" r="6" fill="#ffbd2e"/>
						<line x1="3" y1="6" x2="9" y2="6" stroke="#995900" stroke-width="1" opacity="0" class="min-line" />
					</svg>
				</div>
				<div class="traffic-btn max-btn" @click.stop="$emit('maximize')">
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

	<!-- Mac OS 9 经典白金风格标题栏 -->
	<template v-else-if="winStyle === 'mac9'">
		<div class="window-header mac9-header" :style="headerBarStyle" @mousedown="$emit('start-drag', $event)" @touchstart.passive="$emit('start-drag', $event)">
			<button class="mac9-btn" :title="$t('desktop.winClose')" @click.stop="$emit('close')">
				<span class="mac9-glyph">×</span>
			</button>
			<span class="mac9-title">{{ window.title }}</span>
			<div class="mac9-buttons">
				<button class="mac9-btn" :title="$t('desktop.winZoom')" @click.stop="$emit('maximize')">
					<span class="mac9-glyph">+</span>
				</button>
				<button class="mac9-btn" :title="$t('desktop.winCollapse')" @click.stop="$emit('minimize')">
					<span class="mac9-glyph">–</span>
				</button>
			</div>
		</div>
	</template>

	<!-- 经典风格标题栏 -->
	<template v-else-if="winStyle === 'winClassic'">
		<div class="window-header winxp-header" :style="headerBarStyle" @mousedown="$emit('start-drag', $event)" @touchstart.passive="$emit('start-drag', $event)">
			<div class="winxp-title-left">
				<sc-icon :name="window.icon || 'ms-grid_view'" :size="14" color="#ffffff" />
			</div>
			<span class="winxp-title-text">{{ window.title }}</span>
			<div class="winxp-buttons">
				<button class="winxp-btn min-btn" :title="$t('desktop.winMinimize')" @click.stop="$emit('minimize')">
					<svg width="8" height="8" viewBox="0 0 8 8"><rect x="0.5" y="3.5" width="7" height="1.5" rx="0.5" fill="currentColor"/></svg>
				</button>
				<button class="winxp-btn max-btn" :title="$t('desktop.winMaximize')" @click.stop="$emit('maximize')">
					<svg width="9" height="9" viewBox="0 0 9 9" v-if="!window.maximized">
						<rect x="0.5" y="0.5" width="8" height="8" rx="0.5" fill="none" stroke="currentColor" stroke-width="1.2"/>
					</svg>
					<svg width="9" height="9" viewBox="0 0 9 9" v-else>
						<rect x="1" y="2.5" width="6.5" height="6" rx="0.5" fill="none" stroke="currentColor" stroke-width="1.2"/>
						<rect x="0" y="0" width="6.5" height="6" rx="0.5" fill="#000080"/>
					</svg>
				</button>
				<button class="winxp-btn close-btn" :title="$t('desktop.winClose')" @click.stop="$emit('close')">
					<svg width="8" height="8" viewBox="0 0 8 8"><path d="M1,1 L7,7 M7,1 L1,7" stroke="currentColor" stroke-width="1.2"/></svg>
				</button>
			</div>
		</div>
	</template>

	<!-- 通用 Windows 风格标题栏 (win7/win10/win11/default) -->
	<template v-else>
		<div class="window-header" :style="headerBarStyle" @mousedown="$emit('start-drag', $event)" @touchstart.passive="$emit('start-drag', $event)">
			<div class="window-title">
				<sc-icon :name="window.icon || 'ms-grid_view'" :size="16" />
				<span>{{ window.title }}</span>
			</div>
			<div class="window-controls">
				<button class="control-btn minimize" @click.stop="$emit('minimize')">
					<svg width="12" height="12" viewBox="0 0 12 12"><rect x="2" y="5.5" width="8" height="1" fill="none" stroke="currentColor" stroke-width="1" /></svg>
				</button>
				<button v-if="window.resizable !== false && !isMobile" class="control-btn maximize" @click.stop="$emit('maximize')">
					<svg v-if="window.maximized" width="12" height="12" viewBox="0 0 12 12">
						<rect x="3" y="1" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1" />
						<rect x="1" y="3" width="8" height="8" fill="var(--win-bg, #ffffff)" stroke="currentColor" stroke-width="1.2" />
					</svg>
					<svg v-else width="12" height="12" viewBox="0 0 12 12">
						<rect x="1" y="1" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.2" />
					</svg>
				</button>
				<button class="control-btn close" @click.stop="$emit('close')">
					<svg width="12" height="12" viewBox="0 0 12 12">
						<line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" stroke-width="1.2" />
						<line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" stroke-width="1.2" />
					</svg>
				</button>
			</div>
		</div>
	</template>
</template>

<script>
export default {
	name: 'TitleBar',
	props: {
		window: { type: Object, required: true },
		winStyle: { type: String, default: 'modern' },
		headerBarStyle: { type: Object, default: () => ({}) },
		isMobile: { type: Boolean, default: false },
	},
	emits: ['close', 'minimize', 'maximize', 'start-drag'],
};
</script>
