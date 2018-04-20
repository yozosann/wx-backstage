const NODE_ENV = process.env.NODE_ENV || 'development';

const defaultConfig = require('./default');
const config = require(`./${NODE_ENV}`);

module.exports = Object.assign({}, defaultConfig, config)
