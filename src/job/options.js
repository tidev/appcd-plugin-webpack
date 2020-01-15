import { createSchema, projectSchema, buildSchema } from '../utils';

export const schema = createSchema(joi => joi.object({
	identifier: joi.string()
		.required(),
	watch: joi.boolean()
		.required(),
	project: projectSchema,
	build: buildSchema
}));
