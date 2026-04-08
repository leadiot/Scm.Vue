import { defineStore } from 'pinia'
import config from "@/config"

export const useGlobalStore = defineStore('global', {
	state: () => ({
		locale: config.LOCALE,
		ismobile: false,
		home: config.HOME,
		layout: config.LAYOUT,
		theme: config.THEME,
		menuIsCollapse: config.MENU_IS_COLLAPSE,
		layoutTags: config.LAYOUT_TAGS,
	}),
	actions: {
		SET_locale(value) {
			this.locale = value
		},
		SET_ismobile(value) {
			this.ismobile = value
		},
		SET_home(value) {
			this.home = value
		},
		SET_layout(value) {
			this.layout = value
		},
		SET_theme(value) {
			this.theme = value
		},
		TOGGLE_menuIsCollapse() {
			this.menuIsCollapse = !this.menuIsCollapse
		},
		TOGGLE_layoutTags() {
			this.layoutTags = !this.layoutTags
		}
	}
})
