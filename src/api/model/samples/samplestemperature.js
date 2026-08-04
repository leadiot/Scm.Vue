import config from "@/config"
import http from "@/utils/request"
export default {
	page: {
		url: `${config.API_URL}/samplestemperature/pages`,
		name: "分页",
		get: async function (params) {
			return await http.get(this.url, params);
		}
	},
	view: {
		url: `${config.API_URL}/samplestemperature/view/`,
		name: "查看",
		get: async function (params) {
			return await http.get(this.url + params);
		}
	},
}