<template>
	<div class="start-menu classic-start-menu">
		<div class="classic-menu-banner"><span>{{ title }}</span></div>
		<div class="classic-menu-body">
			<div v-for="app in apps" :key="app.id" class="classic-menu-item"
				@mouseenter="$emit('show-submenu', $event, app)" @mouseleave="$emit('hide-submenu')">
				<div class="classic-menu-app" @click="app.children ? null : $emit('open-app', app)">
					<sc-icon :name="app.meta.icon" :size="24" />
					<span>{{ app.name }}</span>
					<sc-icon v-if="app.children" name="ms-arrow_forward" class="arrow" :size="14" />
				</div>
			</div>
			<div class="classic-menu-divider"></div>
			<div class="classic-menu-item">
				<div class="classic-menu-app" @click="$emit('open-settings')">
					<sc-icon name="ms-settings" :size="24" />
					<span>{{ $t('desktop.settings') }}</span>
				</div>
			</div>
			<div class="classic-menu-item">
				<div class="classic-menu-app" @click="$emit('logout')">
					<sc-icon name="ms-exit_to_app" :size="24" />
					<span>{{ $t('desktop.logoff') }}</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'ClassicMenu',
	props: {
		apps: { type: Array, default: () => [] },
		title: { type: String, default: 'Windows' },
	},
	emits: ['open-app', 'open-settings', 'logout', 'show-submenu', 'hide-submenu'],
};
</script>
