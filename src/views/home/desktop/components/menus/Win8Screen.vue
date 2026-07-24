<template>
	<div class="win8-start-screen" @click.self="$emit('close')">
		<div class="win8-screen-header">
			<span class="win8-screen-title">{{ $t('desktop.start') }}</span>
			<div class="win8-screen-user" @click="$emit('open-profile')">
				<sc-icon name="ms-account_circle" :size="28" />
				<span>{{ userName }}</span>
			</div>
		</div>
		<div class="win8-tiles">
			<div v-for="app in apps" :key="app.id" class="win8-tile"
				:style="{ backgroundColor: tileColor(app) }" @click="$emit('open-app', app)">
				<sc-icon :name="app.meta.icon" :size="36" />
				<span>{{ app.name }}</span>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Win8Screen',
	props: {
		apps: { type: Array, default: () => [] },
		userName: { type: String, default: 'User' },
	},
	emits: ['open-app', 'open-profile', 'close'],
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
