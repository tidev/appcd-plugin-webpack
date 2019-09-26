import fs from 'fs';
import path from 'path';
import readPkg from 'read-pkg';
import { loadConfig } from 'ti-js-config';

import { loadModule, resolveModule } from '../loader';
import HookContext from './index';

// lazy load FSWatcher module
let FSWatcher;
function lazyWatcher() {
	if (!FSWatcher) {
		FSWatcher = require('appcd-fswatcher');
	}

	return FSWatcher;
}

/**
 * A project scoped hook context.
 *
 * This context will load built-in hook files from appcd plugins and any local
 * hook files configured in the project.
 *
 * A project can define a list of hook files to load under the `appcdHooks` key
 * inside the project's `package.json`.
 */
export default class ProjectHookContext extends HookContext {
	constructor(projectDir, platform, watch = false) {
		super();

		this.projectDir = projectDir;
		this.shouldWatch = watch;
		this.watchers = {};
		const tiConfigPath = path.join(this.projectDir, 'ti.config.js');
		if (fs.existsSync(tiConfigPath)) {
			// FIXME: Replace with a trimmed down options object instead of the whole project config
			this.options = loadConfig(this.projectDir);
			this.options.platform = platform;
		}
		this.validProjectTypes = [ 'vue' ];
	}

	getCwd() {
		return this.projectDir;
	}

	loadProjectTypeHookFile() {
		const projectType = this.options.type;
		if (!this.validProjectTypes.includes(projectType)) {
			throw new Error(`Project type must be one of ${this.validProjectTypes.join(',')}. Received ${projectType}.`);
		}
		const id = `config/${projectType}`;
		const configHookFile = `../../${id}`;
		const apply = require(configHookFile);
		this.applyHookFile(`built-in:${id}`, apply);
	}

	loadAndApplyLocalHookFiles() {
		const pkgPath = path.join(this.projectDir, 'package.json');
		if (this.shouldWatch) {
			const FSWatcher = lazyWatcher();
			const pkgWatcher = new FSWatcher(pkgPath);
			pkgWatcher.on('change', e => {
				if (e.type === 'changed') {
					this.loadPackageHookFiles();
				} else {
					// TODO: remove hook files
				}
			});
			this.watchers[pkgPath] = pkgWatcher;
		}

		if (fs.existsSync(pkgPath)) {
			this.loadPackageHookFiles();
		}

		// TODO: Read pkg.dependencies for hooks/plugins?
	}

	loadPackageHookFiles() {
		const pkg = readPkg.sync({ cwd: this.projectDir });
		if (pkg.appcdHooks) {
			const files = pkg.appcdHooks;
			if (!Array.isArray(files)) {
				throw new TypeError(`Invalid type for option 'appcdHooks', expected 'array' but got ${typeof files}`);
			}

			files.forEach(file => {
				const hookId = `local:${file}`;
				const relativePath = `./${file}`;
				const fullPath = resolveModule(relativePath, this.projectDir);
				if (!fullPath) {
					console.warn(`Could not resolve full path for ${file} in ${this.projectDir}`);
					return;
				}
				if (this.shouldWatch) {
					const watcher = new FSWatcher(fullPath);
					watcher.on('change', e => {
						console.log(`${hookId} changed`);
						console.log(e);
						this.reapplyHookFile(hookId, loadModule(relativePath, this.projectDir, true));
					});
					this.watchers[fullPath] = watcher;
				}

				this.applyHookFile(hookId, loadModule(relativePath, this.projectDir, false));
			});
		}
	}
}
