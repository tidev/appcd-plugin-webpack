import FSWatcher from 'appcd-fswatcher';
import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import readPkg from 'read-pkg';

import { loadModule } from './loader';
import PluginApi from './plugin-api';
import { isPlugin, ProjectDiagnostics } from '../utils';

/** @typedef {import("./hooks/hook").default} Hook */

/**
 * A grouping container for all plugins in a specific directory, i.e. a project.
 */
export default class PluginContext extends EventEmitter {
	/**
	 * Constructs a new plugin context.
	 *
	 * @param {string} cwd Current working directory of this plugin context.
	 * @param {Object} options Options object that will passed to plugins.
	 */
	constructor({ cwd, builtInPlugins, isWorker, options }) {
		super();

		if (!fs.existsSync(cwd)) {
			throw new Error(`Invalid working directory, '${cwd}' does not exist.`);
		}

		/**
		 * Current working directory of this plugin context.
		 *
		 * @type string
		 */
		this.cwd = cwd;
		/**
		 * Whether this plugin context is running inside a worker thread or not.
		 *
		 * When run as a worker, all automatic plugin reloading functionality is
		 * disabled.
		 */
		this.isWorker = isWorker;
		/**
		 * True if this context should watch plugins for changes and automatically
		 * reload them.
		 */
		this.shouldWatch = options.watch && !isWorker;
		/**
		 * package.json of the current working directory
		 */
		this.pkg = {};
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
		this.options = options || {};
		/**
		 * List of built-in plugins
		 */
		this.builtInPlugins = builtInPlugins;
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
		/**
		 * Map of file watchers
		 *
		 * @type Map<string, FSWatcher>
		 */
		this.watchers = new Map();
		/**
		 * Diagnostis data for the project.
		 */
		this.diagnostics = new ProjectDiagnostics();
	}

	initialize() {
		this.readPkg();
		console.time('resolveAndApplyPlugins');
		this.resolveAndApplyPlugins();
		console.timeEnd('resolveAndApplyPlugins');
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
	 * Reads package.json from active working directory.
	 */
	readPkg() {
		if (fs.existsSync(path.join(this.cwd, 'package.json'))) {
			this.pkg = readPkg.sync({ cwd: this.cwd });
		} else {
			this.pkg = {};
		}
	}

	resolveAndApplyPlugins(inlinePlugins = []) {
		let plugins = [].concat(this.builtInPlugins);

		if (inlinePlugins) {
			plugins = plugins.concat(inlinePlugins);
		}

		this.readPkg();
		const { cwd, pkg } = this;
		const forceLoad = this.shouldWatch;
		if (this.shouldWatch) {
			const pkgPath = path.join(cwd, 'package.json');
			const pkgWatcher = new FSWatcher(pkgPath);
			pkgWatcher.on('change', () => {
				this.reset();
				this.resolveAndApplyPlugins();
				this.emit('reload');
			});
			this.watchers.set(pkgPath, pkgWatcher);
		}

		// project plugins installed as dependencies
		const projectPlugins = Object.keys(pkg.devDependencies || {})
			.concat(Object.keys(pkg.dependencies || {}))
			.filter(isPlugin)
			.map(id => {
				return {
					id,
					apply: loadModule(id, cwd, forceLoad)
				};
			});
		plugins = plugins.concat(projectPlugins);

		// project local plugins configured in package.json
		if (pkg.appcdWebpackPlugins) {
			const files = pkg.appcdWebpackPlugins;
			if (!Array.isArray(files)) {
				throw new TypeError(`Invalid type for option "appcdWebpackPlugins", expected "array" but got "${typeof files}"`);
			}

			plugins = plugins.concat(files.map(file => {
				const pluginId = `local:${file}`;
				if (this.shouldWatch) {
					const fileWatcher = new FSWatcher(path.join(cwd, file));
					fileWatcher.on('change', e => {
						if (e.action === 'change') {
							this.reapplyPlugin(pluginId, loadModule(`./${file}`, cwd, true));
						} else if (e.action === 'delete') {
							fileWatcher.close();
							this.watchers.delete(file);
							this.removePlugin(pluginId);
						}
					});
					this.watchers.set(file, fileWatcher);
				}

				return {
					id: pluginId,
					apply: loadModule(`./${file}`, cwd, forceLoad)
				};
			}));
		}

		this.plugins = new Map(plugins.map(({ id, apply }) => [ id, apply ]));
		this.plugins.forEach((apply, id) => this.applyPlugin(id, apply));
	}

	/**
	 * Applies a plugin.
	 *
	 * @param {string} id Plugin identifier.
	 * @param {Function} apply Apply function exportet by the plugin file.
	 */
	applyPlugin(id, apply) {
		const pluginApi = new PluginApi(id, this);
		try {
			apply(pluginApi, this.options);
		} catch (e) {
			e.message = `Failed to apply plugin "${id}". ${e.message}`;
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

	reset() {
		this.hooks.forEach(hook => hook.clear());
		this.plugins.clear();
		this.tasks = {};
		this.watchers.forEach(watcher => watcher.close());
		this.watchers.clear();
	}
}
