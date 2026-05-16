# AGENTS.md — Scm.Vue

> Frontend repo of the Scm.Net rapid development framework.
> Backend: <https://gitee.com/leadiot/scm.net>

---

## Project Type

- Vue 3.5 + Vite 8 + Element Plus 2.13, pure JavaScript (no TypeScript).
- Enterprise admin/dashboard system supporting three layouts: `console`, `desktop`, and `monitor`.
- Single repo, not a monorepo.

---

## Dev Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (default <http://localhost:2800>) |
| `npm run serve` | Same as `dev` |
| `npm run build` | Production build (`dist/`, ESBuild minification) |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint check and auto-fix (`.vue`, `.js`, `.jsx`, `.cjs`, `.mjs`) |

> No test framework (no Vitest / Jest / Cypress / Playwright).

---

## Environment Variables

File precedence: `.env.production` > `.env.development` > `.env`

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE` | `http://localhost:5000` | Backend API address |
| `VITE_WEB_PORT` | `2800` | Frontend dev server port |
| `VITE_APP_PROXY` | `true` | Enable Vite proxy (`/api` → backend) |

> **Important**: All variables with `VITE_APP_OIDC_*` prefix (`OIDC_KEY`, `OIDC_AUTH`, `OIDC_LOGIN`, `OIDC_REDIRECT_URI`, etc.) are bound to third-party federated login via oidc.org.cn. **Do not modify** them, or the external login/authorization pages will break.

---

## Code Style & Conventions

- **Indentation**: `.editorconfig` enforces `indent_style = tab`, `indent_size = 4`, `end_of_line = lf`.
- **ESLint**: Flat config (`eslint.config.js`), very permissive: `indent` / `no-tabs` / `no-mixed-spaces-and-tabs` / `vue/no-unused-components` / `vue/multi-word-component-names` are all `off`.
- **Path alias**: `@/` maps to `src/` (configured in `vite.config.js` + `jsconfig.json`).
- **Global component registration**: Global business components (`scTable`, `scSearch`, `scUpload`, 40+ total) are centrally registered in `src/scui.js`, along with global properties (`$CONFIG`, `$TOOL`, `$HTTP`, `$API`, `$AUTH`, `$ROLE`). When adding a new global component or directive, always update `src/scui.js`.
- **Global directives**: `v-auth` (permission), `v-role` (role), `v-copy` (clipboard), `v-time` (time formatting).

---

## Routing Architecture

- **Hash mode**: `createWebHashHistory`, all routes start with `#/`.
- **Dynamic routes**: Menus and routes are loaded from the backend API (`tool.session.get("MENU")`) and injected dynamically after login. Static routes are only used for login, OAuth callback, and system pages (see `src/config/route.js`).
- **Layout switching**: `App.vue` switches layouts dynamically based on `route.meta.layout`: `layout/console`, `layout/desktop`, `layout/monitor`, or `layout/none`.
- **Component loading**: `loadComponent()` uses `import.meta.glob('@/views/**/*.vue')` to auto-match `@/views/{component}.vue` or `@/views/{component}/index.vue`.

---

## API Layer

- `src/api/index.js` uses `import.meta.glob("./model/**/*.js", { eager: true })` to **auto-import** all API modules under `src/api/model/**/*.js`.
- To add a new API module, simply create a `.js` file under `src/api/model/` — **no manual registration required**.
- HTTP wrapper is in `src/utils/request.js`: Axios interceptors automatically attach `appkey`, `timestamp`, and `signature` (MD5), and handle 401 redirects to login.

---

## State Management

- Pinia 3, stores located in `src/stores/`:
  - `global.js` — theme, layout, language, menu collapse
  - `keepAlive.js` — page cache
  - `viewTags.js` — multi-tab management
  - `iframe.js` — iframe page management

---

## Build & Deploy

- Vite config in `vite.config.js`:
  - `build.outDir: 'dist'`, `assetsDir: 'static'`
  - Production uses `esbuild` minification
  - Code split into multiple vendor chunks (vue-vendor, element-plus, echarts, xgplayer, xlsx, etc.)
- Production deploy: deploy the `dist/` directory to Nginx / IIS / any static file server.
- `.gitignore` excludes `dist/`, `node_modules/`, and IDE config files.

---

## Quick Reference

| Purpose | File |
|---------|------|
| App entry | `src/main.js` |
| Global components/directives registration | `src/scui.js` |
| Global config | `src/config/index.js` |
| Router + guards | `src/router/index.js` |
| Static routes config | `src/config/route.js` |
| HTTP request wrapper | `src/utils/request.js` |
| Permission utilities | `src/utils/permission.js` |
| Common utilities | `src/utils/tool.js` |
| Page views | `src/views/` |
| Business components | `src/components/` |
| API modules | `src/api/model/` |
| i18n | `src/locales/lang/` |
| Layout components | `src/layout/` |

---

## Common Pitfalls

1. **Modifying OIDC config breaks login**: Variables with `VITE_APP_OIDC_*` prefix in `.env` are bound to oidc.org.cn third-party login. Do not change them casually.
2. **Global components must be registered**: After creating a new component in `src/components/`, register it via `app.component()` in `src/scui.js` if it needs to be used globally.
3. **API module naming collision**: `src/api/index.js` auto-import uses `split("/").pop()` as the module name. Files with the same name in different subdirectories will overwrite each other (e.g. `src/api/model/foo/bar.js` vs `src/api/model/baz/bar.js`).
4. **No TypeScript**: This project is pure JS. Do not introduce `.ts` files or type declarations unless you first update the build config.
5. **No test suite**: Post-change validation relies on manual browsing via `npm run dev` or checking `npm run build` for build errors.
