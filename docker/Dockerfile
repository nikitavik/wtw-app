FROM node:20-alpine AS builder

WORKDIR /app

# Optimize for low-memory environments (1GB RAM total)
# Set heap size to 512MB, leaving room for OS (~200MB) and Docker (~300MB)
ENV NODE_OPTIONS="--max-old-space-size=512"
ENV npm_config_cache=/tmp/.npm

COPY package*.json ./
# Use --prefer-offline and --no-audit to speed up and reduce memory
RUN npm ci --prefer-offline --no-audit --no-fund

COPY . .
# Build with incremental compilation (already enabled in tsconfig.json)
RUN npm run build

# Clean up immediately after build to free memory
RUN rm -rf node_modules && \
    rm -rf /tmp/.npm && \
    rm -rf .git 2>/dev/null || true

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

CMD ["node", "dist/src/main.js"]

