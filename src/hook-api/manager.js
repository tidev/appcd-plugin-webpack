import ProjectHookContext from './context/project';
import Hook from './hook';
import { interopRequireDefault } from './loader';

class HookManager {
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

	unregisterHook(name) {
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
		const idToHook = (id) => ({
			id: id.replace(/^\.+\//, 'built-in:'),
			// eslint-disable-next-line security/detect-non-literal-require
			apply: interopRequireDefault(require(id))
		});
		this.builtInHookAppliers = [
			'../config/base',
			'../config/prod',
			'../tasks/build',
			'../tasks/serve'
		].map(idToHook);
	}

	createHookContext(projectDir, options) {
		const context = new ProjectHookContext(projectDir, options);
		this.hookContexts.set(projectDir, context);
		this.hookClasses.forEach((hookClass, name) => {
			const hook = new hookClass(name);
			context.addHook(name, hook);
		});
		this.builtInHookAppliers.map(({ id, apply }) => context.applyHookFile(id, apply));
		context.initialize();

		return context;
	}
}

export default new HookManager();
