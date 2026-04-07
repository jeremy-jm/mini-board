# mini-board

**English** · [简体中文](README.zh-CN.md)

## Introduction

**mini-board** is a single-page task board (SPA) with Trello-like basics: three columns (Todo / In Progress / Done), cards, drag-and-drop to change status and reorder within a column, and persistence via a backend API to **PostgreSQL** so a refresh does not lose data.

It targets the “minimal task board” assignment while going beyond must-haves with typed APIs, containerization, i18n, theming, and similar engineering practices.

## Features

- Three-column board and cards: title, description, created time
- Tasks: create (modal), edit, delete
- Drag-and-drop: cross-column status changes and intra-column reorder; optimistic updates with rollback and error toasts on failure
- Extended fields (bonus-oriented): assignee (avatar), priority, due date (overdue highlight for non-done tasks)
- Persistence: REST API + PostgreSQL (not localStorage-only)

## Stack & main dependencies

| Layer          | Tech / libraries                    |
| -------------- | ----------------------------------- |
| Frontend       | React 19, TypeScript                |
| Build          | Vite 8                              |
| State          | Redux Toolkit, react-redux          |
| DnD            | @dnd-kit/core, @dnd-kit/sortable    |
| UI / styling   | Ant Design 6, Tailwind CSS 4        |
| HTTP           | axios                               |
| i18n           | i18next, react-i18next (zh-CN / en) |
| Backend        | Node.js, Fastify 5                  |
| Validation     | zod                                 |
| ORM / DB       | Prisma, PostgreSQL                  |
| Frontend tests | Vitest, Testing Library             |
| Backend tests  | Vitest, supertest (route injection) |

## Architecture (brief)

The board and forms use **Redux** for task state; **dnd-kit** powers drag-and-drop behind reusable draggable cards and droppable columns. The UI calls Fastify `/api` via **axios**; **Prisma** talks to PostgreSQL with stable per-column ordering via `status` + `order`. DnD uses optimistic updates; failed reorder rolls back only the affected columns and shows an error.

## Bonus items (vs. assignment)

- **A — Backend & persistence:** **Node.js + Fastify + TypeScript** CRUD for tasks/members and batch reorder; **PostgreSQL** with **Prisma**; **not** localStorage as the sole store.
- **B — Engineering & Docker:** **Dockerfiles** for frontend/backend and **`docker-compose`** to run app + DB; production-like **nginx + static assets** (see “Production-like” below).

Extras (beyond minimum):

- zh/en UI, light/dark theme (`class`-based, aligned with system `prefers-color-scheme` where applicable)
- Structured API errors, unified client error handling, skeleton loading, button loading states
- Performance: e.g. `React.memo`, column-scoped `useSelector`, Vite chunking, lazy-loaded board
- Frontend and backend Vitest (frontend unit tests + backend services/routes)

## How to use

### Local development (no Docker)

1. Run **PostgreSQL** (locally or in a container) and ensure the database name matches your URL (default in compose: `miniboard`).
2. Create `backend/.env` with at least:

   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/miniboard?schema=public"
   ```

   Adjust user, password, and port to match your instance.

3. Backend:

   ```bash
   cd backend
   npm install
   npm run prisma:generate
   npm run prisma:push
   npm run prisma:seed
   npm run dev
   ```

4. Frontend:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. Open the URL Vite prints (usually `http://localhost:5173`). The dev server proxies API calls (see [`frontend/vite.config.ts`](frontend/vite.config.ts)).

**Note:** If pulling Docker base images fails (e.g. in restricted networks), configure a registry mirror or use local Node + Postgres;

### Docker (development stack)

The root `docker-compose.yml` includes the dev stack. Recommended:

```bash
docker compose up --build
# or: dev/prd
docker compose -f docker-compose.dev.yml up --build

```

- Frontend: `http://localhost:5173`
- API: `http://localhost:3001/api/...`
- `VITE_PROXY_TARGET` points the Vite proxy at the `backend` service (see [`frontend/vite.config.ts`](frontend/vite.config.ts)).

### Production-like (nginx)

Nginx serves the built SPA and proxies `/api` to the backend (DB often not published to the host):

```bash
docker compose -f docker-compose.prd.yml up --build -d
```

App URL: `http://localhost:8080` (confirm in `docker-compose.prd.yml`).

### Volumes & backups

Data lives in Docker **volumes**, not in the image. Export/backup and `down -v` caveats: [**docs/docker-data.md**](docs/docker-data.md).

## GitHub Actions (CI + image publish)

This repository includes two workflows:

- `CI` (`.github/workflows/ci.yml`)
  - Trigger: `pull_request` to `dev` / `master`, and `push` to `dev` / `master`
  - Frontend job: `npm ci` + `npm run lint` + `npm run test` + `npm run build`
  - Backend job: `npm ci` + `npm run test` + `npm run build` (includes PostgreSQL service for tests)
- `Publish Images` (`.github/workflows/publish-images.yml`)
  - Trigger: `push` to `dev` / `master`, and manual `workflow_dispatch`
  - Builds and pushes 3 images to GHCR:
    - `ghcr.io/<owner>/mini-board-frontend`
    - `ghcr.io/<owner>/mini-board-backend`
    - `ghcr.io/<owner>/mini-board-nginx`
  - Channel tags:
    - `dev` branch pushes `dev`
    - `master` branch pushes `prd` and `latest`

### GHCR permissions

- Uses built-in `GITHUB_TOKEN` to publish packages.
- Workflow permissions include:
  - `contents: read`
  - `packages: write`
- If your repository is under an organization, ensure org/repo Actions policies allow publishing to GHCR packages.

### Quick verification

1. Open a PR to `dev` or `master` and confirm the `CI` workflow passes.
2. Push to `dev` and confirm image tags include `dev`.
3. Merge/push to `master` and confirm image tags include `prd` and `latest`.
4. In GHCR package list, verify image tags include:
   - commit SHA tag (e.g. `sha-<commit>`)
   - branch tag (for branch builds)
   - `latest` for default branch

## Related files

| File                                               | Purpose                               |
| -------------------------------------------------- | ------------------------------------- |
| [`docker-compose.dev.yml`](docker-compose.dev.yml) | Dev: Vite + backend + Postgres        |
| [`docker-compose.prd.yml`](docker-compose.prd.yml) | Prod-like: nginx + backend + Postgres |
| [`homework.md`](homework.md)                       | Original assignment text              |
