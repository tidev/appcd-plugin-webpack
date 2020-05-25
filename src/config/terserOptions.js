export default options => {
	const terserOptions = {
		mangle: {},
		output: { comments: false }
	};
	if (options.build.platform === 'ios') {
		terserOptions.mangle.safari10 = true;
		terserOptions.output.safari10 = true;
	}
	return {
		terserOptions,
		extractComments: false
	};
};
