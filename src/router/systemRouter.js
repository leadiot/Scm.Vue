import config from "@/config";

const routes = [
	{
		id: '1000',
		name: "layout",
		path: "/",
		//component: () => import("@/layout/console"),
		redirect: config.CONSOLE_URL || "/console",
		children: [],
	},
	{
		id: '1001',
		name: 'login',
		path: "/login",
		component: () => import("@/views/login"),
		meta: { title: "登录", layout: 0 },
	},
	{
		id: '1002',
		name: 'about',
		path: "/about",
		component: () => import("@/views/about"),
		meta: { title: "关于", layout: 0 },
	},
	{
		id: '1003',
		name: 'oauth',
		path: "/oauth",
		component: () => import("@/views/oauth"),
		meta: { title: "联合登录", layout: 0 },
	},
	{
		id: '1004',
		name: 'user_register',
		path: "/user_register",
		component: () => import("@/views/login/userRegister"),
		meta: { title: "用户注册", layout: 0 },
	},
	{
		id: '1005',
		name: 'reset_password',
		path: "/reset_password",
		component: () => import("@/views/login/resetPassword"),
		meta: { title: "重置密码", layout: 0 },
	},
	// {
	// 	id: '1006',
	// 	name: 'console',
	// 	path: "/console",
	// 	component: () => import("@/views/home/console"),
	// 	meta: { title: "控制台", layout: 1 },
	// 	children: [],
	// },
	{
		id: '1007',
		name: 'desktop',
		path: "/desktop",
		component: () => import("@/views/home/desktop"),
		meta: { title: "云桌面", layout: 2 },
	},
	{
		id: '1008',
		name: 'monitor',
		path: "/monitor",
		component: () => import("@/views/home/monitor"),
		meta: { title: "大屏幕", layout: 3 },
	},
	// {
	// 	id: '1009',
	// 	name: 'workflow_design',
	// 	path: "/scm/sys/workflow/design",
	// 	component: () => import("@/views/scm/sys/flowinfo/design"),
	// 	meta: { title: "流程设计", layout: 0 },
	// },
];

export default routes;
