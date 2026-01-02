# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Stage 2: Production Run
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
# Copy migrations (required for server startup)
COPY --from=builder /app/migrations ./migrations

# Create directory for SQLite data
RUN mkdir -p .data && chown -R node:node .data

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=sqlite:./.data/tradeapp.sqlite

# Expose port
EXPOSE 3000

# Volume for persistence
VOLUME ["/app/.data"]

# Switch to non-root user
USER node

# Start server
CMD ["node", "dist/server.js"]

