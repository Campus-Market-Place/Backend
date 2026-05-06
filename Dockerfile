FROM node:20-bookworm-slim

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# 👇 COPY prisma FIRST (important)
COPY prisma ./prisma
COPY prisma.config.ts ./ 
 # if you use it

# 👇 Then package files
COPY package*.json ./

# Install dependencies (now prisma works)
RUN npm install

# Copy rest of app
COPY . .

# Generate prisma client (safe now)
RUN npx prisma generate

# Build app
RUN npm run build

ENV NODE_ENV=production

EXPOSE 3000

CMD ["npm", "start"]