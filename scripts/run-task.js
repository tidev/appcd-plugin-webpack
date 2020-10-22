const { spawn } = require('child_process');

const child = spawn(
	'node',
	[ '--preserve-symlinks', './dist/job/task-runner.js', 'build' ],
	{
		shell: true,
		stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ],
	}
);
child.send({ identifier: '45ac8781f8c41f3e3ffa71ebbe03b936d3dcf695', type: 'alloy', task: 'build', watch: true, project: { path: '/Users/jvennemann/Development/appc/kitchensink-v2', name: 'KitchenSink' }, build: { platform: 'ios', deployType: 'development', target: 'simulator', sdk: { path: '/Users/jvennemann/Library/Application Support/Titanium/mobilesdk/osx/9.1.0-beta.1', version: '9.1.0-beta.1', gitHash: '34e07d7f38', buildDate: '7/10/2020 17:58' }, ios: { deviceFamily: 'universal' } } });
child.stdout.on('data', data => console.log(data.toString()));
child.stderr.on('data', data => console.log(data.toString()));
