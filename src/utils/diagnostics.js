import { sendData } from './ipc';

class Diagnostics {
	constructor(file) {
		this.file = file;
		this.symbols = new Set();
		this.apiUsage = {};
	}

	recordApiUsage(expression) {
		this.symbols.add(expression.replace(/^(Ti|Titanium)\./, ''));
		if (this.apiUsage[expression]) {
			this.apiUsage[expression] = 1;
		} else {
			this.apiUsage[expression]++;
		}
	}
}

export class ProjectDiagnostics {
	constructor() {
		this.diagnostics = new Map();
	}

	recordApiUsage(file, expression) {
		let diagnostics = this.diagnostics.get(file);
		if (!diagnostics) {
			diagnostics = new Diagnostics(file);
			this.diagnostics.set(file, diagnostics);
		}

		diagnostics.recordApiUsage(expression);
	}

	send(fileList) {
		const allDiagnostics = [];
		this.diagnostics.forEach((diagnostics, file) => {
			if (!fileList || fileList.includes(file)) {
				allDiagnostics.push({
					file,
					symbols: [ ...diagnostics.symbols ],
					apiUsage: diagnostics.apiUsage
				});
			}
		});
		sendData('diagnostics', allDiagnostics);
	}
}
