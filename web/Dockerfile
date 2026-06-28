# =============================================================================
# STAGE 1 — Dependencies & Build
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests (Docker layer caching)
COPY package.json package-lock.json ./

# Install all dependencies (dev + prod)
RUN npm ci

# Copy the entire source tree
COPY . .

# Build the Next.js application with standalone tracing
RUN npm run build

# =============================================================================
# STAGE 2 — Runner image (minimal)
# =============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

# Copy standalone output — this includes the server, node_modules (prod only),
# and the compiled application code
COPY --from=builder /app/.next/standalone ./

# Copy static assets (not included in standalone by default)
COPY --from=builder /app/.next/static ./.next/static

# Copy public assets
COPY --from=builder /app/public ./public

# Drop privileges
USER appuser

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
