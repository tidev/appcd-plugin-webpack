/**
 * @typedef RawHookValue
 * @property {any} value The value that should be applies
 * @property {string} name Plugin name to identify where the value comes from
 * @property {[string]} before Apply value before another
 * @property {[string]} after Apply value after another
 */

/**
 * @typedef HookValue
 * @property {any} value The hook value
 * @property {string} name Plugin name to identify where the value comes from
 */

/**
 * @typedef HookValueOptions
 * @property {string} name Plugin name to identify where the value comes from
 * @property {[string]} before Apply value before another
 * @property {[string]} after Apply value after another
 */

const findFirstIndex = (array, predicate) => array.findIndex(predicate);
const findLastIndex = (array, predicate) => {
	let l = array.length;
	while (l--) {
		if (predicate(array[l], l, array)) {
			return l;
		}
	}
	return -1;
};

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
		if (typeof name !== 'string') {
			throw new TypeError(`The argument "name" must be of type "string", received type ${typeof name}`);
		}
		/**
		 * The name of this hook.
		 *
		 * @type {string}
		 */
		this.name = name;
		/**
		 * A list of raw values added by plugins that will be applied when calling
		 * `apply`.
		 *
		 * @type {Array<RawHookValue>}
		 */
		this.rawValues = [];

		/**
		 * The applied and processed values, only available after calling `apply`.
		 *
		 * @type {Array<HookValue>}
		 */
		this.appliedValues = [];
	}

	/**
	 * The ordered hook values
	 *
	 * @type {Array<HookValue>}
	 */
	get orderedValues() {
		// all hooks without before/after can stay in the order as they were added
		const orderedValues = this.rawValues
			.filter(v => !(v.before || v.after))
			.map(({ name, value }) => ({ name, value }));
		const needOrdering = this.rawValues.filter(v => v.before || v.after);
		if (needOrdering.length === 0) {
			return orderedValues;
		}
		const stack = [ ...needOrdering ];
		while (stack.length) {
			const rawValue = stack.shift();
			const { name, value, before, after } = rawValue;
			const orderedValue = { name, value };
			const insertAt = before || after;
			const findIndex = before ? findFirstIndex : findLastIndex;
			const i = findIndex(orderedValues, ({ name }) => name === insertAt);
			if (i === -1) {
				if (!rawValue.retried) {
					// insertAt value not found yet, push back to the stack again
					rawValue.retried = true;
					stack.push(rawValue);
				} else {
					delete rawValue.retried;
					const orderKey = rawValue.before ? 'before' : 'after';
					console.warn(`Unable to insert "${name}" ${orderKey} "${insertAt}" since "${insertAt}" was not found.`);
					orderedValues.push(orderedValue);
				}
				continue;
			}
			delete rawValue.retried;
			if (before) {
				orderedValues.splice(i, 0, orderedValue);
			} else if (after) {
				orderedValues.splice(i + 1, 0, orderedValue);
			}
		}

		return orderedValues;
	}

	/**
	 * Adds a new raw value to this hook.
	 *
	 * This raw value will later be processed in the `apply` function.
	 *
	 * @param {any} value Value to add to the list of raw values.
	 * @param {HookValueOptions} options Options to consider while applying the value
	 */
	add(value, options) {
		const { name, before, after } = options || {};
		if (typeof name !== 'string') {
			throw new TypeError(`Invalid or missing plugin name while trying to add hook value for ${this.name}.`);
		}
		if (before && after) {
			throw new TypeError(`Using options "before" and "after" at the same time is not allowed (${name}.${this.name})`);
		}

		this.rawValues.push({ value, ...options });
	}

	/**
	 * Removes all values previously added under the given plugin name.
	 *
	 * @param {string} name Name of the plugin where the value came from
	 */
	remove(name) {
		const find = () => this.rawValues.findIndex(({ name: n }) => n === name);
		let index = find(name);
		while (index !== -1) {
			this.rawValues.splice(index, 1);
			index = find(name);
		}
	}

	/**
	 * Clears all raw and applied values, resetting the hook to it's initial state.
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
		for (const { value, name } of this.orderedValues) {
			try {
				if (typeof value === 'function') {
					this.appliedValues.push({
						value: value(...args),
						name
					});
				} else {
					this.appliedValues.push({
						value,
						name
					});
				}
			} catch (error) {
				console.error(`${name} failed to apply ${this.name}.`);
				throw error;
			}
		}
	}
}
