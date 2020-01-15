export function registerHooks(hookManager) {
	hookManager.registerHook('chainWebpack');
}

export function unregisterHooks(hookManager) {
	hookManager.unregisterHook('chainWebpack');
}
