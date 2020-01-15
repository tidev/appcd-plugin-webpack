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
	/**
	 * Constructs a new Hook class
	 *
	 * @param {string} name Hook name
	 */
	constructor(name) {
		this.name = name;
		this.rawValues = [];
		this.appliedValues = [];
	}

	/**
	 * Adds a new raw value to this hook.
	 *
	 * Currently only function values are supported.
	 *
	 * @param {Function} value Value to add to the list of raw values
	 * @param {string} sourceHookId Source hint where the value came from
	 */
	add(value, sourceHookId) {
		this.rawValues.push({ value, sourceHookId });
	}

	/**
	 * Removes all values previously added under the given source hook id.
	 *
	 * @param {string} sourceHookId Source hint where the value came from
	 */
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

	/**
	 * Clears all raw and applied values.
	 */
	clear() {
		this.rawValues = [];
		this.appliedValues = [];
	}

	/**
	 * Applies all raw values and stores the result.
	 *
	 * @param  {...any} args Additional args passed to hook functions.
	 */
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
