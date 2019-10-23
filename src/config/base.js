/* eslint indent: "off" */

const FriendlyErrorsPlugin = require('@soda/friendly-errors-webpack-plugin');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const { GenerateAppJsPlugin, PlatformAwareFileSystemPlugin, titaniumTarget } = require('webpack-target-titanium');

const { generateTranspileDepRegex } = require('../utils');
const { ApiTrackerPlugin, StateNotifierPlugin } = require('../webpack');

module.exports = function (api, options) {
	const projectDir = api.getCwd();
	const outputDirectory = path.join(projectDir, 'Resources');
	const platformName = options.platform;

	const resolveLocal = (...args) => {
		return path.resolve(__dirname, '..', '..', ...args);
	};

	api.chainWebpack(config => {
		config
			.context(path.join(projectDir, 'app'))
			.target(titaniumTarget)
			.mode('development')
			/*
			.entry('ti.main')
				.add('/Users/jvennemann/Library/Application Support/Titanium/mobilesdk/osx/8.2.0/common/Resources/ti.main.js')
				.end()
			*/
			.output
				.path(outputDirectory)
				.filename('[name].js')
				.libraryTarget('commonjs2')
				.globalObject('global')
				.end()
			.externals(
				(context, request, callback) => {
					// TODO: automatically externalize used native modules
					if (request === './app' || request === 'com.appcelerator.aca') {
						return callback(null, `commonjs ${request}`);
					}

					callback();
				}
			);

		const transpileDepRegex = generateTranspileDepRegex(options.transpileDependencies);
		config.module
			.rule('compile')
				.test(/\.js$/)
				.exclude
					.add(filepath => {
						// transpile titanium-vdom and titanium-navigator
						if (/node_modules\/titanium-(navigator|vdom)/.test(filepath)) {
							return false;
						}

						// check if this is something the user explicitly wants to transpile
						if (transpileDepRegex && transpileDepRegex.test(filepath)) {
							return false;
						}

						// Don't transpile all other node_modules
						return /node_modules/.test(filepath);
					})
					.end()
				.use('babel')
					.loader('babel-loader')
					// TODO: Add @babel/preset-env settings based on platform
					.options({
						cwd: path.join(projectDir, 'app')
					});

		config.module
			.rule('images')
				.test(/\.(png|jpe?g|gif|webp)(\?.*)?$/)
				.use('file-loader')
					.loader('file-loader');

		config.module
			.rule('media')
				.test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
				.use('file-loader')
					.loader('file-loader');

		config.module
			.rule('fonts')
				.test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
				.use('file-loader')
					.loader('file-loader')
					.options({
						name: '[path][name].[ext]'
					});

		config.resolve
			.alias
				.set('@', api.resolve('app/src'))
				.set('~', api.resolve('app/assets'))
				.set('vue$', 'titanium-vue')
				.end()
			.extensions
				.merge([ '.mjs', '.js', '.vue', '.json' ])
				.end()
			.modules
				.add('node_modules')
				.add(api.resolve('node_modules'))
				.add(resolveLocal('node_modules'));

		config.resolveLoader
			.modules
				.add('node_modules')
				.add(api.resolve('node_modules'))
				.add(resolveLocal('node_modules'));

		config.plugin('clean')
			.use(CleanWebpackPlugin, [
				{
					dry: false,
					cleanOnceBeforeBuildPatterns: [
						path.join(outputDirectory, '*.*'),
						path.join(projectDir, 'platform')
					],
					dangerouslyAllowCleanPatternsOutsideProject: true
				}
			]);
		// TODO: replace with EnvironmentPlugin
		config.plugin('define')
			.use(webpack.DefinePlugin, [
				{
					'process.env.TARGET_PLATFORM': JSON.stringify(platformName)
				}
			]);
		config.plugin('app.js')
			.use(GenerateAppJsPlugin, [
				[ 'main' ]
			]);
		config.plugin('platform-filesystem')
			.use(PlatformAwareFileSystemPlugin, [
				{
					platform: platformName
				}
			]);
		config.plugin('api-tracker')
			.use(ApiTrackerPlugin, [
				{
					cwd: projectDir
				}
			]);
		config.plugin('friendly-errors')
			.use(FriendlyErrorsPlugin);
		// state notifier needs to come last to capture all output from previous
		// plugins, e.g. friendly-errors
		config.plugin('state-notifier')
			.use(StateNotifierPlugin);
	});
};
