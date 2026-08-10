import config from "@/config";
import http from "@/utils/request";

export default {
	/** 日志上报 — 批量推送前端日志到后端 */
	report: {
		url: `${config.API_URL}/scmlogfe/report`,
		name: "日志上报",
		post: async function (logs) {
			return await http.post(this.url, { logs });
		},
	},
	/** 获取服务端日志配置（可强制用户日志级别） */
	config: {
		url: `${config.API_URL}/scmlogfe/logConfig`,
		name: "日志配置",
		get: async function () {
			return await http.get(this.url);
		},
	},
};
