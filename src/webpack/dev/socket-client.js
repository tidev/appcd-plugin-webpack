const BaseClient = require('webpack-dev-server/client/clients/BaseClient');

const WebSocket = require('tiws').default;

module.exports = class WebsocketClient extends BaseClient {
	constructor(url) {
		super();
		const wsUrl = url.replace(/^http/, 'ws');
		this.client = new WebSocket(wsUrl, {
			origin: url.replace(/(\w+:\/\/\w+:\d+).*/, (match, origin) => origin)
		});
	}

	static getClientPath(options) {
		return require.resolve('./client');
	}

	onOpen(f) {
		this.client.onopen = f;
	}

	onClose(f) {
		this.client.onclose = f;
	}

	// call f with the message string as the first argument
	onMessage(f) {
		console.log('registering client onMessage');
		this.client.onmessage = (e) => {
			f(e.data);
		};
	}
};
