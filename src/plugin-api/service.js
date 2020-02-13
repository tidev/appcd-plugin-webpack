import PluginContext from './context';
import Hook from './hooks/hook';
import { interopRequireDefault } from './loader';
import { createPluginOptions } from './utils';

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
		this.builtInPlugins = [];
		this.hooks = new Map();
		this.contexts = new Map();

		this.resolveBuiltInPlugins();
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
		context.resolveAndApplyPlugins(this.builtInPlugins);

		return context;
	}

	/**
	 * Resolves built-in plugins.
	 *
	 * These will be loaded with the webpack plugin itself and don't need
	 * fs-watching so we can use a simple require to load the apply function.
	 */
	resolveBuiltInPlugins() {
		const idToPlugin = (id) => ({
			id: id.replace(/^\.+\//, 'built-in:'),
			// eslint-disable-next-line security/detect-non-literal-require
			apply: interopRequireDefault(require(id))
		});
		this.builtInPlugins = [
			'../config/base',
			'../config/prod',
			'../tasks/build',
			'../tasks/serve'
		].map(idToPlugin);
	}
}

export default new PluginService();
