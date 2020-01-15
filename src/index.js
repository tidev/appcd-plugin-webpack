/* istanbul ignore if */
if (!Error.prepareStackTrace) {
	require('source-map-support/register');
}

import hookManager from './hook-api/manager';
import JobManager from './job/manager';
import JobService from './services/job';
import StatusService from './services/status';
import WebUiService from './services/web-ui';
import { registerHooks, unregisterHooks } from './utils';

const jobManager = new JobManager();
const jobService = new JobService(jobManager);
const statusService = new StatusService(jobManager);
const uiService = new WebUiService();

export async function activate(config) {
	registerHooks(hookManager);

	appcd.register('/status', statusService);

	uiService.activate();
	appcd.register('/web', uiService);

	jobService.activate(config);
	appcd.register('/', jobService);
}

export async function deactivate() {
	unregisterHooks(hookManager);

	await jobManager.stopAll();
	uiService.deactivate();
}
