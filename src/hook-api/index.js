import path from 'path';

/**
 * The Hook API will be passed into each hook file that is registered with
 * appcd.
 *
 * Each function exported from a hook file will receive a unique HookApi
 * instance. This allows for better tracking of failed individual hooks.
 */
export default class HookApi {
	/**
	 * Constructs a new Hook API.
	 *
	 * For each registered hook in the passed hook context a new function is
	 * added to this class that delegates to the hook's `add` method.
	 *
	 * @param {string} id Unique identifier for the current hook file.
	 * @param {HookContext} context Project hook context that this hook api delegates to.
	 */
	constructor(id, context) {
		this.id = id;
		this.context = context;
		context.hooks.forEach((hook, name) => {
			this[name] = (value) => hook.add(value, id);
		});
	}

	/**
	 * Returns the current working directory.
	 *
	 * @return {string} Current working directory
	 */
	getCwd() {
		return this.context.getCwd();
	}

	/**
	 * Resolves a path relative to the current working directory.
	 *
	 * @param {string} _path The path to resolve
	 * @return {string} THe resolved path
	 */
	resolve(..._path) {
		return path.resolve(this.getCwd(), ..._path);
	}
}
