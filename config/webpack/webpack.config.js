const path = require('path');

module.exports = {
  entry: './public/wv-configs/config.js',
  mode: 'development',
  devtool: 'inline-source-map',

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ]
  },
  output: {
    filename: 'config.out.js',
    path: path.resolve(__dirname, './public/wv-configs'),
  },
};

