import PluginContext from './context';
import Hook from './hooks/hook';
import { createPluginOptions } from '../utils';

/**
 * @type Plugin
 * @property {string} id Plugin identifier
 * @property {Function} apply Plugin's apply function
 */

/**
 * The central plugin management service. Registers/unregisters available
 * hooks, loads built-in plugins and is responsible for creating new plugin
 * context instances.
 */
class PluginService {
	constructor() {
		this.hooks = new Map();
		this.contexts = new Map();
	}

	registerHook(name, hookClass = Hook) {
		this.hooks.set(name, hookClass);

		this.contexts.forEach(context => {
			const hook = new hookClass(name);
			context.registerHook(name, hook);
		});
	}

	unregisterHook(name) {
		this.hooks.delete(name);

		this.contexts.forEach(context => {
			context.unregisterHook(name);
		});
	}

	createPluginContext(cwd, options) {
		options = createPluginOptions(options);
		const context = new PluginContext(cwd, options);
		this.contexts.set(cwd, context);
		this.hooks.forEach((hookClass, name) => {
			const hook = new hookClass(name);
			context.registerHook(name, hook);
		});
		context.initialize();

		return context;
	}
}

export default new PluginService();
