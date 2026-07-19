import sysConfig from "@/config";
import tool from "@/utils/tool";
import { createI18n } from "vue-i18n";
import el_zh_cn from "element-plus/dist/locale/zh-cn.mjs";
import el_en from "element-plus/dist/locale/en.mjs";
import el_ja from "element-plus/dist/locale/ja.mjs";

import zh_cn from "./lang/zh-cn.js";
import en from "./lang/en.js";
import ja from "./lang/ja.js";

const messages = {
	"zh-cn": {
		el: el_zh_cn,
		...zh_cn,
	},
	zh: {
		el: el_zh_cn,
		...zh_cn,
	},
	en: {
		el: el_en,
		...en,
	},
	ja: {
		el: el_ja,
		...ja,
	},
};

const i18n = createI18n({
	legacy: false,
	globalInjection: true,
	locale: tool.data.get("APP_LANG") || sysConfig.LANG,
	fallbackLocale: "zh-cn",
	messages,
});

export default i18n;
