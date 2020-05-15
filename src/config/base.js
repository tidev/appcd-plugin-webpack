/* eslint indent: ["error", "tab", { "MemberExpression": "off" }] */

const FriendlyErrorsPlugin = require('@soda/friendly-errors-webpack-plugin');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = function (api, options) {
	const resolveLocal = (...args) => {
		return path.resolve(__dirname, '..', '..', ...args);
	};

	api.chainWebpack(config => {
		config
			.context(api.getCwd())
			.mode('development');

		// resolve -----------------------------------------------------------------

		config.resolve
			.extensions
				.merge([ '.mjs', '.js', '.json' ])
				.end()
			.symlinks(false)
			.modules
				.add('node_modules')
				.add(api.resolve('node_modules'))
				.add(resolveLocal('node_modules'));

		config.resolveLoader
			.modules
				.add('node_modules')
				.add(api.resolve('node_modules'))
				.add(resolveLocal('node_modules'));

		// plugins -----------------------------------------------------------------

		config.plugin('friendly-errors')
			.use(FriendlyErrorsPlugin);

		// optimization ------------------------------------------------------------

		config.optimization
			.minimizer('terser')
				.use(TerserPlugin);
	});
};
