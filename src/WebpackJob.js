import EventEmitter from 'events';
import path from 'path';

import { processStats } from './utils/stats';

const jsonTemplateConfig = {
	default: [ 'id', 'name', 'projectPath', 'type', 'platform', 'state', 'history' ],
	detail: [
		'id',
		'name',
		'projectPath',
		'type',
		'platform',
		'state',
		'progress',
		'history',
		'stats',
		'output',
		'tiSymbols'
	]
};

/**
 * Representation of a Webpack build job.
 *
 * Uses webpack's Node api to run a webpack compilation
 */
export default class WebpackJob extends EventEmitter {
	constructor(id, options) {
		super();

		this._state = WebpackJob.STATE_STOPPED;
		this.id = id;
		this.pid = null;
		this.output = '';
		this.history = [];
		this.isStarting = false;
		this.progress = {
			progress: 0
		};
		this.tiSymbols = {};

		this.setOptions(options);
	}

	static get STATE_STARTED() {
		return 'started';
	}

	static get STATE_BUILDING() {
		return 'building';
	}

	static get STATE_READY() {
		return 'ready';
	}

	static get STATE_STOPPED() {
		return 'stopped';
	}

	static get STATE_ERROR() {
		return 'error';
	}

	get state() {
		return this._state;
	}

	set state(newState) {
		if (this._state === newState) {
			return;
		}

		this._state = newState;
		this.emit('state', this, this._state);
	}

	setOptions(newOptions) {
		this.options = Object.assign({}, { modules: [] }, newOptions);

		const { platform, projectPath, type } = this.options;
		this.name = projectPath.split('/').pop();
		this.projectPath = projectPath;
		this.platform = platform;
		this.type = type;
	}

	async start() {
		if (this.pid !== null || this.isStarting) {
			return;
		}

		this.isStarting = true;
		this.cleanupJobData();

		const args = [
			path.resolve(__dirname, './tasks/build.js'),
			'--project', this.projectPath,
			'--platform', this.platform,
		];
		for (const module of this.options.modules) {
			args.push('-m', module.id);
		}
		if (this.options.watch) {
			args.push('--watch');
		}

		this.output = `\u001b[90m$ appcd-plugin-webpack build ${args.slice(1).join(' ')}\u001b[0m\n\n`;

		const startTimeout = setTimeout(() => {
			throw new Error('Webpack build failed to spawn within 5 sec.');
		}, 5000);

		const { response } = await appcd.call('/appcd/subprocess/spawn/node', {
			data: {
				args,
				ipc: true
			}
		});
		response.on('data', data => {
			switch (data.type) {
				case 'spawn': {
					clearTimeout(startTimeout);
					this.pid = data.pid;
					this.state = WebpackJob.STATE_STARTED;
					this.isStarting = false;
					return Promise.resolve();
				}
				case 'stdout': {
					this.output += data.output;
					this.emit('output', data.output);
					break;
				}
				case 'stderr': {
					this.output += data.output;
					this.emit('output', data.output);
					break;
				}
				case 'ipc': {
					this.processIpcMessage(data.msg);
					break;
				}
				case 'exit': {
					if (data.code && data.code !== 0) {
						this.state = WebpackJob.STATE_ERROR;
					} else {
						this.state = WebpackJob.STATE_STOPPED;
					}
				}
			}
		});
	}

	async stop() {
		if (typeof this.pid !== 'number') {
			return;
		}

		await appcd.call(`/appcd/subprocess/kill/${this.pid}`);
		this.pid = null;
		this.state = WebpackJob.STATE_STOPPED;
		this.cleanupJobData();
	}

	processIpcMessage(message) {
		switch (message.type) {
			case 'dashboard': {
				if (message.data.type === 'done') {
					this.storeBuildResult(message.data.data);
				} else if (message.data.type === 'progress') {
					this.updateBuildProgress(message.data.data);
				}
				break;
			}
			case 'state': {
				if (message.data === 'ready') {
					this.state = WebpackJob.STATE_READY;
				} else if (message.data === 'error') {
					this.state = WebpackJob.STATE_ERROR;
				} else if (message.data === 'compiling') {
					this.state = WebpackJob.STATE_BUILDING;
				}
				break;
			}
			case 'invalid': {
				this.invalidationReason = message.data;
				break;
			}
			case 'api-usage': {
				for (const usageInfo of message.data) {
					const { file, symbols = [], removed = false } = usageInfo;
					if (removed) {
						delete this.tiSymbols[file];
					} else {
						this.tiSymbols[file] = symbols;
					}
				}
				this.emit('api-usage', this.tiSymbols);
			}
		}
	}

	updateBuildProgress(data) {
		this.progress = data;
		this.emit('progress', data);
	}

	storeBuildResult(context) {
		this.stats = processStats(context.stats);

		this.history.unshift({
			invalid: this.invalidationReason,
			errors: (context.errors || []).length,
			warnings: (context.warnings || []).length,
			progress: context.progress,
			message: context.message,
			timestamp: new Date()
		});
		if (this.history.length > 10) {
			this.history.pop();
		}
		this.invalidationReason = null;

		this.emit('done', this);
	}

	toJson(template = 'default') {
		const jsonConfig = jsonTemplateConfig[template];
		const data  = {};
		for (const propertyName of jsonConfig) {
			data[propertyName] = this[propertyName];
		}
		return data;
	}

	cleanupJobData() {
		this.stats = null;
		this.progress = {
			progress: 0
		};
		this.tiSymbols = {};
		this.output = '';
	}
}
