/* eslint indent: "off" */

const CopyPlugin = require('copy-webpack-plugin');

module.exports = function (api, options) {
	api.chainWebpack(config => {
		// entry -------------------------------------------------------------------

		config
			.entry('main')
				.add('./src/main.js')
				.end();

		// resolve -----------------------------------------------------------------

		config.resolve
			.alias
				.set('@', api.resolve('app', 'src'))
				.set('~', api.resolve('app', 'assets'));

		// plugins -----------------------------------------------------------------

		config.plugin('copy-assets')
			.use(CopyPlugin, [
				[
					// copy app/assets
					{ from: 'assets', to: '.' }
				]
			]);
	});
};
