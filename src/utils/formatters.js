function group (errors) {
	const modulePaths = new Map();

	for (const error of errors) {
		if (!modulePaths.has(error.module)) {
			modulePaths.set(error.module, []);
		}
		modulePaths.get(error.module).push(error);
	}

	return Array.from(modulePaths.keys()).map(module => ({
		module: module,
		errors: modulePaths.get(module),
	}));
}

function formatFileList (files) {
	const length = files.length;
	if (!length) {
		return '';
	}
	return ` in ${files[0]}${files[1] ? `, ${files[1]}` : ''}${length > 2 ? ` and ${length - 2} other${length === 3 ? '' : 's'}` : ''}`;
}

function formatGroup (group) {
	const files = group.errors.map(e => e.file).filter(Boolean);
	return `* ${group.module} -> @${group.module}${formatFileList(files)}`;
}

export function formatAbsolutePathErrors (errors) {
	const pathErrors = errors.filter(e => e.type === 'absolute-path-usage');
	if (pathErrors.length > 0) {
		// Firstly group related paths together
		const grouped = group(pathErrors);
		return [
			grouped.length === 1 ? 'Absolute path require found' : 'Absolute path requires found',
			'',
			...grouped.map(formatGroup),
			'For absolute paths use the "@" alias at the start of your path to allow it to be resolved correctly',
		];
	}
}
