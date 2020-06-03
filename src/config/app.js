/* eslint indent: ["error", "tab", { "MemberExpression": "off" }] */

import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import fs from 'fs';
import { tiappxml } from 'node-titanium-sdk';
import path from 'path';
import { SourceMapDevToolPlugin } from 'webpack';
import {
	GenerateAppJsPlugin,
	PlatformResolverPlugin,
	TitaniumExternalsPlugins,
	titaniumTarget
} from 'webpack-target-titanium';

import {
	AliasExternalsPlugin,
	ApiTrackerPlugin,
	BootstrapPlugin
} from '../webpack';

/** @typedef {import("../plugin-api/plugin-api").default} PluginApi */

// TODO:should we put this in a seperate plugin as well? Something like
// webpack-plugin-titanium? That would make appcd-plugin-webpack work as a
// universal webpack build service, even for projects other than Titanium.

/**
 * Common configuration plugin for all Titanium Apps
 *
 * @param {PluginApi} api Plugin API
 * @param {object} options Project options
 */
export default (api, options) => {
	api.chainWebpack(config => {
		const outputDirectory = api.resolve('Resources');
		const platformName = options.build.platform;

		config
			.target(titaniumTarget)
			.entry('main')
				.add('./src/main.js')
				.end()
			.devtool(false)
			.output
				.path(outputDirectory)
				.filename('[name].js')
				.libraryTarget('commonjs2')
				.globalObject('global')
				.end();

		// resolve -----------------------------------------------------------------

		config.resolve
			.plugin('platform-resolver-ignore-ext')
				.use(new PlatformResolverPlugin('described-relative', platformName, true, 'raw-file'))
				.end()
			.plugin('platform-resolver')
				.use(new PlatformResolverPlugin('described-relative', platformName, false, 'raw-file'));

		// base js rule ------------------------------------------------------------

		config.module
			.rule('js')
				.test(/\.m?js$/);

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
			.use(CleanWebpackPlugin, [
				{
					cleanStaleWebpackAssets: false
				}
			]);

		const { project } = options;
		const tiAppPath = path.join(project.path, 'tiapp.xml');
		if (!fs.existsSync(tiAppPath)) {
			throw new Error(`Could not find "tiapp.xml" in ${project.path}.`);
		}
		const tiapp = new tiappxml(tiAppPath);
		const nativeModules = [ ...new Set(tiapp.modules.map(m => m.id)) ];
		config.plugin('titanium-externals')
			.use(TitaniumExternalsPlugins, [
				[
					...nativeModules,
					/\.?\/?semantic.colors.json$/
				]
			]);
		config.plugin('alias-externals')
			.use(AliasExternalsPlugin, [
				nativeModules
			]);
		config.plugin('app.js')
			.use(GenerateAppJsPlugin, [
				[ 'main' ]
			]);
		config.plugin('api-tracker')
			.use(ApiTrackerPlugin, [
				{
					cwd: api.getCwd(),
					diagnostics: api.context.diagnostics
				}
			]);
		config.plugin('bootstrap-files')
			.use(BootstrapPlugin, [
				api.getCwd(),
				'src'
			]);

		if (process.env.NODE_ENV !== 'production') {
			config.plugin('devtool')
				.use(SourceMapDevToolPlugin, [
					{
						filename: null,
						// NOTE: We MUST append a \n or else iOS will break, because it
						// injects a ';' after the original file contents when doing it's
						// require() impl
						append: '\n//# sourceMappingURL=[url]\n',
						module: true,
						columns: false,
						noSources: false
					}
				]);
		}
	});
};
