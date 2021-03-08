module.exports = {
  apps: [
    {
      name: "Kongko",
      script: "server.js",
      instances: "1",
      autorestart: true,
      watch: true,
      max_memory_restart: "1G",
      out_file: "../log/app.log",
      error_file: "../log/err.log",
      env: {
        NODE_ENV: "development",
        REDISHOST: "localhost",
        REDISPORT: 6379,
        PORT: 3000,
        APPNAME: "KONGKO",
      },
      env_production: {
        NODE_ENV: "production",
        REDISHOST: "kongko.heroku.com",
        REDISPORT: 80,
        PORT: 3000,
        APPNAME: "KONGKO",
      },
    },
  ],
};
