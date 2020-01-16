import HookApi from '../index';
import { EventEmitter } from 'events';

/**
 * The base context for hooks.
 *
 * A hook context serves as a grouping container for a set of hooks. It manages
 * adding and removing of hooks as well as applying each individual hook.
 */
export default class HookContext extends EventEmitter {
	/**
	 * Constructs a new hook context.
	 */
	constructor() {
		super();

		/**
		 * Map of hooks known in this context.
		 *
		 * @type Map<string, Hook>
		 */
		this.hooks = new Map();
		/**
		 * Options object that will be passed into hook functions
		 *
		 * @type Object
		 */
		this.hookOptions = {};
		/**
		 * Map of tasks known in this context.
		 *
		 * @type Object
		 */
		this.tasks = {};
	}

	/**
	 * Adds a new hook under the given name.
	 *
	 * @param {string} name The name of the hook.
	 * @param {Hook} hook The hook instance.
	 */
	addHook(name, hook) {
		if (!this.hooks.has(name)) {
			this.hooks.set(name, hook);
		}
	}

	/**
	 * Removes hook with the given name.
	 *
	 * @param {string} name Name of the hook to remove.
	 */
	removeHook(name) {
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
	 * Initializes a context.
	 *
	 * Typically used by the context to load all known hook files.
	 */
	initialize() {

	}

	/**
	 * Applies the function exported from a hook file.
	 *
	 * @param {string} id Hook file identifier.
	 * @param {Function} apply Apply function exportet by the hook file.
	 */
	applyHookFile(id, apply) {
		const hookApi = new HookApi(id, this);
		try {
			apply(hookApi, this.hookOptions);
		} catch (e) {
			e.message = `Failed to load and apply hook "${id}". ${e.message}`;
			throw e;
		}
	}

	/**
	 * Re-applies the function exportet from a hook file.
	 *
	 * Makes sure to remove old hook function before re-appliying them.
	 *
	 * @param {string} id Hook file identifier.
	 * @param {Function} apply Apply function exportet by the hook file.
	 */
	reapplyHookFile(id, apply) {
		this.removeHookFile(id, false);
		this.applyHookFile(id, apply);
		this.emit('change', { id, type: 'changed' });
	}

	/**
	 * Removes all hooks from the specified hook file.
	 *
	 * @param {string} id Hook file identifier
	 * @param {boolean} shouldEmit Whether or not to emit change event
	 */
	removeHookFile(id, shouldEmit = true) {
		this.hooks.forEach(hook => {
			hook.remove(id);
		});
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
	 */
	applyHook(name, ...args) {
		const hook = this.getHook(name);
		if (!hook) {
			throw new Error(`Unable to apply hook "${name}". No hook with this name is registered.`);
		}
		hook.apply(...args);
	}

	/**
	 * Asynchronously applies the hook with the given name, passing all additional
	 * arguements to the hook.
	 *
	 * @param {string} name Name of the hook to apply.
	 * @param  {...any} args Arguements that will be passed to the hook.
	 */
	async applyAsyncHook(name, ...args) {
		const hook = this.getHook(name);
		if (!hook) {
			throw new Error(`Unable to apply hook "${name}". No hook with this name is registered.`);
		}
		await hook.apply(...args);
	}
}
