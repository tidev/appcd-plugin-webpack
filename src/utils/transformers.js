export function transformAbsolutePathErrors (error) {
	if (error.type === 'module-not-found' && error.module.startsWith('/')) {
		error.type = 'absolute-path-usage';
		error.message = `Absolute path used to require ${error.module}`;
		error.name = 'Absolute path usage';
	}
	return error;
}
