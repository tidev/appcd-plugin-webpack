import Dispatcher from 'appcd-dispatcher';
import { codes, Response } from 'appcd-response';
import fs from 'fs-extra';
import Koa from 'koa';
import serve from 'koa-static';
import path from 'path';

export default class WebpackWebService extends Dispatcher {

	async activate() {
		this.app = new Koa();
		this.app.use(serve(path.join(__dirname, '..', 'public')));
		this.server = this.app.listen(8080);
		// this.register('/:path*', ctx => this.serve(ctx));
	}

	async deactivate() {
		this.server.close();
		this.server = null;
		this.app = null;
	}

	async serve(ctx) {
		const indexFilename = 'index.html';
		const relativePath = ctx.path;
		const trailingSlash = relativePath[relativePath.length - 1] === '/';
		let localPath = path.join(__dirname, '..', 'public', relativePath);

		if (trailingSlash) {
			localPath = path.join(localPath, indexFilename);
		}

		let stats;
		try {
			stats = await fs.stat(localPath);
			if (stats.isDirectory()) {
				localPath = path.join(localPath, indexFilename);
				stats = await fs.stat(localPath);
			}
		} catch (e) {
			const notFoundErrorCodes = [ 'ENOENT', 'ENAMETOOLONG', 'ENOTDIR' ];
			if (notFoundErrorCodes.includes(e.code)) {
				return new Response(codes.NOT_FOUND);
			}
			return new Response(codes.SERVER_ERROR);
		}

		if (!await fs.exists(localPath)) {
			return new Response(codes.NOT_FOUND);
		}

		// @fixme there is currently no way to set header :(

		return (await fs.readFile(localPath)).toString();
	}
}
