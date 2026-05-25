<template>
	<el-form ref="form" label-width="80px">
		<el-form-item :label="$t('user.nightmode')">
			<el-switch v-model="dark"></el-switch>
		</el-form-item>
		<el-form-item :label="$t('user.language')">
			<el-select v-model="lang">
				<el-option label="简体中文" value="zh-cn"></el-option>
				<el-option label="English" value="en"></el-option>
			</el-select>
		</el-form-item>
		<el-divider></el-divider>
		<el-form-item label="主题选择">
			<el-select v-model="currentThemeName" @change="onThemeChange" placeholder="请选择主题" style="width: 100%;">
				<el-option-group label="预设主题">
					<el-option v-for="(theme, index) in presetThemeList" :key="'preset-' + index"
						:label="theme.name + (theme.description ? ' - ' + theme.description : '')" :value="theme.name">
						<div style="display: flex; align-items: center; gap: 10px;">
							<div
								:style="{ width: '20px', height: '20px', borderRadius: '4px', background: theme.gradient }">
							</div>
							<span>{{ theme.name }}</span>
							<span v-if="theme.description" style="color: #909399; font-size: 12px;">({{ theme.description
							}})</span>
						</div>
					</el-option>
				</el-option-group>
				<el-option-group label="自定义主题">
					<el-option v-for="(theme, index) in customThemeList" :key="'custom-' + index"
						:label="theme.name" :value="theme.name">
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
				<el-button type="primary" size="small" @click="showCreateThemeDialog">创建自定义主题</el-button>
				<el-button v-if="currentTheme && currentTheme.isCustom" type="danger" size="small"
					@click="deleteCurrentTheme">删除当前主题</el-button>
			</div>
		</el-form-item>
		<el-form-item label="主色调">
			<el-color-picker v-model="colorPrimary" :predefine="colorList"></el-color-picker>
		</el-form-item>
		<el-form-item label="辅色调">
			<el-color-picker v-model="colorSecondary" :predefine="colorList"></el-color-picker>
		</el-form-item>
		<el-divider></el-divider>
		<el-form-item label="框架布局">
			<el-select v-model="consoleLayout" placeholder="请选择">
				<el-option label="默认" value="default"></el-option>
				<el-option label="通栏" value="header"></el-option>
				<el-option label="经典" value="menu"></el-option>
				<el-option label="功能坞" value="dock"></el-option>
			</el-select>
		</el-form-item>
		<el-form-item label="折叠菜单">
			<el-switch v-model="menuIsCollapse"></el-switch>
		</el-form-item>
		<el-form-item label="标签栏">
			<el-switch v-model="layoutTags"></el-switch>
		</el-form-item>
		<el-divider></el-divider>
	</el-form>

	<!-- 创建自定义主题对话框 -->
	<el-dialog v-model="createThemeVisible" title="创建自定义主题" width="500px">
		<el-form :model="newTheme" label-width="100px">
			<el-form-item label="主题名称" required>
				<el-input v-model="newTheme.name" placeholder="请输入主题名称"></el-input>
			</el-form-item>
			<el-form-item label="主色调" required>
				<el-color-picker v-model="newTheme.primary" :predefine="colorList"></el-color-picker>
			</el-form-item>
			<el-form-item label="辅色调">
				<el-color-picker v-model="newTheme.secondary" :predefine="colorList"></el-color-picker>
			</el-form-item>
			<el-form-item label="强调色">
				<el-color-picker v-model="newTheme.accent" :predefine="colorList"></el-color-picker>
			</el-form-item>
			<el-form-item label="表面色">
				<el-color-picker v-model="newTheme.surface" :predefine="colorList"></el-color-picker>
			</el-form-item>
			<el-form-item label="背景色">
				<el-color-picker v-model="newTheme.background" :predefine="colorList"></el-color-picker>
			</el-form-item>
			<el-form-item label="错误色">
				<el-color-picker v-model="newTheme.error" :predefine="colorList"></el-color-picker>
			</el-form-item>
			<el-form-item label="描述">
				<el-input v-model="newTheme.description" placeholder="可选描述"></el-input>
			</el-form-item>
		</el-form>
		<template #footer>
			<el-button @click="createThemeVisible = false">取消</el-button>
			<el-button type="primary" @click="createTheme">创建</el-button>
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
			consoleLayout: this.globalStore.consoleLayout,
			menuIsCollapse: this.globalStore.menuIsCollapse,
			layoutTags: this.globalStore.layoutTags,
			lang: this.$TOOL.data.get('APP_LANG') || this.$CONFIG.LANG,
			dark: this.$TOOL.data.get('APP_THEME') == 'dark',
			colorList: this.$CONFIG.PREDEFINE_COLORS,
			presetThemeList: this.$CONFIG.PREDEFINE_THEMES,
			customThemeList: themeUtil.getCustomThemes(),
			colorPrimary: this.$TOOL.data.get('APP_COLOR') || this.$CONFIG.COLOR || '#409EFF',
			colorSecondary: this.$TOOL.data.get('APP_COLOR_SECONDARY') || '#909399',
			currentTheme: themeUtil.getCurrentTheme(),
			currentThemeName: themeUtil.getCurrentTheme().name,
			createThemeVisible: false,
			newTheme: this.getDefaultNewTheme()
		};
	},
	methods: {
		selectTheme(theme) {
			this.currentTheme = theme
			this.currentThemeName = theme.name
			this.colorPrimary = theme.primary
			this.colorSecondary = theme.secondary || '#909399'
			// 应用完整主题
			themeUtil.applyTheme(theme)
		},
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
		applyPrimaryColor(val) {
			themeUtil.setPrimaryColor(val)
			this.currentTheme = themeUtil.getCurrentTheme()
		},
		applySecondaryColor(val) {
			themeUtil.setSecondaryColor(val)
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
				this.$message.warning('请输入主题名称')
				return
			}
			if (!this.newTheme.primary) {
				this.$message.warning('请选择主色调')
				return
			}
			// 检查名称是否重复
			const allThemes = [...this.presetThemeList, ...this.customThemeList]
			if (allThemes.some(t => t.name === this.newTheme.name)) {
				this.$message.warning('主题名称已存在')
				return
			}
			// 创建并保存主题
			const theme = themeUtil.createCustomTheme(this.newTheme)
			const success = themeUtil.saveCustomTheme(theme)
			if (success) {
				this.customThemeList = themeUtil.getCustomThemes()
				this.selectTheme(theme)
				this.createThemeVisible = false
				this.$message.success('自定义主题创建成功')
			} else {
				this.$message.error('创建失败')
			}
		},
		deleteCurrentTheme() {
			if (!this.currentTheme || !this.currentTheme.isCustom) {
				this.$message.warning('只能删除自定义主题')
				return
			}
			this.$confirm('确定要删除当前自定义主题吗？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				const success = themeUtil.deleteCustomTheme(this.currentTheme.name)
				if (success) {
					this.customThemeList = themeUtil.getCustomThemes()
					// 切换到默认主题
					this.selectTheme(this.presetThemeList[0])
					this.$message.success('主题删除成功')
				} else {
					this.$message.error('删除失败')
				}
			}).catch(() => { })
		}
	},
	mounted() {
		// 初始化主题
		themeUtil.initTheme()
		this.currentTheme = themeUtil.getCurrentTheme()
		// 刷新自定义主题列表
		this.customThemeList = themeUtil.getCustomThemes()
		// 调试：确保主题列表已加载
		if (!this.presetThemeList || this.presetThemeList.length === 0) {
			console.warn('主题列表为空，使用备用主题')
			this.presetThemeList = themeUtil.PRESET_THEMES
		}
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
			this.$TOOL.data.set("APP_LANG", val);
		},
		colorPrimary(val) {
			this.applyPrimaryColor(val);
		},
		colorSecondary(val) {
			this.applySecondaryColor(val);
		}
	}
}
</script>
