import Dispatcher from 'appcd-dispatcher';
import { AppcdError, codes, Response } from 'appcd-response';
import BuildJob from '../job/build-job';

/**
 * Service to start and stop Webpack build jobs
 */
export default class JobService extends Dispatcher {
	constructor(jobManager) {
		super();

		this.jobManager = jobManager;
	}

	activate() {
		this.register('/start/:identifier?', ctx => this.startWebpack(ctx));
		this.register('/stop/:identifier', ctx => this.stopWebpack(ctx));
		this.register('/list', ctx => this.listBuildJobs(ctx));
	}

	async startWebpack(ctx) {
		const { params, data: options } = ctx.request;
		const jobIdentifier = (options && options.identifier) || params.identifier;
		let job;
		if (this.jobManager.hasJob(jobIdentifier)) {
			job = this.jobManager.getJob(jobIdentifier);
			await job.stop();
			if (options) {
				job.options = options;
			}
		} else if (options) {
			job = new BuildJob(jobIdentifier, options);
			this.jobManager.addJob(job);
		} else {
			ctx.response = new AppcdError('Invalid request data');
			return;
		}
		await job.start();
		ctx.response = new Response(codes.OK);
	}

	async stopWebpack(ctx) {
		const { params } = ctx.request;
		const identifier = params.identifier;
		if (!this.jobManager.hasJob(identifier)) {
			return new AppcdError(`No job found with identifier ${identifier}`);
		}
		const job = this.jobManager.getJob(identifier);
		try {
			await job.stop();
			ctx.response = new Response(codes.OK);
		} catch (e) {
			return new AppcdError(`Failed to stop job with identifier ${identifier}`);
		}
	}

	listBuildJobs(ctx) {
		const jobs = [];
		this.jobManager.jobs.forEach(job => {
			jobs.push(job.toJson());
		});

		ctx.response = jobs;
	}
}
