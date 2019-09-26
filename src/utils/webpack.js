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
