<template>
	<div class="mac-dock">
		<div class="mac-dock-item" title="Launchpad" @click="$emit('toggle-launchpad')">
			<sc-icon name="ms-apps" :size="40" />
		</div>
		<div class="mac-dock-separator"></div>
		<div v-for="item in items" :key="item.key" class="mac-dock-item" :class="{ running: item.running }"
			:title="itemTitle(item)" @click="$emit('dock-click', item)">
			<img v-if="icon(item)" :src="icon(item)" alt="" draggable="false" />
			<sc-icon v-else :name="iconName(item)" :size="42" />
			<span v-if="item.running" class="mac-dock-dot"></span>
		</div>
	</div>
</template>

<script>
export default {
	name: 'MacDock',
	props: {
		items: { type: Array, default: () => [] },
		iconsPath: { type: String, default: '' },
	},
	emits: ['toggle-launchpad', 'dock-click'],
	methods: {
		icon(item) {
			const code = item.app ? item.app.meta.icon : item.window.icon;
			if (!this.iconsPath) return null;
			return code ? this.iconsPath + code + '.png' : null;
		},
		iconName(item) {
			return item.app ? item.app.meta.icon : (item.window.icon || 'ms-grid_view');
		},
		itemTitle(item) {
			return item.app ? item.app.name : item.window.title;
		},
	},
};
</script>
