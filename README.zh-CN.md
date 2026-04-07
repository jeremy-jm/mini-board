# mini-board（极简任务看板）

[English](README.md) · **简体中文**

## 简介与目的

**mini-board** 是一个单页（SPA）任务看板应用，交互上有 Trello 的基础能力：三列状态（Todo / In Progress / Done）、卡片式任务、拖拽改状态与同列排序，数据通过后端 API 写入 **PostgreSQL**，刷新页面不丢失。

本项目用于完成课程/作业中的「极简任务看板」要求，并在必做功能之外补充工程化与可维护性实践（类型安全的 API、容器化、国际化与主题等）。

## 核心功能

- 三栏看板与任务卡片：标题、描述、创建时间  
- 任务：新增（弹窗）、编辑、删除  
- 拖拽：跨列变更状态、同列手动排序；乐观更新，失败回滚并提示  
- 扩展字段（作业加分方向）：负责人（头像）、优先级、截止日期（未完成任务逾期标红）  
- 持久化：REST API + PostgreSQL（非 localStorage）

## 技术栈与主要依赖

| 层级 | 技术 / 库 |
|------|-----------|
| 前端框架 | React 19、TypeScript |
| 构建 | Vite 8 |
| 状态 | Redux Toolkit、react-redux |
| 拖拽 | @dnd-kit/core、@dnd-kit/sortable |
| UI / 样式 | Ant Design 6、Tailwind CSS 4 |
| 请求 | axios |
| 国际化 | i18next、react-i18next（zh-CN / en） |
| 后端运行时 | Node.js、Fastify 5 |
| 校验 | zod |
| ORM / 数据库 | Prisma、PostgreSQL |
| 前端测试 | Vitest、Testing Library |
| 后端测试 | Vitest、supertest（路由注入） |

## 架构简述

浏览器中的看板与表单通过 **Redux** 管理任务列表；**dnd-kit** 负责拖拽，封装为可复用的可拖卡片与可投放列。用户操作经 **axios** 调用 Fastify 暴露的 `/api`；服务端用 **Prisma** 访问 PostgreSQL，任务按 `status` + `order` 做列内排序。拖拽采用乐观更新，排序失败时仅回滚受影响的列并提示错误。

## 加分项完成情况（对照作业说明）

作业中的**进阶要求**与实现对应关系如下：

- **维度 A — 后端与持久化**：使用 **Node.js + Fastify + TypeScript** 提供任务与成员的增删改查及批量重排接口；数据存储在 **PostgreSQL**，通过 **Prisma** 建模与迁移，**不使用 localStorage 作为唯一数据源**。  
- **维度 B — 工程化与容器化**：提供前后端 **Dockerfile**，以及 **`docker-compose`** 一键启动前端、后端与数据库；另有接近生产环境的 **nginx + 静态资源** 编排（见下文「生产形态」）。

在此基础上额外完成（非作业最低要求、便于 Code Review 展示）：

- 中英文界面、浅色/深色主题（`class` 策略，与系统 `prefers-color-scheme` 协同）  
- 结构化错误响应与前端统一错误提示、首屏骨架与按钮 loading  
- 性能相关：卡片 `React.memo`、按列精确 `useSelector`、Vite 分包与看板懒加载等（见代码）  
- 前后端 Vitest 测试（前端单测 + 后端服务与路由层）

## 如何使用（How to use）

### 本地开发（不使用 Docker）

1. 本机或容器启动 **PostgreSQL**，并创建与连接串一致的数据库（compose 默认库名为 `miniboard`）。  
2. 在 `backend` 目录创建 `.env`，至少配置：

   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/miniboard?schema=public"
   ```

   用户名、密码、端口请与你的 Postgres 实例一致。  
3. 后端：

   ```bash
   cd backend
   npm install
   npm run prisma:generate
   npm run prisma:push
   npm run prisma:seed
   npm run dev
   ```

4. 前端：

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. 浏览器访问 Vite 提示的地址（一般为 `http://localhost:5173`）。开发环境下前端通过代理访问后端 API（见 `frontend/vite.config.ts`）。

**说明**：若无法从国内网络拉取 Docker 基础镜像，可为 Docker 配置镜像加速或使用本机 Node + Postgres 开发；。

### Docker 一键启动（开发栈）

仓库根目录默认 `docker-compose.yml` 会包含开发编排。推荐：

```bash
docker compose -f docker-compose.dev.yml up --build
# 或：docker compose up --build
```

- 前端：`http://localhost:5173`  
- API：`http://localhost:3001/api/...`  
- Compose 内通过服务名 `backend` 配置 Vite 的 `VITE_PROXY_TARGET`，见 [`frontend/vite.config.ts`](frontend/vite.config.ts)。

### 生产形态（nginx）

静态资源由 nginx 提供，并将 `/api` 反代到后端（主机上通常只暴露 80/8080，数据库不映射到宿主机）：

```bash
docker compose -f docker-compose.prd.yml up --build -d
```

访问：`http://localhost:8080`（具体以 `docker-compose.prd.yml` 为准）。

### 数据卷与备份

数据保存在 Docker **volume** 中，不在镜像内。导出、备份与 `down -v` 风险说明见 [**docs/docker-data.md**](docs/docker-data.md)。

## GitHub Actions（CI + 镜像发布）

仓库已包含两个工作流：

- `CI`（`.github/workflows/ci.yml`）
  - 触发：`pull_request` 到 `dev` / `master`，以及 `push` 到 `dev` / `master`
  - 前端任务：`npm ci` + `npm run lint` + `npm run test` + `npm run build`
  - 后端任务：`npm ci` + `npm run test` + `npm run build`（测试阶段包含 PostgreSQL service）
- `Publish Images`（`.github/workflows/publish-images.yml`）
  - 触发：`push` 到 `dev` / `master`，以及手动 `workflow_dispatch`
  - 构建并推送 3 个 GHCR 镜像：
    - `ghcr.io/<owner>/mini-board-frontend`
    - `ghcr.io/<owner>/mini-board-backend`
    - `ghcr.io/<owner>/mini-board-nginx`
  - 通道标签策略：
    - `dev` 分支推送 `dev`
    - `master` 分支推送 `prd` 和 `latest`

### GHCR 权限说明

- 使用内置 `GITHUB_TOKEN` 发布 packages。
- Workflow 需要以下权限：
  - `contents: read`
  - `packages: write`
- 若仓库在组织下，请确认组织/仓库的 Actions 策略允许发布到 GHCR。

### 快速验证

1. 提交 PR 到 `dev` 或 `master`，确认 `CI` 通过。
2. 推送到 `dev`，确认 GHCR 镜像出现 `dev` 标签。
3. 合并或推送到 `master`，确认 GHCR 镜像出现 `prd` 与 `latest` 标签。
4. 在 GHCR 中抽查镜像 tag 是否包含：
   - `sha-<commit>`（提交哈希标签）
   - 分支标签（branch tag）
   - 默认分支下的 `latest`

## 相关文件

| 文件 | 内容 |
|------|------|
| [`docker-compose.dev.yml`](docker-compose.dev.yml) | 开发：Vite + backend + Postgres |
| [`docker-compose.prd.yml`](docker-compose.prd.yml) | 生产形态：nginx + backend + Postgres |
| [`homework.md`](homework.md) | 作业原文要求 |
