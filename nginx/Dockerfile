# Production image: build Vite app, then serve static files with nginx.
# Build context must be the repository root (see docker-compose.prd.yml).

FROM node:20-alpine AS builder
WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./

# Same-origin API in browser: axios baseURL /api -> nginx proxies to backend
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/prd.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
