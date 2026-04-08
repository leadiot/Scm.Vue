import config from "@/config";

const routes = [
	// {
	// 	id: '1000',
	// 	name: "layout",
	// 	path: "/",
	// 	component: () => import("@/layout"),
	// 	redirect: config.CONSOLE_URL || "/console",
	// 	children: [],
	// },
	{
		id: '1001',
		path: "/login",
		component: () => import("@/views/login"),
		meta: { title: "登录", layout: "none" },
	},
	{
		id: '1002',
		path: "/about",
		component: () => import("@/views/about"),
		meta: { title: "关于", layout: "none" },
	},
	{
		id: '1003',
		path: "/oauth",
		component: () => import("@/views/oauth"),
		meta: { title: "联合登录", layout: "none" },
	},
	{
		id: '1004',
		path: "/user_register",
		component: () => import("@/views/login/userRegister"),
		meta: { title: "用户注册", layout: "none" },
	},
	{
		id: '1005',
		path: "/reset_password",
		component: () => import("@/views/login/resetPassword"),
		meta: { title: "重置密码", layout: "none" },
	},
	{
		id: '1009',
		path: "/scm/sys/workflow/design",
		component: () => import("@/views/scm/sys/flowinfo/design"),
		meta: { title: "流程设计", layout: "none" },
	},
];

export default routes;
