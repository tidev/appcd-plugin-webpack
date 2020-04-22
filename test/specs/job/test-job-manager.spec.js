import generateOptions from '../../fixtures/options';
import config from '../../../config/config';
import BuildJob from '../../../dist/job/build-job';
import JobManager from '../../../dist/job/manager';

let options = generateOptions('classic');
let identifier = options.identifier;

function createJob() {
	return new BuildJob(options, config);
}

describe('JobManager', () => {
	let jobManager;

	beforeEach(() => {
		jobManager = new JobManager();
	});

	afterEach(() => {
		jobManager = null;
	});

	describe('addJob', () => {
		it('should add job', () => {
			expect(jobManager.hasJob(identifier)).to.be.false;
			const job = createJob();
			jobManager.addJob(job);
			expect(jobManager.jobs.has(identifier)).to.be.true;
		});

		it('should emit "added" event', done => {
			jobManager.once('added', (addedJob) => {
				expect(addedJob).to.equal(job);
				done();
			});
			const job = createJob();
			jobManager.addJob(job);
		});

		it('should delegate "state" event for added jobs', done => {
			jobManager.once('state', (_job, state) => {
				expect(_job).to.equal(job);
				expect(state).to.equal(BuildJob.STATE_ERROR);
				done();
			});
			const job = createJob();
			jobManager.addJob(job);
			job.state = BuildJob.STATE_ERROR;
		});
	});

	describe('hasJob', () => {
		it('should return wether a job exists or not', () => {
			expect(jobManager.hasJob(identifier)).to.be.false;
			const job = createJob();
			jobManager.addJob(job);
			expect(jobManager.hasJob(identifier)).to.be.true;
		});
	});

	describe('getJob', () => {
		it('should return job by identifier', () => {
			const job = createJob();
			jobManager.addJob(job);
			expect(jobManager.getJob(identifier)).to.be.equal(job);
		});

		it('should return undefined for unknown job identifier', () => {
			expect(jobManager.getJob('webpack')).to.be.undefined;
		});
	});
});
