<template>
	<el-config-provider :locale="elLocale" :size="config.size" :zIndex="config.zIndex" :button="config.button">
		<component :is="layoutComponent" />
		<scLogPanel ref="logPanel" />
	</el-config-provider>
</template>

<script>
import { useI18n } from "vue-i18n";
import { computed, watchEffect } from "vue";
import { useRoute } from "vue-router";

import LayoutNone from "@/layout/none/index.vue";
import LayoutConsole from "@/layout/console/index.vue";
import LayoutDesktop from "@/layout/desktop/index.vue";
import LayoutMonitor from "@/layout/monitor/index.vue";

import { useGlobalStore } from "@/stores/global";
import { syncI18nWithGlobalStore } from "@/locales";
import themeUtil from "@/utils/theme";

const layouts = [LayoutNone, LayoutConsole, LayoutDesktop, LayoutMonitor];

export default {
	name: "App",
	setup() {
		const { messages } = useI18n()
		const route = useRoute()
		const globalStore = useGlobalStore()

		// 将 globalStore.locale 变更同步到 i18n（保持两者一致）
		syncI18nWithGlobalStore()

		// Element Plus locale 随 globalStore.locale 响应式更新
		const elLocale = computed(() => messages.value[globalStore.locale]?.el || messages.value['zh-cn']?.el)

		const layoutComponent = computed(() => {
			const layoutType = route.meta?.layout || 0;
			return layouts[layoutType] || layouts[0];
		});

		// 首次：在 Pinia + i18n 均就绪后初始化主题（含 dark mode、on-primary 等正确顺序）
		themeUtil.initTheme()

		// 运行期：locale 变化时同步到 document lang（辅助无障碍/浏览器）
		watchEffect(() => {
			if (globalStore.locale) document.documentElement.setAttribute('lang', globalStore.locale)
		})

		return { elLocale, layoutComponent, globalStore }
	},
	data() {
		return {
			config: {
				size: "default",
				zIndex: 2000,
				button: {
					autoInsertSpace: false,
				},
			},
		};
	},
	mounted() {
		// 全局快捷键 Ctrl+Shift+L 打开日志面板
		this._logPanelKeyHandler = (e) => {
			if (e.ctrlKey && e.shiftKey && e.code === 'KeyL') {
				e.preventDefault()
				this.$refs.logPanel?.open()
			}
		}
		window.addEventListener('keydown', this._logPanelKeyHandler, true)
		// 全局方法 fallback：可在控制台调用 openLogPanel() 打开
		window.openLogPanel = () => this.$refs.logPanel?.open()
	},
	beforeUnmount() {
		if (this._logPanelKeyHandler) {
			window.removeEventListener('keydown', this._logPanelKeyHandler, true)
		}
		delete window.openLogPanel
	},
};
</script>

<style lang="scss">
@use "@/style/style.scss";
</style>
