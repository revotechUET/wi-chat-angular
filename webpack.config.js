let path = require('path');
let OUTPUT = path.join(__dirname, '../wi-angular/build/vendor/js');


module.exports = {
    mode: 'development',
    devtool: 'inline-sourcemap',
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
        filename: 'chat-module.webpack.js',
        // publicPath : path.join(__dirname, '../../wi-angular/source/vendor/js')
        publicPath: '../source/img'
    }
}
