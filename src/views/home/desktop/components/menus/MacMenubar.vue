<template>
	<div class="mac-menubar">
		<div class="mac-menubar-left">
			<div class="mac-menu-apple" @click="$emit('toggle-start-menu')">
				<img v-if="startLogo" :src="startLogo" class="mac-apple-icon" alt="" draggable="false" />
				<sc-icon v-else :name="startIcon" :size="24" />
			</div>
			<span class="mac-menu-appname">{{ focusedTitle }}</span>
		</div>
		<div class="mac-menubar-right">
			<el-tooltip :content="dateTime" placement="bottom">
				<span class="mac-menu-clock" @dblclick="$emit('open-calendar')">{{ time }}</span>
			</el-tooltip>
		</div>
	</div>
</template>

<script>
export default {
	name: 'MacMenubar',
	props: {
		startLogo: { type: String, default: '' },
		startIcon: { type: String, default: '' },
		focusedTitle: { type: String, default: 'Finder' },
		dateTime: { type: String, default: '' },
		time: { type: String, default: '' },
	},
	emits: ['toggle-start-menu', 'open-calendar'],
};
</script>
