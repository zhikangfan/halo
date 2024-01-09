const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
    chainWebpack: config => {
      config.module.rule('worker').test(/\.worker\.js$/).use('worker-loader').loader('worker-loader').options({
          inline: 'fallback',
          filename: 'workerName.[hash].worker.js'
      }).end()
    },
})
