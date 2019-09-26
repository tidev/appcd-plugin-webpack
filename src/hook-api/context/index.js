import HookApi from '../index';

/**
 * The base context for hooks.
 *
 * A hook context serves as a grouping container for a set of hooks. It manages
 * adding and removing of hooks as well as applying each individual hook.
 */
export default class HookContext {
	/**
	 * Constructs a new hook context.
	 */
	constructor() {
		this.hooks = new Map();
		this.options = {};
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
	 * Applies the function exportet from a hook file.
	 *
	 * @param {string} id Hook file identifier.
	 * @param {Function} apply Apply function exportet by the hook file.
	 */
	applyHookFile(id, apply) {
		const hookApi = new HookApi(id, this);
		apply(hookApi, this.options);
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
		this.hooks.forEach(hook => {
			hook.remove(id);
		});
		this.applyHookFile(id, apply);
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
