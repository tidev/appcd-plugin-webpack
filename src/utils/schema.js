import joi from '@hapi/joi';

export const projectSchema = joi.object({
	path: joi.string()
		.required(),
	name: joi.string()
		.required(),
	tiapp: joi.object()
		.unknown()
});

export const buildSchema = joi.object({
	platform: joi.string()
		.valid('android', 'ios')
		.required(),
	deployType: joi.string()
		.valid('development', 'test', 'production')
		.required(),
	target: joi.string()
		.valid('device')
		.required()
		.when('platform', { is: 'android', then: joi.valid('emulator', 'dist-playstore') })
		.when('platform', {
			is: 'ios',
			then: joi.valid(
				'simulator',
				'dist-appstore',
				'dist-adhoc',
				'macos',
				'dist-macappstore'
			)
		}),
	sdk: joi.object({
		path: joi.string()
			.required(),
		version: joi.string()
			.required(),
		gitHash: joi.string()
			.min(7)
			.max(40)
			.alphanum()
			.required(),
		buildDate: joi.string()
			.required()
	}),
	ios: joi.object({
		deviceFamily: joi.string()
			.valid('universal', 'ipad', 'iphone')
			.required()
	})
});

export const createSchema = (fn) => fn(joi);

export function validate(schema, options) {
	const result = schema.validate(options);
	if (result.error) {
		throw new TypeError(`Schema validation failed. ${result.error.message}`);
	}
}
