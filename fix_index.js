const fs = require('fs');
const path = 'sbe/backend/src/index.ts';
let code = fs.readFileSync(path, 'utf8');

const target = `const fastify: FastifyInstance = Fastify({
  logger: true,
});

// Fail fast if JWT_SECRET is not set in production
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error("❌ JWT_SECRET environment variable is required in production");
    process.exit(1);
  }
  // In development, we'll use the secret but warn
  console.warn("⚠️  JWT_SECRET not set - using development secret (DO NOT USE IN PRODUCTION)");
}`;

const replacement = `import * as dotenv from 'dotenv';
dotenv.config();

const fastify: FastifyInstance = Fastify({
  logger: true,
});

// Fail fast if JWT_SECRET is not set in production
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error("❌ JWT_SECRET environment variable is required in production");
    process.exit(1);
  }
  // In development, we'll use the secret but warn
  console.warn("⚠️  JWT_SECRET not set - using development secret (DO NOT USE IN PRODUCTION)");
}`;

if (code.includes(target)) {
  fs.writeFileSync(path, code.replace(target, replacement));
  console.log("Replaced successfully");
} else {
  console.log("Target not found");
}
