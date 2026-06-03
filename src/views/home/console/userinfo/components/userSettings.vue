<template>
	<el-card shadow="never" header="语言主题">
		<el-form ref="form" label-width="120px" style="margin-top:20px;">
			<el-form-item :label="$t('user.nightmode')">
				<el-switch v-model="dark" inline-prompt active-icon="el-icon-moon"
					inactive-icon="el-icon-sunny"></el-switch>
				<div class="el-form-item-msg">{{ $t('user.nightmode_msg') }}</div>
			</el-form-item>
			<el-form-item :label="$t('user.language')">
				<el-select v-model="lang">
					<el-option label="简体中文" value="zh-cn"></el-option>
					<el-option label="English" value="en"></el-option>
				</el-select>
				<div class="el-form-item-msg">{{ $t('user.language_msg') }}</div>
			</el-form-item>
			<el-divider></el-divider>
		
		<el-form-item label="主题选择">
			<el-select v-model="colorPrimary" placeholder="请选择主题">
				<el-option 
					v-for="(theme, index) in themeList" 
					:key="index"
					:label="theme.name"
					:value="theme.primary"
				>
					<span style="display: inline-flex; align-items: center; gap: 8px;">
						<span 
							:style="{ 
								width: '20px', 
								height: '20px', 
								borderRadius: '4px', 
								background: theme.gradient 
							}"
						></span>
						{{ theme.name }}
						<span v-if="theme.description" class="theme-desc">{{ theme.description }}</span>
					</span>
				</el-option>
			</el-select>
		</el-form-item>
		
		<el-form-item label="自定义颜色">
			<el-color-picker v-model="colorPrimary" :predefine="colorList"></el-color-picker>
		</el-form-item>
			<el-divider></el-divider>
			<el-form-item label="首页布局">
				<el-select v-model="home" placeholder="请选择" @change="handleChangeHome">
					<el-option label="自定义" value="/"></el-option>
					<el-option label="工作台" value="/console"></el-option>
					<el-option label="云桌面" value="/desktop"></el-option>
					<el-option label="大屏幕" value="/monitor"></el-option>
				</el-select>
			</el-form-item>
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
	</el-card>
</template>

<script>
import themeUtil from '@/utils/theme'
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
			home: this.$CONFIG.HOME,
			colorList: this.$CONFIG.PREDEFINE_COLORS,
			themeList: this.$CONFIG.PREDEFINE_THEMES || themeUtil.PRESET_THEMES,
			colorPrimary: this.$TOOL.data.get('APP_COLOR') || this.$CONFIG.COLOR || '#409EFF'
		}
	},
	mounted() {
		this.init();
		// themeUtil.initTheme();
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
			themeUtil.setDarkMode(val);
		},
		lang(val) {
			this.$i18n.locale = val
			this.$TOOL.data.set("APP_LANG", val);
		},
		colorPrimary(val) {
			themeUtil.setPrimaryColor(val);
		}
	},
	methods: {
		async init() {
			this.home = await this.$SCM.read_cfg("app_home", this.$CONFIG.HOME);
		},
		async handleChangeHome() {
			var cfgs = [{ key: "app_home", value: this.home }];
			await this.$SCM.save_cfg(cfgs);
		}
	},
}
</script>

<style scoped>
.theme-desc {
	color: var(--color-secondary);
	font-size: 12px;
}
</style>