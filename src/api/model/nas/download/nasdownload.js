import config from "@/config"
import http from "@/utils/request"
export default {
	page: {
		url: `${config.API_URL}/nasdownload/pages`,
		name: "分页",
		get: async function (params) {
			return await http.get(this.url, params);
		}
	},
	list: {
		url: `${config.API_URL}/nasdownload/list`,
		name: "列表",
		get: async function () {
			return await http.get(this.url );
		}
	},
	add: {
		url: `${config.API_URL}/nasdownload`,
		name: "新增",
		post: async function (data) {
			return await http.post(this.url, data);
		}
	},
	update: {
		url: `${config.API_URL}/nasdownload`,
		name: "更新",
		put: async function (data) {
			return await http.put(this.url, data);
		}
	},
	pause: {
		url: `${config.API_URL}/nasdownload/pause/`,
		name: "暂停",
		get: async function (params) {
			return await http.get(this.url + params);
		}
	},
	resume: {
		url: `${config.API_URL}/nasdownload/resume/`,
		name: "恢复",
		get: async function (params) {
			return await http.get(this.url + params);
		}
	},
	status: {
		url: `${config.API_URL}/nasdownload/status`,
		name: "状态",
		post: async function (data) {
			return await http.post(this.url, data);
		}
	},
	delete: {
		url: `${config.API_URL}/nasdownload`,
		name: "删除",
		delete: async function (data) {
			return await http.delete(this.url, data);
		}
	},
	all: {
		url: `${config.API_URL}/nasdownload/all`,
		name: "全部",
		get: async function (params) {
			return await http.get(this.url + params);
		}
	},
}