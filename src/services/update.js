import Dispatcher from 'appcd-dispatcher';
import checkForUpdate from 'update-check';

import pkg from '../../package.json';

export default class UpdateService extends Dispatcher {
	activate() {
		this.register('/info', async ctx => this.getUpdateInfo(ctx));
	}

	async getUpdateInfo(ctx) {
		let update = null;
		try {
			update = await checkForUpdate(pkg, {
				interval: 1000 * 60 * 60 * 24 * 2 // 2 days
			});
		} catch (e) {
			console.error(e);
		}

		if (update) {
			ctx.response = {
				available: true,
				latest: update.latest,
				current: pkg.version,
				fromCache: update.fromCache
			};
		} else {
			ctx.response = { available: false };
		}
	}
}
