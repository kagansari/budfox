module.exports = {
  configureWebpack: {
    entry: './src/client/main.js',
    devtool: 'source-map'
  },
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].template = './src/client/public/index.html'
        return args
      })
  }
}