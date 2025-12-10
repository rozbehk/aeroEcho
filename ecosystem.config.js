module.exports = {
  apps: [
    {
      name: "aeroecho-backend",
      cwd: "./backend",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 4001,
        HOST: "127.0.0.1",
      },
    },
    {
      name: "aeroecho-frontend",
      cwd: "./frontend",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
  ],
};
