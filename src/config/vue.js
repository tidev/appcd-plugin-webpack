/* eslint indent: "off" */

const titaniumCompiler = require('titanium-vue-template-compiler');
const { VueLoaderPlugin } = require('vue-loader');

const { generateTranspileDepRegex } = require('../utils');

module.exports = function (api, options) {
	const transpileDepRegex = generateTranspileDepRegex(options.webpack.transpileDependencies);

	api.chainWebpack(config => {
		config.module
			.rule('compile')
				.exclude
					.add(filepath => {
						// always transpile js in vue files
						if (/\.vue\.jsx?$/.test(filepath)) {
							return false;
						}

						// transpile titanium-vdom and titnaium-navigator
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
	});
};
