const path = require('path')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const env = process.env.NODE_ENV || 'production'

module.exports = {
  // mode (since webpack4) にはproductionとdevelopmentがあります。 
  //productionは最適化オプションであるwebpack.optimizationのプラグインが有効になります。そのため、今まで指定していたwebpack.optimize.UglifyJsPluginは不要となります。
  mode: 'production',

  entry: [ './src/script.js' ],

  resolve: {
    modules: ['../src', '../node_modules'].map(p => path.resolve(__dirname, p)),
  },

  output: {
    path: path.join(__dirname, '../dist'),
    filename: 'webchat.js',
    publicPath: '/dist/',
  },

  module: {
    rules: [
    {
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node-modules/,
      options: {
        presets: ['@babel/preset-react'],
        cacheDirectory: true
      },
    },
    {
      test: /\.scss$/,
      use: [
        'style-loader',
        { loader: 'css-loader', options: { minimize: true } },
        {
          loader: 'postcss-loader',
          options: {
            ident: 'postcss',
            plugins: () => [require('autoprefixer')],
          },
        },
        'sass-loader',
      ],
      exclude: /node_modules/,
    }, 
    {
      test: /\.css$/,
      use: [ 'style-loader', 'css-loader' ],
      exclude: /node_modules/,
    },
    {
      test: /\.(png|jpg|gif)$/i,
      use: [ 'url-loader' ],
      exclude: /node_modules/,
    }]
  },

  plugins: [
    new ProgressBarPlugin(),
    //new webpack.NamedModulesPlugin(), //HMRを使用している時、moduleの相対パスを表示してくれる(HMRを入れる時にこいつも入れるよう推奨されている)

    new webpack.optimize.OccurrenceOrderPlugin(),
    // The following option is redundant in webpack 2, according to https://github.com/webpack/docs/wiki/optimization
    //new webpack.optimize.DedupePlugin(),

    /* 
    // Comment out due to the error: Error: webpack.optimize.UglifyJsPlugin has been removed, please use config.optimization.minimize instead.
    // Replaced by the option "mode = 'prodoction'".
    new webpack.optimize.UglifyJsPlugin({
      compressor: { warnings: false },
      minimize: true,
    }),
    */

    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify(env) },
    }),
  ],
}
