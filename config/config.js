module.exports = {
	/**
	 * Webpack plugin config
	 *
	 * @type {object}
	 */
	webpack: {
		/**
		 * The inactivity timeout during which the build can be inactive. After
		 * the timeout expires, the Webpack build will be stopped to save system.
		 * resources.
		 *
		 * @type {number}
		 */
		inactivityTimeout: 600000
	}
};
