import fs from 'fs';
import defaultsDeep from 'lodash.defaultsdeep';
import { tiappxml } from 'node-titanium-sdk';
import path from 'path';

import {
	createSchema,
	buildSchema,
	projectSchema,
	validate
} from '../utils/schema';

export const schema = createSchema(joi => joi.object({
	type: joi.string()
		.valid('alloy', 'angular', 'classic', 'vue')
		.required(),
	transpileDependencies: joi.array()
		.items(
			joi.string(),
			joi.object()
				.instance(RegExp)
		),
	watch: joi.boolean()
		.required(),
	project: projectSchema,
	build: buildSchema
}));

const defaults = () => ({
	transpileDependencies: [],
});

export function createHookOptions(baseOptions) {
	const { project, build, watch } = baseOptions;
	let options = {};

	const tiAppPath = path.join(project.path, 'tiapp.xml');
	if (!fs.existsSync(tiAppPath)) {
		throw new Error(`Could not find "tiapp.xml" in ${project.path}.`);
	}
	const tiapp = new tiappxml(tiAppPath);
	options = {
		...tiapp.webpack,
		watch
	};
	options.project = { tiapp, ...project };
	options.build = build;
	options = defaultsDeep(options, defaults());
	validate(schema, options);

	return options;
}
