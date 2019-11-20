export function resolveArgs() {
	const rawArgv = process.argv.slice(2);
	const parsedArgs = require('minimist')(rawArgv, {
		boolean: [
			'watch'
		]
	});
	return parsedArgs;
}
