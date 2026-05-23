<template>
	<el-form ref="form" label-width="120px" label-position="left" style="padding:0 20px;">
		<el-alert title="以下配置可实时预览，开发者可在 config/index.js 中配置默认值，非常不建议在生产环境下开放布局设置" type="error"
			:closable="false"></el-alert>
		<el-divider></el-divider>
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
			<div style="display: flex; flex-direction: column; gap: 8px;">
				<div style="display: flex; flex-wrap: wrap; gap: 10px;">
					<el-tooltip 
						v-for="(theme, index) in themeList" 
						:key="index"
						:content="theme.name"
						placement="top"
					>
						<div 
							@click="selectTheme(theme)"
							:style="{ 
								width: '36px', 
								height: '36px', 
								borderRadius: '6px', 
								background: theme.gradient, 
								cursor: 'pointer',
								border: colorPrimary === theme.color ? '2px solid #fff' : '2px solid transparent',
								boxShadow: colorPrimary === theme.color ? '0 0 0 2px var(--el-color-primary)' : '0 2px 6px rgba(0,0,0,0.15)',
								transition: 'all 0.2s ease'
							}"
						></div>
					</el-tooltip>
				</div>
				<div style="font-size: 12px; color: #909399; margin-top: 4px;">
					当前主题：<span style="font-weight: 600;">{{ currentThemeName }}</span>
				</div>
			</div>
		</el-form-item>
		<el-form-item label="自定义颜色">
			<el-color-picker v-model="colorPrimary" :predefine="colorList"></el-color-picker>
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
import colorTool from '@/utils/color'
import { useGlobalStore } from "@/stores/global";

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
			colorPrimary: this.$TOOL.data.get('APP_COLOR') || this.$CONFIG.COLOR || '#409EFF'
		}
	},
	methods: {
		selectTheme(theme) {
			this.colorPrimary = theme.color
		},
		applyColor(val) {
			document.documentElement.style.setProperty('--el-color-primary', val);
			for (let i = 1; i <= 9; i++) {
				document.documentElement.style.setProperty(`--el-color-primary-light-${i}`, colorTool.lighten(val, i / 10));
			}
			for (let i = 1; i <= 9; i++) {
				document.documentElement.style.setProperty(`--el-color-primary-dark-${i}`, colorTool.darken(val, i / 10));
			}
			this.$TOOL.data.set("APP_COLOR", val);
		}
	},
	mounted() {
		this.applyColor(this.colorPrimary)
		// 调试：确保主题列表已加载
		if (!this.themeList || this.themeList.length === 0) {
			console.warn('主题列表为空，使用备用主题')
			this.themeList = [
				{ name: '经典蓝', color: '#409eff', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
				{ name: '中国红', color: '#c41e3a', gradient: 'linear-gradient(135deg, #c41e3a 0%, #8b0000 100%)' },
				{ name: '翡翠绿', color: '#52c41a', gradient: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)' },
			]
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
			if (val) {
				document.documentElement.classList.add("dark")
				this.$TOOL.data.set("APP_THEME", "dark")
			} else {
				document.documentElement.classList.remove("dark")
				this.$TOOL.data.remove("APP_THEME")
			}
		},
		lang(val) {
			this.$i18n.locale = val
			this.$TOOL.data.set("APP_LANG", val);
		},
		colorPrimary(val) {
			this.applyColor(val);
		}
	}
}
</script>
