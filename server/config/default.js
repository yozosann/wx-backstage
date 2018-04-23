const path = require('path');
const projectConfig = require('../../project.config');

module.exports = {
    projectConfig: projectConfig,
    // 启动端口，PORT优先
    port: +process.env.PORT || 9999,
    apiConfig: null,
    mainHtml: 'index.html',

    assetDir: path.resolve("static"),
    assetDirAbsolute: path.join(__dirname, '../../static'),
};
