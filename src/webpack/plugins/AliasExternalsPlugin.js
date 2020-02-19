import ExternalModule from 'webpack/lib/ExternalModule';

/**
 * Allows Webpack aliases to point to external modules.
 */
export class AliasExternalsPlugin {
	/**
	 * @param {Array<string>} externals List of external modules
	 */
	constructor(externals) {
		this.externals = externals;
		this.alias = [];
	}

	apply(compiler) {
		compiler.hooks.compile.tap('AliasExternalsPlugin', ({ normalModuleFactory }) => {
			normalModuleFactory.resolverFactory.hooks.resolveOptions.for('normal').tap('AliasExternalsPlugin', (options) => {
				this.alias = options.alias;
			});
			normalModuleFactory.hooks.factory.tap('AliasExternalsPlugin', factory => (data, callback) => {
				const dependency = data.dependencies[0];
				const request = dependency.request;

				const aliasedRequest = this.alias[request];
				if (aliasedRequest && this.externals.includes(aliasedRequest)) {
					return callback(
						null,
						new ExternalModule(aliasedRequest, 'commonjs', request)
					);
				}

				factory(data, callback);
			});
		});
	}
}
