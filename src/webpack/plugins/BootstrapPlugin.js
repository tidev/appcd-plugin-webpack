import SingleEntryPlugin from 'webpack/lib/SingleEntryPlugin';
import VirtualModulesPlugin from 'webpack-virtual-modules';

const bootstrapEntryTemplate = (directory) => `function importAll(r) {
	r.keys().forEach(r);
}

importAll(require.context('./${directory}', true, /\\.bootstrap.js$/));`;

/**
 * Plugin to add a new entry that loads all available .bootstrap.js files.
 */
export class BootstrapPlugin {
	constructor(context, searchDirectory) {
		this.name = 'main.bootstrap';
		this.entry = './main.bootstrap.js';
		this.context = context;
		this.virtualModules = new VirtualModulesPlugin({
			['main.bootstrap.js']: bootstrapEntryTemplate(searchDirectory)
		});
	}

	apply(compiler) {
		this.virtualModules.apply(compiler);
		const { context, entry, name } = this;
		new SingleEntryPlugin(context, entry, name).apply(compiler);
	}
}
