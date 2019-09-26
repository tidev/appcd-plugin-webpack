/**
 * A Hook is a collection of functions that will all be called
 * when this hook itself gets applied.
 *
 * It provides an interface for adding and removing functions and to apply
 * those. By default the return value of those functions will be stored and
 * can be retrieved for further processing.
 *
 * Individual hooks can extend from this base class to apply additional
 * processing of values.
 */
export default class Hook {
	constructor(name) {
		this.name = name;
		this.rawValues = [];
		this.appliedValues = [];
	}

	add(value, sourceHookId) {
		this.rawValues.push({ value, sourceHookId });
	}

	remove(sourceHookId) {
		const findIndex = () => {
			return this.rawValues.findIndex(({ sourceHookId: _sourceHookId }) => {
				return sourceHookId === _sourceHookId;
			});
		};
		let index = findIndex();
		while (index !== -1) {
			this.rawValues.splice(index, 1);
			index = findIndex();
		}
	}

	clear() {
		this.rawValues = [];
		this.appliedValues = [];
	}

	apply(...args) {
		this.appliedValues = [];
		for (const { value, sourceHookId } of this.rawValues) {
			try {
				this.appliedValues.push(value(...args));
			} catch (error) {
				console.error(`${sourceHookId} failed to apply ${this.name}.`);
				throw error;
			}
		}
	}
}
