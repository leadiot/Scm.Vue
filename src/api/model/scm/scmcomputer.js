import config from "@/config"
import http from "@/utils/request"
export default {
	root: {
		url: `${config.API_URL}/computer/listroot`,
		name: "列表",
		get: async function () {
			return await http.get(this.url);
		}
	},
	home: {
		url: `${config.API_URL}/computer/home`,
		name: "列表",
		get: async function (params) {
			return await http.get(this.url, params);
		}
	},
	list: {
		url: `${config.API_URL}/computer/list`,
		name: "列表",
		get: async function (params) {
			return await http.get(this.url, params);
		}
	},
	listDir: {
		url: `${config.API_URL}/computer/listDir`,
		name: "列表",
		get: async function (params) {
			return await http.get(this.url, params);
		}
	},
	listDoc: {
		url: `${config.API_URL}/computer/listDoc`,
		name: "列表",
		get: async function (params) {
			return await http.get(this.url, params);
		}
	},
	listLib: {
		url: `${config.API_URL}/computer/listLib`,
		name: "列表",
		get: async function () {
			return await http.get(this.url);
		}
	},
	view: {
		url: `${config.API_URL}/computer/view/`,
		name: "查看",
		get: async function (params) {
			return await http.get(this.url + params);
		}
	},
	createDir: {
		url: `${config.API_URL}/computer/CreateDir`,
		name: "新建文件夹",
		post: async function (data) {
			return await http.post(this.url, data);
		}
	},
	copy: {
		url: `${config.API_URL}/computer/copy`,
		name: "复制",
		post: async function (data) {
			return await http.post(this.url, data);
		}
	},
	move: {
		url: `${config.API_URL}/computer/move`,
		name: "移动",
		post: async function (data) {
			return await http.post(this.url, data);
		}
	},
	rename: {
		url: `${config.API_URL}/computer/rename`,
		name: "重命名",
		post: async function (data) {
			return await http.post(this.url, data);
		}
	},
	upload: {
		url: `${config.API_URL}/computer/upload`,
		name: "上传",
		post: async function (data, config) {
			return await http.post(this.url, data, config);
		}
	},
	download: {
		url: `${config.API_URL}/computer/download`,
		name: "下载",
		get: async function (params) {
			return await http.get(this.url, params);
		}
	},
}