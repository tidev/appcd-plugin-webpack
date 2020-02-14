export function registerHooks(pluginService) {
	pluginService.registerHook('chainWebpack');
	pluginService.registerHook('watch');
}
