<template>
	<div class="start-menu"
		:style="{ backgroundColor: menuColor, color: menuTextColor, borderRadius: menuBorderRadius }"
		:class="{ 'menu-glass': menuGlass }">
		<div class="start-menu-header" @click="$emit('open-profile')">
			<sc-icon name="ms-account_circle" :size="32" />
			<span>{{ userName }}</span>
		</div>
		<div class="start-menu-apps">
			<div v-for="app in apps" :key="app.id" class="start-menu-item"
				:class="{ 'has-children': app.children }" @mouseenter="$emit('show-submenu', $event, app)"
				@mouseleave="$emit('hide-submenu')">
				<div class="start-menu-app" @click="app.children ? null : $emit('open-app', app)">
					<sc-icon :name="app.meta.icon" />
					<span>{{ app.name }}</span>
					<sc-icon v-if="app.children" name="ms-arrow_forward" class="arrow" :size="16" />
				</div>
			</div>
		</div>
		<div class="start-menu-footer">
			<div class="start-menu-action" @click="$emit('open-settings')">
				<sc-icon name="ms-settings" />
				<span>{{ $t('desktop.settings') }}</span>
			</div>
			<div class="start-menu-action" @click="$emit('logout')">
				<sc-icon name="ms-exit_to_app" />
				<span>{{ $t('desktop.exit') }}</span>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'GenericMenu',
	props: {
		apps: { type: Array, default: () => [] },
		menuColor: { type: String, default: '' },
		menuTextColor: { type: String, default: '' },
		menuBorderRadius: { type: String, default: '' },
		menuGlass: { type: Boolean, default: false },
		userName: { type: String, default: 'User' },
	},
	emits: ['open-app', 'open-profile', 'open-settings', 'logout', 'show-submenu', 'hide-submenu'],
};
</script>
