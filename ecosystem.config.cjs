/**
 * PM2 ecosystem — Brillar Market
 *
 * Prerequisites:
 *   - MongoDB running and configured in backend/.env
 *   - backend/.env (PORT, MONGODB_URI, JWT_SECRET, CLIENT_URL, …)
 *   - frontend/.env.local for local dev (NEXT_PUBLIC_API_URL)
 *
 * Production (build before start):
 *   cd backend && npm ci && npm run build
 *   cd frontend && npm ci && npm run build
 *   pm2 start ecosystem.config.cjs --only brillar-api,brillar-web --env production
 *
 * Development (tsx + next dev):
 *   pm2 start ecosystem.config.cjs --only brillar-api-dev,brillar-web-dev
 *
 * Useful commands:
 *   pm2 status
 *   pm2 logs brillar-api
 *   pm2 restart brillar-api,brillar-web
 *   pm2 stop all
 *   pm2 delete all
 *
 * Logs are written to ./logs/
 */
const path = require('path');

const rootDir = __dirname;
const logsDir = path.join(rootDir, 'logs');

function logPaths(name) {
  return {
    error_file: path.join(logsDir, `${name}-error.log`),
    out_file: path.join(logsDir, `${name}-out.log`),
  };
}

const sharedPm2 = {
  instances: 1,
  exec_mode: 'fork',
  autorestart: true,
  watch: false,
  merge_logs: true,
  time: true,
  max_restarts: 10,
  restart_delay: 2000,
};

const apiEnv = {
  NODE_ENV: 'development',
  PORT: 5000,
};

const webEnv = {
  NODE_ENV: 'development',
  PORT: 3000,
  NEXT_PUBLIC_API_URL: 'http://localhost:5000/api',
};

module.exports = {
  apps: [
    // ── Production ──────────────────────────────────────────────────────────
    {
      name: 'brillar-api',
      cwd: path.join(rootDir, 'backend'),
      script: 'npm',
      args: 'run start',
      interpreter: 'none',
      max_memory_restart: '500M',
      ...sharedPm2,
      ...logPaths('api'),
      env: { ...apiEnv },
      env_development: { ...apiEnv },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
    {
      name: 'brillar-web',
      cwd: path.join(rootDir, 'frontend'),
      script: 'npm',
      args: 'run start -- -p 3000',
      interpreter: 'none',
      max_memory_restart: '1G',
      ...sharedPm2,
      ...logPaths('web'),
      env: { ...webEnv },
      env_development: { ...webEnv },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        // Set to your public API URL if the storefront is not on the same host.
        NEXT_PUBLIC_API_URL: 'http://localhost:5000/api',
      },
    },

    // ── Development (hot reload) ────────────────────────────────────────────
    {
      name: 'brillar-api-dev',
      cwd: path.join(rootDir, 'backend'),
      script: 'npm',
      args: 'run dev',
      interpreter: 'none',
      max_memory_restart: '500M',
      ...sharedPm2,
      ...logPaths('api-dev'),
      env: { ...apiEnv },
    },
    {
      name: 'brillar-web-dev',
      cwd: path.join(rootDir, 'frontend'),
      script: 'npm',
      args: 'run dev',
      interpreter: 'none',
      max_memory_restart: '1G',
      ...sharedPm2,
      ...logPaths('web-dev'),
      env: { ...webEnv },
    },
  ],
};
