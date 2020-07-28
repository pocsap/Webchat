const path = require('path')
const webpack = require('webpack')
const ProgressBarPlugin = require('progress-bar-webpack-plugin')

const env = process.env.NODE_ENV || 'development'

module.exports = {

  entry: ['./src/script.js'],

  // !!! If "eval" is included, syntax-error is happened during the execution of webpack-dev-server.
  //devtool: 'cheap-module-eval-source-map',
  devtool: 'source-map',

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
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        // !!! Following solutions to polyfill the objects that are used by webpack-dev-server in order to make it available in IE11 did not work at all.
        // !!! However it was possible to make it availavble in IE by just downgrading "query-string" from ^6.2.0 to ^5.0.1.
        // !!! It was not necessary to modify "ansi-regex" and "strip-ansi" in this webchat.
        //exclude: /node_modules\/(?!(color-convert|ansi-html|ansi-styles|strip-ansi|ansi-regex|debug|react-dev-utils|chalk)\/).*/,
        /*
        include: [
          path.join( __dirname, '../src' ),
          path.join( __dirname, '../node_modules' )
        ],
        */
        options: {
          presets: ['@babel/react'],
          cacheDirectory: true,
        },
      }, 
      {
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
      }
    ],
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
