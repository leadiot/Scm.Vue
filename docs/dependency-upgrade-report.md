# Scm.Vue 依赖升级分析报告

- **生成日期**：2026-07-23
- **数据来源**：npm registry 的 `dist-tags.latest`（实测拉取）
- **项目基线**：package.json `version: 10.6.16`，Vue 3.5 + Vite 8 + Element Plus 2.13，纯 JS
- **依赖总数**：33（dependencies 23 + devDependencies 10）

---

## 一、总体结论

| 类别 | 数量 | 说明 |
|------|------|------|
| 🟢 已是最新稳定版 | 10 | 无需操作（含 vue 在当前 3.5 线内已最新） |
| 🔵 建议升级（minor/patch，低风险） | 15 | 可直接 `npm update` 或改 `^` 后重装 |
| 🟡 主版本升级（需评估破坏性） | 4 | cropperjs 2、esbuild 0.28、pinia 4、xgplayer-hls 3 |
| ⚪ 保持稳定（仅 alpha/rc 可用） | 4 | @resvg/resvg-js、vue 3.6(rc)、vue-i18n 12(alpha)、xlsx |

**一句话建议**：项目基线已经非常新（Vite 8 / ESLint 10 / Vue 5-router 等），没有"卡在远古版本"的债务。真实收益集中在三处——① `axios` 升到 1.18.1（含安全修复，优先）；② `pinia` 升 4.x（低风险清理）；③ `xgplayer-hls` 与 `xgplayer` 版本对齐到 3.0.26（当前 2.x 落后于 3.x，存在不配套隐患）。`cropperjs` 2.x 是重写级破坏性，建议排期单独做，不要顺手升。

---

## 二、分级明细

### 🟢 已是最新稳定版（无需操作）
> `^` 范围已覆盖最新 patch，或该包本身无更新。

| 包 | 声明 | 最新 | 备注 |
|----|------|------|------|
| @highlightjs/vue-plugin | ^2.1.0 | 2.1.0 | peer: highlight.js ^11 / vue ^3 ✓ |
| @microsoft/signalr | ^10.0.0 | 10.0.0 | — |
| crypto-js | ^4.2.0 | 4.2.0 | 稳定，见下方专项 |
| highlight.js | ^11.11.1 | 11.11.1 | — |
| nprogress-esm | ^0.2.6 | 0.2.6 | 小众 fork，已停更但够用 |
| qrcode | ^1.5.4 | 1.5.4 | 已修复历史 ReDoS，保持 |
| sortablejs | ^1.15.7 | 1.15.7 | — |
| vkbeautify | ^0.99.3 | 0.99.3 | 无 semver，已停更 |
| vue-draggable-plus | ^0.6.1 | 0.6.1 | — |
| vue | ^3.5.32 | 3.5.40 | 3.5 线最新；3.6 仅 rc，保持 3.5 |

### 🔵 建议升级（minor/patch，低风险）
> 改 `^` 重装或 `npm update` 即可，破坏性极低。优先级按"安全/收益"排序。

| 包 | 声明 → 建议 | 优先级 | 备注 |
|----|------------|--------|------|
| **axios** | ^1.7.0 → **1.18.1** | ⭐ 高 | 含安全修复与 bug 修复，建议最先升 |
| **element-plus** | ^2.13.6 → **2.14.3** | 高 | 组件库补丁/小特性，低风险 |
| **echarts** | ^6.0.0 → **6.1.0** | 中 | 图表库小版本 |
| **vite** | ^8.0.3 → **8.1.5** | 高 | 构建工具，跟随稳定版 |
| @vitejs/plugin-vue | ^6.0.5 → **6.0.8** | 中 | 与 vite 配套 |
| **vue-router** | ^5.0.4 → **5.2.0** | 中 | peer 要求 vue≥3.5.34 / vite≥8，均满足 |
| **vue-i18n** | ^11.3.0 → **11.4.7** | 中 | 11 线最新；12 仅 alpha |
| eslint | ^10.2.0 → **10.7.0** | 中 | lint 规则微调 |
| eslint-plugin-vue | ^10.8.0 → **10.10.0** | 中 | 与 eslint 配套 |
| vue-eslint-parser | ^10.4.0 → **10.4.1** | 低 | — |
| jsencrypt | ^3.3.2 → **3.5.4** | 中 | RSA 库，minor 修复 |
| pinyin-pro | ^3.28.0 → **3.28.2** | 低 | — |
| @element-plus/icons-vue | ^2.3.1 → **2.3.2** | 低 | 图标集补丁 |
| sass | ^1.99.0 → **1.101.6** | 中 | ⚠️ 1.80+ 移除 legacy JS API，见专项 |
| xgplayer | ^3.0.24 → **3.0.26** | 高 | 必须与 xgplayer-hls 对齐，见 🟡 |

### 🟡 主版本升级（需评估破坏性）
> 升级前必须过一遍相关页面与构建，建议单独排期、单独 PR。

| 包 | 当前 → 目标 | 风险 | 说明 |
|----|------------|------|------|
| **xgplayer-hls** | ^2.5.2 → **3.0.26** | 中 | **必须做**。当前 2.x 与 xgplayer 3.x 不配套，应一起升到 3.0.26。HLS 插件 API 有变化。 |
| **pinia** | ^3.0.0 → **4.0.2** | 低 | 主要是清理与 peer 收紧（要求 vue≥3.5.11、typescript≥5.6）。项目 vue 3.5.x 满足，纯 JS 不受 TS 影响。**建议升**。 |
| **cropperjs** | ^1.6.2 → **2.1.1** | 高 | 2.x 是彻底重写（模块化 + Web Component 风格），API 与 1.x 不兼容。若项目用了图片裁剪（`scUpload` 等），改动量大。建议单独排期，不要顺手 bump。 |
| **esbuild** | ^0.27.7 → 0.28.1 | 中 | 0.28 有少量破坏性变更。**建议**：若业务代码未直接 import esbuild，直接**移除该 devDependency**，交给 Vite 8 内部管理，避免版本冲突；若确有自定义脚本用到，再升 0.28 并验证构建。 |

### ⚪ 保持稳定（无稳定版可升）
| 包 | 现状 | 说明 |
|----|------|------|
| @resvg/resvg-js | 2.6.2 | 仅 2.7.0-alpha，保持 stable |
| vue | 3.5.40 | 3.6.0 仅 rc，保持 3.5 线 |
| vue-i18n | 11.4.7 | 12.0 仅 alpha，保持 11 线 |
| xlsx | 0.18.5 | npm 停更，见下方专项 |

---

## 三、专项说明

### xlsx（SheetJS）—— npm 官方包已停更
npm 上的 `xlsx@0.18.5` 长期未更新。SheetJS 官方已转向自家 CDN 发布更新的 `0.20.x+`（含 bug 修复与新特性）。
- **现状可用**：如果当前导入/导出 Excel 功能正常，0.18.5 可继续用，不影响安全关键路径。
- **如需维护更新**：改用官方 CDN 安装，例如 `npm i xlsx@https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`；或评估迁移到 `exceljs`（API 不同但社区活跃）。
- 当前 `package.json` 用 `^0.18.5` 会被锁在 0.18 线，不会自动跳到 0.20，需注意。

### sass 1.80+ 移除 legacy API
- Vite 8 默认走现代 Sass 编译 API，一般无感。
- 若项目 `vite.config.js` 或任何地方显式使用 `sass` 的 legacy JS API（如 `sass.renderSync`、旧 `implementation` 配置），升级后会报弃用警告甚至失败。升级后跑一次 `npm run build` 留意警告。

### crypto-js 4.2.0
- npm 最新即 4.2.0，稳定可用。
- 历史上有 PBKDF2 弱实现类 CVE，多数已在 4.2 修复。项目若仅用其做 MD5 签名（`request.js` 拦截器里的 signature）或 AES，保持 4.2.0 即可；如涉及密钥派生，建议确认是否真需要 crypto-js，或改用 Web Crypto API。

### 版本配套关系（重点）
- **xgplayer ↔ xgplayer-hls**：播放器主包已是 3.x，但 HLS 插件还停在 2.x，二者应**同步升到 3.0.26**。
- **vue-router 5 ↔ vue / vite**：5.2.0 要求 vue≥3.5.34、vite≥8，当前均满足。
- **pinia 4 ↔ vue**：要求 vue≥3.5.11，满足。

---

## 四、推荐执行顺序

**第 1 步｜安全优先（立刻做）**
```bash
npm i axios@^1.18.1
npm i element-plus@^2.14.3 echarts@^6.1.0
npm i vite@^8.1.5 @vitejs/plugin-vue@^6.0.8
```
> 跑 `npm run build` + `npm run lint`，过一遍云桌面/图表/上传页。

**第 2 步｜批量小版本**
```bash
npm update        # 自动把 ^ 范围内的 minor/patch 升到最新
```
> 覆盖 vue-router、vue-i18n、eslint、eslint-plugin-vue、vue-eslint-parser、jsencrypt、pinyin-pro、@element-plus/icons-vue、xgplayer 等。

**第 3 步｜低风险的 major**
```bash
npm i pinia@^4.0.2
npm i xgplayer@^3.0.26 xgplayer-hls@^3.0.26   # 必须一起升
```
> 重点回归：播放器（HLS 视频）、Pinia store 相关页面（布局/多标签/语言切换）。

**第 4 步｜评估后决策**
- `esbuild`：确认有无直接 import，无则移除该 devDependency。
- `cropperjs`：排单独任务，按 2.x 新 API 改造图片裁剪组件。

**第 5 步｜复核**
```bash
npm outdated       # 复核实际安装版本与最新版差距
npm run build
```

---

## 五、不建议做的事
- 不要把 `vue` 升到 3.6.0-rc / `vue-i18n` 升到 12-alpha / `cropperjs` 顺手升 2.x —— 这些都是未完成或破坏性大的，等 stable 或单独排期。
- 不要直接 `npm i latest` 全量拉满，major 跳变会一次带进多个破坏性变更，难以定位问题。
