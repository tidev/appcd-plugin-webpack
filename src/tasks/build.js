import { DashboardPlugin, StateNotifierPlugin } from '../webpack';

export default (api, options) => {
	api.registerTask('build', {
		description: 'build for production'
	}, async () => {
		const { watch } = options;

		const config = api.resolveWebpackConfig();
		if (watch) {
			config.watch = true;
		}

		config.plugins.push(new StateNotifierPlugin());
		config.plugins.push(new DashboardPlugin(api.getCwd()));

		return new Promise((resolve, reject) => {
			const webpack = api.requirePeer('webpack');
			webpack(config, (err, stats) => {
				if (err) {
					return reject(err);
				}

				if (stats.hasErrors()) {
					return reject('Build failed with errors.');
				}

				resolve();
			});
		});
	});
};
