import fs from 'fs';
import defaultsDeep from 'lodash.defaultsdeep';
import { tiappxml } from 'node-titanium-sdk';
import path from 'path';

import {
	createSchema,
	buildSchema,
	projectSchema,
	validate
} from './schema';

export const schema = createSchema(joi => joi.object({
	identifier: joi.string()
		.required(),
	project: projectSchema,
	build: buildSchema,
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
		.required()
}));

const defaults = () => ({
	transpileDependencies: []
});

export function createPluginOptions(baseOptions) {
	const { identifier, type, project, build, watch } = baseOptions;
	let options = {};

	const tiAppPath = path.join(project.path, 'tiapp.xml');
	if (!fs.existsSync(tiAppPath)) {
		throw new Error(`Could not find "tiapp.xml" in ${project.path}.`);
	}
	const tiapp = new tiappxml(tiAppPath);
	options = {
		identifier,
		type,
		watch,
		...tiapp.webpack || {}
	};
	options.project = { tiapp, ...project };
	options.build = build;
	options = defaultsDeep(options, defaults());
	validate(schema, options);

	return options;
}

const pluginPattern = /^(@appcd\/|@titanium-sdk\/|@[\w]+\/appcd-|appcd-)webpack-plugin-/;

export function isPlugin(id) {
	return pluginPattern.test(id);
}

export function matchesPluginId(fullPluginId, id) {
	const shortPluginId = fullPluginId.replace(pluginPattern, '');
	return fullPluginId === id || shortPluginId === id;
}
