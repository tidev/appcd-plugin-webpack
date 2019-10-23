module.exports = function (api) {
	if (process.env.NODE_ENV !== 'production') {
		return;
	}

	api.chainWebpack(config => {
		config
			.mode('production')
			.devtool(false);
	});
};
