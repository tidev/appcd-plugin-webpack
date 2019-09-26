import webpack from 'webpack';
import Config from 'webpack-chain';

import HookManager from '../hook-api/manager';
import { registerHooks } from '../hooks';
import { DashboardPlugin } from '../webpack';
import { resolveArgs } from '../utils';

const args = resolveArgs();

const projectPath = args.project;
const platform = args.platform;

// set target platform for titanium-vue-template-compiler
process.env.TARGET_PLATFORM = platform;

const hookManager = new HookManager();
registerHooks(hookManager);
const hooks = hookManager.getHookContextForProject(projectPath, platform);

const config = new Config();
hooks.applyHook('chainWebpack', config);
const webpackConfig = config.toConfig();

if (args.watch) {
	webpackConfig.watch = true;
}

webpackConfig.plugins.push(new DashboardPlugin(projectPath));

webpack(webpackConfig, (err, stats) => {
	if (err) {
		console.log(err);
		process.exit(1);
	}

	if (stats.hasErrors() && !args.watch) {
		process.exit(1);
	}
});
