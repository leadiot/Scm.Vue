<template>
	<div class="start-menu win11-start-menu" :style="{ backgroundColor: menuColor, color: menuTextColor }">
		<div class="win11-menu-search">
			<input v-model="search" type="text" :placeholder="$t('desktop.search')" />
		</div>
		<div class="win11-menu-section">{{ $t('desktop.pinned') }}</div>
		<div class="win11-menu-grid">
			<div v-for="app in apps" :key="app.id" class="win11-grid-item" @click="$emit('open-app', app)">
				<sc-icon :name="app.meta.icon" :size="28" />
				<span>{{ app.name }}</span>
			</div>
		</div>
		<div class="win11-menu-footer">
			<div class="win11-footer-user" @click="$emit('open-profile')">
				<sc-icon name="ms-account_circle" :size="24" />
				<span>{{ userName }}</span>
			</div>
			<div class="win11-footer-power" :title="$t('desktop.exit')" @click="$emit('logout')">
				<sc-icon name="ms-power_settings_new" :size="18" />
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Win11Menu',
	props: {
		apps: { type: Array, default: () => [] },
		menuColor: { type: String, default: '' },
		menuTextColor: { type: String, default: '' },
		userName: { type: String, default: 'User' },
		modelValue: { type: String, default: '' },
	},
	emits: ['open-app', 'open-profile', 'logout', 'update:modelValue'],
	computed: {
		search: {
			get() { return this.modelValue; },
			set(val) { this.$emit('update:modelValue', val); },
		},
	},
};
</script>
