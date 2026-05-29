import config from "@/config";
import http from "@/utils/request";
export default {
    list: {
        url: `${config.API_URL}/iamsysosp/list`,
        name: "列表",
        get: async function () {
            return await http.get(this.url);
        },
    },
    option: {
        url: `${config.API_URL}/iamsysosp/option`,
        name: "列表",
        get: async function () {
            return await http.get(this.url);
        },
    }
};
