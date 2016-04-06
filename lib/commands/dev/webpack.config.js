/**
 * Created by scott on 16-4-5.
 */
'use strict'

const webpack = require('webpack')
const path = require('path')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const SplitByPathPlugin = require('webpack-split-by-path')

const extractCSS = new ExtractTextPlugin('static.css', {
	disable: false,
	allChunks: true
})

const extractSASS = new ExtractTextPlugin('app.css', {
	disable: false,
	allChunks: true
})

function buildHtmlEntry() {

}

module.exports = {
	make: function (runtime) {

		const config = runtime.config

		const protocol = config.https ? 'https' : 'http'

		return {
			context: path.resolve(process.cwd(), config.pluginStore),
			entry: {
				main: [
					'babel-polyfill',
					`webpack-dev-server/client?${protocol}://${config.hostname}:${config.port}`,
					'webpack/hot/dev-server'
				]
			},
			output: {
				path: path.resolve(process.cwd(), config.dest),
				publicPath: '',
				pathinfo: true,
				filename: '[name].js',
				devtoolModuleFilenameTemplate: function (info) {
					return "file:///" + info.absoluteResourcePath
				}
			},
			debug: true,
			devtool: 'source-map',
			devServer: {
				// Tell the webpack dev server from where to find the files to serve.
				contentBase: path.resolve(process.cwd(), config.dest),
				colors: true,
				publicPath: '/',
				host: config.proxyHostname,
				port: config.proxyPort,
				hot: true
			},
			module: {
				loaders: [
					// js file
					{
						test: /\.js?$/,
						loaders: ['ng-annotate-loader', 'babel-loader'/*, 'eslint-loader'*/]
					},
					// pure css
					{
						test: /\.css$/,
						loaders: ['style', 'css?' + JSON.stringify({
							sourceMap: true,
							minimize: true,
							autoprefixer: {
								browsers: [
									'last 2 versions',
									'> 1%',
									'not ie <= 8'
								],
								add: true
							},
							normalizeCharset: true
						})]
					},
					// scss
					{
						test: /\.scss$/,
						loaders: ['style', 'css?sourceMap&autoprefixer&normalizeCharset', 'resolve-url', 'sass?sourceMap']
					},
					// html
					{
						test: /\.html$/,
						exclude: /index\.html$/,
						loader: `html?attrs=link:href img:src`
					},
					// website ico
					{
						test: /\.ico$/,
						loader: 'file?name=[name].[ext]'
					},
					// image file
					{
						test: /\.(jpe?g|png|gif|svg)$/i,
						loaders: [
							'file?prefix=img/&name=[name].[ext]'
						]
					},
					// misc file
					{
						test: /\.(json|map|wsdl|xsd)$/,
						loaders: [
							'file?prefix=misc/&name=[name].[ext]'
						]
					},
					// music file
					{
						test: /\.(mp3|wav)$/,
						loaders: [
							'file?prefix=media/&name=[name].[ext]'
						]
					},
					// font file
					{
						test: /\.(woff|woff2|ttf|eot)$/,
						loaders: [
							'file?prefix=font/&name=[name].[ext]'
						]
					}
				]
			},
			plugins: [
				new webpack.ProvidePlugin({
					jQuery: 'jquery',
					$: 'jquery'
				}),
				new webpack.DefinePlugin({
					__DEV__: true
				}),
				//extractCSS,
				//extractSASS,
				new HtmlWebpackPlugin({
					filename: 'index.html',
					template: 'index.html'
				}),
				//new CopyWebpackPlugin([{ from: 'static' }]),
				new SplitByPathPlugin([
					{
						name: 'vendor',
						path: path.join(process.cwd(), 'node_modules'),
						ignore: [
							path.join(process.cwd(), '/node_modules/css-loader'),
							path.join(process.cwd(), '/node_modules/style-loader'),
							/\.s?css/
						]
					}
				]),
				new BrowserSyncPlugin({
						host: config.proxyHostname,
						port: config.proxyPort,
						proxy: `${protocol}://${config.hostname}:${config.port}`
					},
					{
						reload: false
					}),
				new webpack.HotModuleReplacementPlugin()
				//new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}),
			],
			resolve: {
				extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx']
			},
			'html-minify-loader': {
				empty: true,        // KEEP empty attributes
				cdata: false,        // KEEP CDATA from scripts
				comments: false     // KEEP comments
			},
			eslint: {
				emitError: false,
				emitWarning: false,
				quiet: false,
				failOnWarning: false,
				failOnError: false
			},
			node: {
				__dirname: true
			}
		}
	}
}
