const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  entry: './index.web.js',
  mode: 'development',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, 'web-build'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.web.js', '.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      'react-native$': 'react-native-web',
      'react-native/Libraries/Image/resolveAssetSource': 'react-native-web/dist/exports/Image/resolveAssetSource',
      'react-native/Libraries/Image/AssetRegistry': 'react-native-web/dist/exports/Image/AssetRegistry',
      'react-native/Libraries/Image/AssetSourceResolver': 'react-native-web/dist/exports/Image/AssetSourceResolver',
      'react-native-sound$': path.resolve(__dirname, 'src/utils/audioPlayer.web.stub.ts'),
      '@react-native-community/google-signin$': path.resolve(__dirname, 'src/services/auth.web.stub.js'),
      'react-native-fbsdk-next$': path.resolve(__dirname, 'src/services/auth.web.stub.js'),
    },
    fallback: {
      'fs': false,
      'path': false,
      'crypto': false,
      'stream': false,
      'util': false,
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules\/(?!(react-native|@react-native|react-native-web|react-native-sound)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: [
              ['module-resolver', {
                root: ['./src'],
                extensions: ['.ios.js', '.android.js', '.web.js', '.js', '.ts', '.tsx', '.json'],
                alias: {
                  '@': './src',
                },
              }],
              ['@babel/plugin-proposal-class-properties', { loose: true }],
            ],
          },
        },
      },
      {
        test: /\.(js|jsx)$/,
        include: /node_modules\/react-native/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
            ],
            plugins: [
              ['@babel/plugin-proposal-class-properties', { loose: true }],
            ],
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './web/index.html',
      filename: 'index.html',
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'web-build'),
    },
    compress: true,
    port: 3000,
    hot: true,
    open: true,
    historyApiFallback: true,
    client: {
      overlay: {
        warnings: false,
        errors: true,
      },
    },
  },
};
