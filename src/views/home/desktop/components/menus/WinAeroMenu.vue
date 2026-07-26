<template>
	<div class="start-menu win-aero-start-menu">
		<div class="win-aero-menu-body">
			<div class="win-aero-menu-left">
				<div class="win-aero-menu-apps">
					<div v-for="app in apps" :key="app.id" class="win-aero-app-item"
						@mouseenter="$emit('show-submenu', $event, app)" @mouseleave="$emit('hide-submenu')">
						<div class="win-aero-app-link" @click="app.children ? null : $emit('open-app', app)">
							<sc-icon :name="app.meta.icon" :size="24" />
							<span>{{ app.name }}</span>
							<sc-icon v-if="app.children" name="ms-arrow_forward" class="arrow" :size="14" />
						</div>
					</div>
				</div>
				<div class="win-aero-menu-search">
					<input v-model="search" type="text" :placeholder="$t('desktop.search')" />
				</div>
			</div>
			<div class="win-aero-menu-right">
				<div class="win-aero-menu-avatar" @click="$emit('open-profile')">
					<sc-icon name="ms-account_circle" :size="40" color="#3B6BD4" />
				</div>
				<div v-for="link in quickLinks" :key="link.key" class="win-aero-right-item"
					@click="$emit('open-quick-link', link)">
					<span>{{ link.name }}</span>
				</div>
				<div class="win-aero-right-divider"></div>
				<div class="win-aero-right-item" @click="$emit('logout')"><span>{{ $t('desktop.logoff') }}</span></div>
				<div class="win-aero-right-item" @click="$emit('shutdown')"><span>{{ $t('desktop.shutdown') }}</span></div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'WinAeroMenu',
	props: {
		apps: { type: Array, default: () => [] },
		quickLinks: { type: Array, default: () => [] },
		modelValue: { type: String, default: '' },
	},
	emits: ['open-app', 'open-profile', 'open-quick-link', 'logout', 'shutdown', 'show-submenu', 'hide-submenu', 'update:modelValue'],
	computed: {
		search: {
			get() { return this.modelValue; },
			set(val) { this.$emit('update:modelValue', val); },
		},
	},
};
</script>
