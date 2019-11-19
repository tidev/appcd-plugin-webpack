import webpack from 'webpack';
import Config from 'webpack-chain';

import HookManager from '../hook-api/manager';
import { DashboardPlugin } from '../webpack';
import { loadProjectOptions, registerHooks, resolveArgs } from '../utils';

const args = resolveArgs();

const projectDir = args.project;
const platform = args.platform;
const watch = args.watch;
const modules = args.modules;

const hookManager = new HookManager();
registerHooks(hookManager);

const projectOptions = loadProjectOptions(projectDir, {
	platform,
	modules,
	watch
});
const hooks = hookManager.getHookContextForProject(projectDir, projectOptions);

const config = new Config();
hooks.applyHook('chainWebpack', config);
const webpackConfig = config.toConfig();

if (args.watch) {
	webpackConfig.watch = true;
}

webpackConfig.plugins.push(new DashboardPlugin(projectDir));

webpack(webpackConfig, (err, stats) => {
	if (err) {
		console.log(err);
		process.exit(1);
	}

	if (stats.hasErrors() && !args.watch) {
		process.exit(1);
	}
});
