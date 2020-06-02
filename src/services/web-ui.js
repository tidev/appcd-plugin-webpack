import Dispatcher from 'appcd-dispatcher';

import { start as startNuxt, stop as stopNuxt } from '../../app/server';

export default class WebUiService extends Dispatcher {
	activate(config) {
		const uiConfig = config.webpack.ui;
		const { port } = uiConfig;
		// FIXME: starting nuxt in dev mode here breaks the build but works
		// fine in a normal node environment. Why?
		const dev = typeof process.env.APPCD_UI_DEV !== 'undefined';
		startNuxt({ dev, port });

		this.register('/:path(.*)', ctx => {
			const path = ctx.path || '/';
			return `<html>
				<head>
					<script>
						window.location = 'http://localhost:${port}/webpack${path}';
					</script>
				</head>
				<body>
					Redirecting ...
				</body>
			</html>`;
		});
	}

	deactivate() {
		stopNuxt();
	}
}
