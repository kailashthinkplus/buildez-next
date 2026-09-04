module.exports = {
  apps: [
    {
      name: "buildezy",
      cwd: "/var/www/buildezy/apps/web-app",
      script: "/usr/local/bin/node",
      args: "node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3100",
      interpreter: "none",
      uid: "buildezy",
      gid: "buildezy",
      env: {
        NODE_ENV: "production",
        HOSTNAME: "127.0.0.1",
        PORT: "3100",
      },
      autorestart: true,
      max_memory_restart: "2G",
      kill_timeout: 15000,
      listen_timeout: 20000,
      time: true,
    },
  ],
};
