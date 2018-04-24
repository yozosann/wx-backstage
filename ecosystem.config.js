module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [

    // First application
    {
      name      : 'wx-backstage',
      script    : './server/index.js',
      env: {
        "NODE_CONFIG_DIR": "./server/config",
        "NODE_ENV": "test"
      },
      env_production : {
        "NODE_CONFIG_DIR": "./server/config",
        "NODE_ENV": "production"
      }
    }
  ],

  /**
   * Deployment section
   * http://pm2.keymetrics.io/docs/usage/deployment/
   */
  deploy : {
    production : {
      user : 'root',
      host : '140.82.43.167',
      ref  : 'origin/master',
      repo : 'git@github.com:yozosann/wx-backstage.git',
      path : '/root/www/production',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    },
    dev : {
      user : 'node',
      host : '212.83.163.1',
      ref  : 'origin/master',
      repo : 'git@github.com:repo.git',
      path : '/var/www/development',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env dev',
      env  : {
        NODE_ENV: 'dev'
      }
    }
  }
};
