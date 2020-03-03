import portfinder from 'portfinder';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

import { DashboardPlugin, StateNotifierPlugin } from '../webpack';

const defaults = {
	host: '0.0.0.0',
	port: 8080,
	https: false
};

export default (api, options) => {
	api.registerTask('serve', {
		description: 'serve for development'
	}, async () => {
		api.chainWebpack(config => {
			config.plugin('hmr')
				.use(require('webpack/lib/HotModuleReplacementPlugin'));
		});

		const config = api.resolveWebpackConfig();

		const devServerOptions = config.devServer || {};
		const host = devServerOptions.host || defaults.host;
		portfinder.basePort = devServerOptions.port || defaults.port;
		const port = await portfinder.getPortPromise();

		const publicUrl = `http://localhost:${port}`;

		config.output.publicPath = `${publicUrl}/`;
		config.plugins.push(new StateNotifierPlugin());
		config.plugins.push(new DashboardPlugin(api.getCwd()));
		const sockPath = devServerOptions.sockPath || '/sockjs-node';
		const devClients = [
			require.resolve('../webpack/dev/client') + `?${publicUrl}${sockPath}`,
			require.resolve(`webpack/hot/${devServerOptions.hotOnly ? 'only-' : ''}dev-server`)
		];
		config.entry.main = devClients.concat(config.entry.main);

		const compiler = webpack(config);
		const server = new WebpackDevServer(compiler, {
			logLevel: 'debug',
			clientLogLevel: 'debug',
			noInfo: true,
			hot: false,
			injectClient: false,
			injectHot: false,
			transportMode: 'ws',
			sockPath: '',
			open: false,
			writeToDisk: true
		});
		[ 'SIGINT', 'SIGTERM' ].forEach(signal => {
			process.on(signal, () => {
				server.close(() => {
					process.exit(0);
				});
			});
		});

		return new Promise((resolve, reject) => {
			server.listen(port, host, err => {
				if (err) {
					return reject(err);
				}

				resolve();
			});
		});
	});
};
