FROM node:22-bookworm-slim AS deps

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        python3 \
        make \
        g++ \
        libcairo2 \
        libjpeg62-turbo \
        libpango-1.0-0 \
        libgif7 \
        librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm ci --ignore-scripts

FROM deps AS build

ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/campus_marketplace?schema=public

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src ./src
COPY lib ./lib
COPY api ./api

RUN npm run build
RUN npm prune --omit=dev

FROM node:22-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        libcairo2 \
        libjpeg62-turbo \
        libpango-1.0-0 \
        libgif7 \
        librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./

EXPOSE 3000

CMD ["sh", "-c", "npm run prisma:migrate:prod && npm start"]