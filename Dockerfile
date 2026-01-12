# syntax=docker/dockerfile:1
# Simple, reliable Next.js + Prisma runtime image (no standalone node_modules clobbering)

FROM node:20-alpine AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Dev image (used by docker-compose target: dev)
FROM base AS dev
RUN apk add --no-cache libc6-compat openssl

# Install deps (including dev deps for Next tooling)
COPY package.json package-lock.json prisma.config.ts ./
RUN npm ci

# Copy and set up entrypoint script (so Prisma db push can run on startup)
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
# Fix line endings (in case of Windows CRLF) and make executable
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

# App source (will be bind-mounted in compose, but included for completeness)
COPY . .

EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0", "-p", "3000"]

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl

# Copy package files and install deps (includes dev deps for build tooling)
COPY package.json package-lock.json ./
RUN npm ci

# Build the application
FROM base AS builder
RUN apk add --no-cache libc6-compat openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (output goes to src/generated/prisma)
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
RUN apk add --no-cache libc6-compat openssl
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install production dependencies (Prisma CLI is in dependencies)
COPY --chown=nextjs:nodejs package.json package-lock.json prisma.config.ts ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated

# Copy and set up entrypoint script
COPY --chown=nextjs:nodejs scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
# Fix line endings (in case of Windows CRLF) and make executable
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

# Use full path for entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]