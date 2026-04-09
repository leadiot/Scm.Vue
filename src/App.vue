<template>
	<el-config-provider :locale="locale" :size="config.size" :zIndex="config.zIndex" :button="config.button">
		<component :is="layoutComponent" />
	</el-config-provider>
</template>

<script>
import colorTool from "@/utils/color";
import { useI18n } from "vue-i18n";
import { computed, shallowRef, watch } from "vue";
import { useRoute } from "vue-router";

import LayoutNone from "@/layout/none/index.vue";
import LayoutConsole from "@/layout/console/index.vue";
import LayoutDesktop from "@/layout/desktop/index.vue";
import LayoutMonitor from "@/layout/monitor/index.vue";

const layouts = {
	none: LayoutNone,
	console: LayoutConsole,
	desktop: LayoutDesktop,
	monitor: LayoutMonitor,
};

export default {
	name: "App",
	setup() {
		const { locale, messages } = useI18n()
		const elLocale = computed(() => messages.value[locale.value].el)
		const route = useRoute()
		const layoutComponent = shallowRef(layouts.none)

		watch(
			() => route.meta?.layout,
			(layoutType) => {
				layoutComponent.value = layouts[layoutType] || layouts.none
			},
			{ immediate: true }
		)

		return { elLocale, layoutComponent }
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
	computed: {
		locale() {
			return this.elLocale;
		},
	},
	created() {
		const app_color = this.$CONFIG.COLOR || this.$TOOL.data.get("APP_COLOR");
		if (app_color) {
			document.documentElement.style.setProperty("--el-color-primary", app_color);
			for (let i = 1; i <= 9; i++) {
				document.documentElement.style.setProperty(
					`--el-color-primary-light-${i}`,
					colorTool.lighten(app_color, i / 10)
				);
			}
			for (let i = 1; i <= 9; i++) {
				document.documentElement.style.setProperty(
					`--el-color-primary-dark-${i}`,
					colorTool.darken(app_color, i / 10)
				);
			}
		}
	},
};
</script>

<style lang="scss">
@use "@/style/style.scss";
</style>
