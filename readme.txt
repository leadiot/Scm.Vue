【打开方式】
1、安装Node.js；
2、安装VScode、Trae或Qoder；
3、打开文件夹至Scm.Vue目录
4、运行npm update，更新项目依赖环境；
5、运行npm run dev，启动服务；
6、打开浏览器，访问地址：https://localhost:2800；
7、登录用户及口令：admin/123456。

【环境配置】
如果您没有本地服务，请修改.env.development文件，将VUE_APP_API_BASEURL修改为我们的开发服务器；
如下为开发环境：
VUE_APP_API_BASE = http://106.14.146.154:9999

【应用配置】
以下配置文件的相关配置均可以修改：
1、public/config.js：优先级最高，可用于生产环境的个性配置；
2、src/config/index.js：优先级次之，可用于编译环境的默认配置；
3、.env相关的文件：优先级最低，可用于开发环境的相关配置；

【待办事项】
1、AI相关功能的完善。