import config from "@/config";
import http from "@/utils/request";
export default {
	list: {
		url: `${config.API_URL}/scmsysconfig/list`,
		name: "列表",
		get: async function (params) {
			return await http.get(this.url, params);
		},
	},
	model: {
		url: `${config.API_URL}/scmsysconfig/`,
		name: "查询一条",
		get: async function (params) {
			return await http.get(this.url + params);
		}
	},
	save: {
		url: `${config.API_URL}/scmsysconfig`,
		name: "更新配置",
		post: async function (data) {
			return await http.post(this.url, data);
		}
	},
};
