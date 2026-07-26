<template>
	<div class="start-menu win10-start-menu" :style="{ backgroundColor: menuColor, color: menuTextColor }">
		<div class="win10-menu-rail">
			<div class="win10-rail-item" :title="userName" @click="$emit('open-profile')">
				<sc-icon name="ms-account_circle" :size="20" />
			</div>
			<div class="win10-rail-spacer"></div>
			<div class="win10-rail-item" :title="$t('desktop.settings')" @click="$emit('open-settings')">
				<sc-icon name="ms-settings" :size="20" />
			</div>
			<div class="win10-rail-item" :title="$t('desktop.exit')" @click="$emit('logout')">
				<sc-icon name="ms-power_settings_new" :size="20" />
			</div>
		</div>
		<div class="win10-menu-apps">
			<div class="win10-menu-search">
				<input v-model="search" type="text" :placeholder="$t('desktop.search')" />
			</div>
			<div v-for="app in apps" :key="app.id" class="win10-app-item"
				@mouseenter="$emit('show-submenu', $event, app)" @mouseleave="$emit('hide-submenu')">
				<div class="win10-app-link" @click="app.children ? null : $emit('open-app', app)">
					<sc-icon :name="app.meta.icon" :size="18" />
					<span>{{ app.name }}</span>
					<sc-icon v-if="app.children" name="ms-arrow_forward" class="arrow" :size="14" />
				</div>
			</div>
		</div>
		<div class="win10-menu-tiles">
			<div v-for="app in tiles" :key="app.id" class="win10-tile" :style="{ backgroundColor: tileColor(app) }"
				@click="$emit('open-app', app)">
				<sc-icon :name="app.meta.icon" :size="26" />
				<span>{{ app.name }}</span>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Win10Menu',
	props: {
		apps: { type: Array, default: () => [] },
		tiles: { type: Array, default: () => [] },
		menuColor: { type: String, default: '' },
		menuTextColor: { type: String, default: '' },
		userName: { type: String, default: 'User' },
		modelValue: { type: String, default: '' },
	},
	emits: ['open-app', 'open-profile', 'open-settings', 'logout', 'show-submenu', 'hide-submenu', 'update:modelValue'],
	computed: {
		search: {
			get() { return this.modelValue; },
			set(val) { this.$emit('update:modelValue', val); },
		},
	},
	methods: {
		tileColor(app) {
			const palette = ['#0078D7', '#107C10', '#5C2D91', '#D83B01', '#038387', '#CA5010', '#986F0B', '#004E8C'];
			const code = app.code || app.name || 'app';
			let hash = 0;
			for (let i = 0; i < code.length; i++) {
				hash = (hash * 31 + code.charCodeAt(i)) % 997;
			}
			return palette[hash % palette.length];
		},
	},
};
</script>
