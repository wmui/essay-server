module.exports = {
  apps: [
    {
      name: 'essay-server',
      script: 'start.js',
      env: {
        COMMON_VARIABLE: 'true'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ],
  deploy: {
    production: {
      user: 'root',
      host: '118.193.175.253',
      ref: 'origin/master',
      repo: 'git@github.com:wmui/essay-server.git',
      path: '/www/essay-server',
      'post-deploy': 'yarn && pm2 reload ecosystem.config.js --env production'
    }
  }
}
