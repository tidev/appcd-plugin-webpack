import PluginApi from './plugin-api';
import { EventEmitter } from 'events';

/**
 * The plugin context.
 *
 * A plugin context serves as a grouping container for all plugins in a
 * specific directory.
 */
export default class PluginContext extends EventEmitter {
	/**
	 * Constructs a new plugin context.
	 *
	 * @param {string} cwd Current working directory of this plugin context.
	 * @param {Object} options Options object that will passed to plugins.
	 */
	constructor(cwd, options) {
		super();

		/**
		 * Current working directory of this plugin context.
		 *
		 * @type string
		 */
		this.cwd = cwd;
		/**
		 * Map of hooks known in this context.
		 *
		 * @type Map<string, Hook>
		 */
		this.hooks = new Map();
		/**
		 * Options object that will be passed into plugins.
		 *
		 * @type Object
		 */
		this.options = options;
		/**
		 * Map of plugin identifiers and their apply functions.
		 *
		 * @type Map<string, Function>
		 */
		this.plugins = new Map();
		/**
		 * Map of tasks known in this context.
		 *
		 * @type Object
		 */
		this.tasks = {};
	}

	/**
	 * Registers a new hook under the given name in this context.
	 *
	 * @param {string} name The name of the hook.
	 * @param {Hook} hook The hook class instance.
	 */
	registerHook(name, hook) {
		if (!this.hooks.has(name)) {
			this.hooks.set(name, hook);
		}
	}

	/**
	 * Removes hook with the given name from this context.
	 *
	 * @param {string} name Name of the hook to remove.
	 */
	unregisterHook(name) {
		this.hooks.delete(name);
	}

	/**
	 * Returns hook with the given name.
	 *
	 * @param {string} name Name of the hook to look for.
	 * @return {Hook}
	 */
	getHook(name) {
		return this.hooks.get(name);
	}

	/**
	 * Applies a plugin.
	 *
	 * @param {string} id Plugin identifier.
	 * @param {Function} apply Apply function exportet by the plugin file.
	 */
	applyPlugin(id, apply) {
		this.plugins.set(id, apply);
		const pluginApi = new PluginApi(id, this);
		try {
			apply(pluginApi, this.options);
		} catch (e) {
			e.message = `Failed to load and apply plugin "${id}". ${e.message}`;
			throw e;
		}
	}

	/**
	 * Re-applies the function exportet from a plugin.
	 *
	 * Makes sure to remove old hook function before re-appliying them.
	 *
	 * @param {string} id Plugin identifier.
	 * @param {Function} apply Apply function exportet by the plugin.
	 */
	reapplyPlugin(id, apply) {
		this.removePlugin(id, false);
		this.applyPlugin(id, apply);
		this.emit('change', { id, type: 'changed' });
	}

	/**
	 * Removes the specified plugin by removing it from all known hooks.
	 *
	 * @param {string} id Plugin identifier
	 * @param {boolean} shouldEmit Whether or not to emit `change` event
	 */
	removePlugin(id, shouldEmit = true) {
		this.hooks.forEach(hook => {
			hook.remove(id);
		});
		this.plugins.delete(id);
		if (shouldEmit) {
			this.emit('change', { id, type: 'removed' });
		}
	}

	/**
	 * Applies the hook with the given name, passing all additional arguements
	 * to the hook.
	 *
	 * @param {string} name Name of the hook to apply.
	 * @param  {...any} args Arguements that will be passed to the hook.
	 * @return {Hook} Returns the hook
	 */
	applyHook(name, ...args) {
		const hook = this.getHook(name);
		if (!hook) {
			throw new Error(`Unable to apply hook "${name}". No hook with this name is registered.`);
		}
		hook.apply(...args);

		return hook;
	}

	/**
	 * Asynchronously applies the hook with the given name, passing all additional
	 * arguments to the hook.
	 *
	 * @param {string} name Name of the hook to apply.
	 * @param  {...any} args Arguements that will be passed to the hook.
	 * @return {Hook} Returns the hook
	 */
	async applyAsyncHook(name, ...args) {
		const hook = this.getHook(name);
		if (!hook) {
			throw new Error(`Unable to apply hook "${name}". No hook with this name is registered.`);
		}
		await hook.apply(...args);

		return hook;
	}
}
