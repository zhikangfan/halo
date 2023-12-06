const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
    chainWebpack: config => {
        config.module
            .rule('wasm')
            .test(/\.wasm$/)
            .use('file-loader')
            .loader('file-loader')
            .end();
    },
})
