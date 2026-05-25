<template>
	<el-config-provider :locale="locale" :size="config.size" :zIndex="config.zIndex" :button="config.button">
		<component :is="layoutComponent" />
	</el-config-provider>
</template>

<script>
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import { useRoute } from "vue-router";

import LayoutNone from "@/layout/none/index.vue";
import LayoutConsole from "@/layout/console/index.vue";
import LayoutDesktop from "@/layout/desktop/index.vue";
import LayoutMonitor from "@/layout/monitor/index.vue";

const layouts = [LayoutNone, LayoutConsole, LayoutDesktop, LayoutMonitor];

export default {
	name: "App",
	setup() {
		const { locale, messages } = useI18n()
		const elLocale = computed(() => messages.value[locale.value].el)
		const route = useRoute()

		const layoutComponent = computed(() => {
			const layoutType = route.meta?.layout || 0;
			return layouts[layoutType] || layouts[0];
		});

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
	}
};
</script>

<style lang="scss">
@use "@/style/style.scss";
</style>
