const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
let path = require('path');
let OUTPUT = path.join(__dirname, 'dist');

module.exports = {
    mode: 'development',
    module: {
        rules: [
            { test: /\.css$/, use: ['style-loader', 'css-loader'] },
            { test: /\.html$/, use: 'html-loader' },
            { test: /\.png$/, use: {
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]',
                    outputPath: '../../img/'
                }
            } }
        ]
    },
    entry: [
        './app.js'
    ],
    output: {
        path: OUTPUT,
        filename: 'wi-chat-module.js',
        publicPath: '../source/img'
    },
    plugins: [
        new HardSourceWebpackPlugin(),
    ]
}
