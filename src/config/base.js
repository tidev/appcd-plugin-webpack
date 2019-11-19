/* eslint indent: "off" */

const FriendlyErrorsPlugin = require('@soda/friendly-errors-webpack-plugin');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const {
	GenerateAppJsPlugin,
	PlatformResolverPlugin,
	titaniumTarget,
	TitaniumExternalsPlugins
} = require('webpack-target-titanium');
const TerserPlugin = require('terser-webpack-plugin');

const { generateTranspileDepRegex } = require('../utils');
const { ApiTrackerPlugin, StateNotifierPlugin } = require('../webpack');

module.exports = function (api, options) {
	const projectDir = api.getCwd();
	const outputDirectory = api.resolve('Resources');
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
				.end();

		// resolve -----------------------------------------------------------------

		config.resolve
			.extensions
				.merge([ '.mjs', '.js', '.json' ])
				.end()
			.modules
				.add('node_modules')
				.add(api.resolve('node_modules'))
				.add(resolveLocal('node_modules'))
				.end()
			.plugin('platform-resolver')
				.use(new PlatformResolverPlugin('described-relative', platformName, 'raw-file'));

		config.resolveLoader
			.modules
				.add('node_modules')
				.add(api.resolve('node_modules'))
				.add(resolveLocal('node_modules'));

		// babel-loader ------------------------------------------------------------

		const transpileDepRegex = generateTranspileDepRegex(options.transpileDependencies);
		const jsRule = config.module
			.rule('js')
				.test(/\.m?js$/)
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
				.use('cache-loader')
					.loader('cache-loader')
					.options(api.generateCacheConfig('babel-loader', {
						'@babel/core': require('@babel/core/package.json').version,
						'babel-loader': require('babel-loader/package.json').version
					}, [
						'babel.config.js'
					]))
					.end();

		jsRule
			.use('babel-loader')
				.loader('babel-loader')
				// TODO: Add @babel/preset-env settings based on platform
				.options({
					cwd: path.join(projectDir, 'app'),
					plugins: [
						[ require.resolve('babel-plugin-transform-titanium'), {
							deploytype: 'development',
							platform: options.platform,
							target: 'simulator'
						} ]
					]
				});

		// static assets -----------------------------------------------------------

		config.module
			.rule('images')
				.test(/\.(png|jpe?g|gif|webp)(\?.*)?$/)
				.use('file-loader')
					.loader('file-loader')
					.options({
						name: '[path][name].[ext]'
					});

		config.module
			.rule('media')
				.test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/)
				.use('file-loader')
					.loader('file-loader')
					.options({
						name: '[path][name].[ext]'
					});

		config.module
			.rule('fonts')
				.test(/\.(woff2?|eot|ttf|otf)(\?.*)?$/i)
				.use('file-loader')
					.loader('file-loader')
					.options({
						name: '[path][name].[ext]'
					});

		// plugins -----------------------------------------------------------------

		config.plugin('clean')
			.use(CleanWebpackPlugin);
		config.plugin('define')
			.use(webpack.DefinePlugin, [
				{
					'process.env.TARGET_PLATFORM': JSON.stringify(platformName)
				}
			]);
		config.plugin('titanium-externals')
			.use(TitaniumExternalsPlugins, [
				options.modules
			]);
		config.plugin('app.js')
			.use(GenerateAppJsPlugin, [
				[ 'main' ]
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

		// optimization ------------------------------------------------------------

		config.optimization
			.minimizer('terser')
				.use(TerserPlugin);
	});
};
