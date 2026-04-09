<template>
	<div class="desktop" :style="desktopStyle" @click="clearSelection" @contextmenu.prevent>
		<!-- 桌面图标区域 -->
		<div class="desktop-icons">
			<div v-for="app in deskApps" :key="app.id" class="desktop-icon"
				:class="{ selected: selectedApp === app.id }" @click.stop="selectApp(app.id)"
				@dblclick.stop="openApp(app)">
				<div class="icon-image">
					<sc-icon :name="app.icon" :size="48" :color="iconColor" />
				</div>
				<div class="icon-text" :style="{ color: iconColor }">{{ app.name }}</div>
			</div>
		</div>

		<!-- 窗口容器 -->
		<div class="windows-container">
			<Window v-for="window in windows" :key="window.id" :window="window" :theme="windowTheme"
				@close="closeWindow" @minimize="minimizeWindow" @maximize="maximizeWindow" @focus="focusWindow"
				@set-wallpaper="setWallpaper" />
		</div>

		<!-- 任务栏 -->
		<div class="taskbar" :style="{ backgroundColor: taskbarColor, color: taskbarTextColor }">
			<div class="taskbar-start" @click="toggleStartMenu">
				<sc-icon name="ms-window" :size="24" />
				<span>开始</span>
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
		<div v-if="showStartMenu" class="start-menu" :style="{ backgroundColor: menuColor, color: menuTextColor }">
			<div class="start-menu-header">
				<sc-icon name="ms-account_circle" :size="32" />
				<span>{{ userName }}</span>
			</div>
			<div class="start-menu-apps">
				<div v-for="app in menuApps" :key="app.id" class="start-menu-item"
					:class="{ 'has-children': app.children }" @mouseenter="showSubmenu($event, app)"
					@mouseleave="hideSubmenu">
					<div class="start-menu-app" @click="app.children ? null : openApp(app)">
						<sc-icon :name="app.icon" />
						<span>{{ app.name }}</span>
						<sc-icon v-if="app.children" name="ms-arrow_forward" class="arrow" :size="16" />
					</div>
				</div>
			</div>
			<div class="start-menu-footer">
				<div class="start-menu-action" @click="openSettings">
					<sc-icon name="ms-settings" />
					<span>设置</span>
				</div>
				<div class="start-menu-action" @click="logout">
					<sc-icon name="ms-exit_to_app" />
					<span>退出</span>
				</div>
			</div>
		</div>

		<!-- 子菜单 -->
		<div v-if="activeSubmenu" class="submenu"
			:style="{ ...submenuStyle, backgroundColor: menuColor, color: menuTextColor }" @mouseenter="keepSubmenu"
			@mouseleave="hideSubmenu">
			<div v-for="child in activeSubmenu.children" :key="child.id" class="submenu-item" @click="openApp(child)">
				<sc-icon :name="child.icon" />
				<span>{{ child.name }}</span>
			</div>
		</div>

		<!-- 设置窗口 -->
		<el-dialog v-model="showSettings" title="桌面设置" width="500px" :modal-append-to-body="false">
			<el-tabs>
				<el-tab-pane label="主题设置">
					<div class="settings-section">
						<h4>预设主题</h4>
						<div class="theme-grid">
							<div v-for="theme in themes" :key="theme.name" class="theme-item"
								:class="{ active: currentTheme === theme.name }" @click="applyTheme(theme)">
								<div class="theme-preview" :style="theme.previewStyle">
									<div class="theme-taskbar" :style="{ backgroundColor: theme.taskbarColor }"></div>
								</div>
								<span class="theme-name">{{ theme.label }}</span>
							</div>
						</div>
					</div>
				</el-tab-pane>
				<el-tab-pane label="个性设置">
					<div class="settings-section">
						<h4>图标颜色</h4>
						<el-color-picker v-model="iconColor" :predefine="colorList" show-alpha />
					</div>

					<div class="settings-section">
						<h4>背景类型</h4>
						<el-radio-group v-model="backgroundType">
							<el-radio value="color">纯色</el-radio>
							<el-radio value="gradient">渐变</el-radio>
							<el-radio value="image">图像</el-radio>
						</el-radio-group>
					</div>

					<div v-if="backgroundType === 'color'" class="settings-section">
						<h4>预设颜色</h4>
						<el-color-picker v-model="backgroundColor" :predefine="colorList" show-alpha />
					</div>

					<div v-if="backgroundType === 'gradient'" class="settings-section">
						<h4>渐变颜色</h4>
						<el-color-picker v-model="gradientColor1" :predefine="colorList" show-alpha />
						<el-color-picker v-model="gradientColor2" :predefine="colorList" show-alpha />
						<el-select v-model="gradientDirection" style="margin-left: 10px; width: 120px;">
							<el-option label="从左到右" value="to right" />
							<el-option label="从上到下" value="to bottom" />
							<el-option label="对角线" value="to bottom right" />
						</el-select>
					</div>

					<div v-if="backgroundType === 'image'" class="settings-section">
						<h4>背景图像</h4>
						<el-input v-model="backgroundImage" placeholder="输入图像URL或选择预设" />
						<div class="preset-images">
							<div v-for="(img, index) in presetImages" :key="index" class="preset-image"
								:style="{ backgroundImage: `url(${img})` }" @click="backgroundImage = img" />
						</div>
					</div>
				</el-tab-pane>
				<el-tab-pane label="框架布局">
					<el-form ref="form">
						<el-form-item label="首页布局">
							<el-select v-model="home" placeholder="请选择">
								<el-option label="自定义" value="/"></el-option>
								<el-option label="工作台" value="/console"></el-option>
								<el-option label="云桌面" value="/desktop"></el-option>
								<el-option label="大屏幕" value="/monitor"></el-option>
							</el-select>
						</el-form-item>
					</el-form>
				</el-tab-pane>
			</el-tabs>
			<template #footer>
				<el-button @click="showSettings = false">取消</el-button>
				<el-button type="primary" @click="saveSettings">保存</el-button>
			</template>
		</el-dialog>
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
			showSettings: false,
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
			],
			userName: 'User',
			home: '/',
			deskApps: [],
			menuApps: [],
			updateTimeInterval: null,
			documentClickHandler: null,
			iconColor: '#ffffff',
			currentTheme: 'default',
			taskbarColor: 'rgba(0, 0, 0, 0.6)',
			taskbarTextColor: '#ffffff',
			menuColor: 'rgba(0, 0, 0, 0.9)',
			menuTextColor: '#ffffff',
			windowTheme: {
				bg: '#f3f3f3',
				headerBg: '#f3f3f3',
				titleColor: '#1a1a1a',
				titleColorInactive: '#666666',
				border: 'rgba(0, 0, 0, 0.1)'
			},
			themes: [
				{
					name: 'default',
					label: '默认',
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
					label: '深色',
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
					label: '浅色',
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
					label: '极光',
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
					label: '午夜',
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
					label: '海洋',
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
					label: '森林',
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
					label: '玫瑰',
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
					label: '琥珀',
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
					label: '薄荷',
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
					label: '紫罗兰',
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
					name: 'chinese-purple',
					label: '中国紫',
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
			var userInfo = this.$TOOL.session.get("USER_INFO");
			if (userInfo) {
				this.userName = userInfo.userName;
			}

			this.updateTime();
			this.updateTimeInterval = setInterval(this.updateTime, 1000);

			this.listApp();
			this.loadTheme();

			this.documentClickHandler = (e) => {
				if (!e.target.closest('.start-menu') && !e.target.closest('.taskbar-start')) {
					this.showStartMenu = false;
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
		},
		listApp() {
			var app = { id: 11, name: '云空间', icon: 'ms-cloud', component: 'Files', width: 900, height: 600 };
			this.deskApps.push(app);
			this.menuApps.push(app);

			app = { id: 12, name: '浏览器', icon: 'ms-language', component: 'Browser' };
			this.deskApps.push(app);
			this.menuApps.push(app);

			var menu = { id: 2, name: '多媒体', icon: 'ms-videocam', children: [] };
			this.menuApps.push(menu);
			app = { id: 21, name: '图像', icon: 'ms-photo_library', component: 'Image' };
			this.deskApps.push(app);
			menu.children.push(app);
			app = { id: 22, name: '音频', icon: 'ms-music_note', component: 'Audio' };
			this.deskApps.push(app);
			menu.children.push(app);
			app = { id: 23, name: '视频', icon: 'ms-videocam', component: 'Video' };
			this.deskApps.push(app);
			menu.children.push(app);

			menu = { id: 1, name: '应用', icon: 'ms-folder', children: [] };
			this.menuApps.push(menu);

			app = { id: 13, name: '记事', icon: 'ms-description', component: 'Notepad', width: 700, height: 500 };
			this.deskApps.push(app);
			menu.children.push(app);
			app = { id: 14, name: '待办', icon: 'ms-assignment', component: 'Todo', width: 320, height: 580 };
			this.deskApps.push(app);
			menu.children.push(app);
			app = { id: 15, name: '日历', icon: 'ms-calendar_month', component: 'Calendar', width: 320, height: 460, resizable: false };
			// this.deskApps.push(app);
			menu.children.push(app);
			app = { id: 16, name: '计算器', icon: 'ms-calculate', component: 'Calculator', width: 400, height: 580, resizable: false };
			// this.deskApps.push(app);
			menu.children.push(app);

			menu = { id: 4, name: '通讯', icon: 'ms-contacts', children: [] };
			this.menuApps.push(menu);
			app = { id: 41, name: '联系人', icon: 'ms-contacts', component: 'Contacts', width: 800, height: 560 };
			this.deskApps.push(app);
			menu.children.push(app);
			app = { id: 42, name: '短信', icon: 'ms-sms', component: 'SMS', width: 800, height: 560 };
			this.deskApps.push(app);
			menu.children.push(app);

			menu = { id: 3, name: '系统工具', icon: 'ms-settings', children: [] };
			this.menuApps.push(menu);
			app = { id: 31, name: '终端', icon: 'ms-terminal', component: 'Terminal', width: 800, height: 560 };
			this.deskApps.push(app);
			menu.children.push(app);
			app = { id: 32, name: '下载', icon: 'ms-download', component: 'Download' };
			this.deskApps.push(app);
			menu.children.push(app);
			app = { id: 33, name: '消息', icon: 'ms-mail', component: 'Message' };
			// this.deskApps.push(app);
			menu.children.push(app);
		},
		openApp(app) {
			this.showStartMenu = false;
			const windowId = ++this.windowIdCounter;
			this.windows.push({
				id: windowId,
				title: app.name,
				icon: app.icon,
				component: app.component,
				props: app.props,
				minimized: false,
				maximized: false,
				focused: true,
				resizable: app.resizable,
				x: 100 + (windowId % 5) * 30,
				y: 100 + (windowId % 5) * 30,
				width: app.width || 800,
				height: app.height || 600,
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
			this.showSettings = true;
		},
		openCalendar() {
			this.openApp({
				name: '日历',
				icon: 'ms-calendar_month',
				component: 'Calendar',
				width: 320,
				height: 460,
				resizable: false
			});
		},
		saveSettings() {
			localStorage.setItem('desktop_icon_color', this.iconColor);
			this.showSettings = false;
		},
		applyTheme(theme) {
			this.currentTheme = theme.name;
			this.backgroundType = theme.backgroundType;
			this.taskbarColor = theme.taskbarColor;
			this.taskbarTextColor = theme.taskbarTextColor || '#ffffff';
			this.menuColor = theme.menuColor || 'rgba(0, 0, 0, 0.9)';
			this.menuTextColor = theme.menuTextColor || '#ffffff';
			this.iconColor = theme.iconColor || '#ffffff';
			this.windowTheme = theme.windowTheme || {
				bg: '#f3f3f3',
				headerBg: '#f3f3f3',
				titleColor: '#1a1a1a',
				titleColorInactive: '#666666',
				border: 'rgba(0, 0, 0, 0.1)'
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
			this.$confirm("确认是否退出当前用户？", "提示", {
				type: "warning",
				confirmButtonText: "退出",
				confirmButtonClass: "el-button--danger",
			})
				.then(() => {
					this.$router.replace({ path: "/login" });
				})
				.catch(() => {
					//取消退出
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
				appConfig = {
					name: '记事',
					icon: 'ms-article',
					component: 'Text',
					width: 800,
					height: 600,
					props: { files: files, index: index }
				};
			} else if (kind === 'image') {
				appConfig = {
					name: '图像',
					icon: 'ms-photo_library',
					component: 'Image',
					width: 900,
					height: 700,
					props: { files: files, index: index }
				};
			} else if (kind === 'video') {
				appConfig = {
					name: '视频',
					icon: 'ms-videocam',
					component: 'Video',
					width: 900,
					height: 600,
					props: { files: files, index: index }
				};
			} else if (kind === 'audio') {
				appConfig = {
					name: '音频',
					icon: 'ms-music_note',
					component: 'Audio',
					width: 500,
					height: 600,
					props: { files: files, index: index }
				};
			} else {
				this.$message.info(`无法打开此类型文件`);
				return;
			}

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
				this.$message.info(`无法打开此类型文件: ${file.name}`);
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
	filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
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
	top: 0;
	left: 0;
	right: 0;
	bottom: 48px;
	pointer-events: none;
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
	backdrop-filter: blur(10px);
	display: flex;
	align-items: center;
	padding: 0 10px;
	z-index: 1000;
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
	backdrop-filter: blur(20px);
	border-radius: 8px;
	overflow: hidden;
	z-index: 1001;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.start-menu-header {
	display: flex;
	align-items: center;
	gap: 15px;
	padding: 20px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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

.settings-section {
	margin-bottom: 20px;
}

.settings-section h4 {
	margin-bottom: 10px;
	color: #606266;
}

.preset-colors {
	display: grid;
	grid-template-columns: repeat(6, 1fr);
	gap: 10px;
}

.preset-color {
	width: 100%;
	aspect-ratio: 1;
	border-radius: 8px;
	cursor: pointer;
	border: 2px solid transparent;
	transition: all 0.2s;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}

.preset-color:hover {
	transform: scale(1.1);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.preset-color.active {
	border-color: #409eff;
	box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3);
}

.check-icon {
	color: #fff;
	font-size: 14px;
	font-weight: bold;
	text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.preset-images {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 10px;
	margin-top: 10px;
}

.preset-image {
	width: 100%;
	height: 80px;
	background-size: cover;
	background-position: center;
	border-radius: 4px;
	cursor: pointer;
	border: 2px solid transparent;
	transition: border-color 0.3s;
}

.preset-image:hover {
	border-color: #409eff;
}

.theme-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 15px;
	margin-top: 10px;
}

.theme-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	cursor: pointer;
	padding: 8px;
	border-radius: 8px;
	border: 2px solid transparent;
	transition: all 0.3s;
}

.theme-item:hover {
	background-color: rgba(0, 0, 0, 0.05);
}

.theme-item.active {
	border-color: #409eff;
	background-color: rgba(64, 158, 255, 0.1);
}

.theme-preview {
	width: 100%;
	height: 60px;
	border-radius: 6px;
	position: relative;
	overflow: hidden;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.theme-taskbar {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	height: 12px;
}

.theme-name {
	margin-top: 8px;
	font-size: 12px;
	color: #606266;
}
</style>
