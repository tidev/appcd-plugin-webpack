import joi from '@hapi/joi';

const schema = joi.object({
	identifier: joi.string()
		.required(),
	projectPath: joi.string()
		.required(),
	projectType: joi.string()
		.valid('alloy', 'angular', 'classic', 'vue')
		.required(),
	deployType: joi.string()
		.required(),
	platform: joi.string()
		.valid('android', 'ios')
		.required(),
	buildTarget: joi.string()
		.required(),
	sdkPath: joi.string()
		.required(),
	watch: joi.bool()
}).unknown();

export function validate(options) {
	const result = schema.validate(options);
	if (result.error) {
		throw result.error;
	}
}

export const defaults = () => ({
	watch: false,
	modules: []
});
