# Dev image: Vite dev server with HMR (used by docker-compose.dev.yml).
# No production build here — faster image builds; Vite compiles on the fly.
FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
