<!-- 大屏幕布局 -->
<template>
	<div class="monitor-layout">
		<router-view v-slot="{ Component }">
			<keep-alive :include="keepLiveRoute">
				<component :is="Component" :key="$route.fullPath" v-if="routeShow" />
			</keep-alive>
		</router-view>
	</div>
</template>

<script>
import { useKeepAliveStore } from '@/stores/keepAlive';

export default {
	name: 'MonitorLayout',
	setup() {
		const keepAliveStore = useKeepAliveStore();
		return {
			keepLiveRoute: keepAliveStore.keepLiveRoute,
			routeShow: keepAliveStore.routeShow,
		};
	},
};
</script>

<style scoped>
.monitor-layout {
	width: 100%;
	height: 100vh;
	overflow: hidden;
	background: #000;
}
</style>
