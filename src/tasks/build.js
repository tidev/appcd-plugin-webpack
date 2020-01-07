import webpack from 'webpack';
import Config from 'webpack-chain';

import HookManager from '../hook-api/manager';
import { DashboardPlugin } from '../webpack';
import { loadProjectOptions, registerHooks, resolveArgs } from '../utils';

const {
	project: projectDir,
	platform,
	target: buildTarget,
	deployType,
	sdk: sdkPath,
	watch
} = resolveArgs();

const hookManager = new HookManager();
registerHooks(hookManager);

const projectOptions = loadProjectOptions(projectDir, {
	platform,
	buildTarget,
	deployType,
	sdkPath,
	watch
});
const hooks = hookManager.createProjectHookContext(projectDir, projectOptions);

const config = new Config();
hooks.applyHook('chainWebpack', config);
const webpackConfig = config.toConfig();

if (watch) {
	webpackConfig.watch = true;
}

webpackConfig.plugins.push(new DashboardPlugin(projectDir));

webpack(webpackConfig, (err, stats) => {
	if (err) {
		console.log(err);
		process.exit(1);
	}

	if (stats.hasErrors() && !watch) {
		process.exit(1);
	}
});
