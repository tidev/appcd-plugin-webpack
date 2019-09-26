import path from 'path';

import WebpackJob from '../dist/WebpackJob';
import WebpackJobManager from '../dist/WebpackJobManager';

let jobIdentifier = 'test';
let jobOptions = {
	identifier: jobIdentifier,
	projectPath: path.resolve(__dirname, '..'),
	configPath: path.resolve(__dirname, 'fixtures', 'webpack.config.js')
};

describe('WebpackJobManager', () => {
	let jobManager;

	beforeEach(() => {
		jobManager = new WebpackJobManager();
	});

	afterEach(() => {
		jobManager = null;
	});

	describe('hasJob', () => {
		it('should return wether a job exists or not', () => {
			expect(jobManager.hasJob(jobIdentifier)).to.be.false;
			const job = new WebpackJob({
				identifier: jobIdentifier
			});
			jobManager.jobs.set(jobIdentifier, job);
			expect(jobManager.hasJob(jobIdentifier)).to.be.true;
		});
	});

	describe('getJob', () => {
		it('should return job by identifier', () => {
			const job = new WebpackJob({
				identifier: jobIdentifier
			});
			jobManager.jobs.set(jobIdentifier, job);
			expect(jobManager.getJob(jobIdentifier)).to.be.equal(job);
		});

		it('should return undefined for unknown job identifier', () => {
			expect(jobManager.getJob('webpack')).to.be.undefined;
		});
	});

	it('should start and stop webpack build job', async () => {
		const jobManager = new WebpackJobManager();
		const job = new WebpackJob(jobOptions);
		await jobManager.addAndStartJob(job);

		expect(jobManager.hasJob(job.id)).to.be.true;
		expect(job.state).to.not.equal(WebpackJob.STATE_ERROR);

		await jobManager.stopJob(job);
		expect(job.state).to.be.equal(WebpackJob.STATE_STOPPED);
	});

});
