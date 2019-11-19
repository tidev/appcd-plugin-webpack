/**
 * A fallback for require.resolve.
 *
 * The built-in require.resolve doesn't work for request outside of a appcd
 * plugin since they are restricted due to PluginModule.
 *
 * @param {string} request The module to resolve.
 * @param {Object} options Resolve options.
 * @param {Array<string>} options.paths Paths from which module resolution will start.
 * @return {string} Resolved module path.
 */
function resolveFallback (request, options) {
	const Module = require('module');
	const isMain = false;
	const fakeParent = new Module('', null);

	const paths = [];

	for (let i = 0; i < options.paths.length; i++) {
		const path = options.paths[i];
		fakeParent.paths = Module._nodeModulePaths(path);
		const lookupPaths = Module._resolveLookupPaths(request, fakeParent, true);

		if (!paths.includes(path)) {
			paths.push(path);
		}

		for (let j = 0; j < lookupPaths.length; j++) {
			if (!paths.includes(lookupPaths[j])) {
				paths.push(lookupPaths[j]);
			}
		}
	}

	const filename = Module._findPath(request, paths, isMain);
	if (!filename) {
		const err = new Error(`Cannot find module '${request}'`);
		err.code = 'MODULE_NOT_FOUND';
		throw err;
	}
	return filename;
}

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
	} catch (e) {}
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
	if (resolvedPath) {
		if (force) {
			clearRequireCache(resolvedPath);
		}

		return require(resolvedPath);
	}

	throw new Error(`Could not load hook ${request}`);
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
