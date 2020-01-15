import { schema } from './options';
import hookManager from '../hook-api/manager';
import { createHookOptions } from '../hook-api/options';
import { registerHooks, validate } from '../utils';

const initTimeout = setTimeout(() => {
	throw new Error('Task timeout: Did not receive initial task data within 5s.');
}, 5000);

process.once('message', data => {
	clearTimeout(initTimeout);

	validate(schema, data);
	const options = data;

	registerHooks(hookManager);

	const { project } = options;
	const context = hookManager.createHookContext(project.path, {
		watch: false,
		hookOptions: createHookOptions(options)
	});
	const name = process.argv[2];
	const task = context.tasks[name];
	if (!task) {
		throw new Error(`Task "${name}" does not exist.`);
	}

	const { run } = task;
	run().catch(err => {
		console.error(err);
		process.exit(1);
	});
});
