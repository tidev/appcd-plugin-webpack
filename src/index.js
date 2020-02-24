/* istanbul ignore if */
if (!Error.prepareStackTrace) {
	require('source-map-support/register');
}

import pluginService from './plugin-api/service';
import JobManager from './job/manager';
import JobService from './services/job';
import StatusService from './services/status';
import WebUiService from './services/web-ui';
import { registerHooks } from './utils';

const jobManager = new JobManager();
const jobService = new JobService(jobManager);
const statusService = new StatusService(jobManager);
const uiService = new WebUiService();

export async function activate(config) {
	registerHooks(pluginService);

	appcd.register('/status', statusService);

	uiService.activate(config);
	appcd.register('/web', uiService);

	jobService.activate(config);
	appcd.register('/', jobService);
}

export async function deactivate() {
	await jobManager.stopAll();
	uiService.deactivate();
}
