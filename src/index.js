/* istanbul ignore if */
if (!Error.prepareStackTrace) {
	require('source-map-support/register');
}

import JobManager from './job/manager';
import JobService from './services/job';
import StatusService from './services/status';
import WebUiService from './services/web-ui';

const jobManager = new JobManager();
const jobService = new JobService(jobManager);
const statusService = new StatusService(jobManager);
const uiService = new WebUiService();

export async function activate(config) {
	appcd.register('/status', statusService);

	uiService.activate();
	appcd.register('/web', uiService);

	jobService.activate(config);
	appcd.register('/', jobService);
}

export async function deactivate() {
	jobManager.stopAll();
	uiService.deactivate();
}
