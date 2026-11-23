# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# 1. Install dependencies (monorepo workspaces included)
FROM base AS deps
COPY package.json package-lock.json ./
COPY packages/tokens/package.json ./packages/tokens/package.json
COPY packages/icons/package.json ./packages/icons/package.json
COPY packages/ui/package.json ./packages/ui/package.json
RUN npm ci --legacy-peer-deps

# 2. Build 3-tier tokens, publishable packages, and Next.js standalone app
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build:packages
RUN npm run verify:wcag
RUN npm run build

# 3. Production runner (non-root, minimal footprint for Ubuntu Server / Coolify)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

CMD ["node", "server.js"]
