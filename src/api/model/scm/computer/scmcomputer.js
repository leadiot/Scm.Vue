import config from "@/config"
import http from "@/utils/request"
export default {
	page: {
		url: `${config.API_URL}/scmcomputer/pages`,
		name: "分页",
		get: async function (params) {
			return await http.get(this.url, params);
		}
	},
	list: {
		url: `${config.API_URL}/scmcomputer/list`,
		name: "列表",
		get: async function (params) {
			return await http.get(this.url, params);
		}
	},
	root: {
		url: `${config.API_URL}/scmcomputer/list`,
		name: "列表",
		get: async function (params) {
			return await http.get(this.url, params);
		}
	},
	home: {
		url: `${config.API_URL}/scmcomputer/list`,
		name: "列表",
		get: async function (params) {
			return await http.get(this.url, params);
		}
	},
	view: {
		url: `${config.API_URL}/scmcomputer/view/`,
		name: "查看",
		get: async function (params) {
			return await http.get(this.url + params);
		}
	},
	edit: {
		url: `${config.API_URL}/scmcomputer/edit/`,
		name: "编辑",
		get: async function (params) {
			return await http.get(this.url + params);
		}
	},
	add: {
		url: `${config.API_URL}/scmcomputer`,
		name: "新增",
		post: async function (data) {
			return await http.post(this.url, data);
		}
	},
	delete: {
		url: `${config.API_URL}/scmcomputer`,
		name: "删除",
		delete: async function (data) {
			return await http.delete(this.url, data);
		}
	},
	option: {
		url: `${config.API_URL}/scmcomputer/option`,
		name: "选择",
		get: async function (data) {
			return await http.get(this.url, data);
		}
	},
	mkdir: {
		url: `${config.API_URL}/scmcomputer/mkdir`,
		name: "新建文件夹",
		post: async function (data) {
			return await http.post(this.url, data);
		}
	},
	copy: {
		url: `${config.API_URL}/scmcomputer/copy`,
		name: "复制",
		post: async function (data) {
			return await http.post(this.url, data);
		}
	},
	move: {
		url: `${config.API_URL}/scmcomputer/move`,
		name: "移动",
		post: async function (data) {
			return await http.post(this.url, data);
		}
	},
	upload: {
		url: `${config.API_URL}/scmcomputer/upload`,
		name: "上传",
		post: async function (data, config) {
			return await http.post(this.url, data, config);
		}
	},
}