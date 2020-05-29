/* eslint indent: ["error", "tab", { "MemberExpression": "off" }] */

import FriendlyErrorsPlugin from '@soda/friendly-errors-webpack-plugin';
import path from 'path';
import TerserPlugin from 'terser-webpack-plugin';

import terserOptions from './terserOptions';

export default (api, options) => {
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
			.use(FriendlyErrorsPlugin, [{
				clearConsole: false
			}]);

		// optimization ------------------------------------------------------------

		config.optimization
			.minimizer('terser')
				.use(TerserPlugin, [ terserOptions(options) ]);
	});
};
