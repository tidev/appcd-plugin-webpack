import webpack from 'webpack';
import prettyTime from 'pretty-time';

import { parseRequest, sendData, formatRequest } from '../../utils';
import { analyzeBundle } from '../utils/analyzer';

const { ProgressPlugin } = webpack;

// Default state object
const DEFAULT_STATE = {
	start: null,
	progress: -1,
	done: false,
	message: '',
	details: [],
	request: null,
	hasErrors: false
};

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

		compiler.hooks.afterEmit.tap('AppcdDashboard:afterEmit', compilation => {
			this.assetSources = new Map();
			for (const name in compilation.assets) {
				const asset = compilation.assets[name];
				this.assetSources.set(name, asset.source());
			}
		});

		compiler.hooks.done.tap('AppcdDashboard:done', stats => {
			if (this.state.done) {
				return;
			}

			const hasErrors = stats.hasErrors();
			const status = hasErrors ? 'with some errors' : 'successfully';

			const time = this.state.start
				? ' in ' + prettyTime(process.hrtime(this.state.start), 2)
				: '';

			Object.assign(this.state, {
				...DEFAULT_STATE,
				progress: 100,
				done: true,
				message: `Compiled ${status}${time}`,
				hasErrors
			});

			this.sendProgress();

			const statsData = stats.toJson();
			analyzeBundle(statsData, this.assetSources, compiler.options.output.path);
			sendData('dashboard', { type: 'done', data: { ...this.state, stats: statsData } });
		});
	}

	_ensureState() {
		if (!this.state) {
			this.state = { ...DEFAULT_STATE };
		}
	}

	updateProgress (percent = 0, message = '', details = []) {
		const progress = Math.floor(percent * 100);

		Object.assign(this.state, {
			progress,
			message: message || '',
			details,
			request: parseRequest(details[2], this.cwd)
		});

		if (Date.now() - this.lastProgressUpdate > 100) {
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
					details1: this.state.details1,
					details2: this.state.details2,
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
