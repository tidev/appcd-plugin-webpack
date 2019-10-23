'use strict';

const ExternalsPlugin = require('webpack/lib/ExternalsPlugin');

class TitaniumExternalsPlugin {
	constructor(modules) {
		this.modules = modules;
	}

	apply(compiler) {
		const externals = [
			'./app.js',
			'com.appcelerator.aca',
			...this.modules
		];
		new ExternalsPlugin('commonjs', externals).apply(compiler);
	}
}

module.exports = TitaniumExternalsPlugin;
