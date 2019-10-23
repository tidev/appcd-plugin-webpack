export function resolveArgs() {
	const rawArgv = process.argv.slice(2);
	const parsedArgs = require('minimist')(rawArgv, {
		alias: {
			modules: 'm'
		},
		boolean: [
			'watch'
		],
		default: {
			modules: []
		}
	});
	if (!Array.isArray(parsedArgs.modules)) {
		parsedArgs.modules = [parsedArgs.modules];
	}
	return parsedArgs;
}

