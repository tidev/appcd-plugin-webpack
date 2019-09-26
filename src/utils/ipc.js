export function sendData(type, data) {
	process.send && process.send({ type, data });
}
