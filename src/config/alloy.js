/* eslint indent: "off" */

const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const {
	DefinePlugin,
	ExternalsPlugin,
	NormalModuleReplacementPlugin,
	WatchIgnorePlugin
} = require('webpack');

module.exports = function (api, options) {
	const projectDir = api.getCwd();
	const alloyRoot = path.dirname(api.resolvePeer('alloy'));
	const { createCompileConfig, createCompiler } = api.requirePeer('alloy-compiler');
	const alloyConfig = {
		platform: options.platform,
		deploytype: options.deployType
	};
	const compileConfig = createCompileConfig({ projectDir, alloyConfig });
	const alloyCompiler = createCompiler({ compileConfig, webpack: true });
	const backboneVersion = compileConfig.backbone ? compileConfig.backbone : '0.9.2';

	options.transpileDependencies.push(new RegExp('node_modules[\\/]alloy'));

	api.chainWebpack(config => {
		// entry -------------------------------------------------------------------

		config
			.entry('main')
				.add('./alloy.js')
				.end();

		// resolve -----------------------------------------------------------------

		config.resolve
			.alias
				.set('@', api.resolve('app', 'lib'))
				.set('~', api.resolve('app', 'assets'))
				.set('@app', api.resolve('app'))
				.set('/alloy$', path.join(alloyRoot, 'template', 'lib', 'alloy.js'))
				.set('/alloy/backbone$', path.join(alloyRoot, 'lib', 'alloy', 'backbone', backboneVersion, 'backbone.js'))
				.set('/alloy/constants$', path.join(path.dirname(require.resolve('alloy-utils')), 'constants.js'))
				.set('/alloy/controllers/BaseController$', path.join(alloyRoot, 'lib', 'alloy', 'controllers', 'BaseController.js'))
				.set('/alloy/controllers', api.resolve('app', 'controllers'))
				.set('/alloy/models', api.resolve('app', 'models'))
				.set('/alloy/styles', api.resolve('app', 'styles'))
				.set('/alloy/widgets', api.resolve('app', 'widgets'))
				.set('/alloy/CFG', api.resolve('Resources', 'alloy', 'CFG'))
				.set('/alloy', path.join(alloyRoot, 'lib', 'alloy'))
				.end()
			.extensions
				.merge([ '.xml', '.tss' ]);

		// module rules ------------------------------------------------------------

		config.module
			.rule('js')
				.use('alloy-loader')
					.loader('alloy-loader')
					.options({
						compiler: alloyCompiler,
						platform: options.platform
					});

		config.module
			.rule('tss')
				.test(/\.tss$/)
				.use('tss-loader')
					.loader(require.resolve('alloy-loader/lib/loaders/styleLoader'))
					.options({
						compiler: alloyCompiler
					});

		config.module
			.rule('backbone')
				.test(/backbone\.js$/)
				.use('imports-loader')
					.loader('imports-loader?define=>false');

		// plugins -----------------------------------------------------------------

		config.plugin('alloy-loader')
			.use(require.resolve('alloy-loader/lib/plugin'), [
				{
					compiler: alloyCompiler,
					platform: options.platform
				}
			]);
		// TODO: Copy widget resources and merge i18n
		config.plugin('copy-resources')
			.use(CopyPlugin, [
				[
					// copy app/platform/<splatform>
					{ from: `platform/${options.platform}`, to: `../platform/${options.platform}` },
					// copy app/i18n
					{ from: 'i18n', to: '../i18n' },
				]
			]);
		config.plugin('copy-assets')
			.use(CopyPlugin, [
				[
					// copy app/assets
					{ from: 'assets', to: '.' }
				]
			]);
		config.plugin('externals')
			.use(ExternalsPlugin, [
				'commonjs',
				[ 'jquery', 'file', 'system' ]
			]);
		config.plugin('clean')
			.tap(args => {
				const options = args[0] || {
					cleanOnceBeforeBuildPatterns: [ '**/*' ]
				};
				options.dry = false;
				options.cleanStaleWebpackAssets = false;
				options.cleanOnceBeforeBuildPatterns = [
					...options.cleanOnceBeforeBuildPatterns,
					'../platform',
					'../i18n',
					'!alloy',
					'!alloy/CFG.js'
				];
				options.dangerouslyAllowCleanPatternsOutsideProject = true;
				args[0] = options;
				return args;
			});
		config.plugin('watch-ignore')
			.use(WatchIgnorePlugin, [
				[
					/alloy[/\\]CFG.js/
				]
			]);
		config.plugin('alloy-defines')
			.use(DefinePlugin, [
				{
					ALLOY_VERSION: api.requirePeer('alloy/package.json').version,
					// mobile web is dead, Alloy just still doesn't know it yet.
					OS_MOBILEWEB: false
				}
			]);
		config.plugin('widget-alias')
			.use(NormalModuleReplacementPlugin, [
				/@widget/,
				resource => {
					const widgetDirMatch = resource.context.match(/.*widgets[/\\][^/\\]+[/\\]/);
					if (!widgetDirMatch) {
						return;
					}
					const widgetDir = widgetDirMatch[0];
					resource.request = `${widgetDir}${resource.request.replace('@widget/', 'lib/')}`;
				}
			]);
		config.plugin('bootstrap-files')
			.tap(args => {
				args[1] = 'lib';
				return args;
			});
	});
};
