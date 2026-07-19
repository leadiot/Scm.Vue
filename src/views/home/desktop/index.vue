<template>
	<div class="desktop" :class="[themeClass, osFamilyClass]" :style="desktopStyle" @click="clearSelection" @contextmenu.prevent="showContextMenu">
		<!-- 桌面图标区域 -->
		<div class="desktop-icons">
			<div v-for="app in deskApps" :key="app.id" class="desktop-icon"
				:class="{ selected: selectedApp === app.id }" @click.stop="selectApp(app.id)"
				@dblclick.stop="openApp(app)">
				<div class="icon-image" :style="iconImageStyle(app)">
					<img v-if="getThemeIcon(app.meta.icon)" :src="getThemeIcon(app.meta.icon)" :style="{ width: iconSize + 'px', height: iconSize + 'px', objectFit: 'contain' }" alt="" draggable="false" />
					<sc-icon v-else :name="app.meta.icon" :size="iconSize" :color="iconColor" />
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

		<!-- 任务栏（非 macOS 主题） -->
		<div v-if="!isMacTheme" class="taskbar" :style="{ backgroundColor: taskbarColor, color: taskbarTextColor, borderRadius: taskbarBorderRadius }" :class="{ 'taskbar-glass': taskbarGlass }">
			<div class="taskbar-start" @click="toggleStartMenu">
				<template v-if="showFlagStart">
					<svg class="xp-start-flag" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
						<path fill="#F65314" d="M2.8 5.2 C5.5 3.4 8.2 3.1 10.9 4.3 L11.3 10.7 C8.6 9.5 5.9 9.8 3.2 11.6 Z" />
						<path fill="#7CBB00" d="M12.2 4.7 C14.9 3.5 17.6 3.9 20.3 5.7 L20.7 12.1 C18 10.3 15.3 9.9 12.6 11.1 Z" />
						<path fill="#00A1F1" d="M3.2 13.0 C5.9 11.2 8.6 10.9 11.3 12.1 L11.7 18.5 C9.0 17.3 6.3 17.6 3.6 19.4 Z" />
						<path fill="#FFBB00" d="M12.6 12.5 C15.3 11.3 18.0 11.7 20.7 13.5 L21.1 19.9 C18.4 18.1 15.7 17.7 13.0 18.9 Z" />
					</svg>
				</template>
				<sc-icon v-else :name="taskbarStartIcon" :size="24" />
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

		<!-- macOS 菜单栏 -->
		<div v-if="isMacTheme" class="mac-menubar">
			<div class="mac-menubar-left">
				<div class="mac-menu-apple" @click="toggleStartMenu">
					<sc-icon name="ms-apple" :size="16" />
				</div>
				<span class="mac-menu-appname">{{ macFocusedTitle }}</span>
			</div>
			<div class="mac-menubar-right">
				<el-tooltip :content="currentDateTime" placement="bottom">
					<span class="mac-menu-clock" @dblclick="openCalendar">{{ currentTime }}</span>
				</el-tooltip>
			</div>
		</div>

		<!-- macOS Dock -->
		<div v-if="isMacTheme" class="mac-dock">
			<div v-for="item in macDockItems" :key="item.key" class="mac-dock-item"
				:class="{ running: item.running }" :title="dockItemTitle(item)" @click="onDockClick(item)">
				<img v-if="dockIcon(item)" :src="dockIcon(item)" alt="" draggable="false" />
				<sc-icon v-else :name="dockIconName(item)" :size="42" />
				<span v-if="item.running" class="mac-dock-dot"></span>
			</div>
		</div>

		<!-- 开始菜单（Windows XP 双栏复刻） -->
		<div v-if="showStartMenu && isXpTheme" class="start-menu xp-start-menu">
			<div class="xp-menu-header" @click="openProfile">
				<div class="xp-menu-avatar">
					<sc-icon name="ms-account_circle" :size="30" color="#3B6BD4" />
				</div>
				<span class="xp-menu-username">{{ user.userName || 'User' }}</span>
			</div>
			<div class="xp-menu-body">
				<div class="xp-menu-left">
					<div class="xp-menu-caption">{{ $t('desktop.allPrograms') }}</div>
					<div v-for="app in menuApps" :key="app.id" class="xp-menu-item"
						:class="{ 'has-children': app.children }" @mouseenter="showSubmenu($event, app)"
						@mouseleave="hideSubmenu">
						<div class="xp-menu-app" @click="app.children ? null : openApp(app)">
							<sc-icon :name="app.meta.icon" :size="22" />
							<span>{{ app.name }}</span>
							<sc-icon v-if="app.children" name="ms-arrow_forward" class="arrow" :size="14" />
						</div>
					</div>
				</div>
				<div class="xp-menu-right">
					<div v-for="link in xpQuickLinks" :key="link.key" class="xp-right-item" @click="openQuickLink(link)">
						<sc-icon :name="link.icon" :size="18" />
						<span>{{ link.name }}</span>
					</div>
				</div>
			</div>
			<div class="xp-menu-footer">
				<div class="xp-footer-btn" @click="logout">
					<span class="xp-footer-icon xp-icon-logoff">
						<sc-icon name="ms-logout" :size="13" color="#ffffff" />
					</span>
					<span>{{ $t('desktop.logoff') }}</span>
				</div>
				<div class="xp-footer-btn" @click="shutdown">
					<span class="xp-footer-icon xp-icon-shutdown">
						<sc-icon name="ms-power_settings_new" :size="13" color="#ffffff" />
					</span>
					<span>{{ $t('desktop.shutdown') }}</span>
				</div>
			</div>
		</div>

		<!-- 开始菜单（Windows 95/98/2000 经典复刻） -->
		<div v-else-if="showStartMenu && isClassicTheme" class="start-menu classic-start-menu">
			<div class="classic-menu-banner"><span>{{ classicMenuTitle }}</span></div>
			<div class="classic-menu-body">
				<div v-for="app in menuApps" :key="app.id" class="classic-menu-item"
					@mouseenter="showSubmenu($event, app)" @mouseleave="hideSubmenu">
					<div class="classic-menu-app" @click="app.children ? null : openApp(app)">
						<sc-icon :name="app.meta.icon" :size="24" />
						<span>{{ app.name }}</span>
						<sc-icon v-if="app.children" name="ms-arrow_forward" class="arrow" :size="14" />
					</div>
				</div>
				<div class="classic-menu-divider"></div>
				<div class="classic-menu-item">
					<div class="classic-menu-app" @click="openSettings">
						<sc-icon name="ms-settings" :size="24" />
						<span>{{ $t('desktop.settings') }}</span>
					</div>
				</div>
				<div class="classic-menu-item">
					<div class="classic-menu-app" @click="logout">
						<sc-icon name="ms-exit_to_app" :size="24" />
						<span>{{ $t('desktop.logoff') }}</span>
					</div>
				</div>
			</div>
		</div>

		<!-- 开始菜单（Windows Vista/7 Aero 双栏复刻） -->
		<div v-else-if="showStartMenu && isAeroTheme" class="start-menu aero-start-menu">
			<div class="aero-menu-body">
				<div class="aero-menu-left">
					<div class="aero-menu-apps">
						<div v-for="app in filteredMenuApps" :key="app.id" class="aero-app-item"
							@mouseenter="showSubmenu($event, app)" @mouseleave="hideSubmenu">
							<div class="aero-app-link" @click="app.children ? null : openApp(app)">
								<sc-icon :name="app.meta.icon" :size="24" />
								<span>{{ app.name }}</span>
								<sc-icon v-if="app.children" name="ms-arrow_forward" class="arrow" :size="14" />
							</div>
						</div>
					</div>
					<div class="aero-menu-search">
						<input v-model="menuSearch" type="text" :placeholder="$t('desktop.search')" />
					</div>
				</div>
				<div class="aero-menu-right">
					<div class="aero-menu-avatar" @click="openProfile">
						<sc-icon name="ms-account_circle" :size="40" color="#3B6BD4" />
					</div>
					<div v-for="link in xpQuickLinks" :key="link.key" class="aero-right-item" @click="openQuickLink(link)">
						<span>{{ link.name }}</span>
					</div>
					<div class="aero-right-divider"></div>
					<div class="aero-right-item" @click="logout"><span>{{ $t('desktop.logoff') }}</span></div>
					<div class="aero-right-item" @click="shutdown"><span>{{ $t('desktop.shutdown') }}</span></div>
				</div>
			</div>
		</div>

		<!-- 开始屏幕（Windows 8 全屏磁贴复刻） -->
		<div v-else-if="showStartMenu && currentTheme === 'win8'" class="win8-start-screen" @click.self="toggleStartMenu">
			<div class="win8-screen-header">
				<span class="win8-screen-title">{{ $t('desktop.start') }}</span>
				<div class="win8-screen-user" @click="openProfile">
					<sc-icon name="ms-account_circle" :size="28" />
					<span>{{ user.userName || 'User' }}</span>
				</div>
			</div>
			<div class="win8-tiles">
				<div v-for="app in flatMenuApps" :key="app.id" class="win8-tile"
					:style="{ backgroundColor: tileColor(app) }" @click="openApp(app)">
					<sc-icon :name="app.meta.icon" :size="36" />
					<span>{{ app.name }}</span>
				</div>
			</div>
		</div>

		<!-- 开始菜单（Windows 10 磁贴复刻） -->
		<div v-else-if="showStartMenu && isWin10LikeTheme" class="start-menu win10-start-menu">
			<div class="win10-menu-rail">
				<div class="win10-rail-item" :title="user.userName || 'User'" @click="openProfile">
					<sc-icon name="ms-account_circle" :size="20" />
				</div>
				<div class="win10-rail-spacer"></div>
				<div class="win10-rail-item" :title="$t('desktop.settings')" @click="openSettings">
					<sc-icon name="ms-settings" :size="20" />
				</div>
				<div class="win10-rail-item" :title="$t('desktop.exit')" @click="logout">
					<sc-icon name="ms-power_settings_new" :size="20" />
				</div>
			</div>
			<div class="win10-menu-apps">
				<div class="win10-menu-search">
					<input v-model="menuSearch" type="text" :placeholder="$t('desktop.search')" />
				</div>
				<div v-for="app in filteredMenuApps" :key="app.id" class="win10-app-item"
					@mouseenter="showSubmenu($event, app)" @mouseleave="hideSubmenu">
					<div class="win10-app-link" @click="app.children ? null : openApp(app)">
						<sc-icon :name="app.meta.icon" :size="18" />
						<span>{{ app.name }}</span>
						<sc-icon v-if="app.children" name="ms-arrow_forward" class="arrow" :size="14" />
					</div>
				</div>
			</div>
			<div class="win10-menu-tiles">
				<div v-for="app in tileApps" :key="app.id" class="win10-tile"
					:style="{ backgroundColor: tileColor(app) }" @click="openApp(app)">
					<sc-icon :name="app.meta.icon" :size="26" />
					<span>{{ app.name }}</span>
				</div>
			</div>
		</div>

		<!-- 开始菜单（Windows 11 居中网格复刻） -->
		<div v-else-if="showStartMenu && currentTheme === 'win11'" class="start-menu win11-start-menu">
			<div class="win11-menu-search">
				<input v-model="menuSearch" type="text" :placeholder="$t('desktop.search')" />
			</div>
			<div class="win11-menu-section">{{ $t('desktop.pinned') }}</div>
			<div class="win11-menu-grid">
				<div v-for="app in filteredFlatApps" :key="app.id" class="win11-grid-item" @click="openApp(app)">
					<sc-icon :name="app.meta.icon" :size="28" />
					<span>{{ app.name }}</span>
				</div>
			</div>
			<div class="win11-menu-footer">
				<div class="win11-footer-user" @click="openProfile">
					<sc-icon name="ms-account_circle" :size="24" />
					<span>{{ user.userName || 'User' }}</span>
				</div>
				<div class="win11-footer-power" :title="$t('desktop.exit')" @click="logout">
					<sc-icon name="ms-power_settings_new" :size="18" />
				</div>
			</div>
		</div>

		<!-- 开始菜单（通用） -->
		<div v-else-if="showStartMenu" class="start-menu" :style="{ backgroundColor: menuColor, color: menuTextColor, borderRadius: menuBorderRadius }" :class="{ 'menu-glass': menuGlass }">
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
			menuSearch: '',
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
			// 图标名称到文件名映射（Material Symbols → 主题图标文件名）
			iconMap: {
				'ms-computer': 'computer.png',
				'ms-desktop_windows': 'computer.png',
				'ms-laptop': 'computer.png',
				'ms-folder': 'folder.png',
				'ms-folder_open': 'folder.png',
				'ms-settings': 'settings.png',
				'ms-delete': 'trash.png',
				'ms-delete_outline': 'trash.png',
				'ms-delete_forever': 'trash.png',
				'ms-download': 'downloads.png',
				'ms-downloading': 'downloads.png',
				'ms-download_done': 'downloads.png',
				'ms-music_note': 'music.png',
				'ms-audiotrack': 'music.png',
				'ms-headphones': 'music.png',
				'ms-videocam': 'videos.png',
				'ms-movie': 'videos.png',
				'ms-movie_creation': 'videos.png',
				'ms-article': 'documents.png',
				'ms-description': 'documents.png',
				'ms-feed': 'documents.png',
				'ms-photo_library': 'documents.png',
				'ms-image': 'documents.png',
				'ms-calendar_month': 'documents.png',
				'ms-account_circle': 'documents.png',
			},
			menuApps: [],
			updateTimeInterval: null,
			documentClickHandler: null,
			iconColor: '#ffffff',
			iconShadow: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
			iconSize: 48,
			iconBgColor: 'transparent',
			iconBgRadius: '0px',
			iconBgSize: '0px',
			iconsPath: '',
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
					name: 'win11',
					style: 'windows',
					backgroundType: 'image',
					backgroundImage: '/images/windows/win11/background.png',
					iconsPath: '/images/windows/win11/',
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
						buttonWidth: '46px',
						style: 'win11'
					},
					previewStyle: { backgroundImage: 'url(/images/windows/win11/background.png)', backgroundSize: 'cover' }
				},
				{
					name: 'win10',
					style: 'windows',
					backgroundType: 'image',
					backgroundImage: '/images/windows/win10/background.png',
					iconsPath: '/images/windows/win10/',
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
						buttonWidth: '46px',
						style: 'win10'
					},
					previewStyle: { backgroundImage: 'url(/images/windows/win10/background.png)', backgroundSize: 'cover' }
				},
				{
					name: 'win8',
					style: 'windows',
					backgroundType: 'image',
					backgroundImage: '/images/windows/win8/background.png',
					iconsPath: '/images/windows/win8/',
					taskbarColor: 'rgba(20, 20, 40, 0.92)',
					taskbarTextColor: '#ffffff',
					taskbarBorderRadius: '0px',
					taskbarGlass: false,
					taskbarStartIcon: 'ms-grid_view',
					menuColor: 'rgba(30, 30, 50, 0.95)',
					menuTextColor: '#ffffff',
					menuBorderRadius: '0px',
					menuGlass: false,
					iconColor: '#ffffff',
					iconShadow: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
					iconSize: 48,
					iconBgColor: 'rgba(0, 120, 215, 0.8)',
					iconBgRadius: '0px',
					iconBgSize: '70px',
					windowTheme: {
						bg: '#ffffff',
						headerBg: '#0078D7',
						titleColor: '#ffffff',
						titleColorInactive: '#cccccc',
						border: '#0078D7',
						borderRadius: '0px',
						shadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
						closeBtnHover: '#c42b1c',
						minBtnHover: 'rgba(0,0,0,0.1)',
						maxBtnHover: 'rgba(0,0,0,0.1)',
						titleHeight: '32px',
						buttonWidth: '46px',
						style: 'win10'
					},
					previewStyle: { backgroundImage: 'url(/images/windows/win8/background.png)', backgroundSize: 'cover' }
				},
				{
					name: 'win7',
					style: 'windows',
					backgroundType: 'image',
					backgroundImage: '/images/windows/win7/background.png',
					iconsPath: '/images/windows/win7/',
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
						headerBg: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(200,210,220,0.6) 50%, rgba(170,180,200,0.6) 100%)',
						titleColor: '#000066',
						titleColorInactive: '#808080',
						border: '#808080',
						borderRadius: '0px',
						shadow: '0 10px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0,0,0,0.2)',
						closeBtnHover: '#e81123',
						minBtnHover: 'rgba(255,255,255,0.3)',
						maxBtnHover: 'rgba(255,255,255,0.3)',
						titleHeight: '32px',
						buttonWidth: '28px',
						style: 'win7'
					},
					previewStyle: { backgroundImage: 'url(/images/windows/win7/background.png)', backgroundSize: 'cover' }
				},
				{
					name: 'winVista',
					style: 'windows',
					backgroundType: 'image',
					backgroundImage: '/images/windows/winvista/background.png',
					iconsPath: '/images/windows/winvista/',
					taskbarColor: 'rgba(0, 0, 0, 0.7)',
					taskbarTextColor: '#ffffff',
					taskbarBorderRadius: '0px',
					taskbarGlass: true,
					taskbarStartIcon: 'ms-grid_view',
					menuColor: 'rgba(30, 30, 30, 0.9)',
					menuTextColor: '#ffffff',
					menuBorderRadius: '0px',
					menuGlass: true,
					iconColor: '#ffffff',
					iconShadow: 'drop-shadow(0 3px 8px rgba(0, 0, 0, 0.5))',
					iconSize: 48,
					iconBgColor: 'rgba(31, 156, 216, 0.3)',
					iconBgRadius: '4px',
					iconBgSize: '70px',
					windowTheme: {
						bg: '#ffffff',
						headerBg: 'linear-gradient(180deg, rgba(220,230,245,0.9) 0%, rgba(185,200,220,0.9) 50%, rgba(150,170,200,0.9) 100%)',
						titleColor: '#003366',
						titleColorInactive: '#808080',
						border: '#7A9EC4',
						borderRadius: '6px',
						shadow: '0 10px 40px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0,0,0,0.15)',
						closeBtnHover: '#e81123',
						minBtnHover: 'rgba(255,255,255,0.4)',
						maxBtnHover: 'rgba(255,255,255,0.4)',
						titleHeight: '32px',
						buttonWidth: '30px',
						style: 'win7'
					},
					previewStyle: { backgroundImage: 'url(/images/windows/winvista/background.png)', backgroundSize: 'cover' }
				},
				{
					name: 'winXP',
					style: 'windows',
					backgroundType: 'image',
					backgroundImage: '/images/windows/winxp/background.png',
					iconsPath: '/images/windows/winxp/',
					taskbarColor: '#245edb',
					taskbarTextColor: '#ffffff',
					taskbarBorderRadius: '0px',
					taskbarGlass: false,
					taskbarStartIcon: 'ms-grid_view',
					menuColor: '#ffffff',
					menuTextColor: '#1a1a1a',
					menuBorderRadius: '8px 8px 8px 0',
					menuGlass: false,
					iconColor: '#ffffff',
					iconShadow: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4))',
					iconSize: 48,
					iconBgColor: 'rgba(255, 255, 255, 0.12)',
					iconBgRadius: '4px',
					iconBgSize: '70px',
					windowTheme: {
						bg: '#ffffff',
						headerBg: 'linear-gradient(180deg, #0058ee 0%, #0054e3 50%, #0047cc 100%)',
						titleColor: '#ffffff',
						titleColorInactive: '#c0c0c0',
						border: '#0054e3',
						borderRadius: '8px 8px 0 0',
						shadow: '0 4px 16px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)',
						closeBtnHover: '#c42b1c',
						minBtnHover: '#1e90ff',
						maxBtnHover: '#1e90ff',
						titleHeight: '28px',
						buttonWidth: '22px',
						style: 'xp',
						xpHeaderStart: '#0058ee',
						xpHeaderEnd: '#0047cc',
						xpHeaderInactiveStart: '#7a96df',
						xpHeaderInactiveEnd: '#5e7eb5',
						xpBtnStart: '#3c8cff',
						xpBtnEnd: '#0054e3',
						xpBtnHoverStart: '#5ca0ff',
						xpBtnHoverEnd: '#1e6fe0',
						xpCloseStart: '#ff6b4a',
						xpCloseEnd: '#c1352e',
						xpCloseHoverStart: '#ff8b6a',
						xpCloseHoverEnd: '#d0453e'
					},
					previewStyle: { backgroundImage: 'url(/images/windows/winxp/background.png)', backgroundSize: 'cover' }
				},
				{
					name: 'win2000',
					style: 'windows',
					backgroundType: 'image',
					backgroundImage: '/images/windows/win2000/background.png',
					iconsPath: '/images/windows/win2000/',
					taskbarColor: '#C0C0C0',
					taskbarTextColor: '#000000',
					taskbarBorderRadius: '0px',
					taskbarGlass: false,
					taskbarStartIcon: 'ms-grid_view',
					menuColor: '#C0C0C0',
					menuTextColor: '#000000',
					menuBorderRadius: '0px',
					menuGlass: false,
					iconColor: '#ffffff',
					iconShadow: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
					iconSize: 32,
					iconBgColor: 'rgba(0, 0, 128, 0.15)',
					iconBgRadius: '0px',
					iconBgSize: '56px',
					windowTheme: {
						bg: '#ffffff',
						headerBg: '#000080',
						titleColor: '#ffffff',
						titleColorInactive: '#C0C0C0',
						border: '#808080',
						borderRadius: '0px',
						shadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1)',
						closeBtnHover: '#c00000',
						minBtnHover: '#808080',
						maxBtnHover: '#808080',
						titleHeight: '28px',
						buttonWidth: '18px',
						style: 'xp',
						xpHeader: 'linear-gradient(90deg, #000080 0%, #1084D0 100%)',
						xpHeaderInactive: 'linear-gradient(90deg, #808080 0%, #B5B5B5 100%)',
						xpBtnStart: '#D4D0C8',
						xpBtnEnd: '#C0C0C0',
						xpBtnHoverStart: '#E4E0DC',
						xpBtnHoverEnd: '#D4D0C8',
						xpCloseStart: '#D4D0C8',
						xpCloseEnd: '#C0C0C0',
						xpCloseHoverStart: '#E4E0DC',
						xpCloseHoverEnd: '#D4D0C8',
						xpBtnBorder: '#808080',
						xpCloseBorder: '#808080',
						xpGlyphColor: '#000000',
						xpFrame: '#C0C0C0',
						xpHeaderRadius: '0px',
						xpBtnSize: '18px'
					},
					previewStyle: { backgroundImage: 'url(/images/windows/win2000/background.png)', backgroundSize: 'cover' }
				},
				{
					name: 'win98',
					style: 'windows',
					backgroundType: 'image',
					backgroundImage: '/images/windows/win98/background.png',
					iconsPath: '/images/windows/win98/',
					taskbarColor: '#C0C0C0',
					taskbarTextColor: '#000000',
					taskbarBorderRadius: '0px',
					taskbarGlass: false,
					taskbarStartIcon: 'ms-grid_view',
					menuColor: '#C0C0C0',
					menuTextColor: '#000000',
					menuBorderRadius: '0px',
					menuGlass: false,
					iconColor: '#ffffff',
					iconShadow: 'drop-shadow(0 2px 3px rgba(0, 0, 0, 0.3))',
					iconSize: 32,
					iconBgColor: 'rgba(0, 128, 128, 0.2)',
					iconBgRadius: '0px',
					iconBgSize: '56px',
					windowTheme: {
						bg: '#ffffff',
						headerBg: '#000080',
						titleColor: '#ffffff',
						titleColorInactive: '#C0C0C0',
						border: '#808080',
						borderRadius: '0px',
						shadow: '0 4px 10px rgba(0, 0, 0, 0.15), 0 1px 3px rgba(0, 0, 0, 0.1)',
						closeBtnHover: '#c00000',
						minBtnHover: '#808080',
						maxBtnHover: '#808080',
						titleHeight: '24px',
						buttonWidth: '16px',
						style: 'xp',
						xpHeader: 'linear-gradient(90deg, #000080 0%, #1084D0 100%)',
						xpHeaderInactive: 'linear-gradient(90deg, #808080 0%, #B5B5B5 100%)',
						xpBtnStart: '#D4D0C8',
						xpBtnEnd: '#C0C0C0',
						xpBtnHoverStart: '#E4E0DC',
						xpBtnHoverEnd: '#D4D0C8',
						xpCloseStart: '#D4D0C8',
						xpCloseEnd: '#C0C0C0',
						xpCloseHoverStart: '#E4E0DC',
						xpCloseHoverEnd: '#D4D0C8',
						xpBtnBorder: '#808080',
						xpCloseBorder: '#808080',
						xpGlyphColor: '#000000',
						xpFrame: '#C0C0C0',
						xpHeaderRadius: '0px',
						xpBtnSize: '16px'
					},
					previewStyle: { backgroundImage: 'url(/images/windows/win98/background.png)', backgroundSize: 'cover' }
				},
				{
					name: 'win95',
					style: 'windows',
					backgroundType: 'image',
					backgroundImage: '/images/windows/win95/background.png',
					iconsPath: '/images/windows/win95/',
					taskbarColor: '#C0C0C0',
					taskbarTextColor: '#000000',
					taskbarBorderRadius: '0px',
					taskbarGlass: false,
					taskbarStartIcon: 'ms-grid_view',
					menuColor: '#C0C0C0',
					menuTextColor: '#000000',
					menuBorderRadius: '0px',
					menuGlass: false,
					iconColor: '#ffffff',
					iconShadow: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3))',
					iconSize: 32,
					iconBgColor: 'rgba(0, 128, 128, 0.2)',
					iconBgRadius: '0px',
					iconBgSize: '56px',
					windowTheme: {
						bg: '#ffffff',
						headerBg: '#000080',
						titleColor: '#ffffff',
						titleColorInactive: '#C0C0C0',
						border: '#808080',
						borderRadius: '0px',
						shadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
						closeBtnHover: '#c00000',
						minBtnHover: '#808080',
						maxBtnHover: '#808080',
						titleHeight: '22px',
						buttonWidth: '16px',
						style: 'xp',
						xpHeader: 'linear-gradient(90deg, #000080 0%, #1084D0 100%)',
						xpHeaderInactive: 'linear-gradient(90deg, #808080 0%, #B5B5B5 100%)',
						xpBtnStart: '#D4D0C8',
						xpBtnEnd: '#C0C0C0',
						xpBtnHoverStart: '#E4E0DC',
						xpBtnHoverEnd: '#D4D0C8',
						xpCloseStart: '#D4D0C8',
						xpCloseEnd: '#C0C0C0',
						xpCloseHoverStart: '#E4E0DC',
						xpCloseHoverEnd: '#D4D0C8',
						xpBtnBorder: '#808080',
						xpCloseBorder: '#808080',
						xpGlyphColor: '#000000',
						xpFrame: '#C0C0C0',
						xpHeaderRadius: '0px',
						xpBtnSize: '16px'
					},
					previewStyle: { backgroundImage: 'url(/images/windows/win95/background.png)', backgroundSize: 'cover' }
				},
				{
					name: 'winDark',
					style: 'windows',
					backgroundType: 'image',
					backgroundImage: '/images/windows/windark/background.png',
					iconsPath: '/images/windows/windark/',
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
						buttonWidth: '46px',
						style: 'win10'
					},
					previewStyle: { backgroundImage: 'url(/images/windows/windark/background.png)', backgroundSize: 'cover' }
				},
				{
					name: 'macOS',
					style: 'macos',
					backgroundType: 'image',
					backgroundImage: '/images/macos/background.png',
					iconsPath: '/images/macos/',
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
						border: 'rgba(0, 0, 0, 0.08)',
						borderRadius: '10px',
						shadow: '0 10px 50px rgba(0, 0, 0, 0.2)',
						closeBtnHover: '#ff5f57',
						minBtnHover: '#ffbd2e',
						maxBtnHover: '#28c840',
						titleHeight: '40px',
						buttonWidth: '48px',
						style: 'macos'
					},
					previewStyle: { backgroundImage: 'url(/images/macos/background.png)', backgroundSize: 'cover' }
				},
				{
					name: 'macOSBigSur',
					style: 'macos',
					backgroundType: 'gradient',
					gradientColor1: '#007AFF',
					gradientColor2: '#5AC8FA',
					gradientDirection: 'to bottom right',
					iconsPath: '/images/macos/',
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
						border: 'rgba(0, 0, 0, 0.06)',
						borderRadius: '10px',
						shadow: '0 10px 50px rgba(0, 0, 0, 0.2)',
						closeBtnHover: '#ff5f57',
						minBtnHover: '#ffbd2e',
						maxBtnHover: '#28c840',
						titleHeight: '40px',
						buttonWidth: '48px',
						style: 'macos'
					},
					previewStyle: { backgroundImage: 'url(/images/macos/background.png)', backgroundSize: 'cover' }
				},
				{
					name: 'macOSMonterey',
					style: 'macos',
					backgroundType: 'gradient',
					gradientColor1: '#00D4AA',
					gradientColor2: '#00A8FF',
					gradientDirection: 'to bottom right',
					iconsPath: '/images/macos/',
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
						border: 'rgba(0, 0, 0, 0.05)',
						borderRadius: '10px',
						shadow: '0 10px 50px rgba(0, 0, 0, 0.2)',
						closeBtnHover: '#ff5f57',
						minBtnHover: '#ffbd2e',
						maxBtnHover: '#28c840',
						titleHeight: '40px',
						buttonWidth: '48px',
						style: 'macos'
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
					iconsPath: '/images/macos/',
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
						border: 'rgba(0, 0, 0, 0.04)',
						borderRadius: '10px',
						shadow: '0 10px 50px rgba(0, 0, 0, 0.2)',
						closeBtnHover: '#ff5f57',
						minBtnHover: '#ffbd2e',
						maxBtnHover: '#28c840',
						titleHeight: '40px',
						buttonWidth: '48px',
						style: 'macos'
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
					iconsPath: '/images/macos/',
					windowTheme: {
						bg: '#1c1c1c',
						headerBg: '#2a2a2a',
						titleColor: '#ffffff',
						titleColorInactive: '#888888',
						border: 'rgba(255, 255, 255, 0.08)',
						borderRadius: '10px',
						shadow: '0 10px 50px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.05)',
						closeBtnHover: '#ff5f57',
						minBtnHover: '#ffbd2e',
						maxBtnHover: '#28c840',
						titleHeight: '40px',
						buttonWidth: '48px',
						style: 'macos'
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
		},
		themeClass() {
			return this.currentTheme ? `theme-${this.currentTheme}` : '';
		},
		isXpTheme() {
			return this.currentTheme === 'winXP';
		},
		// Windows 95/98/2000 经典主题
		isClassicTheme() {
			return ['win95', 'win98', 'win2000'].includes(this.currentTheme);
		},
		// Windows 7/Vista Aero 主题
		isAeroTheme() {
			return ['win7', 'winVista'].includes(this.currentTheme);
		},
		// macOS 系列主题
		isMacTheme() {
			return this.currentTheme.startsWith('macOS');
		},
		// 开始按钮显示 Windows 旗帜（XP/经典/Aero）
		showFlagStart() {
			return this.isXpTheme || this.isClassicTheme || this.isAeroTheme;
		},
		// 操作系统家族根类（供 grouped CSS 覆盖）
		osFamilyClass() {
			if (this.isMacTheme) return 'os-macos';
			if (this.isClassicTheme) return 'os-classic';
			if (this.isAeroTheme) return 'os-aero';
			if (['win8', 'win10', 'win11', 'winDark'].includes(this.currentTheme)) return 'os-winflat';
			return '';
		},
		// 经典开始菜单侧栏标题
		classicMenuTitle() {
			const titles = { win95: 'Windows 95', win98: 'Windows 98', win2000: 'Windows 2000' };
			return titles[this.currentTheme] || 'Windows';
		},
		// macOS 菜单栏应用名（聚焦窗口标题）
		macFocusedTitle() {
			const win = this.windows.find(w => w.focused && !w.minimized);
			return win ? win.title : 'Finder';
		},
		// macOS Dock 项：固定桌面图标 + 运行中的临时窗口
		macDockItems() {
			const pinned = this.deskApps.map(app => ({
				key: 'app-' + app.id,
				app: app,
				running: this.windows.some(w => w.code === app.code),
			}));
			const pinnedCodes = new Set(this.deskApps.map(a => a.code));
			const transient = this.windows
				.filter(w => !w.code || !pinnedCodes.has(w.code))
				.map(w => ({ key: 'win-' + w.id, window: w, running: true }));
			return [...pinned, ...transient];
		},
		// Windows 10/深色 主题
		isWin10LikeTheme() {
			return ['win10', 'winDark'].includes(this.currentTheme);
		},
		// 打平菜单树（叶子应用）
		flatMenuApps() {
			const leaves = [];
			const walk = (items) => {
				(items || []).forEach(item => {
					if (item.children && item.children.length) walk(item.children);
					else leaves.push(item);
				});
			};
			walk(this.menuApps);
			return leaves;
		},
		// 开始菜单搜索过滤（保留树结构）
		filteredMenuApps() {
			const kw = (this.menuSearch || '').toLowerCase();
			if (!kw) return this.menuApps;
			const match = (item) => (item.name || '').toLowerCase().includes(kw) || (item.children || []).some(match);
			return this.menuApps.filter(match);
		},
		// 开始菜单搜索过滤（打平叶子）
		filteredFlatApps() {
			const kw = (this.menuSearch || '').toLowerCase();
			if (!kw) return this.flatMenuApps;
			return this.flatMenuApps.filter(a => (a.name || '').toLowerCase().includes(kw));
		},
		// Win10 磁贴应用（前 12 个叶子）
		tileApps() {
			return this.flatMenuApps.slice(0, 12);
		},
		// XP 开始菜单右栏快捷链接
		xpQuickLinks() {
			return [
				{ key: 'computer', icon: 'ms-computer', name: this.$t('desktop.myComputer') },
				{ key: 'settings', icon: 'ms-settings', name: this.$t('desktop.controlPanel') },
				{ key: 'profile', icon: 'ms-account_circle', name: this.$t('desktop.profile') },
				{ key: 'calendar', icon: 'ms-calendar_month', name: this.$t('desktop.calendar') },
			];
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
				if (!e.target.closest('.start-menu') && !e.target.closest('.taskbar-start') && !e.target.closest('.mac-menu-apple')) {
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
			const meta = app.meta || {};
			if (meta.type === 'link') {
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
				icon: meta.icon || app.icon,
				component: app.component,
				props: app.props,
				minimized: false,
				maximized: false,
				focused: true,
				resizable: meta.resizable,
				centered: meta.center !== false,
				x: 100 + (windowId % 5) * 30,
				y: 100 + (windowId % 5) * 30,
				width: meta.width || app.width || 800,
				height: meta.height || app.height || 600,
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
			} else {
				this.menuSearch = '';
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
		// XP 开始菜单右栏快捷链接
		openQuickLink(link) {
			if (link.key === 'computer') {
				this.openApp({
					code: 'app-files',
					name: link.name,
					component: 'Files',
					meta: { icon: link.icon, width: 960, height: 620, resizable: true },
				});
			} else if (link.key === 'settings') {
				this.openSettings();
			} else if (link.key === 'profile') {
				this.openProfile();
			} else if (link.key === 'calendar') {
				this.openCalendar();
			}
		},
		shutdown() {
			this.$confirm(this.$t('desktop.shutdownConfirm'), this.$t('desktop.tip'), {
				type: "warning",
				confirmButtonText: this.$t('desktop.shutdown'),
				confirmButtonClass: "el-button--danger",
			})
				.then(() => {
					this.$router.replace({ path: "/login" });
				})
				.catch(() => {
					// 取消关闭
				});
		},
		// macOS Dock 图标
		dockIcon(item) {
			return this.getThemeIcon(item.app ? item.app.meta.icon : item.window.icon);
		},
		dockIconName(item) {
			return item.app ? item.app.meta.icon : (item.window.icon || 'ms-grid_view');
		},
		dockItemTitle(item) {
			return item.app ? item.app.name : item.window.title;
		},
		// macOS Dock 点击：运行中则切换聚焦/最小化，否则打开应用
		onDockClick(item) {
			if (item.window) {
				this.toggleWindow(item.window.id);
				return;
			}
			const running = this.windows.filter(w => w.code === item.app.code);
			if (running.length > 0) {
				this.toggleWindow(running[running.length - 1].id);
			} else {
				this.openApp(item.app);
			}
		},
		// Win8/10 磁贴颜色（按应用编码散列到 Metro 调色板）
		tileColor(app) {
			const palette = ['#0078D7', '#107C10', '#5C2D91', '#D83B01', '#038387', '#CA5010', '#986F0B', '#004E8C'];
			const code = app.code || app.name || 'app';
			let hash = 0;
			for (let i = 0; i < code.length; i++) {
				hash = (hash * 31 + code.charCodeAt(i)) % 997;
			}
			return palette[hash % palette.length];
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
				iconsPath: this.iconsPath,
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
			// 根据当前主题推导 iconsPath
			const themeDef = this.themes.find(t => t.name === config.currentTheme);
			this.iconsPath = (themeDef && themeDef.iconsPath) ? themeDef.iconsPath : (config.iconsPath || '');
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
			this.iconsPath = theme.iconsPath || '';
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
		/**
		 * 获取主题图标的 URL
		 * @param {string} iconName - Material Symbols 图标名称
		 * @returns {string|null} 主题特定的图标 URL，如果没有则返回 null
		 */
		getThemeIcon(iconName) {
			if (!this.iconsPath) return null;
			const fileName = this.iconMap[iconName];
			return fileName ? this.iconsPath + fileName : null;
		},
		/**
		 * 获取桌面图标的图片样式
		 */
		iconImageStyle(app) {
			const style = { filter: this.iconShadow };
			if (app && this.getThemeIcon(app.meta.icon)) {
				return style;
			}
			return style;
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
	--taskbar-height: 48px;
	position: relative;
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
	inset: 0 0 var(--taskbar-height);
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
	height: var(--taskbar-height);
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
	bottom: calc(var(--taskbar-height) + 10px);
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

/* ================= Windows XP 主题复刻（仅 .theme-winXP 下生效） ================= */
.theme-winXP {
	--taskbar-height: 30px;
	font-family: Tahoma, 'Microsoft YaHei', 'Segoe UI', sans-serif;
}

/* --- 任务栏 --- */
.theme-winXP .taskbar {
	padding: 0;
	background: linear-gradient(180deg, #245EDB 0%, #3F8CF3 9%, #245EDB 18%, #245EDB 92%, #1941A5 100%) !important;
	box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.35), inset 0 -1px 2px rgba(0, 0, 0, 0.2);
}

.theme-winXP .taskbar-start {
	height: 100%;
	margin: 0;
	padding: 0 20px 0 10px;
	gap: 6px;
	border-radius: 0 10px 10px 0;
	background: linear-gradient(180deg, #6DBB6A 0%, #4EA24E 35%, #3E9645 60%, #2F7D33 100%);
	box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.55), inset 0 -2px 3px rgba(0, 0, 0, 0.35), 2px 0 4px rgba(0, 0, 0, 0.3);
	font-size: 15px;
	font-style: italic;
	font-weight: bold;
	text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.theme-winXP .taskbar-start:hover {
	background: linear-gradient(180deg, #7FCB7C 0%, #5AB25A 35%, #4CA64A 60%, #3A8C3E 100%);
}

.theme-winXP .taskbar-start:active {
	background: linear-gradient(180deg, #2F7D33 0%, #3E9645 100%);
	box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
}

.theme-winXP .taskbar-apps {
	gap: 3px;
	margin-left: 6px;
}

.theme-winXP .taskbar-app {
	min-width: 150px;
	max-width: 200px;
	height: 23px;
	padding: 0 8px;
	border: 1px solid rgba(0, 0, 0, 0.25);
	border-radius: 3px;
	background: linear-gradient(180deg, #3B79E8 0%, #2B63D8 50%, #2150B8 100%);
	box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.25);
	font-size: 11px;
}

.theme-winXP .taskbar-app span {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.theme-winXP .taskbar-app:hover {
	background: linear-gradient(180deg, #4B88F0 0%, #3B74E4 50%, #2B60C8 100%);
}

.theme-winXP .taskbar-app.active {
	background: linear-gradient(180deg, #1A3F8C 0%, #1E4BA8 50%, #2659C9 100%);
	border: 1px solid rgba(0, 0, 0, 0.35);
	box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.35);
}

.theme-winXP .taskbar-app.minimized {
	opacity: 0.85;
}

.theme-winXP .taskbar-tray {
	align-self: stretch;
	padding: 0 12px;
	background: linear-gradient(180deg, #1290E9 0%, #1CB0F5 50%, #1290E9 100%);
	border-left: 1px solid rgba(0, 0, 0, 0.2);
	box-shadow: inset 2px 0 3px rgba(0, 0, 0, 0.25);
}

.theme-winXP .taskbar-tray .time {
	font-size: 11px;
	text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
}

/* --- 桌面图标 --- */
.theme-winXP .desktop-icon {
	padding: 6px;
	border-radius: 0;
}

.theme-winXP .desktop-icon:hover,
.theme-winXP .desktop-icon.selected {
	background-color: transparent;
	border-color: transparent;
	box-shadow: none;
}

.theme-winXP .desktop-icon.selected .icon-image {
	position: relative;
}

.theme-winXP .desktop-icon.selected .icon-image::after {
	content: '';
	position: absolute;
	inset: 0;
	background: rgba(49, 106, 197, 0.4);
}

.theme-winXP .icon-text {
	padding: 1px 3px;
	font-size: 11px;
}

.theme-winXP .desktop-icon.selected .icon-text {
	background-color: #316AC5;
}

/* --- 右键菜单 / 子菜单 --- */
.theme-winXP .context-menu,
.theme-winXP .submenu {
	background-color: #FFFFFF !important;
	color: #1A1A1A !important;
	border: 1px solid #ACA899;
	border-radius: 0;
	padding: 2px;
	backdrop-filter: none;
	box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.theme-winXP .context-menu-item,
.theme-winXP .submenu-item {
	padding: 5px 16px;
	font-size: 11px;
}

.theme-winXP .context-menu-item:hover,
.theme-winXP .submenu-item:hover {
	background-color: #316AC5;
	color: #FFFFFF;
}

.theme-winXP .context-menu-divider {
	background-color: #D4D0C8;
	margin: 2px 4px;
}

/* --- XP 开始菜单 --- */
.xp-start-menu {
	left: 0;
	bottom: var(--taskbar-height);
	width: 400px;
	border: 3px solid #0054E3;
	border-bottom: none;
	border-radius: 6px 6px 0 0;
	background: #FFFFFF;
	box-shadow: 4px -2px 12px rgba(0, 0, 0, 0.35);
}

.xp-menu-header {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px;
	background: linear-gradient(180deg, #0058EE 0%, #3A8CF2 4%, #2463D8 50%, #1C50B0 96%, #17459E 100%);
	cursor: pointer;
}

.xp-menu-header:hover {
	filter: brightness(1.08);
}

.xp-menu-avatar {
	width: 40px;
	height: 40px;
	background: #FFFFFF;
	border: 2px solid rgba(255, 255, 255, 0.7);
	border-radius: 5px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	flex-shrink: 0;
}

.xp-menu-username {
	color: #FFFFFF;
	font-size: 14px;
	font-weight: bold;
	text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.xp-menu-body {
	display: flex;
	min-height: 260px;
}

.xp-menu-left {
	flex: 1;
	background: #FFFFFF;
	padding: 4px;
	max-height: 400px;
	overflow-y: auto;
}

.xp-menu-caption {
	padding: 4px 8px;
	font-size: 10px;
	letter-spacing: 1px;
	color: #808080;
}

.xp-menu-item {
	position: relative;
}

.xp-menu-app {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 6px 8px;
	cursor: pointer;
	font-size: 12px;
	color: #1A1A1A;
}

.xp-menu-app:hover {
	background-color: #316AC5;
	color: #FFFFFF;
}

.xp-menu-app .arrow {
	margin-left: auto;
}

.xp-menu-right {
	width: 150px;
	flex-shrink: 0;
	background: #D9E8FB;
	border-left: 1px solid #B5CCE8;
	padding: 4px;
}

.xp-right-item {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 6px 8px;
	cursor: pointer;
	font-size: 11px;
	font-weight: bold;
	color: #0B326E;
}

.xp-right-item:hover {
	background-color: #316AC5;
	color: #FFFFFF;
}

.xp-menu-footer {
	display: flex;
	justify-content: flex-end;
	align-items: center;
	gap: 8px;
	padding: 6px 10px;
	background: linear-gradient(180deg, #2463D8 0%, #1C50B0 100%);
}

.xp-footer-btn {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 3px 6px;
	cursor: pointer;
	border-radius: 3px;
	color: #FFFFFF;
	font-size: 11px;
}

.xp-footer-btn:hover {
	background: rgba(255, 255, 255, 0.15);
}

.xp-footer-icon {
	width: 20px;
	height: 20px;
	border-radius: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3);
}

.xp-icon-logoff {
	background: linear-gradient(180deg, #F5A623 0%, #D97B00 100%);
}

.xp-icon-shutdown {
	background: linear-gradient(180deg, #E85D4A 0%, #C1352E 100%);
}

/* ================= Windows 95/98/2000 经典主题复刻 ================= */
.os-classic {
	--taskbar-height: 28px;
	font-family: Tahoma, 'Microsoft YaHei', 'Segoe UI', sans-serif;
}

.os-classic .taskbar {
	padding: 2px;
	background: #C0C0C0 !important;
	border-top: 1px solid #FFFFFF;
	box-shadow: inset 0 1px 0 #DFDFDF;
}

.os-classic .taskbar-start {
	height: 22px;
	margin: 1px 2px;
	padding: 0 6px;
	gap: 4px;
	background: #C0C0C0;
	border: 1px solid;
	border-color: #FFFFFF #000000 #000000 #FFFFFF;
	box-shadow: inset 1px 1px 0 #DFDFDF, inset -1px -1px 0 #808080;
	border-radius: 0;
	font-size: 11px;
	font-weight: bold;
}

.os-classic .taskbar-start:hover {
	background: #C0C0C0;
}

.os-classic .taskbar-start:active {
	border-color: #000000 #FFFFFF #FFFFFF #000000;
	box-shadow: inset 1px 1px 0 #808080;
}

.os-classic .taskbar-start .xp-start-flag {
	width: 16px;
	height: 16px;
}

.os-classic .taskbar-apps {
	gap: 2px;
	margin-left: 2px;
}

.os-classic .taskbar-app {
	height: 22px;
	min-width: 110px;
	max-width: 150px;
	padding: 0 6px;
	gap: 4px;
	background: #C0C0C0;
	border: 1px solid;
	border-color: #FFFFFF #000000 #000000 #FFFFFF;
	box-shadow: inset 1px 1px 0 #DFDFDF, inset -1px -1px 0 #808080;
	border-radius: 0;
	font-size: 11px;
}

.os-classic .taskbar-app span {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.os-classic .taskbar-app:hover {
	background: #C0C0C0;
}

.os-classic .taskbar-app.active {
	background: #E0E0E0;
	border-color: #000000 #FFFFFF #FFFFFF #000000;
	box-shadow: inset 1px 1px 0 #808080;
}

.os-classic .taskbar-app.minimized {
	opacity: 0.75;
}

.os-classic .taskbar-tray {
	align-self: center;
	height: 22px;
	margin: 1px 2px 1px 0;
	padding: 0 8px;
	background: #C0C0C0;
	border: 1px solid;
	border-color: #808080 #FFFFFF #FFFFFF #808080;
}

.os-classic .taskbar-tray .time {
	font-size: 11px;
}

.os-classic .desktop-icon:hover,
.os-classic .desktop-icon.selected {
	background-color: transparent;
	border-color: transparent;
	box-shadow: none;
}

.os-classic .desktop-icon.selected .icon-text {
	background-color: #000080;
}

.os-classic .icon-text {
	padding: 1px 2px;
	font-size: 11px;
}

.os-classic .context-menu,
.os-classic .submenu {
	background-color: #C0C0C0 !important;
	color: #000000 !important;
	border: 1px solid;
	border-color: #DFDFDF #808080 #808080 #DFDFDF;
	border-radius: 0;
	padding: 2px;
	backdrop-filter: none;
	box-shadow: 2px 2px 3px rgba(0, 0, 0, 0.4);
}

.os-classic .context-menu-item,
.os-classic .submenu-item {
	padding: 5px 16px;
	font-size: 11px;
}

.os-classic .context-menu-item:hover,
.os-classic .submenu-item:hover {
	background-color: #000080;
	color: #FFFFFF;
}

.os-classic .context-menu-divider {
	height: 0;
	background: none;
	border-top: 1px solid #808080;
	border-bottom: 1px solid #FFFFFF;
	margin: 2px;
}

/* 经典开始菜单 */
.classic-start-menu {
	left: 2px;
	bottom: var(--taskbar-height);
	width: 250px;
	display: flex;
	padding: 3px;
	background: #C0C0C0;
	border: 1px solid;
	border-color: #DFDFDF #808080 #808080 #DFDFDF;
	border-radius: 0;
	box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.4);
}

.classic-menu-banner {
	width: 26px;
	flex-shrink: 0;
	display: flex;
	align-items: flex-end;
	justify-content: center;
	padding: 8px 0;
	background: linear-gradient(180deg, #1084D0 0%, #000080 100%);
}

.classic-menu-banner span {
	writing-mode: vertical-rl;
	transform: rotate(180deg);
	color: #FFFFFF;
	font-size: 16px;
	font-weight: bold;
	letter-spacing: 1px;
	white-space: nowrap;
}

.classic-menu-body {
	flex: 1;
	min-width: 0;
	padding: 2px;
}

.classic-menu-item {
	position: relative;
}

.classic-menu-app {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 6px 8px;
	cursor: pointer;
	font-size: 12px;
	color: #000000;
}

.classic-menu-app:hover {
	background-color: #000080;
	color: #FFFFFF;
}

.classic-menu-app .arrow {
	margin-left: auto;
}

.classic-menu-divider {
	height: 0;
	border-top: 1px solid #808080;
	border-bottom: 1px solid #FFFFFF;
	margin: 3px 2px;
}

/* ================= Windows 7 / Vista Aero 主题复刻 ================= */
.os-aero {
	--taskbar-height: 40px;
}

.os-aero .taskbar {
	padding: 0 8px;
	background: linear-gradient(180deg, rgba(80, 80, 80, 0.5) 0%, rgba(30, 30, 30, 0.6) 50%, rgba(0, 0, 0, 0.7) 100%) !important;
	border-top: 1px solid rgba(255, 255, 255, 0.25);
	box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

.os-aero .taskbar-start {
	width: 44px;
	height: 44px;
	margin: -8px 6px 0 2px;
	padding: 0;
	justify-content: center;
	border-radius: 50%;
	background: radial-gradient(circle at 50% 32%, #8FBCEA 0%, #4B86C8 45%, #24568F 100%);
	border: 1px solid rgba(0, 0, 0, 0.55);
	box-shadow: 0 0 10px rgba(90, 160, 230, 0.55), inset 0 1px 3px rgba(255, 255, 255, 0.5);
}

.os-aero .taskbar-start span {
	display: none;
}

.os-aero .taskbar-start:hover {
	background: radial-gradient(circle at 50% 32%, #ACD0F2 0%, #64A0DA 45%, #32649E 100%);
	box-shadow: 0 0 14px rgba(120, 190, 255, 0.8), inset 0 1px 3px rgba(255, 255, 255, 0.6);
}

.os-aero .taskbar-start:active {
	background: radial-gradient(circle at 50% 32%, #4B86C8 0%, #24568F 100%);
}

.os-aero .taskbar-apps {
	gap: 4px;
	margin-left: 4px;
}

.os-aero .taskbar-app {
	height: 30px;
	min-width: 56px;
	max-width: 160px;
	padding: 0 10px;
	border-radius: 4px;
	border: 1px solid rgba(0, 0, 0, 0.45);
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.06) 50%, rgba(0, 0, 0, 0.14) 100%);
	box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);
	font-size: 12px;
}

.os-aero .taskbar-app span {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.os-aero .taskbar-app:hover {
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0.14) 100%);
	box-shadow: 0 0 8px rgba(130, 195, 255, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.os-aero .taskbar-app.active {
	background: linear-gradient(180deg, rgba(130, 195, 255, 0.4) 0%, rgba(70, 135, 205, 0.3) 100%);
	border-color: rgba(0, 0, 0, 0.55);
	box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
}

.os-aero .taskbar-app.minimized {
	opacity: 0.7;
}

.os-aero .taskbar-tray .time {
	font-size: 12px;
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
}

.os-aero .start-menu {
	background: linear-gradient(180deg, rgba(246, 249, 253, 0.96) 0%, rgba(222, 232, 244, 0.96) 100%) !important;
	color: #1A1A1A !important;
	border: 1px solid rgba(0, 0, 0, 0.4);
	border-radius: 6px !important;
	box-shadow: 0 6px 24px rgba(0, 0, 0, 0.45);
}

.os-aero .start-menu-header {
	border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.os-aero .start-menu-header:hover,
.os-aero .start-menu-app:hover,
.os-aero .start-menu-action:hover {
	background: linear-gradient(180deg, #DCEBFB 0%, #BBD9F5 100%);
	color: #1A1A1A;
}

.os-aero .start-menu-footer {
	border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.os-aero .submenu,
.os-aero .context-menu {
	background: rgba(246, 249, 253, 0.97) !important;
	color: #1A1A1A !important;
	border: 1px solid rgba(0, 0, 0, 0.3);
	border-radius: 4px;
}

.os-aero .submenu-item:hover,
.os-aero .context-menu-item:hover {
	background: linear-gradient(180deg, #DCEBFB 0%, #BBD9F5 100%);
	color: #1A1A1A;
}

.os-aero .context-menu-divider {
	background-color: rgba(0, 0, 0, 0.12);
}

/* ================= Windows 8/10/11/深色 扁平主题 ================= */
.os-winflat {
	--taskbar-height: 40px;
}

.os-winflat .taskbar {
	padding: 0;
	border-radius: 0 !important;
	border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.os-winflat .taskbar-start {
	height: 100%;
	padding: 0 14px;
	border-radius: 0;
}

.os-winflat .taskbar-apps {
	gap: 0;
	margin-left: 0;
	align-self: stretch;
}

.os-winflat .taskbar-app {
	height: 100%;
	min-width: 160px;
	max-width: 200px;
	padding: 0 10px;
	border-radius: 0;
	background: transparent;
	border-bottom: 2px solid transparent;
	font-size: 12px;
}

.os-winflat .taskbar-app span {
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.os-winflat .taskbar-app:hover {
	background: rgba(255, 255, 255, 0.08);
}

.os-winflat .taskbar-app.active {
	background: rgba(255, 255, 255, 0.12);
	border-bottom: 2px solid #0078D7;
}

.os-winflat .start-menu,
.os-winflat .context-menu,
.os-winflat .submenu {
	border-radius: 0 !important;
}

/* ================= Windows 11 居中任务栏 ================= */
.theme-win11 {
	--taskbar-height: 48px;
}

.theme-win11 .taskbar {
	justify-content: center;
}

.theme-win11 .taskbar-start {
	height: 40px;
	align-self: center;
	border-radius: 6px;
}

.theme-win11 .taskbar-apps {
	flex: 0 1 auto;
	justify-content: center;
	gap: 4px;
}

.theme-win11 .taskbar-app {
	min-width: 0;
	width: 40px;
	height: 40px;
	align-self: center;
	justify-content: center;
	padding: 0;
	border-bottom: none;
	border-radius: 6px;
}

.theme-win11 .taskbar-app span {
	display: none;
}

.theme-win11 .taskbar-app.active {
	border-bottom: none;
	box-shadow: inset 0 -2px 0 #60CDFF;
}

.theme-win11 .taskbar-tray {
	position: absolute;
	right: 12px;
}

/* ================= macOS 主题复刻（菜单栏 + Dock） ================= */
.os-macos {
	font-family: -apple-system, BlinkMacSystemFont, 'San Francisco', 'Segoe UI', 'Microsoft YaHei', sans-serif;
}

.os-macos .windows-container {
	inset: 28px 0 72px 0;
}

.mac-menubar {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	height: 28px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 14px;
	z-index: 1000;
	background: rgba(255, 255, 255, 0.5);
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
	color: #1A1A1A;
	box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
}

.theme-macOSDark .mac-menubar {
	background: rgba(24, 24, 27, 0.55);
	color: #F2F2F2;
}

.mac-menubar-left {
	display: flex;
	align-items: center;
	gap: 14px;
}

.mac-menu-apple {
	display: flex;
	align-items: center;
	padding: 2px 8px;
	border-radius: 4px;
	cursor: pointer;
}

.mac-menu-apple:hover {
	background: rgba(0, 0, 0, 0.08);
}

.theme-macOSDark .mac-menu-apple:hover {
	background: rgba(255, 255, 255, 0.12);
}

.mac-menu-appname {
	font-size: 13px;
	font-weight: 700;
}

.mac-menubar-right {
	display: flex;
	align-items: center;
}

.mac-menu-clock {
	font-size: 12px;
}

.mac-dock {
	position: absolute;
	bottom: 8px;
	left: 50%;
	transform: translateX(-50%);
	display: flex;
	align-items: flex-end;
	gap: 6px;
	padding: 6px 10px;
	background: rgba(255, 255, 255, 0.35);
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
	border: 1px solid rgba(255, 255, 255, 0.45);
	border-radius: 18px;
	box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
	z-index: 1000;
}

.theme-macOSDark .mac-dock {
	background: rgba(30, 30, 34, 0.45);
	border-color: rgba(255, 255, 255, 0.16);
}

.mac-dock-item {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	cursor: pointer;
	transition: transform 0.15s ease, margin 0.15s ease;
	transform-origin: center bottom;
}

.mac-dock-item:hover {
	transform: scale(1.3);
	margin: 0 8px;
}

.mac-dock-item img {
	width: 44px;
	height: 44px;
	object-fit: contain;
}

.theme-macOSDark .mac-dock-item {
	color: #F2F2F2;
}

.mac-dock-dot {
	width: 4px;
	height: 4px;
	border-radius: 50%;
	background: #3A3A3C;
	margin-top: 1px;
}

.theme-macOSDark .mac-dock-dot {
	background: #E5E5EA;
}

/* macOS 苹果菜单（复用通用开始菜单结构） */
.os-macos .start-menu {
	top: 32px;
	bottom: auto;
	left: 6px;
	width: 250px;
	border-radius: 10px !important;
	box-shadow: 0 12px 36px rgba(0, 0, 0, 0.28);
}

/* --- Aero 开始菜单（Vista/7 双栏） --- */
.aero-start-menu {
	left: 8px;
	width: 430px;
	overflow: visible;
}

.aero-menu-body {
	display: flex;
	min-height: 320px;
}

.aero-menu-left {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
}

.aero-menu-apps {
	flex: 1;
	padding: 6px;
	max-height: 380px;
	overflow-y: auto;
}

.aero-app-item {
	position: relative;
}

.aero-app-link {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 6px 10px;
	border-radius: 3px;
	cursor: pointer;
	font-size: 13px;
	color: #1A1A1A;
}

.aero-app-link:hover {
	background: linear-gradient(180deg, #DCEBFB 0%, #BBD9F5 100%);
}

.aero-app-link .arrow {
	margin-left: auto;
}

.aero-menu-search {
	padding: 8px;
	border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.aero-menu-search input {
	width: 100%;
	padding: 4px 8px;
	border: 1px solid #9FB6CC;
	border-radius: 3px;
	outline: none;
	font-size: 12px;
}

.aero-menu-right {
	position: relative;
	width: 170px;
	flex-shrink: 0;
	padding: 34px 6px 6px;
	background: rgba(185, 209, 234, 0.45);
	border-left: 1px solid rgba(0, 0, 0, 0.08);
	border-radius: 0 6px 6px 0;
}

.aero-menu-avatar {
	position: absolute;
	top: -22px;
	right: 12px;
	width: 48px;
	height: 48px;
	background: #FFFFFF;
	border: 2px solid rgba(255, 255, 255, 0.9);
	border-radius: 6px;
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}

.aero-right-item {
	padding: 6px 10px;
	border-radius: 3px;
	cursor: pointer;
	font-size: 13px;
	font-weight: 600;
	color: #1A1A1A;
}

.aero-right-item:hover {
	background: linear-gradient(180deg, #DCEBFB 0%, #BBD9F5 100%);
}

.aero-right-divider {
	height: 1px;
	background: rgba(0, 0, 0, 0.12);
	margin: 6px 8px;
}

/* --- Win8 全屏开始屏幕 --- */
.win8-start-screen {
	position: absolute;
	inset: 0;
	z-index: 1500;
	padding: 40px 60px;
	background: linear-gradient(135deg, #1B1B4D 0%, #2D2D6E 60%, #1F4E79 100%);
	color: #FFFFFF;
	overflow-y: auto;
	font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
}

.win8-screen-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 32px;
}

.win8-screen-title {
	font-size: 34px;
	font-weight: 300;
	letter-spacing: 1px;
}

.win8-screen-user {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 4px 8px;
	cursor: pointer;
	font-size: 14px;
}

.win8-screen-user:hover {
	background: rgba(255, 255, 255, 0.12);
}

.win8-tiles {
	display: grid;
	grid-template-columns: repeat(auto-fill, 120px);
	gap: 8px;
}

.win8-tile {
	width: 120px;
	height: 120px;
	padding: 8px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 8px;
	cursor: pointer;
	font-size: 12px;
	text-align: center;
	transition: transform 0.08s ease;
}

.win8-tile:hover {
	outline: 2px solid rgba(255, 255, 255, 0.65);
}

.win8-tile:active {
	transform: scale(0.94);
}

.win8-tile span {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	max-width: 100%;
}

/* --- Win10 开始菜单（左侧栏 + 应用列表 + 磁贴） --- */
.win10-start-menu {
	left: 8px;
	width: 620px;
	display: flex;
	padding: 0;
}

.win10-menu-rail {
	width: 44px;
	flex-shrink: 0;
	display: flex;
	flex-direction: column;
	padding: 4px 0;
	background: rgba(0, 0, 0, 0.25);
}

.win10-rail-item {
	width: 44px;
	height: 42px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}

.win10-rail-item:hover {
	background: rgba(255, 255, 255, 0.1);
}

.win10-rail-spacer {
	flex: 1;
}

.win10-menu-apps {
	width: 230px;
	flex-shrink: 0;
	padding: 6px;
	max-height: 440px;
	overflow-y: auto;
}

.win10-menu-search {
	padding: 2px 2px 6px;
}

.win10-menu-search input {
	width: 100%;
	padding: 5px 10px;
	background: rgba(255, 255, 255, 0.08);
	border: 1px solid rgba(255, 255, 255, 0.15);
	border-radius: 2px;
	color: inherit;
	outline: none;
	font-size: 12px;
}

.win10-app-item {
	position: relative;
}

.win10-app-link {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 8px 10px;
	cursor: pointer;
	font-size: 13px;
}

.win10-app-link:hover {
	background: rgba(255, 255, 255, 0.08);
}

.win10-app-link .arrow {
	margin-left: auto;
}

.win10-menu-tiles {
	flex: 1;
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 4px;
	padding: 8px;
	align-content: start;
	max-height: 440px;
	overflow-y: auto;
}

.win10-tile {
	aspect-ratio: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 6px;
	padding: 6px;
	cursor: pointer;
	font-size: 11px;
	text-align: center;
}

.win10-tile:hover {
	outline: 2px solid rgba(255, 255, 255, 0.5);
}

.win10-tile span {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	max-width: 100%;
}

/* --- Win11 开始菜单（居中 + 固定网格） --- */
.win11-start-menu {
	left: 50%;
	bottom: calc(var(--taskbar-height) + 12px);
	width: 540px;
	display: flex;
	flex-direction: column;
	border-radius: 8px !important;
	transform: translateX(-50%);
}

.win11-menu-search {
	padding: 16px 24px 8px;
}

.win11-menu-search input {
	width: 100%;
	padding: 7px 14px;
	background: rgba(255, 255, 255, 0.08);
	border: 1px solid rgba(255, 255, 255, 0.15);
	border-bottom: 2px solid rgba(255, 255, 255, 0.25);
	border-radius: 4px;
	color: inherit;
	outline: none;
	font-size: 13px;
}

.win11-menu-search input:focus {
	border-bottom-color: #60CDFF;
}

.win11-menu-section {
	padding: 8px 28px 4px;
	font-size: 12px;
	font-weight: 600;
	opacity: 0.85;
}

.win11-menu-grid {
	display: grid;
	grid-template-columns: repeat(6, 1fr);
	gap: 2px;
	padding: 4px 18px 12px;
	max-height: 300px;
	overflow-y: auto;
}

.win11-grid-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
	padding: 10px 4px;
	border-radius: 6px;
	cursor: pointer;
	font-size: 11px;
	text-align: center;
}

.win11-grid-item:hover {
	background: rgba(255, 255, 255, 0.08);
}

.win11-grid-item span {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	max-width: 100%;
}

.win11-menu-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px 28px;
	border-top: 1px solid rgba(255, 255, 255, 0.08);
	background: rgba(0, 0, 0, 0.15);
	border-radius: 0 0 8px 8px;
}

.win11-footer-user {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 4px 8px;
	border-radius: 4px;
	cursor: pointer;
	font-size: 13px;
}

.win11-footer-user:hover {
	background: rgba(255, 255, 255, 0.08);
}

.win11-footer-power {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 4px;
	cursor: pointer;
}

.win11-footer-power:hover {
	background: rgba(255, 255, 255, 0.1);
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
	.desktop {
		--taskbar-height: 56px;
	}

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
		bottom: var(--taskbar-height);
	}

	.taskbar {
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
		bottom: calc(var(--taskbar-height) + 10px);
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
		bottom: calc(var(--taskbar-height) + 10px);
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
