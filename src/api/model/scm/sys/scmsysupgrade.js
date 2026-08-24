import config from "@/config";
import http from "@/utils/request";
export default {
	appInfo: {
		url: `${config.API_URL}/upgrade/appInfo`,
		name: "App信息",
		get: async function () {
			return await http.get(this.url);
		},
	},
	verInfo: {
		url: `${config.API_URL}/upgrade/verInfo`,
		name: "Ver信息",
		get: async function () {
			return await http.get(this.url);
		},
	},
	check: {
		url: `${config.API_URL}/upgrade/check`,
		name: "检查",
		get: async function () {
			return await http.get(this.url);
		},
	},
	download: {
		url: `${config.API_URL}/upgrade/download/`,
		name: "下载",
		get: async function (params) {
			return await http.get(this.url + params);
		},
	},
	upgrade: {
		url: `${config.API_URL}/upgrade/upgrade/`,
		name: "升级",
		get: async function (params) {
			return await http.get(this.url + params);
		},
	},
};
