<template>
	<div class="start-menu mac-apple-menu">
		<div class="apple-menu-item" @click="$emit('open-profile')"><span>{{ $t('desktop.aboutMac') }}</span></div>
		<div class="apple-menu-item" @click="$emit('open-settings')"><span>{{ $t('desktop.systemSettings') }}</span></div>
		<div class="apple-menu-divider"></div>
		<div class="apple-menu-item" @click="$emit('toggle-launchpad')"><span>{{ $t('desktop.launchpad') }}</span></div>
		<div class="apple-menu-divider"></div>
		<div class="apple-menu-item" @click="$emit('force-quit')"><span>{{ $t('desktop.forceQuit') }}</span></div>
		<div class="apple-menu-divider"></div>
		<div class="apple-menu-item" @click="$emit('shutdown')"><span>{{ $t('desktop.shutdown') }}</span></div>
		<div class="apple-menu-item" @click="$emit('logout')"><span>{{ $t('desktop.logoff') }}</span></div>
	</div>
</template>

<script>
export default {
	name: 'MacAppleMenu',
	emits: ['open-profile', 'open-settings', 'toggle-launchpad', 'force-quit', 'shutdown', 'logout'],
};
</script>
