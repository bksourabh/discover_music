const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

// Determine publicPath for GitHub Pages
// If GITHUB_REPOSITORY is set (in CI), extract repo name and use it as base path
// Otherwise, use '/' for local development
function getPublicPath() {
  const githubRepo = process.env.GITHUB_REPOSITORY;
  if (githubRepo) {
    // Extract repo name from "username/repo-name"
    const repoName = githubRepo.split('/')[1];
    return `/${repoName}/`;
  }
  // For local development or if repo name is not available, use root
  return '/';
}

const publicPath = getPublicPath();
const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--mode=production');

module.exports = {
  entry: './index.web.js',
  mode: isProduction ? 'production' : 'development',
  devtool: isProduction ? 'source-map' : 'source-map',
  output: {
    path: path.resolve(__dirname, 'web-build'),
    filename: 'bundle.js',
    publicPath: publicPath,
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
      {
        test: /\.mp3$/i,
        type: 'asset/resource',
        generator: {
          filename: 'piano-mp3/[name][ext]',
        },
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
    static: [
      {
        directory: path.join(__dirname, 'web-build'),
      },
      {
        directory: path.join(__dirname, 'piano-mp3'),
        publicPath: '/piano-mp3',
      },
    ],
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
