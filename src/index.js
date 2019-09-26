/* istanbul ignore if */
if (!Error.prepareStackTrace) {
	require('source-map-support/register');
}

import WebpackJobManager from './WebpackJobManager';
import WebpackService from './WebpackService';
import WebpackStatusService from './WebpackStatusService';
import WebpackWebService from './WebpackWebService';
import HookManager from './hook-api/manager';
import { registerHooks, unregisterHooks } from './hooks';

// FIXME: The appcd global is unique for each plugin so this should obviously
// be done somewhere in the appcd-plugin package
appcd.hooks = new HookManager();

const jobManager = new WebpackJobManager();
const webpackService = new WebpackService(jobManager);
const webpackStatusService = new WebpackStatusService(jobManager);
const webpackWebService = new WebpackWebService();

export async function activate(config) {
	registerHooks(appcd.hooks);

	appcd.register('/status', webpackStatusService);
	webpackWebService.activate(config);
	appcd.register('/web', webpackWebService);
	await webpackService.activate(config);
	appcd.register('/', webpackService);
}

export async function deactivate() {
	webpackWebService.deactivate();

	unregisterHooks(appcd.hooks);

	jobManager.stopAll();
}
