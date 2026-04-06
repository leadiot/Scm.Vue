# Scm.Vue

Scm.Net 项目前端，基于 Vue 3 + Vite + Element Plus 构建的企业级后台管理系统。

## 技术栈

| 技术 | 版本 | 说明 |
| --- | --- | --- |
| [Vue](https://vuejs.org/) | ^3.5.32 | 渐进式 JavaScript 框架 |
| [Vite](https://vitejs.dev/) | ^8.0.3 | 下一代前端构建工具 |
| [Vue Router](https://router.vuejs.org/) | ^5.0.4 | Vue.js 官方路由 |
| [Pinia](https://pinia.vuejs.org/) | ^3.0.0 | Vue.js 状态管理 |
| [Element Plus](https://element-plus.org/) | ^2.13.6 | Vue 3 组件库 |
| [Axios](https://axios-http.com/) | ^1.7.0 | HTTP 请求库 |
| [ECharts](https://echarts.apache.org/) | ^6.0.0 | 数据可视化图表库 |
| [Sass](https://sass-lang.com/) | ^1.99.0 | CSS 预处理器 |

## 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0 或 pnpm >= 8.0.0

## 安装

```bash
# 克隆项目
git clone https://gitee.com/leadiot/scm.vue.git

# 进入前端目录
cd Scm.Vue

# 安装依赖
npm install
```

## 开发

```bash
# 启动开发服务器
npm run dev

# 或
npm run serve
```

访问 http://localhost:2800 查看项目。

## 构建

```bash
# 生产环境构建
npm run build

# 预览构建结果
npm run preview
```

## 目录结构

```
Scm.Vue/
├── public/                 # 静态资源
│   ├── img/               # 图片资源
│   ├── lib/               # 第三方库
│   └── index.html         # HTML 模板
├── src/
│   ├── api/               # API 接口
│   │   └── model/         # 接口模块
│   ├── assets/            # 资源文件
│   │   ├── mp3/           # 音频文件
│   │   └── sass/          # 样式文件
│   ├── components/        # 公共组件
│   ├── config/            # 配置文件
│   ├── directives/        # 自定义指令
│   ├── layout/            # 布局组件
│   ├── locales/           # 国际化
│   ├── router/            # 路由配置
│   ├── stores/            # 状态管理
│   ├── style/             # 全局样式
│   ├── utils/             # 工具函数
│   ├── views/             # 页面视图
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── .env                   # 环境变量
├── .env.development       # 开发环境变量
├── .env.production        # 生产环境变量
├── vite.config.js         # Vite 配置
└── package.json           # 项目配置
```

## 主要功能

- **用户认证** - 支持多种登录方式（账户、手机、邮件、三方登录等）
- **权限管理** - 多级权限控制（公司、部门、岗位、分组、用户、角色）
- **国际化** - 支持多语言切换
- **主题定制** - 支持亮色/暗色主题
- **组件丰富** - 40+ 自定义业务组件
- **代码生成** - 支持自动生成代码
- **工作流** - 自定义审批流程
- **消息通知** - 实时消息推送与聊天
- **数据可视化** - ECharts 图表集成
- **文件管理** - 文件上传、导入导出

## 浏览器支持

| ![Chrome](https://img.shields.io/badge/Chrome->=80-success?logo=google-chrome) | ![Firefox](https://img.shields.io/badge/Firefox->=75-success?logo=firefox) | ![Safari](https://img.shields.io/badge/Safari->=13-success?logo=safari) | ![Edge](https://img.shields.io/badge/Edge->=80-success?logo=microsoft-edge) |
| --- | --- | --- | --- |
| Chrome >= 80 | Firefox >= 75 | Safari >= 13 | Edge >= 80 |

## 相关链接

- [后端项目](https://gitee.com/leadiot/scm.net)
- [在线文档](https://gitee.com/leadiot/scm.net/wikis/项目介绍)
- [在线演示](http://www.c-scm.net)

## 项目截图
电脑端页面   
![后台首页](https://gitee.com/leadiot/scm.net/raw/master/screenshots/pc-home.png)  
![接口日志](https://gitee.com/leadiot/scm.net/raw/master/screenshots/pc-logapi.png)  
![在线SQL](https://gitee.com/leadiot/scm.net/raw/master/screenshots/pc-sql.png)  
![任务调度](https://gitee.com/leadiot/scm.net/raw/master/screenshots/pc-task.png)  
![系统监控](https://gitee.com/leadiot/scm.net/raw/master/screenshots/pc-monitor.png)  

手机端页面   
![用户登录](https://gitee.com/leadiot/scm.net/raw/master/screenshots/mp-login.jpg)  
![用户首页](https://gitee.com/leadiot/scm.net/raw/master/screenshots/mp-home.jpg)  
![系统菜单](https://gitee.com/leadiot/scm.net/raw/master/screenshots/mp-menu.jpg)  

## 演示账号

| 角色 | 账号 | 密码 |
| --- | --- | --- |
| 管理员 | admin@demo | 123456 |
| 普通用户 | user@demo | 123456 |

## 开源协议

[MIT License](LICENSE)

## 交流群

![QQ](https://img.shields.io/badge/QQ-415872667-green?logo=tencent-qq)
