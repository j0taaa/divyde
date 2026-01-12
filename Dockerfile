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

# Prisma CLI installer - installs prisma with all dependencies
FROM base AS prisma-installer
WORKDIR /app
RUN npm install prisma@7.2.0

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
# Copy Prisma CLI with all dependencies from the installer stage
COPY --from=prisma-installer --chown=nextjs:nodejs /app/node_modules ./node_modules
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



