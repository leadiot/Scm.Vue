import sysConfig from "@/config";
import tool from "@/utils/tool";
import { createI18n } from "vue-i18n";
import el_zh_cn from "element-plus/dist/locale/zh-cn.mjs";
import el_zh_tw from "element-plus/dist/locale/zh-tw.mjs";
import el_en from "element-plus/dist/locale/en.mjs";
import el_ja from "element-plus/dist/locale/ja.mjs";

import zh_cn from "./lang/zh-cn.js";
import zh_tw from "./lang/zh-tw.js";
import en from "./lang/en.js";
import ja from "./lang/ja.js";
import { useGlobalStore } from "@/stores/global";

const messages = {
	"zh-cn": { el: el_zh_cn, ...zh_cn },
	zh:      { el: el_zh_cn, ...zh_cn },
	"zh-tw": { el: el_zh_tw, ...zh_tw },
	en:      { el: el_en,   ...en },
	ja:      { el: el_ja,   ...ja },
};

/**
 * 读取当前语言：从统一持久化 APP_SETTINGS.locale（localStorage）读取
 * 注意：本模块在 main.js 顶部 import 时即加载，此时 app.use(pinia) 尚未执行，
 * 因此不能在此处调用 useGlobalStore()，只能直接读 localStorage。
 * 后续 syncI18nWithGlobalStore()（在 Pinia 就绪后由 App.vue 调用）会把
 * globalStore 的变更同步回 i18n。
 */
function resolveInitialLocale() {
	try {
		const raw = tool.local.get("APP_SETTINGS");
		const settings = raw ? (typeof raw === "string" ? JSON.parse(raw) : raw) : null;
		if (settings && typeof settings.locale === "string" && settings.locale) {
			return settings.locale;
		}
	} catch (e) { void e; }
	return sysConfig.LANG;
}

const i18n = createI18n({
	legacy: false,
	globalInjection: true,
	locale: resolveInitialLocale(),
	fallbackLocale: "zh-cn",
	messages,
});

/**
 * 将 globalStore 的 locale/themeMode/主题 变更同步到 i18n + DOM。
 * 由 App.vue 在 setup（Pinia 已创建后）调用一次即可。
 */
import { watchEffect } from "vue";
export function syncI18nWithGlobalStore() {
	const store = useGlobalStore();
	watchEffect(() => {
		const loc = store.locale;
		if (loc && i18n.mode === "legacy") {
			i18n.global.locale = loc;
		} else if (loc) {
			i18n.global.locale.value = loc;
		}
	});
	return store;
}

export default i18n;
