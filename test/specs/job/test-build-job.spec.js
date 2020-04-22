import generateOptions from '../../fixtures/options';
import config from '../../../config/config';

import BuildJob from '../../../dist/job/build-job';

describe('BuildJob', () => {
	it('should have initial stopped status', () => {
		const options = generateOptions('classic');
		const job = new BuildJob(options, config);
		expect(job.state).to.equal(BuildJob.STATE_STOPPED);
	});

	it('should stop after inactivity timeout', async () => {
		const options = generateOptions('classic');
		const job = new BuildJob(options, { inactivityTimeout: 500 });
		job.state = BuildJob.STATE_READY;
		return new Promise((resolve) => {
			job.once('state', (job, state) => {
				expect(state).to.equal(BuildJob.STATE_STOPPED);
				resolve();
			});
		});
	});
});
