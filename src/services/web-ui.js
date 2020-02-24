import Dispatcher from 'appcd-dispatcher';

import { start as startNuxt, stop as stopNuxt } from '../../app/server';

export default class WebUiService extends Dispatcher {
	activate(config) {
		const uiConfig = config.webpack.ui;
		const { port } = uiConfig;
		this.register('/:path?', ctx => {
			return `<html>
				<head>
					<script>
						window.location = 'http://localhost:${port}';
					</script>
				</head>
				<body>
					Redirecting ...
				</body>
			</html>`;
		});

		startNuxt({ dev: false, port });
	}

	deactivate() {
		stopNuxt();
	}
}
