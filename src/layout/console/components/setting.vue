<template>
	<el-form ref="form" label-width="80px">
		<el-form-item :label="$t('user.language')">
			<el-select v-model="lang">
				<el-option :label="$t('common.chinese')" value="zh-cn"></el-option>
				<el-option :label="$t('common.traditionalChinese')" value="zh-tw"></el-option>
				<el-option :label="$t('common.english')" value="en"></el-option>
				<el-option :label="$t('common.japanese')" value="ja"></el-option>
			</el-select>
		</el-form-item>
		<el-divider></el-divider>
		<el-form-item :label="$t('user.nightmode')">
			<el-switch v-model="dark"></el-switch>
		</el-form-item>
		<el-form-item :label="$t('common.themeSelection')">
			<el-select v-model="currentThemeName" @change="onThemeChange" :placeholder="$t('setting.selectTheme')"
				style="width: 100%;">
				<el-option-group :label="$t('common.presetThemes')">
					<el-option v-for="(theme, index) in presetThemeList" :key="'preset-' + index"
						:label="theme.name + (theme.description ? ' - ' + theme.description : '')" :value="theme.name">
						<div style="display: flex; align-items: center; gap: 10px;">
							<div
								:style="{ width: '20px', height: '20px', borderRadius: '4px', background: theme.gradient }">
							</div>
							<span>{{ theme.name }}</span>
							<span v-if="theme.description" class="theme-desc">({{ theme.description }})</span>
						</div>
					</el-option>
				</el-option-group>
				<el-option-group :label="$t('common.customThemes')">
					<el-option v-for="(theme, index) in customThemeList" :key="'custom-' + index" :label="theme.name"
						:value="theme.name">
						<div style="display: flex; align-items: center; gap: 10px;">
							<div
								:style="{ width: '20px', height: '20px', borderRadius: '4px', background: theme.gradient }">
							</div>
							<span>{{ theme.name }}</span>
						</div>
					</el-option>
				</el-option-group>
			</el-select>
			<div style="margin-top: 10px;">
				<el-button type="primary" size="small" @click="showCreateThemeDialog">{{ $t('common.createTheme')
					}}</el-button>
				<el-button v-if="currentTheme && currentTheme.isCustom" type="danger" size="small"
					@click="deleteCurrentTheme">{{ $t('common.deleteTheme') }}</el-button>
			</div>
		</el-form-item>
		<el-divider></el-divider>
		<el-form-item :label="$t('common.frameLayout')">
			<el-select v-model="consoleLayout" :placeholder="$t('setting.selectPlaceholder')">
				<el-option :label="$t('setting.layoutDefault')" value="default"></el-option>
				<el-option :label="$t('setting.layoutHeader')" value="header"></el-option>
				<el-option :label="$t('setting.layoutMenu')" value="menu"></el-option>
				<el-option :label="$t('setting.layoutDock')" value="dock"></el-option>
			</el-select>
		</el-form-item>
		<el-form-item :label="$t('common.collapseMenu')">
			<el-switch v-model="menuIsCollapse"></el-switch>
		</el-form-item>
		<el-form-item :label="$t('common.tagsBar')">
			<el-switch v-model="layoutTags"></el-switch>
		</el-form-item>
		<el-divider></el-divider>
	</el-form>

	<!-- 创建自定义主题对话框 -->
	<el-dialog v-model="createThemeVisible" :title="$t('common.createTheme')" width="500px">
		<el-form :model="newTheme" label-width="100px">
			<el-form-item :label="$t('common.themeName')" required>
				<el-input v-model="newTheme.name" :placeholder="$t('setting.themeNamePlaceholder')"></el-input>
			</el-form-item>
			<el-form-item :label="$t('common.primaryColor')" required>
				<el-color-picker v-model="newTheme.primary" :predefine="colorList"></el-color-picker>
			</el-form-item>
			<el-form-item :label="$t('common.secondaryColor')">
				<el-color-picker v-model="newTheme.secondary" :predefine="colorList"></el-color-picker>
			</el-form-item>
			<el-form-item :label="$t('common.accentColor')">
				<el-color-picker v-model="newTheme.accent" :predefine="colorList"></el-color-picker>
			</el-form-item>
			<el-form-item :label="$t('common.surfaceColor')">
				<el-color-picker v-model="newTheme.surface" :predefine="colorList"></el-color-picker>
			</el-form-item>
			<el-form-item :label="$t('common.backgroundColor')">
				<el-color-picker v-model="newTheme.background" :predefine="colorList"></el-color-picker>
			</el-form-item>
			<el-form-item :label="$t('common.errorColor')">
				<el-color-picker v-model="newTheme.error" :predefine="colorList"></el-color-picker>
			</el-form-item>
			<el-form-item :label="$t('common.description')">
				<el-input v-model="newTheme.description" :placeholder="$t('common.optionalDescription')"></el-input>
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="createThemeVisible = false">{{ $t('common.cancel') }}</el-button>
			<el-button type="primary" @click="createTheme">{{ $t('common.create') }}</el-button>
		</template>
	</el-dialog>
</template>

<script>
import { useGlobalStore } from "@/stores/global";
import themeUtil from '@/utils/theme';

export default {
	setup() {
		const globalStore = useGlobalStore()
		return { globalStore }
	},
	data() {
		return {
			// 从 globalStore 取当前值，不再读碎片化 cache key
			lang: this.globalStore.locale,
			dark: this.globalStore.isDarkMode,
			currentTheme: {},
			currentThemeName: '',
			createThemeVisible: false,
			newTheme: this.getDefaultNewTheme(),
			consoleLayout: this.globalStore.consoleLayout,
			menuIsCollapse: this.globalStore.menuIsCollapse,
			layoutTags: this.globalStore.layoutTags,
			colorList: this.$CONFIG.PREDEFINE_COLORS,
			presetThemeList: this.$CONFIG.PREDEFINE_THEMES,
			customThemeList: themeUtil.getCustomThemes(),
		};
	},
	methods: {
		/**
		 * 切换主题
		 * @param {Object} theme - 要应用的主题
		 */
		selectTheme(theme) {
			this.currentTheme = theme
			this.currentThemeName = theme.name
			// 应用完整主题
			themeUtil.applyTheme(theme)
		},
		/**
		 * 切换主题事件
		 * @param {string} themeName - 要应用的主题名称
		 */
		onThemeChange(themeName) {
			// 先在预设主题中查找
			let theme = this.presetThemeList.find(t => t.name === themeName)
			// 再在自定义主题中查找
			if (!theme) {
				theme = this.customThemeList.find(t => t.name === themeName)
			}
			if (theme) {
				this.selectTheme(theme)
			}
		},
		getDefaultNewTheme() {
			return {
				name: '',
				primary: '#409eff',
				secondary: '#909399',
				accent: '#722ed1',
				surface: '#ffffff',
				background: '#f5f7fa',
				error: '#f56c6c',
				description: ''
			}
		},
		showCreateThemeDialog() {
			this.newTheme = this.getDefaultNewTheme()
			this.createThemeVisible = true
		},
		createTheme() {
			if (!this.newTheme.name) {
				this.$message.warning(this.$t('common.themeName'))
				return
			}
			if (!this.newTheme.primary) {
				this.$message.warning(this.$t('setting.enterPrimaryColor'))
				return
			}
			// 检查名称是否重复
			const allThemes = [...this.presetThemeList, ...this.customThemeList]
			if (allThemes.some(t => t.name === this.newTheme.name)) {
				this.$message.warning(this.$t('setting.themeNameExists'))
				return
			}
			// 创建并保存主题
			const theme = themeUtil.createCustomTheme(this.newTheme)
			const success = themeUtil.saveCustomTheme(theme)
			if (success) {
				this.customThemeList = themeUtil.getCustomThemes()
				this.selectTheme(theme)
				this.createThemeVisible = false
				this.$message.success(this.$t('setting.themeCreateSuccess'))
			} else {
				this.$message.error(this.$t('setting.createFailed'))
			}
		},
		deleteCurrentTheme() {
			if (!this.currentTheme || !this.currentTheme.isCustom) {
				this.$message.warning(this.$t('setting.onlyDeleteCustom'))
				return
			}
			this.$confirm(this.$t('setting.deleteThemeConfirm'), this.$t('common.info'), {
				confirmButtonText: this.$t('common.confirm'),
				cancelButtonText: this.$t('common.cancel'),
				type: 'warning'
			}).then(() => {
				const success = themeUtil.deleteCustomTheme(this.currentTheme.name)
				if (success) {
					this.customThemeList = themeUtil.getCustomThemes()
					// 切换到默认主题
					this.selectTheme(this.presetThemeList[0])
					this.$message.success(this.$t('setting.deleteSuccess'))
				} else {
					this.$message.error(this.$t('setting.deleteFailed'))
				}
			}).catch(() => { })
		},
		changeTheme() {
			this.selectTheme(this.currentTheme)
			// 已经通过 applyTheme → store.APPLY_theme 持久化，这里仅同步后端 save_cfg（如仍需要）
			this.$SCM.save_cfg([{ key: 'APP_THEME_NAME', value: this.currentTheme.name }]);
		},
		changeMode() {
			// setDarkMode 同时修改 HTML class + 存 store（store 负责持久化）
			themeUtil.setDarkMode(!this.dark);
			this.$SCM.save_cfg([{ key: 'APP_THEME_MODE', value: this.dark ? 'dark' : 'light' }]);
		}
	},
	mounted() {
		// 初始化主题
		var theme = themeUtil.getCurrentTheme();
		this.currentTheme = theme
		this.currentThemeName = theme.name
		
		// 刷新自定义主题列表
		this.customThemeList = themeUtil.getCustomThemes()
	},
	watch: {
		consoleLayout(val) {
			this.globalStore.SET_consoleLayout(val)
		},
		menuIsCollapse() {
			this.globalStore.TOGGLE_menuIsCollapse()
		},
		layoutTags() {
			this.globalStore.TOGGLE_layoutTags()
		},
		dark(val) {
			themeUtil.setDarkMode(val)
		},
		lang(val) {
			this.$i18n.locale = val
			// 交给 globalStore 统一持久化
			this.globalStore.SET_locale(val)
		}
	}
}
</script>

<style scoped>
.theme-desc {
	color: var(--color-secondary);
	font-size: 12px;
}
</style>
