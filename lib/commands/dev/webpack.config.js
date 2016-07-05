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
const autoprefixer = require('autoprefixer');

const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const SplitByPathPlugin = require('webpack-split-by-path')

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

		const outputPath = path.resolve(process.cwd(), config.dest)

		const defaults = {
			context: path.resolve(process.cwd(), config.pluginStore),
			entry: {
				main: [
					'babel-polyfill',
					'webpack-dev-server/client?' + serverUrl + '/',
					'webpack/hot/dev-server'
				]
			},
			output: {
				path: path.join(outputPath, 'www'),
				publicPath: serverUrl + '/',
				pathinfo: true,
				filename: '[name].js',
				/*devtoolModuleFilenameTemplate: function (info) {
					return 'file://' + info.absoluteResourcePath
				}*/
			},
			debug: true,
			devtool: 'source-map',
			module: {
				loaders: [
					// js file
					{
						test: /\.js?$/,
						exclude: /(node_modules|bower_components)/,
						loaders: ['ng-annotate-loader', 'babel-loader'/*, 'eslint-loader'*/]
					},
					// pure css
					{
						test: /\.css$/,
						loaders: ['style', 'css?sourceMap', 'postcss']
					},
					// scss
					{
						test: /\.scss$/,
						loaders: ['style', 'css?sourceMap&autoprefixer&normalizeCharset', 'postcss', 'resolve-url', 'sass?sourceMap']
					},
					// html
					{
						test: /\.html$/,
						exclude: /index\.html$/,
						loaders: ['ngtemplate?relativeTo=' + path.resolve(process.cwd(), config.pluginStore), 'html?attrs=link:href img:src source:src']
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
							'file?name=img/[name].[ext]'
						]
					},
					// misc file
					{
						test: /\.(json|map|wsdl|xsd)$/,
						loaders: [
							'file?name=misc/[name].[ext]'
						]
					},
					// music file
					{
						test: /\.(mp3|wav)$/,
						loaders: [
							'file?name=media/[name].[ext]'
						]
					},
					// font file
					{
						test: /\.(woff|woff2|ttf|eot)(\?.+)?$/,
						loaders: [
							'file?name=font/[name].[ext]'
						]
					},
					{
						test: /\.(svg)(\?.+)$/,
						loaders: [
							'file?name=font/[name].[ext]'
						]
					},

					//**********************************
					// special
					//**********************************
					{
						test: require.resolve('jquery'),
						loader: 'expose?$!expose?jQuery'
					}
				]
			},
			plugins: [
				new webpack.optimize.DedupePlugin(),
				new webpack.ProvidePlugin({
					jQuery: 'jquery',
					$: 'jquery'
				}),
				new webpack.DefinePlugin({
					__DEV__: true,
					__PLUGINS__: {},
					APP_DEBUG_MODE: true
				}),
				//extractCSS,
				//extractSASS,

				//new CopyWebpackPlugin([{ from: 'static' }]),
				new SplitByPathPlugin([
					{
						name: 'vendor',
						path: [
							path.join(process.cwd(), 'node_modules'),
							path.join(outputPath, 'bower_components')
						]
					}
				]),
				new BrowserSyncPlugin({
						host: config.proxyHostname,
						port: config.proxyPort,
						proxy: {
							target: serverUrl,
							ws: true
						}
					},
					{
						reload: false
					}),
				new webpack.HotModuleReplacementPlugin(),
				new webpack.ResolverPlugin(
					new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('.bower.json', ['main'])
				)
				//new webpack.optimize.UglifyJsPlugin({compress: {warnings: false}}),
			],
			resolve: {
				extensions: ['', '.webpack.js', '.web.js', '.js'],
				root: [path.join(outputPath, 'bower_components')]
			},
			node: {
				__dirname: true
			},
			eslint: {
				emitError: false,
				emitWarning: false,
				quiet: false,
				failOnWarning: false,
				failOnError: false
			},
			postcss: function () {
				return [
					require('autoprefixer')({
						browsers: [
							'last 2 versions',
							'> 1%',
							'not ie <= 8'
						],
						add: true
					}),
					require('postcss-normalize-charset')
				]
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
