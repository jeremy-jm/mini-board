FROM node:20-alpine
WORKDIR /app

# 接收构建参数
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run prisma:generate
RUN npm run build

EXPOSE 3001
CMD ["sh", "-c", "npx prisma db push && npm run prisma:seed && npm run start"]