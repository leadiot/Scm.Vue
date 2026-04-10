import config from "@/config"
import http from "@/utils/request"
export default {
	page: {
		url: `${config.API_URL}/scmsysgtdheader/pages`,
		name: "查询",
		get: async function (params) {
			return await http.get(this.url, params);
		}
	},
	list: {
		url: `${config.API_URL}/scmsysgtdheader/list`,
		name: "列表",
		get: async function (params) {
			return await http.get(this.url, params);
		}
	},
	view: {
		url: `${config.API_URL}/scmsysgtdheader/view/`,
		name: "查看",
		get: async function (params) {
			return await http.get(this.url + params);
		}
	},
	edit: {
		url: `${config.API_URL}/scmsysgtdheader/edit/`,
		name: "编辑",
		get: async function (params) {
			return await http.get(this.url + params);
		}
	},
	add: {
		url: `${config.API_URL}/scmsysgtdheader`,
		name: "新增",
		post: async function (data) {
			return await http.post(this.url, data);
		}
	},
	update: {
		url: `${config.API_URL}/scmsysgtdheader`,
		name: "更新",
		put: async function (data) {
			return await http.put(this.url, data);
		}
	},
	status: {
		url: `${config.API_URL}/scmsysgtdheader/status`,
		name: "状态",
		post: async function (data) {
			return await http.post(this.url, data);
		}
	},
	delete: {
		url: `${config.API_URL}/scmsysgtdheader`,
		name: "删除",
		delete: async function (data) {
			return await http.delete(this.url + "?ids=" + data);
		}
	},
	handle: {
		url: `${config.API_URL}/scmsysgtdheader/handle`,
		name: "处理",
		post: async function (data) {
			return await http.post(this.url, data);
		}
	},
	remove: {
		url: `${config.API_URL}/scmsysgtdheader/clear`,
		name: "逻辑删除",
		post: async function () {
			return await http.post(this.url);
		}
	},
}