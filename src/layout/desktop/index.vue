<!-- 云桌面布局 -->
<template>
	<div class="desktop-layout">
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
	name: 'DesktopLayout',
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
.desktop-layout {
	width: 100%;
	height: 100vh;
	overflow: hidden;
}
</style>
