import fs from 'fs';
import hash from 'hash-sum';
import path from 'path';
import Config from 'webpack-chain';

import { matchesPluginId } from '../utils';

/** @typedef {import("./context").default} PluginContext */

/**
 * The Plugin API will be passed into the function exported by plugins and can
 * then be used to tap into the individual hooks.
 *
 * This represets the front-facing API that plugin creators interact with. Each
 * function exported from a plugin file will receive a unique PluginApi
 * instance. This allows for better tracking of failed hooks from plugins.
 */
export default class PluginApi {
	/**
	 * Constructs a new Plugin API.
	 *
	 * For each registered hook in the passed plugin context a new function is
	 * added to this class that delegates to the hook's `add` method.
	 *
	 * @param {string} id Unique identifier for the current plugin.
	 * @param {PluginContext} context Plugin context that this PluginApi delegates to.
	 */
	constructor(id, context) {
		this.id = id;
		this.context = context;
		context.hooks.forEach((hook, name) => {
			if (this[name]) {
				throw new Error(`Restricted hook name used. "${name}" is a pre-defined PluginApi method.`);
			}
			this[name] = (value, options = {}) => {
				if (!options.name) {
					options.name = this.id;
				}
				hook.add(value, options);
			};
		});
	}

	/**
	 * Returns the current working directory.
	 *
	 * @return {string} Current working directory
	 */
	getCwd() {
		return this.context.cwd;
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
	 * Checks if there is another plugin with the given identifier.
	 *
	 * @param {string} id Plugin identifier.
	 * @return {boolean}
	 */
	hasPlugin(id) {
		return Array.from(this.context.plugins.keys())
			.some(pid => matchesPluginId(pid, id));
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
		const cacheDirectory = this.resolve('node_modules', '.cache', name);

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
	 * production, development or to analyze bundles.
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
