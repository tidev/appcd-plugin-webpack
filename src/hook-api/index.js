import fs from 'fs';
import hash from 'hash-sum';
import path from 'path';
import Config from 'webpack-chain';

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

	/**
	 * Resolves a peer dependency from the current working directory.
	 *
	 * @param {string} request module name or path
	 * @return {string} resolved module path
	 */
	resolvePeer(request) {
		try {
			const modulePath = require.resolve(request, {
				paths: [ this.getCwd() ]
			});
			return modulePath;
		} catch (e) {
			if (e.code === 'MODULE_NOT_FOUND') {
				e.message += ` as a peer dependency in ${this.getCwd()}`;
			}
			throw e;
		}
	}

	/**
	 * Requires a peer dependency from the current working directory.
	 *
	 * @param {string} request module name or path
	 * @return {*} exported module content
	 */
	requirePeer(request) {
		// eslint-disable-next-line security/detect-non-literal-require
		return require(this.resolvePeer(request));
	}

	/**
	 * Generates a new configuration for cache-loader based on the passed
	 * identifier object and the content of any additional config files.
	 *
	 * @param {string} name Unique name for the cache
	 * @param {object} baseIdentifiers Custom object to include in hash calculation
	 * @param {Array<string>} configFiles List of config files to include in hash calculation
	 * @return {Object} Config object for cache loader with cache directory and identifier
	 */
	generateCacheConfig(name, baseIdentifiers, configFiles = []) {
		const cacheDirectory = this.resolve('build', '.cache', name);

		const hashSource = {
			baseIdentifiers,
			'webpack-plugin': require('../../package.json').version,
			'cache-loader': require('cache-loader/package.json').version,
			env: process.env.NODE_ENV,
			configFiles: ''
		};

		configFiles = configFiles.concat([
			'package-lock.json',
			'yarn.lock'
		]);

		const readConfig = file => {
			const configPath = this.resolve(file);
			if (!fs.existsSync(configPath)) {
				return null;
			}

			if (configPath.endsWith('js')) {
				try {
					// eslint-disable-next-line security/detect-non-literal-require
					return JSON.stringify(require(configPath));
				} catch (e) {
					return fs.readFileSync(configPath, 'utf-8');
				}
			} else {
				return fs.readFileSync(configPath, 'utf-8');
			}
		};

		for (const file of configFiles) {
			const content = readConfig(file);
			if (content) {
				hashSource.configFiles += content.replace(/\r\n?/g, '\n');
			}
		}

		const cacheIdentifier = hash(hashSource);
		return { cacheDirectory, cacheIdentifier };
	}

	/**
	 * Applies all registered `chainWebpack` hooks and returns the resulting
	 * Webpack config.
	 *
	 * @return {Object} Webpack config object
	 */
	resolveWebpackConfig() {
		const config = new Config();
		this.context.applyHook('chainWebpack', config);
		return config.toConfig();
	}

	/**
	 * Registers a task to run Webpack with different configurations, e.g. for
	 * production, development or to analyze bundles
	 *
	 * @param {string} name Task name
	 * @param {Object} meta Meta data to describe the task
	 * @param {Function} fn Task runner function
	 */
	registerTask(name, meta, fn) {
		if (typeof meta === 'function') {
			fn = meta;
			meta = null;
		}
		this.context.tasks[name] = { run: fn, meta: meta || {} };
	}
}
