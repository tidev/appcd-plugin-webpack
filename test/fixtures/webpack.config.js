const path = require('path');

module.export = {
	entry: {
		bundle: './test.js',
	},
	output: {
		pathinfo: true,
		path: path.resolve(__dirname, 'dist'),
		libraryTarget: 'commonjs2',
		filename: '[name].js',
	}
};
