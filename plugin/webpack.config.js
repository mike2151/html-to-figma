const path = require('path');

module.exports = {
  mode: 'production',
  entry: './code.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'code.js',
    path: path.resolve(__dirname, '.'),
  },
};