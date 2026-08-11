import { createRouter, createWebHashHistory } from "vue-router";
import { ElNotification } from "element-plus";
import config from "@/config";
import NProgress from "@/utils/nprogress";
import tool from "@/utils/tool";
import logger from "@/utils/logger";
import systemRouter from "./systemRouter";
import userRoutes from "@/config/route";
import { beforeEach, afterEach } from "./scrollBehavior";
import http from "@/utils/request";

// 视图组件懒加载映射（编译期生成，模块顶层只初始化一次）
const viewModules = import.meta.glob('@/views/**/*.vue');

//系统路由
const routes = systemRouter;

//系统特殊路由
const routes_404 = {
	id: '404',
	path: "/:pathMatch(.*)*",
	hidden: true,
	component: () => import("@/layout/other/404"),
	meta: { layout: 0 },
};
let routes_404_r = () => { };

const router = createRouter({
	history: createWebHashHistory(),
	routes: routes,
});

//设置标题
document.title = config.APP_NAME;

//判断是否已加载过动态/静态路由
let isGetRouter = false;

//根据角色过滤静态路由菜单（beforeEach 与 getMenu 共用）
function getFilteredUserMenu() {
	const userInfo = tool.session.get("USER_INFO");
	return treeFilter(userRoutes, (node) => {
		return node.meta.role
			? node.meta.role.filter((item) => userInfo.role.indexOf(item) > -1).length > 0
			: true;
	});
}

router.beforeEach(async (to, from) => {
	NProgress.start();
	//动态标题
	document.title = to.meta.title
		? `${to.meta.title} - ${config.APP_NAME}`
		: `${config.APP_NAME}`;

	//登录页直接放行
	if (to.path === "/login") {
		//删除路由(替换当前login路由)
		const loginRoute = routes.find(r => r.path === '/login');
		if (loginRoute) {
			router.addRoute(loginRoute);
		}
		//删除路由(404)
		routes_404_r();
		isGetRouter = false;
		return;
	}

	if (routes.findIndex((r) => r.path === to.path) >= 0) {
		return;
	}

	//检查token
	const token = tool.session.get("TOKEN");
	if (!token) {
		return { path: "/login" };
	}

	//加载动态/静态路由
	if (!isGetRouter) {
		const apiMenu = tool.session.get("MENU") || [];
		const userMenu = getFilteredUserMenu();
		const menu = [...userMenu, ...apiMenu];
		let menuRouter = filterAsyncRouter(menu);
		menuRouter = flatAsyncRoutes(menuRouter);
		menuRouter.forEach((item) => {
			router.addRoute(item);
		});
		routes_404_r = router.addRoute(routes_404);
		if (to.matched.length == 0) {
			//动态路由刚注册完成，返回路径触发重新匹配，避免在守卫内主动push
			return to.fullPath;
		}
		isGetRouter = true;
	}
	beforeEach(to, from);
});

router.afterEach((to, from) => {
	afterEach(to, from);
	NProgress.done();
	recordPv(to);
});

router.onError((error) => {
	NProgress.done();
	logger.codeError(error);
	ElNotification.error({
		title: "路由错误",
		message: error.message,
	});
});

router.getMenu = (layout) => {
	if (layout == null) {
		layout = 1;
	}
	const userMenu = getFilteredUserMenu();
	const menu = [...userMenu];

	const apiMenu = tool.session.get("MENU") || [];
	apiMenu.forEach(element => {
		if (element.meta.layout == layout) {
			menu.push(element);
		}
	});
	return menu;
};

async function recordPv(to) {
	const url = to.path;
	if (url == '/login' || url == '/oauth' || url == '/user_register' || url == '/reset_password') {
		return;
	}

	// 记录访问信息，失败走统一日志通道
	try {
		await http.post(`${config.API_URL}/scmsyspv`, { url: url });
	} catch (error) {
		logger.httpError(error);
	}
}

//转换
function filterAsyncRouter(routerMap) {
	const accessedRouters = [];
	routerMap.forEach((item) => {
		const meta = { ...(item.meta || {}) };
		let path = item.path;
		//处理外部链接特殊路由
		if (meta.type == "iframe" || meta.type == "link") {
			meta.url = path;
			path = `/i/${item.id}`;
		}
		//MAP转路由对象
		const route = {
			id: item.id,
			path: path,
			name: item.id,// 此处路由需要使用id作为name，否则会导致路由跳转失败
			meta: meta,
			redirect: item.redirect,
			children: item.children ? filterAsyncRouter(item.children) : null,
			component: loadComponent(item.component),
		};
		accessedRouters.push(route);
	});
	return accessedRouters;
}

function loadComponent(component) {
	if (component) {
		const paths = [
			`@/views/${component}.vue`,
			`@/views/${component}/index.vue`
		];
		for (const path of paths) {
			if (viewModules[path]) {
				return viewModules[path];
			}
		}
		const moduleKeys = Object.keys(viewModules);
		for (const key of moduleKeys) {
			if (key.includes(`/${component}.vue`) || key.includes(`/${component}/index.vue`)) {
				return viewModules[key];
			}
		}
	}

	return () => import("@/layout/other/empty");
}

//路由扁平化
function flatAsyncRoutes(routes, breadcrumb = []) {
	let res = [];
	routes.forEach((route) => {
		const tmp = { ...route };
		if (tmp.children) {
			let childrenBreadcrumb = [...breadcrumb];
			childrenBreadcrumb.push(route);
			let tmpRoute = { ...route };
			tmpRoute.meta.breadcrumb = childrenBreadcrumb;
			delete tmpRoute.children;
			res.push(tmpRoute);
			let childrenRoutes = flatAsyncRoutes(
				tmp.children,
				childrenBreadcrumb
			);
			childrenRoutes.map((item) => {
				res.push(item);
			});
		} else {
			let tmpBreadcrumb = [...breadcrumb];
			tmpBreadcrumb.push(tmp);
			tmp.meta.breadcrumb = tmpBreadcrumb;
			res.push(tmp);
		}
	});
	return res;
}

//过滤树
function treeFilter(tree, func) {
	return tree
		.map((node) => ({ ...node }))
		.filter((node) => {
			node.children = node.children && treeFilter(node.children, func);
			return func(node) || (node.children && node.children.length);
		});
}

export default router;
