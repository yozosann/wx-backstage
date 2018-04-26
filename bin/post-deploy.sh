#!/bin/bash

pm2 stop wx-backstage

if [ -z $NODE_ENV ]
then
    NODE_ENV="test"
fi

echo "============================================================================"
echo "打包环境: $NODE_ENV"
echo "============================================================================"

echo "安装node_modules..."
# yarn
# yarn cache dir
# npm rebuild node-sass
npm install

echo "开始打包..."
NODE_ENV=$NODE_ENV npm run build
echo "打包成功!"

pm2 reload ecosystem.config.js --env $NODE_ENV