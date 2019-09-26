const spawn = require('child_process').spawn;

const child = spawn('node', [
  '/Users/jvennemann/Development/appc/appcd-plugin-webpack/dist/tasks/build.js',
  '--project',
  '/Users/jvennemann/Development/appc/titanium-vue-sample'
], { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] });
child.stdout.on('data', data => { console.log(data.toString()) });
child.stderr.on('data', data => { console.log(data.toString()) });
child.on('close', code => {
  console.log(code);
});