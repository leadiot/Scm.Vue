<p align="center">
  <img src="public/images/logo.png" alt="Scm.Net Logo" width="120" />
</p>

<h1 align="center">Scm.Vue</h1>

<p align="center">
  <a href="https://gitee.com/leadiot/scm.vue">
    <img src="https://gitee.com/leadiot/scm.vue/badge/star.svg?theme=dark" alt="Gitee Stars" />
  </a>
  <a href="https://vuejs.org/">
    <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js" alt="Vue 3" />
  </a>
  <a href="https://vitejs.dev/">
    <img src="https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite" alt="Vite 8" />
  </a>
  <a href="https://element-plus.org/">
    <img src="https://img.shields.io/badge/Element%20Plus-2.13-409EFF?logo=element" alt="Element Plus" />
  </a>
  <a href="https://pinia.vuejs.org/">
    <img src="https://img.shields.io/badge/Pinia-3.0-F7D336?logo=pinia" alt="Pinia 3" />
  </a>
  <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT License" />
</p>

<p align="center">
  <b>Scm.Net 项目前端</b> — 基于 Vue 3 + Vite + Element Plus 构建的企业级中后台管理快速开发框架。
</p>

<p align="center">
  配套后端：<a href="https://gitee.com/leadiot/scm.net">.Net 10.0 版本</a> ｜
  <a href="http://www.c-scm.net">在线演示</a> ｜
  <a href="https://gitee.com/leadiot/scm.net/wikis/项目介绍">在线文档</a>
</p>

---

## 📖 项目简介

**Scm.Vue** 是 [Scm.Net](https://gitee.com/leadiot/scm.net) 快速开发框架的前端部分，采用前后端分离架构，内置权限管理、代码生成、工作流引擎、实时消息、数据可视化等企业级核心能力。

项目集成了 **工作台模式**（Console）、**云桌面模式**（Desktop）和 **大屏幕模式**（Monitor）三种 UI 风格，适应不同业务场景需求。

> 基于 .Net 10.0 / Vue 3.0 技术，适用于企业中后台管理系统的快速开发。

---

## ✨ 核心特性

### 认证与安全
- **多种登录方式** — 账号、手机号、邮箱、OIDC 第三方联合登录
- **数据加密** — 前后端传输参数加密签名
- **权限控制** — 公司/部门/岗位/分组/用户/角色六级权限体系
- **指令级鉴权** — `v-auth`、`v-role` 自定义指令控制页面元素可见性

### 系统与框架
- **动态路由** — 后端动态加载菜单路由，支持扁平化与面包屑导航
- **代码生成器** — 自动生成前后端 CRUD 代码
- **工作流引擎** — 可视化流程设计、自定义审批流转
- **国际化 i18n** — 内置中/英文语言包，Element Plus 组件文案同步
- **主题定制** — 亮色/暗色主题，支持自定义主题色

### 业务能力
- **实时消息** — 基于 SignalR 的 WebSocket 实时消息推送与在线聊天
- **数据可视化** — ECharts 图表集成，Dashboard 看板布局
- **文件管理** — 文件上传、导入导出、图片裁剪（Cropper.js）
- **通知公告** — 站内信、系统通知、邮件通知
- **PWA 支持** — 支持安装为桌面应用

### UI/UX
- **多布局模式** — 工作台 / 云桌面 / 大屏幕 三种布局
- **工作台布局风格** — 支持 default（默认）/ header（通栏）/ menu（经典）/ dock（功能坞）
- **40+ 业务组件** — scTable、scSearch、scUpload、scDynamicForm 等开箱即用
- **多标签页** — 支持标签页模式，可折叠菜单
- **亮色/暗色主题** — 一键切换暗黑模式

---

## 🛠 技术栈

| 技术 | 版本 | 说明 |
| --- | --- | --- |
| [Vue](https://vuejs.org/) | ^3.5.32 | 渐进式 JavaScript 框架 |
| [Vite](https://vitejs.dev/) | ^8.0.3 | 下一代前端构建工具（Rolldown 打包） |
| [Vue Router](https://router.vuejs.org/) | ^5.0.4 | Vue.js 官方路由（Hash 模式） |
| [Pinia](https://pinia.vuejs.org/) | ^3.0.0 | Vue.js 状态管理 |
| [Element Plus](https://element-plus.org/) | ^2.13.6 | Vue 3 桌面端组件库 |
| [Axios](https://axios-http.com/) | ^1.7.0 | HTTP 请求库（请求/响应拦截） |
| [ECharts](https://echarts.apache.org/) | ^6.0.0 | 数据可视化图表库 |
| [Sass](https://sass-lang.com/) | ^1.99.0 | CSS 预处理器 |
| [SignalR](https://learn.microsoft.com/zh-cn/aspnet/core/signalr) | ^10.0.0 | 实时 Web 通信（@microsoft/signalr） |
| [Vue I18n](https://vue-i18n.intlify.dev/) | ^11.0.0 | 国际化插件 |
| [Pinia](https://pinia.vuejs.org/) | ^3.0.0 | 状态管理 |
| [Cropper.js](https://fengyuanchen.github.io/cropperjs/) | ^1.6.2 | 图片裁剪 |
| [CryptoJS](https://github.com/brix/crypto-js) | ^4.2.0 | 前端数据加密 |
| [Highlight.js](https://highlightjs.org/) | ^11.11.1 | 代码语法高亮 |
| [Pinyin Pro](https://github.com/zh-lx/pinyin-pro) | ^3.24.0 | 中文拼音转换 |
| [NProgress](https://ricostacruz.com/nprogress) | 自定义 ESM | 页面加载进度条 |

---

## 🔧 环境要求

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 或 **pnpm** >= 8.0.0

---

## 🚀 快速开始

```bash
# 1. 克隆项目
git clone https://gitee.com/leadiot/scm.vue.git

# 2. 进入前端目录
cd Scm.Vue

# 3. 安装依赖
npm install

# 4. 启动开发服务器（默认 http://localhost:2800）
npm run dev
```

### 可用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器 |
| `npm run serve` | 同 `dev` |
| `npm run build` | 生产环境构建（ESBuild 压缩） |
| `npm run preview` | 预览构建结果 |
| `npm run lint` | ESLint 代码检查 |

---

## 🌐 环境变量

项目使用 `.env` 文件管理环境配置，优先级：`.env.production` > `.env.development` > `.env`。

| 变量名 | 说明 | 默认值 |
| --- | --- | --- |
| `VITE_APP_VER` | 应用版本号 | `10.14.31` |
| `VITE_APP_BUILD` | 构建日期 | `2026051201` |
| `VITE_APP_CODE` | 应用代码 | `Scm.Net` |
| `VITE_APP_NAME` | 应用名称 | `AppName` |
| `VITE_APP_DESC` | 应用简介 | 支持 HTML |
| `VITE_API_BASE` | 后端 API 地址 | `http://localhost:5000` |
| `VITE_WEB_PORT` | 前端开发端口 | `2800` |
| `VITE_APP_PROXY` | 是否启用代理 | `true` |
| `VITE_APP_OIDC_KEY` | OIDC 应用 KEY | 08dc965832db7248 |
| `VITE_APP_OIDC_AUTH` | OIDC 授权地址 | oidc.org.cn |
| `VITE_APP_OIDC_LOGIN` | OIDC 登录地址 | oidc.org.cn |
| `VITE_APP_OIDC_REDIRECT_URI` | OIDC 回调地址 | 按环境配置 |

> **注意**: 带有 `OIDC_` 前缀的变量涉及第三方联合登录，请勿随意修改。

---

## 📁 目录结构

```
Scm.Vue/
├── public/                     # 静态资源（不经过 Vite 处理）
│   ├── images/                 #   - 图片资源（logo、favicon、分享图）
│   ├── lib/                    #   - 第三方库（esm、pdf、Excel 等）
│   ├── logo/                   #   - PWA 图标
│   ├── scicon/                 #   - 自定义图标字体
│   ├── material-symbols/       #   - Material Symbols 图标
│   ├── favicon.ico / .svg      #   - 站点图标
│   └── manifest.json           #   - PWA 清单
├── src/
│   ├── api/                    # API 接口层
│   │   ├── index.js            #   - 统一接口入口
│   │   └── model/              #   - 业务接口模块（SCM、NAS、登录等）
│   ├── assets/                 # 资源文件
│   │   ├── mp3/                #   - 提示音效
│   │   └── sass/               #   - 全局 SCSS 变量与混入
│   ├── components/             # 全局业务组件（40+）
│   │   ├── scTable/            #   - 增强表格组件
│   │   ├── scSearch/           #   - 搜索栏组件
│   │   ├── scUpload/           #   - 文件上传组件
│   │   ├── scDynamicForm/      #   - 动态表单组件
│   │   ├── scDynamicTable/     #   - 动态表格组件
│   │   ├── scDialog/           #   - 弹窗组件
│   │   ├── scFilterBar/        #   - 过滤栏组件
│   │   └── ...                 #   更多组件...
│   ├── config/                 # 全局配置
│   │   ├── index.js            #   - 系统配置（从环境变量读取）
│   │   ├── route.js            #   - 静态路由配置
│   │   ├── table.js            #   - 表格默认配置
│   │   ├── upload.js           #   - 上传配置
│   │   └── workflow.js         #   - 工作流配置
│   ├── directives/             # 自定义指令
│   │   ├── auth.js             #   - 权限认证（v-auth）
│   │   ├── role.js             #   - 角色判断（v-role）
│   │   ├── copy.js             #   - 一键复制（v-copy）
│   │   └── time.js             #   - 时间格式化（v-time）
│   ├── layout/                 # 布局组件
│   │   ├── console/            #   - 工作台布局（主布局）
│   │   ├── desktop/            #   - 云桌面布局（类 Windows 桌面）
│   │   ├── monitor/            #   - 大屏幕布局（数据大屏）
│   │   ├── none/               #   - 空布局（登录页等）
│   │   └── other/              #   - 404、空白页等
│   ├── locales/                # 国际化
│   │   ├── index.js            #   - i18n 初始化
│   │   └── lang/               #   - 语言包（zh-cn / en）
│   ├── router/                 # 路由
│   │   ├── index.js            #   - 路由实例 + 守卫逻辑
│   │   ├── systemRouter.js     #   - 系统内置路由
│   │   └── scrollBehavior.js   #   - 滚动行为控制
│   ├── stores/                 # Pinia 状态管理
│   │   ├── index.js            #   - Pinia 实例
│   │   ├── global.js           #   - 全局状态（主题、布局、语言等）
│   │   ├── keepAlive.js        #   - 页面缓存管理
│   │   ├── viewTags.js         #   - 多标签页管理
│   │   └── iframe.js           #   - iframe 页面管理
│   ├── style/                  # 全局样式
│   │   └── style.scss          #   - 主样式入口
│   ├── utils/                  # 工具函数
│   │   ├── tool.js             #   - 通用工具（存储、日期、格式化等）
│   │   ├── request.js          #   - Axios 封装（拦截器、缓存、加密）
│   │   ├── crypto.js           #   - 加密解密工具
│   │   ├── socket.js           #   - SignalR 实时通信
│   │   ├── permission.js       #   - 权限判断工具
│   │   ├── color.js            #   - 颜色处理工具
│   │   ├── errorHandler.js     #   - 全局错误处理
│   │   ├── exportToExcel.js    #   - Excel 导出
│   │   └── verificate.js       #   - 表单校验函数
│   ├── views/                  # 页面视图
│   │   ├── login/              #   - 登录/注册/重置密码
│   │   ├── home/               #   - 控制台首页/云桌面/大屏幕
│   │   ├── scm/                #   - SCM 业务模块
│   │   ├── nas/                #   - NAS 模块
│   │   ├── oauth/              #   - OIDC 联合登录
│   │   ├── about/              #   - 关于页面
│   │   └── ...                 #   更多业务页面
│   ├── scui.js                 # SCUI 框架注册入口（全局组件/指令/图标）
│   ├── App.vue                 # 根组件（布局动态切换）
│   └── main.js                 # 应用入口
├── .env                        # 公共环境变量
├── .env.development            # 开发环境变量
├── .env.production             # 生产环境变量
├── .editorconfig               # 编辑器代码风格配置
├── .gitignore                  # Git 忽略规则
├── eslint.config.js            # ESLint 配置
├── vite.config.js              # Vite 构建配置（proxy / 分包 / 别名）
├── jsconfig.json               # JS 编译配置（路径别名提示）
├── package.json                # 项目依赖与脚本
└── LICENSE                     # MIT 开源协议
```

---

## 🎨 界面预览

### 登录页
![用户登录](screenshots/web-01-login.png)

### 工作台模式
| 功能 | 截图 |
| --- | --- |
| 控制台首页 | ![后台首页](screenshots/web-02-home.png) |
| 用户管理 | ![用户管理](screenshots/web-03-user.png) |
| 文件管理 | ![文件管理](screenshots/web-04-file.png) |
| 日程管理 | ![日程管理](screenshots/web-05-calendar.png) |
| 电子邮件 | ![电子邮件](screenshots/web-06-email.png) |
| 系统监控 | ![系统监控](screenshots/web-07-monitor.png) |
| 在线文档 | ![在线文档](screenshots/web-08-docs.png) |

### 云桌面模式
| 功能 | 截图 |
| --- | --- |
| 桌面首页 | ![用户首页](screenshots/wos-02-desktop-default.png) |
| 云文件管理 | ![文件管理](screenshots/wos-09-cloud.png) |
| 记事本 | ![记事](screenshots/wos-10-notepad.png) |
| 图片查看 | ![图像](screenshots/wos-11-image.png) |
| 音频播放 | ![音频](screenshots/wos-12-audio.png) |
| 待办事项 | ![待办](screenshots/wos-13-gtd.png) |
| 终端管理 | ![终端管理](screenshots/wos-14-terminal.png) |

---

## 🧪 演示账号

| 角色 | 账号 | 密码 |
| --- | --- | --- |
| 管理员 | `admin@demo` | `123456` |
| 普通用户 | `user@demo` | `123456` |

> 演示地址：http://www.c-scm.net

---

## 🌍 浏览器支持

| 浏览器 | 最低版本 |
| --- | --- |
| ![Chrome](https://img.shields.io/badge/Chrome->=80-success?logo=google-chrome) | Chrome >= 80 |
| ![Firefox](https://img.shields.io/badge/Firefox->=75-success?logo=firefox) | Firefox >= 75 |
| ![Safari](https://img.shields.io/badge/Safari->=13-success?logo=safari) | Safari >= 13 |
| ![Edge](https://img.shields.io/badge/Edge->=80-success?logo=microsoft-edge) | Edge >= 80 |

> 不支持 IE 11 及以下版本。

---

## 📦 构建部署

```bash
# 生产构建
npm run build

# 构建产物输出至 dist/ 目录
# 将 dist/ 目录部署至 Nginx / IIS / 静态文件服务器

# 本地预览构建结果
npm run preview
```

> **注意**: 生产环境需在 `.env.production` 中正确配置 `VITE_API_BASE` 为后端接口地址。

---

## 🔗 相关链接

- [后端项目 Scm.Net](https://gitee.com/leadiot/scm.net) — .Net 10.0 后端框架
- [在线文档](https://gitee.com/leadiot/scm.net/wikis/项目介绍) — 完整开发文档
- [在线演示](http://www.c-scm.net) — 体验系统功能

---

## 📄 开源协议

本项目基于 [MIT License](LICENSE) 开源。

---

## 💬 交流反馈

[![QQ Group](https://img.shields.io/badge/QQ%20群-415872667-12B7F5.svg?logo=tencentqq)](https://qm.qq.com/cgi-bin/qm/qr?k=415872667)

<img src="qqq.jpg" width="300" alt="QQ 群二维码" />
