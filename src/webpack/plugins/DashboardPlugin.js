import webpack from 'webpack';
import prettyTime from 'pretty-time';

import { parseRequest, sendData, formatRequest } from '../../utils';

const { ProgressPlugin } = webpack;

// Default state object
const DEFAULT_STATE = {
	start: null,
	progress: -1,
	done: false,
	message: '',
	details: [],
	request: null,
	hasErrors: false,
	hasWarnings: false
};

/**
 * Extension of the ProgressPlguin used to report extended progress data for
 * the Web UI and the Titanium CLI.
 */
export class DashboardPlugin extends ProgressPlugin {
	constructor(cwd) {
		super();

		this.cwd = cwd;
		this.lastProgressUpdate = Date.now();

		// Override handler from base ProgressPlugin
		this.handler = (percent, message, ...details) => {
			this.updateProgress(percent, message, details);
		};
	}

	apply(compiler) {
		super.apply(compiler);

		compiler.hooks.afterPlugins.tap('AppcdDashboard:afterPlugins', () => {
			this._ensureState();
		});

		compiler.hooks.compile.tap('AppcdDashboard:compile', () => {
			this._ensureState();

			Object.assign(this.state, {
				...DEFAULT_STATE,
				start: process.hrtime()
			});
		});

		compiler.hooks.done.tap('AppcdDashboard:done', stats => {
			if (this.state.done) {
				return;
			}

			const hasErrors = stats.hasErrors();
			const hasWarnings = stats.hasWarnings();
			let status = '';
			if (hasErrors) {
				status = 'with some errors';
			} else if (hasWarnings) {
				status = 'with some warnings';
			} else {
				status = 'successfully';
			}

			const time = this.state.start
				? ' in ' + prettyTime(process.hrtime(this.state.start), 2)
				: '';

			Object.assign(this.state, {
				...DEFAULT_STATE,
				progress: 100,
				done: true,
				message: `Compiled ${status}${time}`,
				hasErrors,
				hasWarnings
			});

			this.sendProgress();

			sendData('dashboard', { type: 'done', data: { ...this.state } });
		});
	}

	_ensureState() {
		if (!this.state) {
			this.state = { ...DEFAULT_STATE };
		}
	}

	updateProgress(percent = 0, message = '', details = []) {
		const progress = Math.floor(percent * 100);

		Object.assign(this.state, {
			progress,
			message: message || '',
			details,
			request: parseRequest(details[2], this.cwd)
		});

		if (Date.now() - this.lastProgressUpdate > 50) {
			this.sendProgress();
		}
	}

	sendProgress() {
		this.lastProgressUpdate = Date.now();

		if (this.state.progress >= 0 && this.state.progress < 100) {
			sendData('dashboard', {
				type: 'progress',
				data: {
					progress: this.state.progress,
					message: this.state.message,
					details: this.state.details,
					request: this.state.request ? formatRequest(this.state.request) : ''
				}
			});
		} else {
			sendData('dashboard', {
				type: 'progress',
				data: {
					progress: this.state.progress,
					message: this.state.message
				}
			});
		}
	}
}
