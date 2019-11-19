import { sendData } from '../../utils/ipc';

class ApiTracker {
	constructor() {
		this.tiSymbols = new Map();
	}

	getSymbolSet(file) {
		if (this.tiSymbols.has(file)) {
			return this.tiSymbols.get(file);
		}

		const symbols = new Set();
		this.tiSymbols.set(file, symbols);
		return symbols;
	}

	sendUsage(fileList) {
		const usage = [];
		this.tiSymbols.forEach((symbols, file) => {
			if (!fileList || fileList.includes(file)) {
				usage.push({
					file,
					symbols: [ ...symbols ]
				});
			}
		});
		sendData('api-usage', usage);
	}
}

export const apiTracker = new ApiTracker();
