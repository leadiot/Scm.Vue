<template>
	<div class="start-menu xp-start-menu">
		<div class="xp-menu-header" @click="$emit('open-profile')">
			<div class="xp-menu-avatar">
				<sc-icon name="ms-account_circle" :size="30" color="#3B6BD4" />
			</div>
			<span class="xp-menu-username">{{ userName }}</span>
		</div>
		<div class="xp-menu-body">
			<div class="xp-menu-left">
				<div class="xp-menu-caption">{{ $t('desktop.allPrograms') }}</div>
				<div v-for="app in apps" :key="app.id" class="xp-menu-item"
					:class="{ 'has-children': app.children }" @mouseenter="$emit('show-submenu', $event, app)"
					@mouseleave="$emit('hide-submenu')">
					<div class="xp-menu-app" @click="app.children ? null : $emit('open-app', app)">
						<sc-icon :name="app.meta.icon" :size="22" />
						<span>{{ app.name }}</span>
						<sc-icon v-if="app.children" name="ms-arrow_forward" class="arrow" :size="14" />
					</div>
				</div>
			</div>
			<div class="xp-menu-right">
				<div v-for="link in quickLinks" :key="link.key" class="xp-right-item"
					@click="$emit('open-quick-link', link)">
					<sc-icon :name="link.icon" :size="18" />
					<span>{{ link.name }}</span>
				</div>
			</div>
		</div>
		<div class="xp-menu-footer">
			<div class="xp-footer-btn" @click="$emit('logout')">
				<span class="xp-footer-icon xp-icon-logoff">
					<sc-icon name="ms-logout" :size="13" color="#ffffff" />
				</span>
				<span>{{ $t('desktop.logoff') }}</span>
			</div>
			<div class="xp-footer-btn" @click="$emit('shutdown')">
				<span class="xp-footer-icon xp-icon-shutdown">
					<sc-icon name="ms-power_settings_new" :size="13" color="#ffffff" />
				</span>
				<span>{{ $t('desktop.shutdown') }}</span>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'XpMenu',
	props: {
		apps: { type: Array, default: () => [] },
		quickLinks: { type: Array, default: () => [] },
		userName: { type: String, default: 'User' },
	},
	emits: ['open-app', 'open-profile', 'open-quick-link', 'logout', 'shutdown', 'show-submenu', 'hide-submenu'],
};
</script>
