import PluginContext from './context';
import Hook from './hooks/hook';
import { interopRequireDefault } from './loader';
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
		this.builtInPlugins = this.resolveBuiltInPlugins();
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

	/**
	 * Resolves built-in plugins.
	 *
	 * These will be loaded with the webpack plugin itself and don't need
	 * fs-watching so we can use a simple require to load the apply function.
	 *
	 * @return {Array}
	 */
	resolveBuiltInPlugins() {
		const idToPlugin = (id) => ({
			id: id.replace(/^\.+\//, 'built-in:'),
			// eslint-disable-next-line security/detect-non-literal-require
			apply: interopRequireDefault(require(id))
		});
		return [
			'../config/base',
			'../config/prod',
			'../config/app',
			'../tasks/build',
			'../tasks/serve'
		].map(idToPlugin);
	}

	createPluginContext(contextOptions) {
		const {
			cwd,
			options,
			useBuiltIns = true,
			isWorker = false
		} = contextOptions;
		const pluginApiOptions = createPluginOptions(options);
		const context = new PluginContext({
			cwd,
			builtInPlugins: useBuiltIns ? this.builtInPlugins : [],
			isWorker,
			options: pluginApiOptions
		});
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
