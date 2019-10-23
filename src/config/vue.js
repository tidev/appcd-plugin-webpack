/* eslint indent: "off" */

const titaniumCompiler = require('titanium-vue-template-compiler');
const { VueLoaderPlugin } = require('vue-loader');

const { TitaniumLoaderPlugin } = require('../webpack');

module.exports = function (api, options) {
	api.chainWebpack(config => {
		config
			.entry('main')
				.add('./src/main.js')
				.end();

		config.resolve
			.alias
				.set('@', api.resolve('app/src'))
				.set('~', api.resolve('app/assets'))
				.set('vue$', 'titanium-vue')
				.end()
			.extensions
				.merge([ '.vue' ])
				.end();

		config.module
			.noParse(/^(titanium-vue|vue-router|vuex|vuex-router-sync)$/);

		config.module
			.rule('js')
				.exclude
					.add(filepath => {
						// always transpile js in vue files
						if (/\.vue\.jsx?$/.test(filepath)) {
							return false;
						}
					})
					.end();

		config.module
			.rule('vue')
				.test(/\.vue$/)
				.use('vue')
					.loader('vue-loader')
					.options({
						compiler: titaniumCompiler
					});

		config.plugin('vue-loader')
			.use(VueLoaderPlugin);

		config.plugin('titanium-loader')
			.use(TitaniumLoaderPlugin, [
				options
			]);
	});
};
