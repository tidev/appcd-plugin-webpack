/* istanbul ignore if */
if (!Error.prepareStackTrace) {
	require('source-map-support/register');
}

import pluginService from './plugin-api/service';
import JobManager from './job/manager';
import JobService from './services/job';
import StatusService from './services/status';
import WebUiService from './services/web-ui';
import UpdateService from './services/update';
import { registerHooks } from './utils';

const jobManager = new JobManager();
const jobService = new JobService(jobManager);
const statusService = new StatusService(jobManager);
const uiService = new WebUiService();
const updateService = new UpdateService();

export async function activate(config) {
	registerHooks(pluginService);

	appcd.register('/status', statusService);

	updateService.activate();
	appcd.register('/update', updateService);

	if (!process.env.APPCD_UI_DEV) {
		uiService.activate(config);
		appcd.register('/web', uiService);
	}

	jobService.activate(config);
	appcd.register('/', jobService);
}

export async function deactivate() {
	await jobManager.stopAll();
	if (!process.env.APPCD_UI_DEV) {
		uiService.deactivate();
	}
}
