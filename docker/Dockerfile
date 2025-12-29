FROM node:20-alpine AS builder

WORKDIR /app

# Set npm memory limits for low-RAM environments
ENV NODE_OPTIONS="--max-old-space-size=256"
ENV npm_config_cache=/tmp/.npm

COPY package*.json ./
# Use --prefer-offline and --no-audit to speed up
RUN npm ci --prefer-offline --no-audit --no-fund

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=128"

COPY package*.json ./
RUN npm ci --omit=dev --prefer-offline --no-audit --no-fund && \
    npm cache clean --force && \
    rm -rf /tmp/.npm

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]

