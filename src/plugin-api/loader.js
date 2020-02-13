const resolve = require.resolve;

/**
 * Resolves a module relative to the given context.
 *
 * @param {string} request The module to resolve.
 * @param {string} context Path from which resolution will start.
 * @return {string} Resolved module path.
 */
export function resolveModule(request, context) {
	let resolvedPath;
	try {
		resolvedPath = resolve(request, {
			paths: [ context ]
		});
	} catch (e) {
		// errors are silently ignored and we return indefined instead
	}
	return resolvedPath;
}

/**
 * Loads a module based on the given context path, optionally ignoring
 * require cache.
 *
 * @param {string} request The module to load.
 * @param {string} context Path from which module resolution will start.
 * @param {boolean} force Wether to force load the module by ignore require cache.
 * @return {any}
 */
export function loadModule(request, context, force = false) {
	const resolvedPath = resolveModule(request, context);
	if (!resolvedPath) {
		throw new Error(`Could not resolve ${request} from ${context}`);
	}

	if (force) {
		clearRequireCache(resolvedPath);
	}
	// eslint-disable-next-line security/detect-non-literal-require
	return interopRequireDefault(require(resolvedPath));
}

/**
 * Returns the `default` export if the given object is a Babel transpiled
 * ES6 module, otherwise just returns the object.
 *
 * @param {Object} obj Module export
 * @return {Object} The default export
 */
export function interopRequireDefault(obj) {
	return obj && obj.__esModule ? obj.default : obj;
}

/**
 * Clears the require cache for the specified module and all it's child
 * modules.
 *
 * @param {string} id Module id to clear require cache for.
 * @param {Map<string, boolean>} map Helper map to keep track of already cleared modules.
 */
function clearRequireCache (id, map = new Map()) {
	const module = require.cache[id];
	if (module) {
		map.set(id, true);
		// Clear children modules
		module.children.forEach(child => {
			if (!map.get(child.id)) {
				clearRequireCache(child.id, map);
			}
		});
		delete require.cache[id];
	}
}
