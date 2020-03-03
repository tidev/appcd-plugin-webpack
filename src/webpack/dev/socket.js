'use strict';

const Client = require('./socket-client');

let retries = 0;
let client = null;

function initSocket(url, handlers) {
	client = new Client(url);

	client.onOpen(() => {
		retries = 0;
	});

	client.onClose(() => {
		if (retries === 0) {
			handlers.close();
		}

		// Try to reconnect.
		client = null;

		// After 10 retries stop trying, to prevent logspam.
		if (retries <= 10) {
			// Exponentially increase timeout to reconnect.
			// Respectfully copied from the package `got`.
			// eslint-disable-next-line no-mixed-operators, no-restricted-properties
			const retryInMs = 1000 * Math.pow(2, retries) + Math.random() * 100;
			retries += 1;

			setTimeout(() => {
				initSocket(url, handlers);
			}, retryInMs);
		}
	});

	client.onMessage((data) => {
		console.log('webpack dev client onMessage', data);
		const msg = JSON.parse(data);
		if (handlers[msg.type]) {
			handlers[msg.type](msg.data);
		}
	});
}

module.exports = initSocket;
