# AGENTS.md — Scm.Vue

> 前端仓库：Scm.Net 快速开发框架的 Vue 3 前端部分。
> 配套后端：<https://gitee.com/leadiot/scm.net>

---

## 项目类型

- Vue 3.5 + Vite 8 + Element Plus 2.13，纯 JavaScript（无 TypeScript）。
- 企业中后台管理系统，支持三种布局模式：`console`（工作台）、`desktop`（云桌面）、`monitor`（数据大屏）。
- 单仓库，非 monorepo。

---

## 开发命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器（默认 <http://localhost:2800>） |
| `npm run serve` | 同 `dev` |
| `npm run build` | 生产构建（`dist/` 目录，ESBuild 压缩） |
| `npm run preview` | 预览构建结果 |
| `npm run lint` | ESLint 检查并自动修复（`.vue`, `.js`, `.jsx`, `.cjs`, `.mjs`） |

> 没有测试框架（无 Vitest / Jest / Cypress / Playwright）。

---

## 环境变量

文件优先级：`.env.production` > `.env.development` > `.env`

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `VITE_API_BASE` | `http://localhost:5000` | 后端 API 地址 |
| `VITE_WEB_PORT` | `2800` | 前端开发端口 |
| `VITE_APP_PROXY` | `true` | 是否启用 Vite 代理（`/api` → 后端） |

> **注意**：所有带 `VITE_APP_OIDC_*` 前缀的变量（`OIDC_KEY`、`OIDC_AUTH`、`OIDC_LOGIN`、`OIDC_REDIRECT_URI` 等）涉及第三方联合登录，**不能修改**，否则外部登录/授权页面无法打开。

---

## 代码风格与约定

- **缩进**：`.editorconfig` 规定 `indent_style = tab`、`indent_size = 4`、`end_of_line = lf`。
- **ESLint**：flat config（`eslint.config.js`），规则非常宽松：`indent` / `no-tabs` / `no-mixed-spaces-and-tabs` / `vue/no-unused-components` / `vue/multi-word-component-names` 均为 `off`。
- **路径别名**：`@/` 映射到 `src/`（`vite.config.js` + `jsconfig.json`）。
- **组件注册**：全局业务组件（`scTable`、`scSearch`、`scUpload` 等 40+ 个）统一在 `src/scui.js` 中注册，并挂载全局属性（`$CONFIG`、`$TOOL`、`$HTTP`、`$API`、`$AUTH`、`$ROLE`）。新增全局组件或指令时，必须同步修改 `src/scui.js`。
- **全局指令**：`v-auth`（权限）、`v-role`（角色）、`v-copy`（复制）、`v-time`（时间格式化）。

---

## 路由架构

- **Hash 模式**：`createWebHashHistory`，所有路由带 `#/`。
- **动态路由**：菜单和路由从后端 API 加载（`tool.session.get("MENU")`），登录后动态注入；静态路由仅用于登录页、OAuth 回调、系统页面（见 `src/config/route.js`）。
- **布局切换**：`App.vue` 根据 `route.meta.layout` 动态切换 `layout/console`、`layout/desktop`、`layout/monitor`、`layout/none`。
- **组件加载**：`loadComponent()` 通过 `import.meta.glob('@/views/**/*.vue')` 自动匹配 `@/views/{component}.vue` 或 `@/views/{component}/index.vue`。

---

## API 层

- `src/api/index.js` 使用 `import.meta.glob("./model/**/*.js", { eager: true })` **自动导入** `src/api/model/**/*.js` 下的所有接口模块。
- 新增接口模块时，直接在 `src/api/model/` 下新建 `.js` 文件即可，**无需手动注册**。
- HTTP 封装在 `src/utils/request.js`：Axios 拦截器自动附加 `appkey`、`timestamp`、`signature`（MD5 签名），并处理 401 跳转登录。

---

## 状态管理

- Pinia 3，stores 位于 `src/stores/`：
  - `global.js` — 主题、布局、语言、菜单折叠
  - `keepAlive.js` — 页面缓存
  - `viewTags.js` — 多标签页
  - `iframe.js` — iframe 页面管理

---

## 构建与部署

- Vite 配置在 `vite.config.js`：
  - `build.outDir: 'dist'`，`assetsDir: 'static'`
  - 生产环境使用 `esbuild` 压缩
  - 代码拆分为多个 vendor chunk（vue-vendor、element-plus、echarts、xgplayer、xlsx 等）
- 生产部署：将 `dist/` 目录部署到 Nginx / IIS / 静态文件服务器即可。
- `.gitignore` 排除了 `dist/`、`node_modules/`、IDE 配置文件。

---

## 快速定位

| 目的 | 文件 |
|------|------|
| 应用入口 | `src/main.js` |
| 全局组件/指令注册 | `src/scui.js` |
| 全局配置 | `src/config/index.js` |
| 路由 + 守卫 | `src/router/index.js` |
| 静态路由配置 | `src/config/route.js` |
| HTTP 请求封装 | `src/utils/request.js` |
| 权限判断 | `src/utils/permission.js` |
| 工具函数 | `src/utils/tool.js` |
| 页面视图 | `src/views/` |
| 业务组件 | `src/components/` |
| API 接口 | `src/api/model/` |
| 国际化 | `src/locales/lang/` |
| 布局组件 | `src/layout/` |

---

## 常见陷阱

1. **修改 OIDC 配置会导致登录失效**：`.env` 中的 `VITE_APP_OIDC_*` 系列变量与 oidc.org.cn 第三方登录绑定，不能随意更改。
2. **全局组件未注册**：在 `src/components/` 新建组件后，如果需要在全局使用，务必在 `src/scui.js` 中 `app.component()` 注册。
3. **API 模块命名冲突**：`src/api/index.js` 自动导入时，取的是文件路径的最后一段（`split("/").pop()`），同名文件会覆盖，注意避免 `src/api/model/foo/bar.js` 与 `src/api/model/baz/bar.js` 同名。
4. **没有 TypeScript**：本项目是纯 JS，不要引入 `.ts` 文件或类型声明，除非先改造构建配置。
5. **没有测试套件**：修改后验证只能依赖 `npm run dev` 手动浏览或 `npm run build` 检查构建是否通过。
