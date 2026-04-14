# --- Stage 1: Build the Rust Matching Engine ---
FROM rust:1.81-slim-bullseye as engine-builder
WORKDIR /app/engine
COPY engine/ .
RUN cargo build --release

# --- Stage 2: Build the Node.js Backend ---
FROM node:22-slim as backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
RUN npm run build # Assuming a build script exists for TS

# --- Stage 3: Final Production Image ---
FROM node:22-slim
WORKDIR /app

# Install system dependencies if any
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Copy from builders
COPY --from=backend-builder /app/backend /app/backend
COPY --from=engine-builder /app/engine/target/release/sbe-engine /app/backend/bin/sbe-engine

WORKDIR /app/backend
EXPOSE 4000

# Start command
CMD ["node", "dist/index.js"]
