const path = require('path');

const defaultOptions = {
	identifier: '1234',
	task: 'build',
	type: 'classic',
	build: {
		target: 'simulator',
		platform: 'ios',
		deployType: 'development',
		sdk: {
			path: '/path/to/sdk/9.1.0',
			version: '9.1.0',
			gitHash: '0123456789',
			buildDate: '01.01.2020'
		},
		ios: {
			deviceFamily: 'universal'
		}
	},
	watch: false
};

module.exports = function generateOptions(testProject, options) {
	const project = {
		path: path.resolve(__dirname, 'projects', testProject),
		name: `webpack-test-${testProject}`
	};
	return Object.assign({ project }, defaultOptions, { ...options });
};
