# 一眼万年，用最基础的语言写出最通用的企业管理后台

> Scm.Net：一个基于 .NET 10 + Vue 3 的企业级快速开发框架，纯 JavaScript，没有花活。

---

## 写在前面

每年前端圈都会冒出新概念——新框架、新编译器、新元编程。追不完，也没必要追。

Scm.Net 做了一个"无聊"的选择：**用最基础的技术栈，把企业管理后台做到最通用。** .NET 10 写后端，Vue 3 + Element Plus 写前端，全程纯 JavaScript，一行 TypeScript 都没有。听起来不够"先进"？但它能跑在从 2020 年至今的任何一台服务器上，能被任何一个会写 Vue 的开发者接手，能在三天内搭起一套带权限、工作流、代码生成器的完整系统。

**一眼万年**，不是技术万年不变，而是基本功万年有效。

---

## 技术栈：只选"够了"的

| 层 | 选型 | 为什么 |
|---|---|---|
| 后端 | .NET 10 | 性能强、生态稳、部署简单 |
| 前端框架 | Vue 3.5 | 渐进式，上手成本最低 |
| 构建工具 | Vite 8 | 开发体验碾压一切 |
| UI 库 | Element Plus 2.14 | 中后台组件最全，没有之一 |
| 状态管理 | Pinia 3 | Vue 官方推荐，足够轻量 |
| HTTP | Axios | 拦截器机制成熟，签名加密好处理 |
| 实时通信 | SignalR | 微软出品，WebSocket 封装到位 |
| 图表 | ECharts 6 | 中文文档友好，企业场景刚需 |

没有用 Next.js，没有用 Nuxt，没有引入 SSR，没有上微前端。**企业后台不需要这些。** 用户要的是打开浏览器就能用、刷新不丢数据、权限管得住、表格能导出——这些 Scm.Net 全做到了。

---

## 架构哲学：约定优于配置

### 1. API 自动导入——零注册

```js
// src/api/index.js —— 全部代码，没有省略
const modules = {};
const files = import.meta.glob("./model/**/*.js", { eager: true });

Object.keys(files).forEach((key) => {
    let k = key.replace(/^\.\/model\//, "").replace(/\.js$/, "");
    if (k.indexOf("/") > -1) {
        k = k.split("/").pop();
    }
    modules[k] = files[key].default;
});

export default modules;
```

新增一个接口模块？在 `src/api/model/` 下丢一个 `.js` 文件就行。**不需要注册，不需要导入，不需要改任何配置文件。** 这就是"基础语言"的力量——`import.meta.glob` 是 Vite 提供的原生能力，几行代码解决一个工程化痛点。

### 2. 全局组件集中注册

`src/scui.js` 是整个前端的"注册中心"。40 多个业务组件（scTable、scSearch、scUpload、scWorkflow……）在这里一次性挂载到 Vue 实例上，同时注入 `$CONFIG`、`$TOOL`、`$HTTP`、`$API`、`$AUTH` 等全局属性。

```js
app.config.globalProperties.$API = api;    // 所有接口
app.config.globalProperties.$AUTH = permission; // 权限判断
app.config.globalProperties.$TOOL = tool;  // 工具函数
```

在任何组件里直接 `this.$API.user.getList()`，不用 import，不用注入。**对于一个有几百个页面的中后台系统，这种省事是真的省事。**

### 3. 动态路由——菜单即代码

路由不是前端写死的，而是登录后从后端拉取菜单数据，动态注入 Vue Router。这意味着：

- 新增一个功能页面，后端配一条菜单即可，前端不用改路由表
- 权限控制天然集成——没有菜单权限的用户根本看不到路由
- 支持三种布局自动切换：工作台（Console）、云桌面（Desktop）、大屏（Monitor），靠 `route.meta.layout` 字段驱动

### 4. 请求签名——安全不靠魔法

每个 HTTP 请求自动携带 `appkey`、`timestamp`、`signature` 三件套。签名算法是 MD5——**最基础、最通用的哈希，任何语言的后端都能验签。** 没有用 JWT 之外的自定义协议，没有引入 OAuth 中间件做内部签名，就是 header 里放三个字段，后端拿到一算便知真假。

---

## 通用性：一个框架，三副面孔

企业管理后台的"通用"不是功能堆砌，而是**同一套代码能适配完全不同的使用场景**。

### 工作台模式（Console）
传统中后台：左侧菜单 + 顶部导航 + 多标签页。ERP、CRM、OA 系统的标准形态。支持 default / header / menu / dock 四种布局变体。

### 云桌面模式（Desktop）
把业务功能装进窗口——壁纸、图标、任务栏、可拖拽窗口，像操作系统一样使用后台。这不是玩具，菜单同样从后端动态加载，每个"应用"就是一个 Vue 组件，通过 `import.meta.glob` 按需加载。内置 30+ 套主题（从 Windows 95 到 Windows 11，从 Mac OS 9 到 macOS Tahoe），全部数据驱动，换主题就是换一个 JSON 对象。

### 大屏模式（Monitor）
数据可视化大屏，ECharts 驱动，用于监控中心、运营看板。

**三种模式共享同一套 API、同一套权限体系、同一套组件库。** 切换布局只改一个 meta 字段。这就是架构设计的回报——前期把抽象做对了，后期新增形态的边际成本趋近于零。

---

## 权限体系：六级管控，指令直达

Scm.Net 的权限不是简单的"角色 = 菜单列表"，而是一套六级体系：

**公司 → 部门 → 岗位 → 分组 → 用户 → 角色**

数据权限按组织架构隔离，功能权限按角色分配。前端通过自定义指令在模板里直接控制元素可见性：

```html
<el-button v-auth="'user:add'">新增用户</el-button>
<el-button v-role="'admin'">管理员操作</el-button>
```

不需要在 JS 里写 `if (hasPermission)`，不需要在组件里传 prop，一个指令搞定。**把复杂逻辑收敛成一行模板语法——这就是"基础语言"的优雅。**

---

## 代码生成器：CRUD 不该手写

企业管理后台 80% 的工作是 CRUD——列表、搜索、新增、编辑、删除。Scm.Net 内置代码生成器，根据数据库表结构自动生成前后端代码：

- 后端：Controller + Service + Entity + Mapping
- 前端：列表页 + 表单页 + API 模块 + 路由配置

生成的代码是标准的 Vue 单文件组件，结构清晰，可以直接二次修改。**把人从重复劳动中解放出来，去做真正需要思考的事。**

---

## 纯 JavaScript 的底气

很多人问：2026 年了，为什么不用 TypeScript？

答案很简单：

1. **企业项目的生命周期是 5-10 年。** 今天用 TS 写的代码，三年后框架升级、类型库断更，维护成本反而更高。纯 JS 的代码，只要能跑，谁都能改。
2. **中后台系统的类型复杂度有限。** 表单、表格、接口返回值，类型就那些。引入 TS 带来的类型体操收益远不抵成本。
3. **接手成本。** 会写 Vue 的开发者远比会写 Vue + TS 的多。纯 JS 意味着任何一个前端都能立刻上手。

这不是反对 TypeScript，而是**在特定场景下做出的务实选择。** Scm.Net 面向的是中小企业、快速交付、长期维护——这个场景下，简单就是最大的竞争力。

---

## 一眼万年

技术圈有句话：**"能让项目活十年的，不是最新的框架，而是最稳的基础。"**

Scm.Net 用的每一项技术——Vue、Vite、Element Plus、Axios、ECharts、.NET——都是经过千万项目验证的"基础语言"。它们不会明天就 deprecated，不会因为某个核心维护者跑路而停滞，不会有 Breaking Change 让你重写整个项目。

用最基础的语言，做出最通用的系统。这不是保守，这是**对工程本质的尊重**。

十年后回头看，框架可能换了、版本可能升了，但 Scm.Net 沉淀下来的架构思路——约定优于配置、动态路由驱动布局、权限指令化、代码生成消除重复——这些**不会过时**。

这就是一眼万年。

---

*Scm.Net 开源地址：[Gitee - scm.net（后端）](https://gitee.com/leadiot/scm.net) ｜ [Gitee - scm.vue（前端）](https://gitee.com/leadiot/scm.vue)*
*在线演示：[www.c-scm.net](http://www.c-scm.net) ｜ 演示账号：admin / 123456*
