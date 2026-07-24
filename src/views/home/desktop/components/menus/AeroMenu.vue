<template>
	<div class="start-menu aero-start-menu">
		<div class="aero-menu-body">
			<div class="aero-menu-left">
				<div class="aero-menu-apps">
					<div v-for="app in apps" :key="app.id" class="aero-app-item"
						@mouseenter="$emit('show-submenu', $event, app)" @mouseleave="$emit('hide-submenu')">
						<div class="aero-app-link" @click="app.children ? null : $emit('open-app', app)">
							<sc-icon :name="app.meta.icon" :size="24" />
							<span>{{ app.name }}</span>
							<sc-icon v-if="app.children" name="ms-arrow_forward" class="arrow" :size="14" />
						</div>
					</div>
				</div>
				<div class="aero-menu-search">
					<input v-model="search" type="text" :placeholder="$t('desktop.search')" />
				</div>
			</div>
			<div class="aero-menu-right">
				<div class="aero-menu-avatar" @click="$emit('open-profile')">
					<sc-icon name="ms-account_circle" :size="40" color="#3B6BD4" />
				</div>
				<div v-for="link in quickLinks" :key="link.key" class="aero-right-item"
					@click="$emit('open-quick-link', link)">
					<span>{{ link.name }}</span>
				</div>
				<div class="aero-right-divider"></div>
				<div class="aero-right-item" @click="$emit('logout')"><span>{{ $t('desktop.logoff') }}</span></div>
				<div class="aero-right-item" @click="$emit('shutdown')"><span>{{ $t('desktop.shutdown') }}</span></div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'AeroMenu',
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
