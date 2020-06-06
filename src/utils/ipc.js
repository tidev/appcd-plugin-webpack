const queue = [];
let sendMore = true;

const sendQueue = () => {
	if (queue.length === 0) {
		sendMore = true;
		return;
	}
	const message = queue.shift();
	sendMore = process.send(message, sendQueue);
};

export function sendData(type, data) {
	if (!sendMore) {
		queue.push({ type, data, time: Date.now() });
		return;
	}
	sendMore = process.send({ type, data, time: Date.now() }, sendQueue);
}
