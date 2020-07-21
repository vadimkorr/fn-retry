const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const BUILD_DIR = path.resolve(__dirname, '../dist')
const modes = {
  prod: 'production',
  dev: 'development',
}

module.exports = {
  entry: './src/index.js',
  mode: modes[process.env.NODE_ENV] || 'production',
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
            presets: ['@babel/preset-env'],
            plugins: ['@babel/transform-runtime'],
          },
        },
      },
    ],
  },
  plugins: [new CleanWebpackPlugin()],
}
