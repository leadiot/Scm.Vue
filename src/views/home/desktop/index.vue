<template>
	<div class="desktop" :style="desktopStyle" @click="clearSelection" @contextmenu.prevent="showContextMenu">
		<!-- 桌面图标区域 -->
		<div class="desktop-icons">
			<div v-for="app in deskApps" :key="app.id" class="desktop-icon"
				:class="{ selected: selectedApp === app.id }" @click.stop="selectApp(app.id)"
				@dblclick.stop="openApp(app)">
				<div class="icon-image" :style="{ filter: iconShadow }">
					<sc-icon :name="app.meta.icon" :size="iconSize" :color="iconColor" />
				</div>
				<div class="icon-text" :style="{ color: iconColor }">{{ app.name }}</div>
			</div>
		</div>

		<!-- 窗口容器 -->
		<div class="windows-container">
			<Window v-for="window in windows" :key="window.id" :window="window" :theme="windowTheme"
				@close="closeWindow" @minimize="minimizeWindow" @maximize="maximizeWindow" @focus="focusWindow"
				@set-wallpaper="setWallpaper" @profile-updated="onProfileUpdated" @password-changed="onPasswordChanged"
				@theme-preview="onThemePreview" @save-settings="onSaveSettings" />
		</div>

		<!-- 任务栏 -->
		<div class="taskbar" :style="{ backgroundColor: taskbarColor, color: taskbarTextColor, borderRadius: taskbarBorderRadius }" :class="{ 'taskbar-glass': taskbarGlass }">
			<div class="taskbar-start" @click="toggleStartMenu">
				<sc-icon :name="taskbarStartIcon" :size="24" />
				<span>{{ $t('desktop.start') }}</span>
			</div>
			<div class="taskbar-apps">
				<div v-for="window in windows" :key="window.id" class="taskbar-app"
					:class="{ active: window.focused, minimized: window.minimized }" @click="toggleWindow(window.id)">
					<sc-icon :name="window.icon" :size="20" />
					<span>{{ window.title }}</span>
				</div>
			</div>
			<div class="taskbar-tray">
				<el-tooltip :content="currentDateTime" placement="top">
					<span class="time" @dblclick="openCalendar">{{ currentTime }}</span>
				</el-tooltip>
			</div>
		</div>

		<!-- 开始菜单 -->
		<div v-if="showStartMenu" class="start-menu" :style="{ backgroundColor: menuColor, color: menuTextColor, borderRadius: menuBorderRadius }" :class="{ 'menu-glass': menuGlass }">
			<div class="start-menu-header" @click="openProfile">
				<sc-icon name="ms-account_circle" :size="32" />
				<span>{{ user.userName || 'User' }}</span>
			</div>
			<div class="start-menu-apps">
				<div v-for="app in menuApps" :key="app.id" class="start-menu-item"
					:class="{ 'has-children': app.children }" @mouseenter="showSubmenu($event, app)"
					@mouseleave="hideSubmenu">
					<div class="start-menu-app" @click="app.children ? null : openApp(app)">
						<sc-icon :name="app.meta.icon" />
						<span>{{ app.name }}</span>
						<sc-icon v-if="app.children" name="ms-arrow_forward" class="arrow" :size="16" />
					</div>
				</div>
			</div>
			<div class="start-menu-footer">
				<div class="start-menu-action" @click="openSettings">
					<sc-icon name="ms-settings" />
					<span>{{ $t('desktop.settings') }}</span>
				</div>
				<div class="start-menu-action" @click="logout">
					<sc-icon name="ms-exit_to_app" />
					<span>{{ $t('desktop.exit') }}</span>
				</div>
			</div>
		</div>

		<!-- 子菜单 -->
		<div v-if="activeSubmenu" class="submenu"
			:style="{ ...submenuStyle, backgroundColor: menuColor, color: menuTextColor }" @mouseenter="keepSubmenu"
			@mouseleave="hideSubmenu">
			<div v-for="child in activeSubmenu.children" :key="child.id" class="submenu-item" @click="openApp(child)">
				<sc-icon :name="child.meta.icon" />
				<span>{{ child.name }}</span>
			</div>
		</div>

		<!-- 右键菜单 -->
		<div v-if="contextMenu.visible" class="context-menu"
			:style="{ ...contextMenu.style, backgroundColor: menuColor, color: menuTextColor }">
			<div class="context-menu-item" @click="refreshDesktop">
				<sc-icon name="ms-refresh" :size="16" />
				<span>{{ $t('desktop.refresh') }}</span>
			</div>
			<div class="context-menu-divider"></div>
			<div class="context-menu-item" @click="openSettings">
				<sc-icon name="ms-settings" :size="16" />
				<span>{{ $t('desktop.desktopSettings') }}</span>
			</div>
			<div class="context-menu-item" @click="openProfile">
				<sc-icon name="ms-account_circle" :size="16" />
				<span>{{ $t('desktop.profile') }}</span>
			</div>
			<div class="context-menu-divider"></div>
			<div class="context-menu-item"
				@click="openApp({ name: $t('desktop.terminal'), icon: 'ms-terminal', component: 'Terminal', width: 800, height: 560 })">
				<sc-icon name="ms-terminal" :size="16" />
				<span>{{ $t('desktop.openTerminal') }}</span>
			</div>
			<div class="context-menu-item" @click="openApp({ name: $t('desktop.cloudSpace'), icon: 'ms-folder', component: 'Files' })">
				<sc-icon name="ms-folder" :size="16" />
				<span>{{ $t('desktop.openCloudSpace') }}</span>
			</div>
		</div>
	</div>
</template>

<script>
import scIcon from '@/components/scIcon/index.vue';
import Window from './components/Window.vue';

export default {
	name: 'Desktop',
	components: {
		Window,
		scIcon,
	},
	data() {
		return {
			selectedApp: null,
			showStartMenu: false,
			contextMenu: {
				visible: false,
				style: {},
			},
			currentTime: '',
			windows: [],
			windowIdCounter: 0,
			activeSubmenu: null,
			submenuStyle: {},
			submenuTimeout: null,
			backgroundType: 'color',
			backgroundColor: '#409eff',
			backgroundImage: '',
			gradientColor1: '#667eea',
			gradientColor2: '#764ba2',
			gradientDirection: 'to bottom right',
			colorList: this.$CONFIG.PREDEFINE_COLORS,
			presetImages: [
				'/images/01.jpg',
				'/images/02.jpg',
				'/images/03.jpg',
				'/images/04.jpg',
				'/images/05.jpg',
				'/images/06.jpg',
				'/images/07.jpg',
				'/images/08.jpg',
			],
			user: {},
			home: '/',
			deskApps: [],
			menuApps: [],
			updateTimeInterval: null,
			documentClickHandler: null,
			iconColor: '#ffffff',
			iconShadow: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
			iconSize: 48,
			iconBgColor: 'transparent',
			iconBgRadius: '0px',
			iconBgSize: '0px',
			currentTheme: 'default',
			taskbarColor: 'rgba(0, 0, 0, 0.6)',
			taskbarTextColor: '#ffffff',
			taskbarBorderRadius: '4px',
			taskbarGlass: false,
			taskbarStartIcon: 'ms-grid_view',
			menuColor: 'rgba(0, 0, 0, 0.9)',
			menuTextColor: '#ffffff',
			menuBorderRadius: '8px',
			menuGlass: false,
			windowTheme: {
				bg: '#f3f3f3',
				headerBg: '#f3f3f3',
				titleColor: '#1a1a1a',
				titleColorInactive: '#666666',
				border: 'rgba(0, 0, 0, 0.1)',
				borderRadius: '8px',
				shadow: '0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)',
				closeBtnHover: '#c42b1c',
				minBtnHover: 'rgba(0, 0, 0, 0.1)',
				maxBtnHover: 'rgba(0, 0, 0, 0.1)'
			},
			settingsApp: {
				id: '1',
				code: 'app-settings',
				name: '设置',
				component: 'Settings',
				meta: {
					icon: 'ms-settings',
					width: 900,
					height: 620,
					resizable: true,
				}
			},
			profileApp: {
				id: '2',
				code: 'app-profile',
				name: '个人信息',
				component: 'Profile',
				meta: {
					icon: 'ms-account_circle',
					width: 460,
					height: 680,
					resizable: false,
				}
			},
			calendarApp: {
				id: '3',
				code: 'app-calendar',
				name: '日历',
				component: 'Calendar',
				meta: {
					icon: 'ms-calendar_month',
					width: 320,
					height: 460,
					resizable: false
				}
			},
			imageApp: {
				id: '11',
				code: 'app-image',
				name: '图像',
				component: 'Image',
				meta: {
					icon: 'ms-photo_library',
					width: 900,
					height: 700
				}
			},
			audioApp: {
				id: '12',
				code: 'app-audio',
				name: '音频',
				component: 'Audio',
				meta: {
					icon: 'ms-music_note',
					width: 500,
					height: 600
				}
			},
			videoApp: {
				id: '13',
				code: 'app-video',
				name: '视频',
				component: 'Video',
				meta: {
					icon: 'ms-videocam',
					width: 900,
					height: 600
				}
			},
			textApp: {
				id: '14',
				code: 'app-text',
				name: '记事本',
				component: 'Textpad',
				meta: {
					icon: 'ms-article',
					width: 800,
					height: 600
				}
			},
			themes: [
				{
					name: 'default',
					style: 'system',
					backgroundType: 'color',
					backgroundColor: '#0078d4',
					taskbarColor: 'rgba(0, 60, 90, 0.75)',
					taskbarTextColor: '#ffffff',
					menuColor: 'rgba(0, 60, 90, 0.92)',
					menuTextColor: '#ffffff',
					iconColor: '#ffffff',
					windowTheme: {
						bg: '#f8f9fa',
						headerBg: '#f8f9fa',
						titleColor: '#1a1a1a',
						titleColorInactive: '#6c757d',
						border: 'rgba(0, 120, 212, 0.15)'
					},
					previewStyle: { backgroundColor: '#0078d4' }
				},
				{
					name: 'dark',
					style: 'system',
					backgroundType: 'color',
					backgroundColor: '#0d1117',
					taskbarColor: 'rgba(13, 17, 23, 0.92)',
					taskbarTextColor: '#e6edf3',
					menuColor: 'rgba(22, 27, 34, 0.95)',
					menuTextColor: '#e6edf3',
					iconColor: '#e6edf3',
					windowTheme: {
						bg: '#161b22',
						headerBg: '#161b22',
						titleColor: '#e6edf3',
						titleColorInactive: '#7d8590',
						border: 'rgba(48, 54, 61, 0.8)'
					},
					previewStyle: { backgroundColor: '#0d1117' }
				},
				{
					name: 'light',
					style: 'system',
					backgroundType: 'color',
					backgroundColor: '#f5f7fa',
					taskbarColor: 'rgba(255, 255, 255, 0.85)',
					taskbarTextColor: '#24292f',
					menuColor: 'rgba(255, 255, 255, 0.95)',
					menuTextColor: '#24292f',
					iconColor: '#24292f',
					windowTheme: {
						bg: '#ffffff',
						headerBg: '#ffffff',
						titleColor: '#24292f',
						titleColorInactive: '#57606a',
						border: 'rgba(27, 31, 36, 0.12)'
					},
					previewStyle: { backgroundColor: '#f5f7fa' }
				},
				{
					name: 'aurora',
					style: 'system',
					backgroundType: 'gradient',
					gradientColor1: '#00c6ff',
					gradientColor2: '#0072ff',
					gradientDirection: 'to bottom right',
					taskbarColor: 'rgba(0, 114, 255, 0.75)',
					taskbarTextColor: '#ffffff',
					menuColor: 'rgba(0, 114, 255, 0.92)',
					menuTextColor: '#ffffff',
					iconColor: '#ffffff',
					windowTheme: {
						bg: 'rgba(255, 255, 255, 0.96)',
						headerBg: 'rgba(0, 198, 255, 0.12)',
						titleColor: '#1a1a1a',
						titleColorInactive: '#6c757d',
						border: 'rgba(0, 198, 255, 0.25)'
					},
					previewStyle: { background: 'linear-gradient(to bottom right, #00c6ff, #0072ff)' }
				},
				{
					name: 'midnight',
					style: 'system',
					backgroundType: 'gradient',
					gradientColor1: '#0f0c29',
					gradientColor2: '#302b63',
					gradientDirection: 'to bottom',
					taskbarColor: 'rgba(15, 12, 41, 0.88)',
					taskbarTextColor: '#e8e8f0',
					menuColor: 'rgba(30, 25, 60, 0.95)',
					menuTextColor: '#e8e8f0',
					iconColor: '#e8e8f0',
					windowTheme: {
						bg: 'rgba(25, 22, 45, 0.96)',
						headerBg: 'rgba(30, 27, 55, 0.96)',
						titleColor: '#e8e8f0',
						titleColorInactive: '#8b8ba0',
						border: 'rgba(80, 70, 120, 0.35)'
					},
					previewStyle: { background: 'linear-gradient(to bottom, #0f0c29, #302b63)' }
				},
				{
					name: 'ocean',
					style: 'system',
					backgroundType: 'gradient',
					gradientColor1: '#1e3c72',
					gradientColor2: '#2a5298',
					gradientDirection: 'to bottom right',
					taskbarColor: 'rgba(30, 60, 114, 0.8)',
					taskbarTextColor: '#ffffff',
					menuColor: 'rgba(30, 60, 114, 0.92)',
					menuTextColor: '#ffffff',
					iconColor: '#ffffff',
					windowTheme: {
						bg: 'rgba(255, 255, 255, 0.96)',
						headerBg: 'rgba(42, 82, 152, 0.12)',
						titleColor: '#1a1a1a',
						titleColorInactive: '#6c757d',
						border: 'rgba(42, 82, 152, 0.25)'
					},
					previewStyle: { background: 'linear-gradient(to bottom right, #1e3c72, #2a5298)' }
				},
				{
					name: 'forest',
					style: 'system',
					backgroundType: 'gradient',
					gradientColor1: '#134e5e',
					gradientColor2: '#71b280',
					gradientDirection: 'to bottom right',
					taskbarColor: 'rgba(19, 78, 94, 0.78)',
					taskbarTextColor: '#ffffff',
					menuColor: 'rgba(19, 78, 94, 0.92)',
					menuTextColor: '#ffffff',
					iconColor: '#ffffff',
					windowTheme: {
						bg: 'rgba(255, 255, 255, 0.96)',
						headerBg: 'rgba(113, 178, 128, 0.15)',
						titleColor: '#1a1a1a',
						titleColorInactive: '#6c757d',
						border: 'rgba(113, 178, 128, 0.3)'
					},
					previewStyle: { background: 'linear-gradient(to bottom right, #134e5e, #71b280)' }
				},
				{
					name: 'rose',
					style: 'system',
					backgroundType: 'gradient',
					gradientColor1: '#ee9ca7',
					gradientColor2: '#ffdde1',
					gradientDirection: 'to bottom right',
					taskbarColor: 'rgba(238, 156, 167, 0.8)',
					taskbarTextColor: '#4a3f44',
					menuColor: 'rgba(238, 156, 167, 0.92)',
					menuTextColor: '#4a3f44',
					iconColor: '#4a3f44',
					windowTheme: {
						bg: 'rgba(255, 255, 255, 0.98)',
						headerBg: 'rgba(238, 156, 167, 0.18)',
						titleColor: '#4a3f44',
						titleColorInactive: '#8a7a80',
						border: 'rgba(238, 156, 167, 0.4)'
					},
					previewStyle: { background: 'linear-gradient(to bottom right, #ee9ca7, #ffdde1)' }
				},
				{
					name: 'amber',
					style: 'system',
					backgroundType: 'gradient',
					gradientColor1: '#f12711',
					gradientColor2: '#f5af19',
					gradientDirection: 'to bottom right',
					taskbarColor: 'rgba(241, 39, 17, 0.75)',
					taskbarTextColor: '#ffffff',
					menuColor: 'rgba(200, 100, 20, 0.92)',
					menuTextColor: '#ffffff',
					iconColor: '#ffffff',
					windowTheme: {
						bg: 'rgba(255, 255, 255, 0.96)',
						headerBg: 'rgba(245, 175, 25, 0.15)',
						titleColor: '#1a1a1a',
						titleColorInactive: '#6c757d',
						border: 'rgba(245, 175, 25, 0.35)'
					},
					previewStyle: { background: 'linear-gradient(to bottom right, #f12711, #f5af19)' }
				},
				{
					name: 'mint',
					style: 'system',
					backgroundType: 'gradient',
					gradientColor1: '#11998e',
					gradientColor2: '#38ef7d',
					gradientDirection: 'to bottom right',
					taskbarColor: 'rgba(17, 153, 142, 0.78)',
					taskbarTextColor: '#ffffff',
					menuColor: 'rgba(17, 153, 142, 0.92)',
					menuTextColor: '#ffffff',
					iconColor: '#ffffff',
					windowTheme: {
						bg: 'rgba(255, 255, 255, 0.96)',
						headerBg: 'rgba(56, 239, 125, 0.12)',
						titleColor: '#1a1a1a',
						titleColorInactive: '#6c757d',
						border: 'rgba(56, 239, 125, 0.3)'
					},
					previewStyle: { background: 'linear-gradient(to bottom right, #11998e, #38ef7d)' }
				},
				{
					name: 'purple',
					style: 'system',
					backgroundType: 'gradient',
					gradientColor1: '#654ea3',
					gradientColor2: '#eaafc8',
					gradientDirection: 'to bottom right',
					taskbarColor: 'rgba(101, 78, 163, 0.78)',
					taskbarTextColor: '#ffffff',
					menuColor: 'rgba(101, 78, 163, 0.92)',
					menuTextColor: '#ffffff',
					iconColor: '#ffffff',
					windowTheme: {
						bg: 'rgba(255, 255, 255, 0.96)',
						headerBg: 'rgba(101, 78, 163, 0.12)',
						titleColor: '#1a1a1a',
						titleColorInactive: '#6c757d',
						border: 'rgba(101, 78, 163, 0.25)'
					},
					previewStyle: { background: 'linear-gradient(to bottom right, #654ea3, #eaafc8)' }
				},
				{
					name: 'chinesePurple',
					style: 'system',
					backgroundType: 'gradient',
					gradientColor1: '#5D3F6A',
					gradientColor2: '#8B4789',
					gradientDirection: 'to bottom right',
					taskbarColor: 'rgba(93, 63, 106, 0.78)',
					taskbarTextColor: '#ffffff',
					menuColor: 'rgba(93, 63, 106, 0.92)',
					menuTextColor: '#ffffff',
					iconColor: '#ffffff',
					windowTheme: {
						bg: 'rgba(255, 255, 255, 0.96)',
						headerBg: 'rgba(139, 71, 137, 0.15)',
						titleColor: '#1a1a1a',
						titleColorInactive: '#6c757d',
						border: 'rgba(139, 71, 137, 0.3)'
					},
					previewStyle: { background: 'linear-gradient(to bottom right, #5D3F6A, #8B4789)' }
				},
				{
					name: 'win10',
					style: 'windows',
					backgroundType: 'image',
					backgroundImage: '/images/windows/win10/background.svg',
					taskbarColor: 'rgba(24, 24, 24, 0.98)',
					taskbarTextColor: '#ffffff',
					taskbarBorderRadius: '0px',
					taskbarGlass: false,
					taskbarStartIcon: 'ms-grid_view',
					menuColor: 'rgba(32, 32, 32, 0.98)',
					menuTextColor: '#ffffff',
					menuBorderRadius: '0px',
					menuGlass: false,
					iconColor: '#ffffff',
					iconShadow: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
					iconSize: 48,
					iconBgColor: 'transparent',
					iconBgRadius: '0px',
					iconBgSize: '0px',
					windowTheme: {
						bg: '#ffffff',
						headerBg: '#ffffff',
						titleColor: '#000000',
						titleColorInactive: '#808080',
						border: '#E5E5E5',
						borderRadius: '0px',
						shadow: '0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)',
						closeBtnHover: '#c42b1c',
						minBtnHover: 'rgba(0, 0, 0, 0.1)',
						maxBtnHover: 'rgba(0, 0, 0, 0.1)',
						titleHeight: '32px',
						buttonWidth: '46px'
					},
					previewStyle: { backgroundImage: 'url(/images/windows/win10/background.svg)', backgroundSize: 'cover' }
				},
				{
					name: 'win11',
					style: 'windows',
					backgroundType: 'image',
					backgroundImage: '/images/windows/win11/background.svg',
					taskbarColor: 'rgba(32, 32, 32, 0.85)',
					taskbarTextColor: '#ffffff',
					taskbarBorderRadius: '12px',
					taskbarGlass: true,
					taskbarStartIcon: 'ms-grid_view',
					menuColor: 'rgba(48, 48, 48, 0.95)',
					menuTextColor: '#ffffff',
					menuBorderRadius: '12px',
					menuGlass: true,
					iconColor: '#ffffff',
					iconShadow: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4))',
					iconSize: 48,
					iconBgColor: 'rgba(255, 255, 255, 0.1)',
					iconBgRadius: '12px',
					iconBgSize: '80px',
					windowTheme: {
						bg: '#ffffff',
						headerBg: '#f8f9fa',
						titleColor: '#212529',
						titleColorInactive: '#adb5bd',
						border: 'rgba(0, 0, 0, 0.08)',
						borderRadius: '8px',
						shadow: '0 20px 60px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.08)',
						closeBtnHover: '#e81123',
						minBtnHover: 'rgba(0, 0, 0, 0.08)',
						maxBtnHover: 'rgba(0, 0, 0, 0.08)',
						titleHeight: '32px',
						buttonWidth: '46px'
					},
					previewStyle: { backgroundImage: 'url(/images/windows/win11/background.svg)', backgroundSize: 'cover' }
				},
				{
					name: 'win7',
					style: 'windows',
					backgroundType: 'image',
					backgroundImage: '/images/windows/win7/background.svg',
					taskbarColor: '#1A1A1A',
					taskbarTextColor: '#ffffff',
					taskbarBorderRadius: '0px',
					taskbarGlass: true,
					taskbarStartIcon: 'ms-grid_view',
					menuColor: '#2D2D2D',
					menuTextColor: '#ffffff',
					menuBorderRadius: '0px',
					menuGlass: true,
					iconColor: '#ffffff',
					iconShadow: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))',
					iconSize: 48,
					iconBgColor: 'rgba(255, 255, 255, 0.05)',
					iconBgRadius: '4px',
					iconBgSize: '70px',
					windowTheme: {
						bg: '#ffffff',
						headerBg: '#D4D0C8',
						titleColor: '#000000',
						titleColorInactive: '#808080',
						border: '#808080',
						borderRadius: '0px',
						shadow: '0 10px 40px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.15)',
						closeBtnHover: '#e81123',
						minBtnHover: '#D4D0C8',
						maxBtnHover: '#D4D0C8',
						titleHeight: '30px',
						buttonWidth: '45px'
					},
					previewStyle: { backgroundImage: 'url(/images/windows/win7/background.svg)', backgroundSize: 'cover' }
				},
				{
					name: 'winXP',
					style: 'windows',
					backgroundType: 'image',
					backgroundImage: '/images/windows/winxp/background.svg',
					taskbarColor: '#1E90FF',
					taskbarTextColor: '#ffffff',
					taskbarBorderRadius: '0px',
					taskbarGlass: false,
					taskbarStartIcon: 'ms-grid_view',
					menuColor: '#1E90FF',
					menuTextColor: '#ffffff',
					menuBorderRadius: '0px',
					menuGlass: false,
					iconColor: '#ffffff',
					iconShadow: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.5))',
					iconSize: 48,
					iconBgColor: 'rgba(255, 255, 255, 0.1)',
					iconBgRadius: '0px',
					iconBgSize: '64px',
					windowTheme: {
						bg: '#ffffff',
						headerBg: '#000080',
						titleColor: '#ffffff',
						titleColorInactive: '#c0c0c0',
						border: '#808080',
						borderRadius: '0px',
						shadow: '0 4px 16px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)',
						closeBtnHover: '#c42b1c',
						minBtnHover: '#1E90FF',
						maxBtnHover: '#1E90FF',
						titleHeight: '28px',
						buttonWidth: '44px'
					},
					previewStyle: { backgroundImage: 'url(/images/windows/winxp/background.svg)', backgroundSize: 'cover' }
				},
				{
					name: 'winDark',
					style: 'windows',
					backgroundType: 'image',
					backgroundImage: '/images/windows/windark/background.svg',
					taskbarColor: '#000000',
					taskbarTextColor: '#ffffff',
					taskbarBorderRadius: '0px',
					taskbarGlass: false,
					taskbarStartIcon: 'ms-grid_view',
					menuColor: '#2A2A2A',
					menuTextColor: '#ffffff',
					menuBorderRadius: '0px',
					menuGlass: false,
					iconColor: '#ffffff',
					iconShadow: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
					iconSize: 48,
					iconBgColor: 'transparent',
					iconBgRadius: '0px',
					iconBgSize: '0px',
					windowTheme: {
						bg: '#1C1C1C',
						headerBg: '#2D2D2D',
						titleColor: '#ffffff',
						titleColorInactive: '#808080',
						border: '#404040',
						borderRadius: '0px',
						shadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
						closeBtnHover: '#c42b1c',
						minBtnHover: 'rgba(255, 255, 255, 0.1)',
						maxBtnHover: 'rgba(255, 255, 255, 0.1)',
						titleHeight: '32px',
						buttonWidth: '46px'
					},
					previewStyle: { backgroundImage: 'url(/images/windows/windark/background.svg)', backgroundSize: 'cover' }
				},
				{
					name: 'macOS',
					style: 'macos',
					backgroundType: 'image',
					backgroundImage: '/images/macos/background.svg',
					gradientDirection: 'to bottom right',
					taskbarColor: 'rgba(255, 255, 255, 0.75)',
					taskbarTextColor: '#1a1a1a',
					menuColor: 'rgba(255, 255, 255, 0.95)',
					menuTextColor: '#1a1a1a',
					iconColor: '#1a1a1a',
					windowTheme: {
						bg: '#ffffff',
						headerBg: '#f6f6f6',
						titleColor: '#1a1a1a',
						titleColorInactive: '#999999',
						border: 'rgba(0, 0, 0, 0.08)'
					},
					previewStyle: { background: 'linear-gradient(to bottom right, #667eea, #764ba2)' }
				},
				{
					name: 'macOSBigSur',
					style: 'macos',
					backgroundType: 'gradient',
					gradientColor1: '#007AFF',
					gradientColor2: '#5AC8FA',
					gradientDirection: 'to bottom right',
					taskbarColor: 'rgba(255, 255, 255, 0.8)',
					taskbarTextColor: '#000000',
					menuColor: 'rgba(255, 255, 255, 0.95)',
					menuTextColor: '#000000',
					iconColor: '#000000',
					windowTheme: {
						bg: '#ffffff',
						headerBg: '#f5f5f5',
						titleColor: '#000000',
						titleColorInactive: '#999999',
						border: 'rgba(0, 0, 0, 0.06)'
					},
					previewStyle: { backgroundImage: 'url(/images/macos/background.svg)', backgroundSize: 'cover' }
				},
				{
					name: 'macOSMonterey',
					style: 'macos',
					backgroundType: 'gradient',
					gradientColor1: '#00D4AA',
					gradientColor2: '#00A8FF',
					gradientDirection: 'to bottom right',
					taskbarColor: 'rgba(255, 255, 255, 0.78)',
					taskbarTextColor: '#1a1a1a',
					menuColor: 'rgba(255, 255, 255, 0.95)',
					menuTextColor: '#1a1a1a',
					iconColor: '#1a1a1a',
					windowTheme: {
						bg: '#ffffff',
						headerBg: '#f8f8f8',
						titleColor: '#1a1a1a',
						titleColorInactive: '#aaaaaa',
						border: 'rgba(0, 0, 0, 0.05)'
					},
					previewStyle: { background: 'linear-gradient(to bottom right, #00D4AA, #00A8FF)' }
				},
				{
					name: 'macOSVentura',
					style: 'macos',
					backgroundType: 'gradient',
					gradientColor1: '#FB7185',
					gradientColor2: '#F43F5E',
					gradientDirection: 'to bottom right',
					taskbarColor: 'rgba(255, 255, 255, 0.82)',
					taskbarTextColor: '#1a1a1a',
					menuColor: 'rgba(255, 255, 255, 0.95)',
					menuTextColor: '#1a1a1a',
					iconColor: '#1a1a1a',
					windowTheme: {
						bg: '#ffffff',
						headerBg: '#fafafa',
						titleColor: '#1a1a1a',
						titleColorInactive: '#bbbbbb',
						border: 'rgba(0, 0, 0, 0.04)'
					},
					previewStyle: { background: 'linear-gradient(to bottom right, #FB7185, #F43F5E)' }
				},
				{
					name: 'macOSDark',
					style: 'macos',
					backgroundType: 'color',
					backgroundColor: '#0f0f0f',
					taskbarColor: 'rgba(28, 28, 28, 0.9)',
					taskbarTextColor: '#ffffff',
					menuColor: 'rgba(40, 40, 40, 0.95)',
					menuTextColor: '#ffffff',
					iconColor: '#ffffff',
					windowTheme: {
						bg: '#1c1c1c',
						headerBg: '#2a2a2a',
						titleColor: '#ffffff',
						titleColorInactive: '#888888',
						border: 'rgba(255, 255, 255, 0.08)'
					},
					previewStyle: { backgroundColor: '#0f0f0f' }
				}
			]
		};
	},
	computed: {
		desktopStyle() {
			if (this.backgroundType === 'color') {
				return { backgroundColor: this.backgroundColor };
			} else if (this.backgroundType === 'image') {
				return {
					backgroundColor: this.backgroundColor,
					backgroundImage: `url(${this.backgroundImage})`,
					backgroundSize: 'cover',
					backgroundPosition: 'center',
				};
			} else {
				return {
					background: `linear-gradient(${this.gradientDirection}, ${this.gradientColor1}, ${this.gradientColor2})`,
				};
			}
		},
		currentDateTime() {
			const now = new Date();
			const dateStr = now.toLocaleDateString('zh-CN', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				weekday: 'long'
			});
			const timeStr = now.toLocaleTimeString('zh-CN', {
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit'
			});
			return `${dateStr} ${timeStr}`;
		}
	},
	methods: {
		async init() {
			this.user = this.$TOOL.session.get("USER_INFO") || {};

			this.updateTime();
			this.updateTimeInterval = setInterval(this.updateTime, 1000);

			this.loadSettings();

			this.listApp();
			this.loadTheme();

			this.documentClickHandler = (e) => {
				if (!e.target.closest('.start-menu') && !e.target.closest('.taskbar-start')) {
					this.showStartMenu = false;
				}
				if (!e.target.closest('.context-menu')) {
					this.hideContextMenu();
				}
			};
			document.addEventListener('click', this.documentClickHandler);

			this.home = await this.$SCM.read_cfg("app_home", this.$CONFIG.HOME);
		},
		updateTime() {
			const now = new Date();
			this.currentTime = now.toLocaleTimeString('zh-CN', {
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
			});
		},
		selectApp(appId) {
			this.selectedApp = appId;
		},
		clearSelection() {
			this.selectedApp = null;
			this.hideContextMenu();
		},
		showContextMenu(event) {
			this.showStartMenu = false;
			this.activeSubmenu = null;

			const menuWidth = 160;
			const menuHeight = 200;
			let x = event.clientX;
			let y = event.clientY;

			if (x + menuWidth > window.innerWidth) {
				x = window.innerWidth - menuWidth - 10;
			}
			if (y + menuHeight > window.innerHeight) {
				y = window.innerHeight - menuHeight - 10;
			}

			this.contextMenu = {
				visible: true,
				style: {
					left: `${x}px`,
					top: `${y}px`,
				},
			};
		},
		hideContextMenu() {
			this.contextMenu.visible = false;
		},
		refreshDesktop() {
			this.hideContextMenu();
			this.listApp();
			//this.$message.success('桌面已刷新');
		},
		async listApp() {
			this.menuApps = [];
			this.deskApps = [];

			var menuRes = await this.$API.operator.authority.get({ layout: 2 });
			if (menuRes.code != 200) {
				this.$message.warning(menuRes.message);
				return false;
			}
			if (menuRes.data.length == 0) {
				this.$alert(
					this.$t('desktop.noMenuPermission'),
					this.$t('desktop.noPermission'),
					{ type: "error", center: true }
				);
				return false;
			}

			var menuList = this.$SCM.recursive_menu(menuRes.data, this.$SCM.SYS_ID);
			if (menuList.length == 0) {
				return;
			}

			var children = menuList[0].children || [];
			children.forEach(element => {
				this.menuApps.push(element);
			});
			this.addDeskIcon(menuList[0]);
		},
		addDeskIcon(menuItem) {
			if (menuItem && menuItem.children) {
				menuItem.children.forEach(child => {
					if (child.meta.show_in_desktop) {
						this.deskApps.push(child);
					}
					this.addDeskIcon(child);
					if (child.code == 'app-calendar') {
						this.calendarApp = child;
					}
					if (child.code == 'app-profile') {
						this.profileApp = child;
					}
					if (child.code == 'app-settings') {
						//this.settingsApp = child;
					}
					if (child.code == 'app-image') {
						this.imageApp = child;
					}
					if (child.code == 'app-audio') {
						this.audioApp = child;
					}
					if (child.code == 'app-video') {
						this.videoApp = child;
					}
					if (child.code == 'app-textpad') {
						this.textApp = child;
					}
				});
			}
		},
		getSubMenu(list, pid) {
			var menu = list.filter((item) => item.pid == pid);
			return menu || [];
		},
		openApp(app) {
			if (app.meta && app.meta.type === 'link') {
				this.$router.push({
					path: app.path
				});
				return;
			}

			this.showStartMenu = false;
			this.hideContextMenu();
			const windowId = ++this.windowIdCounter;
			this.windows.push({
				id: windowId,
				code: app.code,
				title: app.name,
				icon: app.meta.icon,
				component: app.component,
				props: app.props,
				minimized: false,
				maximized: false,
				focused: true,
				resizable: app.meta.resizable,
				centered: app.meta.center !== false,
				x: 100 + (windowId % 5) * 30,
				y: 100 + (windowId % 5) * 30,
				width: app.meta.width || 800,
				height: app.meta.height || 600,
			});
			this.focusWindow(windowId);
		},
		showSubmenu(event, app) {
			if (!app || !app.children) {
				return;
			}

			this.keepSubmenu();

			const rect = event.target.getBoundingClientRect();
			this.activeSubmenu = app;
			this.submenuStyle = {
				left: `${rect.right}px`,
				top: `${rect.top}px`,
			};
		},
		hideSubmenu() {
			this.submenuTimeout = setTimeout(() => {
				this.activeSubmenu = null;
			}, 100);
		},
		keepSubmenu() {
			if (this.submenuTimeout) {
				clearTimeout(this.submenuTimeout);
			}
		},
		closeWindow(windowId) {
			this.windows = this.windows.filter((w) => w.id !== windowId);
		},
		minimizeWindow(windowId) {
			const window = this.windows.find((w) => w.id === windowId);
			if (window) {
				window.minimized = true;
				window.focused = false;
			}
		},
		maximizeWindow(windowId) {
			const window = this.windows.find((w) => w.id === windowId);
			if (window) {
				window.maximized = !window.maximized;
			}
		},
		focusWindow(windowId) {
			this.windows.forEach((w) => {
				w.focused = w.id === windowId;
				if (w.id === windowId) {
					w.minimized = false;
				}
			});
		},
		setWallpaper(url) {
			this.backgroundType = 'image';
			this.backgroundImage = url;
			//this.saveSettings();
			this.persistSettings(this.getCurrentConfig());
		},
		toggleWindow(windowId) {
			const window = this.windows.find((w) => w.id === windowId);
			if (window) {
				if (window.focused && !window.minimized) {
					this.minimizeWindow(windowId);
				} else {
					this.focusWindow(windowId);
				}
			}
		},
		toggleStartMenu() {
			this.showStartMenu = !this.showStartMenu;
			if (!this.showStartMenu) {
				this.activeSubmenu = null;
			}
		},
		openSettings() {
			this.showStartMenu = false;
			this.hideContextMenu();
			this.settingsApp.props = {
				config: this.getCurrentConfig(),
				themes: this.themes,
				colorList: this.colorList,
				presetImages: this.presetImages,
			};
			this.openApp(this.settingsApp);
		},
		openCalendar() {
			this.openApp(this.calendarApp);
		},
		openProfile() {
			this.hideContextMenu();
			this.openApp(this.profileApp);
		},
		onProfileUpdated(profile) {
			if (profile.namec) {
				this.user.userName = profile.namec;
			}
		},
		onPasswordChanged() {
			this.$alert(this.$t('desktop.passwordUpdateSuccess'), this.$t('desktop.tip'), {
				type: 'success',
				center: true
			}).then(() => {
				this.$router.replace({ path: '/login' });
			}).catch(() => { });
		},
		getCurrentConfig() {
			return {
				currentTheme: this.currentTheme,
				backgroundType: this.backgroundType,
				backgroundColor: this.backgroundColor,
				backgroundImage: this.backgroundImage,
				gradientColor1: this.gradientColor1,
				gradientColor2: this.gradientColor2,
				gradientDirection: this.gradientDirection,
				iconColor: this.iconColor,
				menuColor: this.menuColor,
				menuTextColor: this.menuTextColor,
				taskbarColor: this.taskbarColor,
				taskbarTextColor: this.taskbarTextColor,
				windowTheme: this.windowTheme,
				home: this.home,
			};
		},
		onThemePreview(config) {
			this.applyConfig(config);
		},
		onSaveSettings(config) {
			this.applyConfig(config);
			this.persistSettings(config);
		},
		applyConfig(config) {
			this.currentTheme = config.currentTheme;
			this.backgroundType = config.backgroundType;
			this.backgroundColor = config.backgroundColor;
			this.backgroundImage = config.backgroundImage;
			this.gradientColor1 = config.gradientColor1;
			this.gradientColor2 = config.gradientColor2;
			this.gradientDirection = config.gradientDirection;
			this.iconColor = config.iconColor;
			this.iconShadow = config.iconShadow || 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))';
			this.iconSize = config.iconSize || 48;
			this.iconBgColor = config.iconBgColor || 'transparent';
			this.iconBgRadius = config.iconBgRadius || '0px';
			this.iconBgSize = config.iconBgSize || '0px';
			this.menuColor = config.menuColor;
			this.menuTextColor = config.menuTextColor;
			this.menuBorderRadius = config.menuBorderRadius || '0px';
			this.menuGlass = config.menuGlass || false;
			this.taskbarColor = config.taskbarColor;
			this.taskbarTextColor = config.taskbarTextColor;
			this.taskbarBorderRadius = config.taskbarBorderRadius || '0px';
			this.taskbarGlass = config.taskbarGlass || false;
			this.taskbarStartIcon = config.taskbarStartIcon || 'ms-grid_view';
			this.windowTheme = config.windowTheme || this.windowTheme;
			this.home = config.home;
		},
		async persistSettings(config) {
			var cfgs = [];
			cfgs.push({ key: "app_home", value: config.home });
			cfgs.push({ key: "desktop_theme", value: config.currentTheme });
			cfgs.push({ key: "desktop_icon_color", value: config.iconColor });
			cfgs.push({ key: "desktop_menu_color", value: config.menuColor });
			cfgs.push({ key: "desktop_background_type", value: config.backgroundType });
			cfgs.push({ key: "desktop_background_color", value: config.backgroundColor });
			cfgs.push({ key: "desktop_background_image", value: config.backgroundImage });
			cfgs.push({ key: "desktop_gradient_color1", value: config.gradientColor1 });
			cfgs.push({ key: "desktop_gradient_color2", value: config.gradientColor2 });
			cfgs.push({ key: "desktop_gradient_direction", value: config.gradientDirection });
			await this.$SCM.save_cfg(cfgs);
		},
		async loadSettings() {
			this.currentTheme = await this.$SCM.read_cfg("desktop_theme", this.currentTheme);
			this.home = await this.$SCM.read_cfg("app_home", this.$CONFIG.HOME);
			this.iconColor = await this.$SCM.read_cfg("desktop_icon_color", this.iconColor);
			this.menuColor = await this.$SCM.read_cfg("desktop_menu_color", this.menuColor);
			this.backgroundType = await this.$SCM.read_cfg("desktop_background_type", this.backgroundType);
			this.backgroundColor = await this.$SCM.read_cfg("desktop_background_color", this.backgroundColor);
			this.backgroundImage = await this.$SCM.read_cfg("desktop_background_image", this.backgroundImage);
			this.gradientColor1 = await this.$SCM.read_cfg("desktop_gradient_color1", this.gradientColor1);
			this.gradientColor2 = await this.$SCM.read_cfg("desktop_gradient_color2", this.gradientColor2);
			this.gradientDirection = await this.$SCM.read_cfg("desktop_gradient_direction", this.gradientDirection);
		},
		applyTheme(theme) {
			this.currentTheme = theme.name;
			this.backgroundType = theme.backgroundType;
			this.taskbarColor = theme.taskbarColor;
			this.taskbarTextColor = theme.taskbarTextColor || '#ffffff';
			this.taskbarBorderRadius = theme.taskbarBorderRadius || '0px';
			this.taskbarGlass = theme.taskbarGlass || false;
			this.taskbarStartIcon = theme.taskbarStartIcon || 'ms-grid_view';
			this.menuColor = theme.menuColor || 'rgba(0, 0, 0, 0.9)';
			this.menuTextColor = theme.menuTextColor || '#ffffff';
			this.menuBorderRadius = theme.menuBorderRadius || '0px';
			this.menuGlass = theme.menuGlass || false;
			this.iconColor = theme.iconColor || '#ffffff';
			this.iconShadow = theme.iconShadow || 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))';
			this.iconSize = theme.iconSize || 48;
			this.iconBgColor = theme.iconBgColor || 'transparent';
			this.iconBgRadius = theme.iconBgRadius || '0px';
			this.iconBgSize = theme.iconBgSize || '0px';
			this.windowTheme = theme.windowTheme || {
				bg: '#f3f3f3',
				headerBg: '#f3f3f3',
				titleColor: '#1a1a1a',
				titleColorInactive: '#666666',
				border: 'rgba(0, 0, 0, 0.1)',
				borderRadius: '0px',
				shadow: '0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)',
				closeBtnHover: '#c42b1c',
				minBtnHover: 'rgba(0, 0, 0, 0.1)',
				maxBtnHover: 'rgba(0, 0, 0, 0.1)',
				titleHeight: '32px',
				buttonWidth: '46px'
			};

			if (theme.backgroundType === 'color') {
				this.backgroundColor = theme.backgroundColor;
			} else if (theme.backgroundType === 'gradient') {
				this.gradientColor1 = theme.gradientColor1;
				this.gradientColor2 = theme.gradientColor2;
				this.gradientDirection = theme.gradientDirection;
			}

			localStorage.setItem('desktop_theme', theme.name);
		},
		loadTheme() {
			const savedTheme = localStorage.getItem('desktop_theme');
			if (savedTheme) {
				const theme = this.themes.find(t => t.name === savedTheme);
				if (theme) {
					this.applyTheme(theme);
				}
			}
			const savedIconColor = localStorage.getItem('desktop_icon_color');
			if (savedIconColor) {
				this.iconColor = savedIconColor;
			}
		},
		logout() {
			this.$confirm(this.$t('desktop.logoutConfirm'), this.$t('desktop.tip'), {
				type: "warning",
				confirmButtonText: this.$t('desktop.exit'),
				confirmButtonClass: "el-button--danger",
			})
				.then(() => {
					this.$router.replace({ path: "/login" });
				})
				.catch(() => {
					// 取消退出
				});
		},
		/**
		 * 打开Nas文件
		 * @param kind 文件类型，如：image, video, audio
		 * @param files 文件列表
		 * @param index 当前文件索引
		 */
		openNasFileWithApp(kind, files, index) {
			if (!files || files.length === 0) return;

			let appConfig = null;
			if (kind === 'text') {
				appConfig = this.textApp;
			} else if (kind === 'image') {
				appConfig = this.imageApp;
			} else if (kind === 'audio') {
				appConfig = this.audioApp;
			} else if (kind === 'video') {
				appConfig = this.videoApp;
			} else {
				this.$message.info(this.$t('desktop.cannotOpenFile'));
				return;
			}
			appConfig.props = { files: files, index: index };

			this.openApp(appConfig);
		},
		/**
		 * 打开Web文件
		 * @param file 文件路径URL
		 */
		openWebFileWithApp(file) {
			const ext = file.name.split('.').pop().toLowerCase();
			const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
			const videoExts = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'];
			const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma'];

			let kind = '';
			if (imageExts.includes(ext)) {
				kind = 'image';
			} else if (videoExts.includes(ext)) {
				kind = 'video';
			} else if (audioExts.includes(ext)) {
				kind = 'audio';
			} else {
				this.$message.info(`${this.$t('desktop.cannotOpenFile')}: ${file.name}`);
				return;
			}

			this.openNasFileWithApp(kind, [file], 0);
		}
	},
	provide() {
		return {
			openWebFileWithApp: this.openWebFileWithApp,
			openNasFileWithApp: this.openNasFileWithApp
		};
	},
	mounted() {
		this.init();
	},
	unmounted() {
		if (this.updateTimeInterval) {
			clearInterval(this.updateTimeInterval);
		}
		if (this.submenuTimeout) {
			clearTimeout(this.submenuTimeout);
		}
		if (this.documentClickHandler) {
			document.removeEventListener('click', this.documentClickHandler);
		}
	},
};
</script>

<style scoped>
.desktop {
	background-color: #000;
	overflow: hidden;
	user-select: none;
	height: 100%;
}

.desktop-icons {
	position: absolute;
	left: 20px;
	top: 20px;
	right: 20px;
	bottom: 68px;
	display: grid;
	grid-template-columns: repeat(auto-fill, 100px);
	grid-auto-flow: column;
	grid-template-rows: repeat(auto-fill, 100px);
	gap: 10px;
	align-content: start;
}

.desktop-icon {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 10px;
	border-radius: 8px;
	border: 2px solid transparent;
	cursor: pointer;
	transition: all 0.3s;
}

.desktop-icon:hover {
	background-color: rgba(255, 255, 255, 0.1);
}

.desktop-icon.selected {
	background-color: rgba(64, 158, 255, 0.3);
	border: 2px solid rgba(64, 158, 255, 0.6);
	box-shadow: 0 0 10px rgba(64, 158, 255, 0.4);
}

.icon-image {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 64px;
	height: 64px;
	transition: all 0.3s ease;
}

.icon-text {
	margin-top: 5px;
	font-size: 12px;
	text-align: center;
	text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
	word-break: break-word;
}

.windows-container {
	position: absolute;
	inset: 0 0 48px;
	pointer-events: none;
	overflow: hidden;
}

.windows-container .window {
	pointer-events: auto;
}

.taskbar {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 48px;
	display: flex;
	align-items: center;
	padding: 0 10px;
	z-index: 1000;
	transition: all 0.3s ease;
}

.taskbar-glass {
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
}

.taskbar:not(.taskbar-glass) {
	backdrop-filter: none;
}

.taskbar-start {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 16px;
	cursor: pointer;
	border-radius: 4px;
	transition: background-color 0.3s;
}

.taskbar-start:hover {
	background-color: rgba(255, 255, 255, 0.1);
}

.taskbar-apps {
	flex: 1;
	display: flex;
	gap: 5px;
	margin-left: 10px;
	overflow-x: auto;
}

.taskbar-app {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 6px 12px;
	cursor: pointer;
	border-radius: 4px;
	background-color: rgba(255, 255, 255, 0.05);
	transition: background-color 0.3s;
	min-width: 150px;
}

.taskbar-app:hover {
	background-color: rgba(255, 255, 255, 0.1);
}

.taskbar-app.active {
	background-color: rgba(255, 255, 255, 0.2);
	border-bottom: 2px solid #409eff;
}

.taskbar-app.minimized {
	opacity: 0.6;
}

.taskbar-tray {
	display: flex;
	align-items: center;
	gap: 15px;
	padding: 0 10px;
}

.time {
	font-size: 12px;
}

.start-menu {
	position: absolute;
	bottom: 58px;
	left: 10px;
	width: 300px;
	border-radius: 8px;
	overflow: hidden;
	z-index: 1001;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	transition: all 0.3s ease;
}

.menu-glass {
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
}

.start-menu:not(.menu-glass) {
	backdrop-filter: none;
}

.start-menu-header {
	display: flex;
	align-items: center;
	gap: 15px;
	padding: 20px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	cursor: pointer;
	transition: background-color 0.2s;
}

.start-menu-header:hover {
	background-color: rgba(255, 255, 255, 0.1);
}

.start-menu-apps {
	max-height: 400px;
	overflow: visible;
	padding: 10px;
}

.start-menu-item {
	position: relative;
}

.start-menu-app {
	display: flex;
	align-items: center;
	gap: 15px;
	padding: 12px;
	cursor: pointer;
	border-radius: 4px;
	transition: background-color 0.3s;
}

.start-menu-app:hover {
	background-color: rgba(255, 255, 255, 0.1);
}

.start-menu-app .arrow {
	margin-left: auto;
	font-size: 12px;
}

.submenu {
	position: fixed;
	min-width: 180px;
	backdrop-filter: blur(20px);
	border-radius: 8px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
	padding: 8px 0;
	z-index: 1002;
}

.submenu-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 16px;
	cursor: pointer;
	transition: background-color 0.3s;
}

.submenu-item:hover {
	background-color: rgba(255, 255, 255, 0.1);
}

.start-menu-footer {
	display: flex;
	border-top: 1px solid rgba(255, 255, 255, 0.1);
	padding: 10px;
}

.start-menu-action {
	flex: 1;
	display: flex;
	align-items: right;
	gap: 10px;
	padding: 12px;
	cursor: pointer;
	border-radius: 4px;
	transition: background-color 0.3s;
}

.start-menu-action:hover {
	background-color: rgba(255, 255, 255, 0.1);
}

.context-menu {
	position: fixed;
	min-width: 160px;
	backdrop-filter: blur(20px);
	border-radius: 8px;
	padding: 6px 0;
	z-index: 2000;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
	border: 1px solid rgba(255, 255, 255, 0.1);
}

.context-menu-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 16px;
	cursor: pointer;
	transition: all 0.15s;
	font-size: 13px;
}

.context-menu-item:hover {
	background-color: rgba(255, 255, 255, 0.1);
}

.context-menu-divider {
	height: 1px;
	background-color: rgba(255, 255, 255, 0.1);
	margin: 4px 0;
}

@media screen and (max-width: 1024px) {
	.desktop-icons {
		grid-template-columns: repeat(auto-fill, 90px);
		grid-template-rows: repeat(auto-fill, 90px);
	}

	.icon-image {
		width: 56px;
		height: 56px;
	}

	.icon-text {
		font-size: 11px;
	}
}

@media screen and (max-width: 768px) {
	.desktop-icons {
		left: 10px;
		top: 10px;
		right: 10px;
		bottom: 66px;
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(auto-fill, 85px);
		gap: 8px;
	}

	.desktop-icon {
		padding: 8px;
	}

	.icon-image {
		width: 48px;
		height: 48px;
	}

	.icon-text {
		font-size: 11px;
		margin-top: 4px;
	}

	.windows-container {
		bottom: 56px;
	}

	.taskbar {
		height: 56px;
		padding: 0 8px;
	}

	.taskbar-start {
		padding: 8px 12px;
	}

	.taskbar-start span {
		display: none;
	}

	.taskbar-apps {
		margin-left: 8px;
		gap: 4px;
	}

	.taskbar-app {
		min-width: auto;
		padding: 8px;
		max-width: 50px;
		justify-content: center;
	}

	.taskbar-app span {
		display: none;
	}

	.taskbar-tray {
		padding: 0 8px;
	}

	.time {
		font-size: 11px;
	}

	.start-menu {
		bottom: 66px;
		left: 0;
		right: 0;
		width: 100%;
		border-radius: 16px 16px 0 0;
		max-height: 70vh;
	}

	.start-menu-header {
		padding: 16px;
	}

	.start-menu-apps {
		max-height: 45vh;
		overflow-y: auto;
	}

	.start-menu-app {
		padding: 14px 12px;
	}

	.submenu {
		position: fixed;
		bottom: 66px;
		left: 0;
		right: 0;
		width: 100%;
		border-radius: 16px 16px 0 0;
		max-height: 50vh;
		overflow-y: auto;
	}

	.submenu-item {
		padding: 14px 16px;
	}
}

@media screen and (max-width: 480px) {
	.desktop-icons {
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(auto-fill, 80px);
		gap: 6px;
	}

	.desktop-icon {
		padding: 6px;
	}

	.icon-image {
		width: 44px;
		height: 44px;
	}

	.icon-text {
		font-size: 10px;
	}

	.taskbar-app {
		max-width: 44px;
	}

	.start-menu {
		max-height: 75vh;
	}

	.start-menu-apps {
		max-height: 50vh;
	}
}
</style>
