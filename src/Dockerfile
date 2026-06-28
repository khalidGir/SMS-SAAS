# =============================================================================
# STAGE 1 — Build environment
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install build-time dependencies required by some native modules (bcrypt)
RUN apk add --no-cache python3 make g++

# Copy dependency manifests first (for Docker layer caching)
COPY package.json package-lock.json ./

# Install ALL dependencies (dev + prod) for Prisma client generation
RUN npm ci

# Copy source code and Prisma schema
COPY prisma/ prisma/
COPY prisma.config.ts ./
COPY src/ src/
COPY generated/ generated/

# Regenerate Prisma client for PostgreSQL target (ensures correct driver adapters)
RUN npx prisma generate

# Remove dev dependencies after build to slim the output node_modules
RUN npm prune --omit=dev

# =============================================================================
# STAGE 2 — Runner image
# =============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Create a non-root user for container security
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

# TZ data for cron scheduling
RUN apk add --no-cache tzdata

# Copy production node_modules (already pruned)
COPY --from=builder /app/node_modules ./node_modules

# Copy Prisma generated client (client binary + schema engine)
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Copy application source
COPY --from=builder /app/src ./src

# Copy and fix entrypoint permissions
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Drop privileges
USER appuser

EXPOSE 4000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "src/index.js"]
