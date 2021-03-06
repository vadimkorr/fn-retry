const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const BUILD_DIR = path.resolve(__dirname, '../dist')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: BUILD_DIR,
    library: 'fn-retry',
    libraryExport: 'default',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            configFile: './babel.config.js',
          },
        },
      },
    ],
  },
  plugins: [new CleanWebpackPlugin()],
}
