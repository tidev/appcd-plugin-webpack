import { sendData } from '../utils';

export class StateNotifierPlugin {
	apply(compiler) {
		compiler.hooks.beforeRun.tap('StateNotifier:beforeRun', _compiler => {
			sendData('state', 'compiling');
		});
		compiler.hooks.watchRun.tap('StateNotifier:watchRun', _compiler => {
			sendData('state', 'compiling');
		});
		compiler.hooks.invalid.tap('StateNotifier:invalid', fileName => {
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
