# syntax=docker/dockerfile:1
# Cache bust: 2026-01-12 - Fixed Prisma client location

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Development image
FROM base AS dev
WORKDIR /app

# Install netcat for database health check
RUN apk add --no-cache netcat-openbsd

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (needs src/ folder to exist)
RUN npx prisma generate

# Copy and set up entrypoint script
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
# Fix line endings (in case of Windows CRLF) and make executable
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000
# Use full path for entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]

# Build the application
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (output goes to src/generated/prisma)
RUN npx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install netcat for database health check
RUN apk add --no-cache netcat-openbsd

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema for db push
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# Copy Prisma CLI and all its dependencies for db push command
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@electric-sql ./node_modules/@electric-sql
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@hono ./node_modules/@hono
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@mrleebo ./node_modules/@mrleebo
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/valibot ./node_modules/valibot
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/pathe ./node_modules/pathe
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/hono ./node_modules/hono
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/foreground-child ./node_modules/foreground-child
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/get-port-please ./node_modules/get-port-please
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/http-status-codes ./node_modules/http-status-codes
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/proper-lockfile ./node_modules/proper-lockfile
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/remeda ./node_modules/remeda
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/std-env ./node_modules/std-env
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/zeptomatch ./node_modules/zeptomatch
# Copy generated Prisma client (output is in src/generated/prisma)
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated
# Copy prisma config file
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts

# Copy and set up entrypoint script
COPY --chown=nextjs:nodejs scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
# Fix line endings (in case of Windows CRLF) and make executable
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use full path for entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "server.js"]



