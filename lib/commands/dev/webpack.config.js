/**
 * Created by scott on 16-4-5.
 */
'use strict'

const webpack = require('webpack')
const path = require('path')
const url = require('url')
const glob = require('glob')
const _ = require('lodash')

const butil = require('../../util')


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

function devServerUrl(protocol, hostname, port) {
	return url.format({
		protocol,
		hostname,
		port
	})
}

function getPluginWebpackConfig(plugins) {
	const pattern = butil.getFileGlobPattern('', _.map(plugins, 'raw.path'), 'webpack.config.js')

	return _.mergeWith.apply(_,
		_.chain(glob.sync(pattern))
			.map(function (_path) {
				return require(_path)
			})
			.value()
			.concat([_mergeOperator])
	)
}

function _mergeOperator(objValue, srcValue) {
	if (Array.isArray(objValue)) {
		return objValue.concat(srcValue)
	}
}

module.exports = {
	make: function (runtime) {

		const config = runtime.config

		const protocol = config.https ? 'https' : 'http'

		const serverUrl = devServerUrl(protocol, config.hostname, config.port)

		const defaults = {
			context: path.resolve(process.cwd(), config.pluginStore),
			entry: {
				main: [
					'babel-polyfill',
					'webpack-dev-server/client?' + serverUrl,
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
						proxy: serverUrl
					},
					{
						reload: false
					}),
				new webpack.HotModuleReplacementPlugin(),
				new webpack.ResolverPlugin(
					new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
				)
				//new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}),
			],
			resolve: {
				extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx'],
				root: [path.join(__dirname, "bower_components")]
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

		const htmlEntres = _.chain(runtime.plugins)
			.map(function (plugin) {
				let entry = _.get(plugin, 'raw.plugin.entry')
				if (Array.isArray(entry)) {
					return entry.reduce(function (result, value) {
						result.push(createEntry(path.join(plugin.path, value)))
					}, [])
				} else if (entry) {
					return [createEntry(path.join(plugin.path, entry))]
				} else {
					return null
				}
			})
			.compact()
			.flatten()
			.value()

		defaults.plugins.push.apply(defaults.plugins, htmlEntres)

		const alias = aliasPlugins(runtime.plugins)

		const config2 = getPluginWebpackConfig(runtime.plugins)

		Array.prototype.push.apply(defaults.entry.main, Object.keys(runtime.plugins))

		return _.mergeWith(defaults, config2, { resolve: { alias } }, _mergeOperator)
	}
}

function createEntry(_path) {
	return new HtmlWebpackPlugin({
		filename: 'index.html',
		template: _path
	})
}

function aliasPlugins(plugins) {
	return _.reduce(plugins, function (result, plugin) {
		result[plugin.name] = plugin.path
		return result
	}, {})
}
