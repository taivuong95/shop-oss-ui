# Use Bun official image
FROM oven/bun:1.1.13-alpine AS builder

WORKDIR /app

# Copy only the necessary files first for better caching
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy the rest of your app
COPY . .

# Build your Next.js app
RUN bun run build

# Production image
FROM oven/bun:1.1.13-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built assets and dependencies from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["bun", "run", "start"]