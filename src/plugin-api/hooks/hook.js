/**
 * A Hook is a collection of raw values that will all be processed
 * when this hook itself gets applied.
 *
 * It provides an interface for adding and removing values and to apply
 * those.
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
	 * This raw value will later be processed in the `apply` function.
	 *
	 * @param {any} value Value to add to the list of raw values.
	 * @param {string} sourceHookId Source hint where the value came from.
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
				if (typeof value === 'function') {
					this.appliedValues.push({
						value: value(...args),
						name: sourceHookId
					});
				} else {
					this.appliedValues.push({
						value,
						name: sourceHookId
					});
				}
			} catch (error) {
				console.error(`${sourceHookId} failed to apply ${this.name}.`);
				throw error;
			}
		}
	}
}
