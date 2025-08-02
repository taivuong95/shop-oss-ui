# Install dependencies only when needed
FROM node:20-alpine AS builder
WORKDIR /app

# Copy only the dependency files first for better cache
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy the rest of your app
COPY . .

# Build your Next.js app
RUN yarn build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built assets and dependencies from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["yarn", "start"]