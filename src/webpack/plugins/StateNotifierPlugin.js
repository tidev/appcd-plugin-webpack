import { sendData } from '../../utils';

/**
 * Reports basic state changes of the Webpack build back to the parent
 * Daemon plugin.
 */
export class StateNotifierPlugin {
	apply(compiler) {
		compiler.hooks.beforeCompile.tap('StateNotifier:beforeCompile', _compiler => {
			sendData('state', 'compiling');
		});
		compiler.hooks.invalid.tap('StateNotifier:invalid', (fileName, changeTime) => {
			sendData('invalid', fileName);
		});
		compiler.hooks.done.tap('StateNotifier:done', stats => {
			const hasErrors = stats.hasErrors();
			if (hasErrors) {
				sendData('state', 'error');
				return;
			}

			sendData('state', 'ready');
		});
	}
}
