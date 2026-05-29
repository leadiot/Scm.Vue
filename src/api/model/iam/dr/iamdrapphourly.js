import config from "@/config"
import http from "@/utils/request"
export default {
    hourly: {
        url: `${config.API_URL}/iamdrapphourly/hourly`,
        name: "查询",
        get: async function (params) {
            return await http.get(this.url, params);
        }
    }
}