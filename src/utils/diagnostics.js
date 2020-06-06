import { sendData } from './ipc';

class Diagnostics {
	constructor(file) {
		this.file = file;
		this.symbols = new Set();
		this.apiUsage = {};
	}

	recordApiUsage(expression) {
		this.symbols.add(expression.replace(/^(Ti|Titanium)\./, ''));
		if (!this.apiUsage[expression]) {
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

	send({ modified, removed, watchRun }) {
		const allDiagnostics = [];
		if (!watchRun) {
			this.diagnostics.forEach((diagnostics, file) => {
				allDiagnostics.push({
					file,
					symbols: [ ...diagnostics.symbols ],
					apiUsage: diagnostics.apiUsage
				});
			});
		} else {
			for (const modifiedFile of modified) {
				const diagnostics = this.diagnostics.get(modifiedFile);
				if (diagnostics === undefined) {
					continue;
				}
				allDiagnostics.push({
					file: modifiedFile,
					symbols: [ ...diagnostics.symbols ],
					apiUsage: diagnostics.apiUsage
				});
			}
			for (const removedFile of removed) {
				allDiagnostics.push({
					file: removedFile,
					removed: true
				});
				this.diagnostics.delete(removedFile);
			}
		}
		sendData('diagnostics', allDiagnostics);
	}
}
