import config from "@/config"
import http from "@/utils/request"
export default {
	page: {
		url: `${config.API_URL}/scmsyscomputer/pages`,
		name: "分页",
		get: async function (params) {
			return await http.get(this.url, params);
		}
	},
	root: {
		url: `${config.API_URL}/scmsyscomputer/listroot`,
		name: "列表",
		get: async function () {
			return await http.get(this.ur);
		}
	},
	list: {
		url: `${config.API_URL}/scmsyscomputer/list`,
		name: "列表",
		get: async function (params) {
			return await http.get(this.url, params);
		}
	},
	home: {
		url: `${config.API_URL}/scmsyscomputer/home`,
		name: "列表",
		get: async function (params) {
			return await http.get(this.url, params);
		}
	},
	quick: {
		url: `${config.API_URL}/scmsyscomputer/quick/`,
		name: "列表",
		get: async function (params) {
			return await http.get(this.url + params);
		}
	},
	view: {
		url: `${config.API_URL}/scmsyscomputer/view/`,
		name: "查看",
		get: async function (params) {
			return await http.get(this.url + params);
		}
	},
	edit: {
		url: `${config.API_URL}/scmsyscomputer/edit/`,
		name: "编辑",
		get: async function (params) {
			return await http.get(this.url + params);
		}
	},
	add: {
		url: `${config.API_URL}/scmsyscomputer`,
		name: "新增",
		post: async function (data) {
			return await http.post(this.url, data);
		}
	},
	delete: {
		url: `${config.API_URL}/scmsyscomputer`,
		name: "删除",
		delete: async function (data) {
			return await http.delete(this.url, data);
		}
	},
	option: {
		url: `${config.API_URL}/scmsyscomputer/option`,
		name: "选择",
		get: async function (data) {
			return await http.get(this.url, data);
		}
	},
	mkdir: {
		url: `${config.API_URL}/scmsyscomputer/mkdir`,
		name: "新建文件夹",
		post: async function (data) {
			return await http.post(this.url, data);
		}
	},
	copy: {
		url: `${config.API_URL}/scmsyscomputer/copy`,
		name: "复制",
		post: async function (data) {
			return await http.post(this.url, data);
		}
	},
	move: {
		url: `${config.API_URL}/scmsyscomputer/move`,
		name: "移动",
		post: async function (data) {
			return await http.post(this.url, data);
		}
	},
	upload: {
		url: `${config.API_URL}/scmsyscomputer/upload`,
		name: "上传",
		post: async function (data, config) {
			return await http.post(this.url, data, config);
		}
	},
}