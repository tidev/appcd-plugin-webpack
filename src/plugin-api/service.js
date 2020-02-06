import path from 'path';
import readPkg from 'read-pkg';

import PluginContext from './context';
import Hook from './hooks/hook';
import { interopRequireDefault, loadModule } from './loader';
import { createPluginOptions } from './utils';

/**
 * @type Plugin
 * @property {string} id Plugin identifier
 * @property {Function} apply Plugin's apply function
 */

/**
 * The central plugin managemant service. Registers/unregisters available
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
		const projectType = options.project.type;
		const projectConfigPlugin = {
			id: `built-in:config/${projectType}`,
			apply: loadModule(`./${projectType}`, path.resolve(__dirname, '..', 'config'))
		};
		const plugins = this.resolvePlugins(context, [ projectConfigPlugin ]);
		plugins.forEach(({ id, apply }) => context.applyPlugin(id, apply));
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

	/**
	 * Resolves all available plugins for the given plugin context.
	 *
	 * @param {PluginContext} context Plugin context.
	 * @param {Array<Plugin>} inlinePlugins Array of inline plugins to add.
	 * @return {Array<Plugin>}
	 */
	resolvePlugins(context, inlinePlugins) {
		let plugins = [].concat(this.builtInPlugins);

		if (inlinePlugins) {
			plugins = plugins.concat(inlinePlugins);
		}

		const { cwd } = context;
		const pkg = readPkg.sync({ cwd });
		// TODO: Plugins from pkg.devDependencies and pkg.dependencies

		if (pkg.appcdWebpackPlugins) {
			const files = pkg.appcdWebpackPlugins;
			if (!Array.isArray(files)) {
				throw new TypeError(`Invalid type for option "appcdWebpackPlugins", expected "array" but got "${typeof files}"`);
			}

			plugins = plugins.concat(files.map(file => ({
				id: `local:${file}`,
				apply: loadModule(`./${file}`, cwd, true)
			})));
		}

		return plugins;
	}
}

export default new PluginService();
