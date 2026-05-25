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
				<el-option v-for="(theme, index) in themeList" :key="index"
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
			</el-select>
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
			themeList: this.$CONFIG.PREDEFINE_THEMES,
			colorPrimary: this.$TOOL.data.get('APP_COLOR') || this.$CONFIG.COLOR || '#409EFF',
			colorSecondary: this.$TOOL.data.get('APP_COLOR_SECONDARY') || '#909399',
			currentTheme: themeUtil.getCurrentTheme(),
			currentThemeName: themeUtil.getCurrentTheme().name
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
			const theme = this.themeList.find(t => t.name === themeName)
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
		}
	},
	mounted() {
		// 初始化主题
		themeUtil.initTheme()
		this.currentTheme = themeUtil.getCurrentTheme()
		// 调试：确保主题列表已加载
		if (!this.themeList || this.themeList.length === 0) {
			console.warn('主题列表为空，使用备用主题')
			this.themeList = themeUtil.PRESET_THEMES
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
