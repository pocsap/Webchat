const path = require('path')
const webpack = require('webpack')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')

const env = process.env.NODE_ENV || 'development'

module.exports = {

  entry: [ './src/script.js' ],

  devtool: 'cheap-module-source-map',

  resolve: {
    modules: ['../src', '../node_modules'].map(p => path.resolve(__dirname, p)),
  },

  output: {
    path: path.join(__dirname, '../dist'),
    filename: 'webchat.js',
    publicPath: '/dist/',
  },

  devServer : {
    port            : 8000,                         // ポートを指定
    progress        : true,                         // 変換の進捗をコンソールに表示
    inline          : true,                         // インライン/iframeモードの指定(通常インラインでいい)
    clientLogLevel  : 'info',                       // バンドル作成に関するログのレベル(none, error, warning, info)
    contentBase     : path.join(__dirname, '/'),    // サーバの基準パス(ドキュメントルート)
    publicPath      : '/',                          // オンメモリのバンドルファイルの仮想的なパス
    hot             : true,                         // HMRの利用
    watchOptions    : {
        poll            : true,                      // ファイルの更新が正しく検知されない場合に利用
        ignored: /node_modules/
    },
    disableHostCheck: true,                          // webpack-dev-serverで起動したアプリが「Invalid Host header」と表示される場合の対処法 (https://qiita.com/yutasuzuki0206/items/542390f7a046772262fe)
  },

  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node-modules/,
      options: {
        presets: ['@babel/preset-react'],
        cacheDirectory: true,
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
    }],
  },

  plugins: [
    new ProgressBarPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': { NODE_ENV: JSON.stringify(env) },
    }),
  ],

}
