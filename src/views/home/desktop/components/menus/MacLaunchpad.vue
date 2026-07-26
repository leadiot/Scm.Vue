<template>
	<div class="mac-launchpad" @click.self="$emit('close')">
		<div class="launchpad-search" @click.stop>
			<input v-model="search" type="text" :placeholder="$t('desktop.search')" />
		</div>
		<div class="launchpad-grid">
			<div v-for="app in apps" :key="app.id" class="launchpad-item" @click="$emit('open-app', app)">
				<div class="launchpad-icon">
					<img v-if="themeIcon(app.meta.icon)" :src="themeIcon(app.meta.icon)" alt="" draggable="false" />
					<sc-icon v-else :name="app.meta.icon" :size="56" />
				</div>
				<span>{{ app.name }}</span>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'MacLaunchpad',
	props: {
		apps: { type: Array, default: () => [] },
		iconsPath: { type: String, default: '' },
		modelValue: { type: String, default: '' },
	},
	emits: ['open-app', 'close', 'update:modelValue'],
	computed: {
		search: {
			get() { return this.modelValue; },
			set(val) { this.$emit('update:modelValue', val); },
		},
	},
	methods: {
		themeIcon(code) {
			if (!this.iconsPath) return null;
			return code ? this.iconsPath + code + '.png' : null;
		},
	},
};
</script>
