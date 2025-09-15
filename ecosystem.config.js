// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "az-cars-backend",
      script: "src/index.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        // add fixed env vars here if you don't rely on .env
      },
    },
  ],
};
