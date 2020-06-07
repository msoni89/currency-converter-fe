const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    optimization: {
        minimize: false
    },
    entry: {
        main: path.join(__dirname, '../src', 'index.tsx')
    },
    output: {
        path: path.join(__dirname, '../dist/'),
        filename: '[name].js',
    },
    watch: true,
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    devServer: {
        contentBase: path.join(__dirname, '../dist/'),
        compress: false,
        port: 9000,
        hot: true,
        proxy: { "/v1/**": { target: 'http://localhost:8085', secure: false }  },
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.ts(x?)$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: "ts-loader"
                    }
                ]
            },

            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            {
                enforce: "pre",
                test: /\.js$/,
                loader: "source-map-loader"
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
            },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                loader: 'url-loader',
                options: {
                    limit: 10000
                }
            }]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html',
            filename: 'index.html',
            showErrors: true,
            title: 'Currency Converted',
            path: path.join(__dirname, '../dist/'),
            hash: true
        })
    ]

}