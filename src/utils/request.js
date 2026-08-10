import axios from "axios";
import { ElMessageBox } from "element-plus";
import sysConfig from "@/config";
import tool from "@/utils/tool";
import crypto from "@/utils/crypto";
import router from "@/router";
import logger from "@/utils/logger";

axios.defaults.baseURL = "";

axios.defaults.timeout = sysConfig.TIMEOUT;

// HTTP request 拦截器
axios.interceptors.request.use(
	(config) => {
		let token = tool.session.get("TOKEN");
		if (token) {
			config.headers[sysConfig.TOKEN_NAME] = sysConfig.TOKEN_PREFIX + token;
		}
		const timestamp = new Date().getTime();
		config.headers["appkey"] = sysConfig.APP_KEY;
		config.headers["timestamp"] = timestamp;
		let signStr = "";
		if (!sysConfig.REQUEST_CACHE && config.method == "get") {
			config.params = config.params || {};
			config.params["_"] = timestamp;
			signStr =
				sysConfig.APP_KEY +
				sysConfig.SIGN_KEY +
				timestamp +
				tool.objKeySort(config.params);
		}
		if (
			config.method == "post" ||
			config.method == "put" ||
			config.method == "delete"
		) {
			signStr =
				sysConfig.APP_KEY +
				sysConfig.SIGN_KEY +
				timestamp +
				JSON.stringify(config.data);
		}
		config.headers["signature"] = crypto.MD5(signStr);
		Object.assign(config.headers, sysConfig.HEADERS);
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// HTTP response 拦截器
axios.interceptors.response.use(
	(response) => {
		if (response.headers["x-refresh-token"]) {
			tool.session.set("TOKEN", response.headers["x-refresh-token"]);
		}
		return response;
	},
	(error) => {
		// 非 401 的状态统一由 logger.httpError 打日志 + 通知
		const { handled } = logger.httpError(error) || {};
		void handled

		// 401：保留原有的登出弹窗引导逻辑
		if (error && error.response && error.response.status === 401) {
			var isBack = tool.data.get("ISLONINEND");
			if (!isBack) {
				tool.data.set("ISLONINEND", "1");
				ElMessageBox.confirm(
					"当前用户已被登出或无权限访问当前资源，请尝试重新登录后再操作。",
					"无权限访问",
					{
						type: "error",
						closeOnClickModal: false,
						showCancelButton: true,
						confirmButtonText: "重新登录",
					}
				)
					.then(() => {
						router.replace({ path: "/login" });
					})
					.catch(() => { });
			}
		}

		return Promise.reject(error && error.response ? error.response : error);
	}
);

var http = {
	/** get 请求
	 * @param  {接口地址} url
	 * @param  {请求参数} params
	 * @param  {参数} config
	 */
	get: function (url, params = {}, config = {}) {
		return new Promise((resolve, reject) => {
			axios({
				method: "get",
				url: url,
				params: params,
				...config,
			})
				.then((response) => {
					resolve(response.data);
				})
				.catch((error) => {
					reject(error);
				});
		});
	},

	/** post 请求
	 * @param  {接口地址} url
	 * @param  {请求参数} data
	 * @param  {参数} config
	 */
	post: function (url, data = {}, config = {}) {
		return new Promise((resolve, reject) => {
			axios({
				method: "post",
				url: url,
				data: data,
				...config,
			})
				.then((response) => {
					resolve(response.data);
				})
				.catch((error) => {
					reject(error);
				});
		});
	},

	/** put 请求
	 * @param  {接口地址} url
	 * @param  {请求参数} data
	 * @param  {参数} config
	 */
	put: function (url, data = {}, config = {}) {
		return new Promise((resolve, reject) => {
			axios({
				method: "put",
				url: url,
				data: data,
				...config,
			})
				.then((response) => {
					resolve(response.data);
				})
				.catch((error) => {
					reject(error);
				});
		});
	},

	/** patch 请求
	 * @param  {接口地址} url
	 * @param  {请求参数} data
	 * @param  {参数} config
	 */
	patch: function (url, data = {}, config = {}) {
		return new Promise((resolve, reject) => {
			axios({
				method: "patch",
				url: url,
				data: data,
				...config,
			})
				.then((response) => {
					resolve(response.data);
				})
				.catch((error) => {
					reject(error);
				});
		});
	},

	/** delete 请求
	 * @param  {接口地址} url
	 * @param  {请求参数} data
	 * @param  {参数} config
	 */
	delete: function (url, data = {}, config = {}) {
		return new Promise((resolve, reject) => {
			axios({
				method: "delete",
				url: url,
				data: data,
				...config,
			})
				.then((response) => {
					resolve(response.data);
				})
				.catch((error) => {
					reject(error);
				});
		});
	},

	/** jsonp 请求
	 * @param  {接口地址} url
	 * @param  {JSONP回调函数名称} name
	 */
	jsonp: function (url, name = "jsonp") {
		return new Promise((resolve) => {
			var script = document.createElement("script");
			var _id = `jsonp${Math.ceil(Math.random() * 1000000)}`;
			script.id = _id;
			script.type = "text/javascript";
			script.src = url;
			window[name] = (response) => {
				resolve(response);
				document.getElementsByTagName("head")[0].removeChild(script);
				try {
					delete window[name];
				} catch {
					window[name] = undefined;
				}
			};
			document.getElementsByTagName("head")[0].appendChild(script);
		});
	},
};

export default http;
