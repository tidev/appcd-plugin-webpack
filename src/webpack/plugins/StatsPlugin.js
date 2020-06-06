import { analyzeBundle } from '../analyzer';
import { sendData } from '../../utils';

/**
 * Prepares Webpack stats for usage inside the Web UI.
 */
export class StatsPlugin {
	constructor() {
		this.assetSources = new Map();
	}

	apply(compiler) {
		compiler.hooks.afterEmit.tap('StatsPlugin:afterEmit', compilation => {
			this.assetSources = new Map();
			for (const name in compilation.assets) {
				const asset = compilation.assets[name];
				this.assetSources.set(name, asset.source());
			}
		});

		compiler.hooks.done.tap('StatsPlugin:done', stats => {
			const statsData = stats.toJson();
			analyzeBundle(statsData, this.assetSources, compiler.options.output.path);
			sendData('stats', statsData);
		});
	}
}
