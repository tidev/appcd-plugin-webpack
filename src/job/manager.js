import EventEmitter from 'events';

/**
 * Manager for Webpack build jobs. Handles starting and stopping of jobs.
 */
export default class JobManager extends EventEmitter {
	constructor() {
		super();

		this.jobs = new Map();
	}

	hasJob(jobIdentifier) {
		return this.jobs.has(jobIdentifier);
	}

	getJob(jobIdentifier) {
		return this.jobs.get(jobIdentifier);
	}

	addJob(job) {
		this.jobs.set(job.id, job);
		this.emit('added', job);
		job.on('state', (job, state) => this.emit('state', job, state));
	}

	async stopAll() {
		return Promise.all(Array.from(this.jobs.values).map(async job => job.stop()));
	}
}
