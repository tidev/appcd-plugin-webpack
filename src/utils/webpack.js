import { createConfigItem } from '@babel/core';
import fs from 'fs';
import defaultsDeep from 'lodash.defaultsdeep';
import path from 'path';

import {
	firstMatch,
	hasValue,
	removeAfter,
	removeBefore
} from './string';

const NEXT = '❱';
const nodeModules = `${path.delimiter}node_modules${path.delimiter}`;

export const isWindows = process.platform === 'win32';

export function generateTranspileDepRegex(transpileDependencies) {
	const deps = transpileDependencies.map(dep => {
		if (typeof dep === 'string') {
			const depPath = path.join('node_modules', dep, '/');
			return isWindows
				? depPath.replace(/\\/g, '\\\\') // double escape for windows style path
				: depPath;
		} else if (dep instanceof RegExp) {
			return dep.source;
		} else {
			throw new Error('Unsupported value in "transpileDependencies" option.');
		}
	});
	return deps.length ? new RegExp(deps.join('|')) : null;
}

export function parseRequest(requestStr, cwd) {
	const parts = (requestStr || '').split('!');

	const to = removeAfter('?', removeBefore(nodeModules, parts.pop()));
	const file = path.relative(
		cwd,
		to ? to : cwd
	);

	const loaders = parts
		.map(part => firstMatch(/[a-z0-9-@]+-loader/, part))
		.filter(hasValue);

	return {
		file: hasValue(file) ? file : null,
		loaders
	};
}

export function formatRequest(request) {
	const loaders = request.loaders.join(NEXT);

	if (!loaders.length) {
		return request.file || '';
	}

	return `${loaders}${NEXT}${request.file}`;
}

/**
 * Automatically configures the @titanium-sdk/app preset if present
 * in the babel config.
 *
 * @param {Object} babelConfig Partial babel configuration
 * @param {Object} api Hook api
 * @param {Object} options Project options
 */
export function configureTitaniumAppPreset(babelConfig, api, options) {
	const { project, build } = options;
	const tiapp = project.tiapp;
	const appPresetIndex = babelConfig.options.presets.findIndex(presetConfig => {
		return presetConfig.file.request === '@titanium-sdk/app';
	});
	if (appPresetIndex === -1) {
		return;
	}

	const appPreset = babelConfig.options.presets[appPresetIndex];
	const presetOptions = appPreset.options || {};
	const readPkg = (platform = '') => {
		return JSON.parse(fs.readFileSync(path.join(build.sdk.path, platform, 'package.json'), 'utf-8'));
	};

	const envPresetOptions = presetOptions.env || {};
	const hasTargetsOption = !!envPresetOptions.targets;
	if (!hasTargetsOption) {
		const targets = {};
		if (build.platform === 'ios') {
			const pkg = readPkg('iphone');
			const defaultMinIosVersion = pkg.minIosVersion;
			targets.ios = tiapp.ios['min-ios-ver'] || defaultMinIosVersion;
		} else if (build.platform === 'android') {
			const pkg = readPkg('android');
			const v8Version = pkg.v8.version;
			const found = v8Version.match(/(\d+)\.(\d+)\.\d+\.\d+/);
			targets.chrome = parseInt(found[1] + found[2]);
		}
		envPresetOptions.targets = targets;
	}
	defaultsDeep(envPresetOptions, {
		useBuiltIns: false
	});
	presetOptions.env = envPresetOptions;

	const pkg = readPkg();
	const titaniumPluginOptions = presetOptions.titanium || {};
	defaultsDeep(titaniumPluginOptions, {
		deploytype: build.deployType,
		platform: build.platform,
		target: build.target,
		Ti: {
			version: pkg.version,
			buildHash: build.sdk.gitHash,
			buildDate: build.sdk.buildDate,
			App: {
				id: tiapp.id,
				guid: tiapp.guid,
				name: tiapp.name,
				description: tiapp.description,
				version: tiapp.version,
				publisher: tiapp.publisher,
				url: tiapp.url,
				deployType: build.deployType
			},
			Filesystem: {
				lineEnding: '\n',
				separator: '/',
			},
			Platform: generatePlatformInlines(options)
		}
	});
	presetOptions.titanium = titaniumPluginOptions;

	const newPresetConfig = createConfigItem(
		[ '@titanium-sdk/app', presetOptions ],
		{ dirname: api.getCwd(), type: 'preset' }
	);
	babelConfig.options.presets.splice(appPresetIndex, 1, newPresetConfig);
}

function generatePlatformInlines(options) {
	const { build } = options;
	if (build.platform === 'ios')  {
		const platform = {
			runtime: 'javascriptcore',
			manufacturer: 'apple'
		};
		if (build.ios.deviceFamily !== 'universal') {
			platform.osname = build.ios.deviceFamily;
		}
		return platform;
	} else {
		return {
			name: 'android',
			osname: 'android',
			runtime: 'v8'
		};
	}
}
