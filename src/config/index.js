const DEFAULT_CONFIG = {
	// 应用代码
	APP_CODE: import.meta.env.VITE_APP_CODE,

	// 应用名称
	APP_NAME: import.meta.env.VITE_APP_NAME,

	// 简介（支持HTML）
	APP_DESC: import.meta.env.VITE_APP_DESC,

	// 版本号
	APP_VER: import.meta.env.VITE_APP_VER,

	// 内核版本号
	CORE_VER: import.meta.env.VITE_APP_VER,

	// 构建日期
	APP_BUILD: import.meta.env.VITE_APP_BUILD,

	// 应用Key
	APP_KEY: "870cb6cfa286ac4cac462bc8e33b1bb5",

	// 参数加密签名Key
	SIGN_KEY: "ab517f95fab7d57",

	// 登录地址
	LOGIN_URL: "/login",

	// 工作台地址
	CONSOLE_URL: "/console",

	// 云桌面地址
	DESKTOP_URL: "/desktop",

	// 大屏幕地址
	MONITOR_URL: "/monitor",

	// 服务器地址
	SERVER_URL: import.meta.env.VITE_API_BASE,

	// 接口地址
	API_URL: import.meta.env.VITE_API_BASE + "/api",

	// SignalR地址
	SignalR_URL: import.meta.env.VITE_API_BASE + "/scmhub",

	// 请求超时
	TIMEOUT: 10000,

	// TokenName
	TOKEN_NAME: "ApiToken",

	// Token前缀，注意最后有个空格，如不需要需设置空字符串
	TOKEN_PREFIX: "",

	// 追加其他头
	HEADERS: {},

	// 请求是否开启缓存
	REQUEST_CACHE: false,

	// 布局类型：none | console | desktop | monitor
	LAYOUT: "console",

	// Console布局风格：默认：default | 通栏：header | 经典：menu | 功能坞：dock
	CONSOLE_LAYOUT: "default",

	// 菜单是否折叠
	MENU_IS_COLLAPSE: false,

	// 菜单是否启用手风琴效果
	MENU_UNIQUE_OPENED: false,

	// 是否开启多标签
	LAYOUT_TAGS: true,

	// 语言
	LANG: "zh-cn",

	// 主题颜色
	COLOR: "",

	// 首面
	HOME: "/console",

	//控制台首页默认布局
	DEFAULT_GRID: {
		//默认分栏数量和宽度 例如 [24] [18,6] [8,8,8] [6,12,6]
		layout: [12, 6, 6],
		//小组件分布，com取值:views/home/components 文件名
		copmsList: [["welcome", "ver"], ["time", "progress"], ["about"]],
	},

	// 默认登录类型，不能修改
	DEF_LOGIN_TYPE: 2,
	// 默认登录模式，可以修改，支持10，20，30，40四种方式
	DEF_LOGIN_MODE: [10, 40],
	// 默认登录单位，不能修改，否则生产环境无法登录
	DEF_LOGIN_UNIT: "dev",
	// 默认登录用户，便于开发时减少输入，可以修改或置空
	DEF_LOGIN_USER: "",
	// 默认登录口令，便于开发时减少输入，可以修改或置空
	DEF_LOGIN_PASS: "",

	// OIDC KEY，可以修改为您的应用KEY
	OIDC_KEY: import.meta.env.VITE_APP_OIDC_KEY,
	// OIDC 服务列表，不能修改，否则三方登录可能无法使用
	OIDC_OSP: import.meta.env.VITE_APP_OIDC_OSP,
	// OIDC 应用图标，不能修改，否则服务图标显示异常
	OIDC_LOGO: import.meta.env.VITE_APP_OIDC_LOGO,
	// OIDC 授权路径，不能修改，否则外部授权页面无法打开
	OIDC_AUTH: import.meta.env.VITE_APP_OIDC_AUTH,
	// OIDC 绑定路径，不能修改，否则外部授权页面无法打开
	OIDC_BIND: import.meta.env.VITE_APP_OIDC_BIND,
	// OIDC 登录路径，不能修改，否则外部登录页面无法打开
	OIDC_LOGIN: import.meta.env.VITE_APP_OIDC_LOGIN,
	// OIDC 重定向URI，不能修改，否则授权回调页面无法打开
	OIDC_REDIRECT_URI: import.meta.env.VITE_APP_OIDC_REDIRECT_URI,

	// 是否开启用户注册
	USER_REGISTER_ENABLED: false,

	// 系统预定义主题（参考 Android Material Design Theme）
	// 每个主题包含完整的颜色方案：
	// - primary: 主色调
	// - secondary: 辅色调
	// - accent: 强调色
	// - surface: 表面色（卡片、浮层背景）
	// - background: 背景色（页面背景）
	// - error: 错误色
	// - onPrimary: 主色调上的文字色
	// - onSecondary: 辅色调上的文字色
	// - isCustom: 是否为用户自定义主题
	PREDEFINE_THEMES: [
		{ name: "经典蓝", primary: "#409eff", secondary: "#909399", accent: "#722ed1", surface: "#ffffff", background: "#f5f7fa", error: "#f56c6c", onPrimary: "#ffffff", onSecondary: "#ffffff", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", description: "Element Plus 默认主题", isCustom: false },
		{ name: "中国蓝", primary: "#0066cc", secondary: "#6b7280", accent: "#1e40af", surface: "#ffffff", background: "#f0f5ff", error: "#dc2626", onPrimary: "#ffffff", onSecondary: "#ffffff", gradient: "linear-gradient(135deg, #0066cc 0%, #0047ab 100%)", description: "沉稳商务风格", isCustom: false },
		{ name: "科技蓝", primary: "#00bfff", secondary: "#94a3b8", accent: "#0ea5e9", surface: "#ffffff", background: "#f0f9ff", error: "#ef4444", onPrimary: "#ffffff", onSecondary: "#ffffff", gradient: "linear-gradient(135deg, #00bfff 0%, #1e90ff 100%)", description: "科技感风格", isCustom: false },
		{ name: "中国红", primary: "#c41e3a", secondary: "#6b7280", accent: "#b91c1c", surface: "#ffffff", background: "#fef2f2", error: "#991b1b", onPrimary: "#ffffff", onSecondary: "#ffffff", gradient: "linear-gradient(135deg, #c41e3a 0%, #8b0000 100%)", description: "中国传统红", isCustom: false },
		{ name: "中国紫", primary: "#722ed1", secondary: "#64748b", accent: "#9333ea", surface: "#ffffff", background: "#f5f3ff", error: "#dc2626", onPrimary: "#ffffff", onSecondary: "#ffffff", gradient: "linear-gradient(135deg, #722ed1 0%, #531dab 100%)", description: "优雅紫色调", isCustom: false },
		{ name: "翡翠绿", primary: "#52c41a", secondary: "#6b7280", accent: "#059669", surface: "#ffffff", background: "#f0fdf4", error: "#dc2626", onPrimary: "#ffffff", onSecondary: "#ffffff", gradient: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)", description: "自然清新风格", isCustom: false },
		{ name: "日落橙", primary: "#fa8c16", secondary: "#78716c", accent: "#ea580c", surface: "#ffffff", background: "#fff7ed", error: "#c2410c", onPrimary: "#ffffff", onSecondary: "#ffffff", gradient: "linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)", description: "温暖活力风格", isCustom: false },
		{ name: "樱花粉", primary: "#eb2f96", secondary: "#a1a1aa", accent: "#db2777", surface: "#ffffff", background: "#fdf2f8", error: "#be185d", onPrimary: "#ffffff", onSecondary: "#ffffff", gradient: "linear-gradient(135deg, #eb2f96 0%, #c41d7f 100%)", description: "柔和粉色系", isCustom: false },
		{ name: "深空灰", primary: "#595959", secondary: "#71717a", accent: "#3f3f46", surface: "#ffffff", background: "#f9fafb", error: "#dc2626", onPrimary: "#ffffff", onSecondary: "#ffffff", gradient: "linear-gradient(135deg, #595959 0%, #434343 100%)", description: "专业灰色系", isCustom: false },
		{ name: "暗夜黑", primary: "#1f1f1f", secondary: "#52525b", accent: "#18181b", surface: "#ffffff", background: "#f6f8f9", error: "#ef4444", onPrimary: "#ffffff", onSecondary: "#ffffff", gradient: "linear-gradient(135deg, #1f1f1f 0%, #141414 100%)", description: "极简黑色系", isCustom: false },
	],

	// 系统预定义颜色列表，可以根据需要修改
	PREDEFINE_COLORS: [
		"#409eff",
		"#0066cc",
		"#00bfff",
		"#c41e3a",
		"#722ed1",
		"#52c41a",
		"#fa8c16",
		"#eb2f96",
		"#595959",
		"#1f1f1f",
		"#ffffff",
		"#cccccc",
		"#999999",
		"#666666",
		"#333333",
		"#000000",
		"#ff0000",
		"#ff4500",
		"#ff8c00",
		"#ffd700",
		"#00ff00",
		"#90ee90",
		"#67c23a",
		"#00ced1",
		"#009688",
		"#1e90ff",
		"#536dfe",
		"#0000ff",
		"#c71585",
	],

	// 商务部备案信息，可以使用HTML标签，例如：<a href="https://www.miitbeian.gov.cn/">粤ICP备2023030233号</a>
	BEIAN_MIIT: "",
	// 公安部备案信息，可以使用HTML标签，例如：<a href="https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=粤ICP备2023030233号">粤ICP备2023030233号</a>
	BEIAN_MPS: "",
};

Object.assign(DEFAULT_CONFIG, APP_CONFIG || {});

export default DEFAULT_CONFIG;
