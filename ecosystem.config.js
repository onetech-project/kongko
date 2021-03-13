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
        NODE_ENV: "production",
        REDISHOST: "ec2-54-195-32-196.eu-west-1.compute.amazonaws.com",
        REDISPORT: 8039,
        REDISPASSWORD:
          "p777f484304be694552231beb56d4752d8f610bedbe078d9e37430c0d48d9a720",
        APPNAME: "Kongko",
      },
    },
  ],
};
