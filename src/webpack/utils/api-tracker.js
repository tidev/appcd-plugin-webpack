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

	toJson() {
		const data = {};
		this.tiSymbols.forEach((symbolSet, fileName) => {
			data[fileName] = [ ...symbolSet ];
		});
		return data;
	}
}

export const apiTracker = new ApiTracker();
