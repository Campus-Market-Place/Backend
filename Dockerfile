FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY dist ./dist
COPY prisma ./prisma
COPY prisma.config.ts prisma.js ./

RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/server.js"]
