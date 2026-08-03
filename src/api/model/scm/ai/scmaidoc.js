import config from "@/config";
import http from "@/utils/request";

export default {
	pages: {
		url: `${config.API_URL}/scmaidoc/pages`,
		name: "文档分页",
		get: async function (params) {
			return await http.get(this.url, params);
		},
	},
	upload: {
		url: `${config.API_URL}/scmaidoc/upload`,
		name: "上传并索引",
		/**
		 * 上传知识库文档（multipart/form-data）。
		 * 上传后后端同步执行：保存→提取文本→分块→向量化→入库，耗时较长。
		 * @param {FormData} data 含 file（必填）、remark（可选）
		 */
		post: async function (data) {
			return await http.post(this.url, data, {
				headers: { "Content-Type": "multipart/form-data" },
				timeout: 300000,
			});
		},
	},
	rebuild: {
		url: `${config.API_URL}/scmaidoc/rebuild`,
		name: "重建索引",
		post: async function (data) {
			return await http.post(this.url, data, { timeout: 300000 });
		},
	},
	delete: {
		url: `${config.API_URL}/scmaidoc`,
		name: "删除文档",
		/**
		 * @param {string|number} ids 逗号分隔的文档ID，如 "1,2,3"
		 */
		delete: async function (ids) {
			return await http.delete(this.url + "?ids=" + ids);
		},
	},
};
