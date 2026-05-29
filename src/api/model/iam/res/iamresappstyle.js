import config from "@/config";
import http from "@/utils/request";
export default {
    page: {
        url: `${config.API_URL}/iamresappstyle/pages`,
        name: "查询",
        get: async function (params) {
            return await http.get(this.url, params);
        },
    },
    list: {
        url: `${config.API_URL}/iamresappstyle/list`,
        name: "列表",
        get: async function (params) {
            return await http.get(this.url + params);
        },
    },
    view: {
        url: `${config.API_URL}/iamresappstyle/view/`,
        name: "查看",
        get: async function (params) {
            return await http.get(this.url + params);
        },
    },
    edit: {
        url: `${config.API_URL}/iamresappstyle/edit/`,
        name: "编辑",
        get: async function (params) {
            return await http.get(this.url + params);
        },
    },
    save: {
        url: `${config.API_URL}/iamresappstyle/save`,
        name: "保存",
        post: async function (data) {
            return await http.post(this.url, data);
        },
    },
    status: {
        url: `${config.API_URL}/iamresappstyle/status`,
        name: "状态",
        post: async function (data) {
            return await http.post(this.url, data);
        },
    },
    delete: {
        url: `${config.API_URL}/iamresappstyle`,
        name: "删除",
        delete: async function (data) {
            return await http.delete(this.url, data);
        },
    }
};
