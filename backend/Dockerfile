FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run prisma:generate
RUN npm run build

EXPOSE 3001
CMD ["sh", "-c", "npx prisma db push && npm run prisma:seed && npm run start"]