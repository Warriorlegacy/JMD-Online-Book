# Multi-stage build for SBE Backend
FROM node:22-slim as backend-builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:22-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy built application
COPY --from=backend-builder /app /app

# Expose API port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Run migrations and seed on startup, then start the app
CMD ["sh", "-c", "node dist/migrate.js && node dist/seed.js && node dist/index.js"]
