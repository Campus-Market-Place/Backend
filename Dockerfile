# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim AS build

WORKDIR /app
ENV npm_config_update_notifier=false

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg62-turbo-dev \
    libgif-dev \
    librsvg2-dev \
    libimage-exiftool-perl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts prisma.js ./

RUN npm ci

COPY src ./src
COPY eng.traineddata ./eng.traineddata

RUN npm run build
RUN npm prune --omit=dev


FROM node:22-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production
ENV npm_config_update_notifier=false

RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    libimage-exiftool-perl \
    && rm -rf /var/lib/apt/lists/*

COPY prisma ./prisma
COPY prisma.config.ts prisma.js ./

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/eng.traineddata ./eng.traineddata

EXPOSE 3000

CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && node dist/server.js"]