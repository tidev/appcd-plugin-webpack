import ProjectHookContext from './context/project';
import Hook from './hook';

export default class HookManager {
	constructor() {
		this.builtInHookAppliers = [];
		this.hookClasses = new Map();
		this.hookContexts = new Map();

		this.resolveBuiltInHooks();
	}

	registerHook(name, hookClass = Hook) {
		this.hookClasses.set(name, hookClass);

		this.hookContexts.forEach(context => {
			const hook = new hookClass(name);
			context.addHook(name, hook);
		});
	}

	deregisterHook(name) {
		this.hookClasses.delete(name);

		this.hookContexts.forEach(context => {
			context.removeHook(name);
		});
	}

	/**
	 * Resolves built-in hook files
	 *
	 * These will be loaded with the plugin and don't need fs-watching so we can
	 * use a simple require to load the apply function.
	 */
	resolveBuiltInHooks() {
		// TODO: This needs to happen per-plugin when plugins activate
		const idToHook = (id) => ({
			id: id.replace(/^.+\//, 'built-in:'),
			apply: require(id)
		});
		this.builtInHookAppliers = [
			'../config/base',
			'../config/prod'
		].map(idToHook);
	}

	getHookContextForProject(projectDir, options) {
		if (this.hookContexts.has(projectDir)) {
			return this.hookContexts.get(projectDir);
		}

		const context = this.createProjectHookContext(projectDir, options);
		this.builtInHookAppliers.map(({ id, apply }) => context.applyHookFile(id, apply));
		context.initialize();

		return context;
	}

	createProjectHookContext(projectDir, options) {
		const context = new ProjectHookContext(projectDir, options);
		this.hookContexts.set(projectDir, context);
		this.hookClasses.forEach((hookClass, name) => {
			const hook = new hookClass(name);
			context.addHook(name, hook);
		});
		return context;
	}
}
