import fs from 'fs';
import defaultsDeep from 'lodash.defaultsdeep';
import path from 'path';
import { tiappxml } from 'node-titanium-sdk';

import { validate, defaults } from '../hook-api/options';

export function registerHooks(hookManager) {
	hookManager.registerHook('chainWebpack');
}

export function unregisterHooks(hookManager) {
	hookManager.unregisterHook('chainWebpack');
}

export function loadProjectOptions(projectDir, baseOptions) {
	let options = {};

	const tiAppPath = path.join(projectDir, 'tiapp.xml');
	if (fs.existsSync(tiAppPath)) {
		const tiapp = new tiappxml(tiAppPath);
		options = {
			...tiapp.webpack
		};
	}

	Object.assign(options, {
		...baseOptions
	});
	options = defaultsDeep(options, defaults());
	validate(options);

	return options;
}
