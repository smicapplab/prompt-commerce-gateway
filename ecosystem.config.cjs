// ─────────────────────────────────────────────────────────────────────────────
// Prompt Commerce Gateway — PM2 Ecosystem Config
// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  apps: [
    {
      name: 'prompt-commerce-gateway',

      // dist/main.js is the compiled output of src/main.ts.
      // main.ts loads dotenv/config as its first import, so .env is always
      // read before any NestJS module initialises — no tsx or --env-file needed.
      script: 'dist/main.js',

      // Always run in production mode
      env_production: {
        NODE_ENV: 'production',
      },

      // Logs — written to the logs/ directory created by run.sh
      error_file: 'logs/error.log',
      out_file:   'logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,

      // Restart policy
      restart_delay: 3000,
      max_restarts:  10,
      min_uptime:    '10s',

      // Graceful shutdown: wait up to 5 s for in-flight requests to finish
      kill_timeout: 5000,
    },
  ],
};
