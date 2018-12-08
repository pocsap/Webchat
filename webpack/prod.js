const path = require('path')
const precss = require('precss')
const webpack = require('webpack')
const autoprefixer = require('autoprefixer')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

const env = process.env.NODE_ENV || 'development'

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
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node-modules/,
      options: {
        cacheDirectory: true
      },
    }, {
      test: /\.scss$/,
      use: [
        'style-loader',
        'css-loader',
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
    }, {
      test: /\.css$/,
      use: [ 'style-loader', 'css-loader' ],
      exclude: /node_modules/,
    },{
      test: /\.(png|jpg|gif)$/i,
      use: [ 'url-loader' ],
      exclude: /node_modules/,
    }]
  },

  plugins: [
    new webpack.NamedModulesPlugin(),

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
      'process.env': { NODE_ENV: JSON.stringify(env) }
    }),
  ],

}
