# Mini board (server,client)

### 本地开发（非 Docker）

1. 启动 PostgreSQL（本地或容器）
2. 后端初始化并启动：
   - `cd backend`
   - `cp .env.example .env`
   - `npm install`
   - `npm run prisma:generate`
   - `npm run prisma:push`
   - `npm run prisma:seed`
   - `npm run dev`
3. 前端启动：
   - `cd frontend`
   - `npm install`
   - `npm run dev`

### Docker 一键启动

`docker-compose up --build`
