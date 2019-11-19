import joi from '@hapi/joi';

const schema = joi.object({
	type: joi.string()
		.valid('alloy', 'angular', 'classic', 'vue')
		.required(),
	platform: joi.string()
		.valid('android', 'ios')
		.required(),
	modules: joi.array()
		.items(
			joi.string()
		),
	watch: joi.bool(),
	transpileDependencies: joi.array()
		.items(
			joi.string(),
			joi.object()
				.instance(RegExp)
		)
});

export function validate(options) {
	const result = schema.validate(options);
	if (result.error) {
		throw result.error;
	}
}

export const defaults = () => ({
	watch: false,
	modules: [],
	transpileDependencies: []
});
