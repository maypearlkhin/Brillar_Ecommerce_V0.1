/**
 * PM2 ecosystem file for Brillar Ecommerce
 *
 * Production (build first):
 *   cd backend && npm run build
 *   cd frontend && npm run build
 *   pm2 start ecosystem.config.cjs --only brillar-api,brillar-web --env production
 *
 * Development:
 *   pm2 start ecosystem.config.cjs --only brillar-api-dev,brillar-web-dev
 *
 * Common commands:
 *   pm2 status
 *   pm2 logs
 *   pm2 restart all
 *   pm2 stop all
 *   pm2 delete all
 */
const path = require('path');

const logsDir = path.join(__dirname, 'logs');

function logFiles(name) {
  return {
    error_file: path.join(logsDir, `${name}-error.log`),
    out_file: path.join(logsDir, `${name}-out.log`),
  };
}

module.exports = {
  apps: [
    {
      name: 'brillar-api',
      cwd: './backend',
      script: 'npm',
      args: 'run start',
      interpreter: 'none',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      ...logFiles('api'),
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
    {
      name: 'brillar-web',
      cwd: './frontend',
      script: 'npm',
      args: 'run start -- -p 3000',
      interpreter: 'none',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      ...logFiles('web'),
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://localhost:5000/api',
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://localhost:5000/api',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://localhost:5000/api',
      },
    },
    {
      name: 'brillar-api-dev',
      cwd: './backend',
      script: 'npm',
      args: 'run dev',
      interpreter: 'none',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      ...logFiles('api-dev'),
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
    },
    {
      name: 'brillar-web-dev',
      cwd: './frontend',
      script: 'npm',
      args: 'run dev',
      interpreter: 'none',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      ...logFiles('web-dev'),
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://localhost:5000/api',
      },
    },
  ],
};
