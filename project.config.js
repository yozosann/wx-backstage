const path = require('path');

module.exports = {
  title: 'yozosann s wx backstage',
  pathConfig: {
    favicon: path.resolve(__dirname, 'src/favicon.ico'),
    global: path.resolve(__dirname, 'src/global/index.js'),
  }
}
