export function resolveArgs() {
	const rawArgv = process.argv.slice(2);
	return require('minimist')(rawArgv, {
		boolean: [
			'watch'
		]
	});
}
