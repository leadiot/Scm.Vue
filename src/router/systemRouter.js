import config from "@/config";

//系统路由
const routes = [
	{
		id: '1000',
		name: "layout",
		path: "/",
		component: () => import("@/layout"),
		// redirect: config.LOGIN_URL || "/console",
		redirect: config.CONSOLE_URL || "/console",
		children: [],
	},
	{
		id: '1001',
		path: "/login",
		component: () => import("@/views/login"),
		meta: { title: "登录" },
	},
	{
		id: '1002',
		path: "/about",
		component: () => import("@/views/about"),
		meta: { title: "关于" },
	},
	{
		id: '1003',
		path: "/oauth",
		component: () => import("@/views/oauth"),
		meta: { title: "联合登录" },
	},
	{
		id: '1004',
		path: "/user_register",
		component: () => import("@/views/login/userRegister"),
		meta: { title: "用户注册" },
	},
	{
		id: '1005',
		path: "/reset_password",
		component: () => import("@/views/login/resetPassword"),
		meta: { title: "重置密码" },
	},
	{
		id: '1006',
		path: "/console1",
		component: () => import("@/views/home/index"),
		meta: { title: "控制台" },
	},
	{
		id: '1007',
		path: "/desktop",
		component: () => import("@/views/home/desktop"),
		meta: { title: "云桌面" },
	},
	{
		id: '1008',
		path: "/display",
		component: () => import("@/views/home/display"),
		meta: { title: "大屏幕" },
	},
	{
		id: '1009',
		path: "/scm/sys/workflow/design",
		component: () => import("@/views/scm/sys/flowinfo/design"),
		meta: { title: "流程设计" },
	},
];

export default routes;
