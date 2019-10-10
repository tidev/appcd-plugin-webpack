/* eslint indent: "off" */

const titaniumCompiler = require('titanium-vue-template-compiler');
const { VueLoaderPlugin } = require('vue-loader');

const { TitaniumLoaderPlugin } = require('../webpack');

module.exports = function (api, options) {
	api.chainWebpack(config => {
		config.module
			.rule('compile')
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
