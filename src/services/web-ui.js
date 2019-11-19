import Dispatcher from 'appcd-dispatcher';

import { start as startNuxt, stop as stopNuxt } from '../../app/server';

export default class WebUiService extends Dispatcher {
	activate() {
		this.register('/:path?', ctx => {
			return `<html>
				<head>
					<script>
						window.location = 'http://localhost:3000';
					</script>
				</head>
				<body>
					Redirecting ...
				</body>
			</html>`;
		});

		// startNuxt({ dev: false });
	}

	deactivate() {
		// stopNuxt();
	}
}
