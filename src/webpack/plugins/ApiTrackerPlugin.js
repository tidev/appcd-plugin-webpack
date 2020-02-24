import path from 'path';

import { apiTracker } from '../utils/api-tracker';
import { isWindows, parseRequest } from '../../utils';

export class ApiTrackerPlugin {
	constructor(options) {
		this.excludePattern = this.generateExcludePattern((options && options.exclude) || []);
		this.tiNodeRegExp = /^Ti(tanium)?\./;
		this.cwd = options.cwd;
		this.watchRun = false;
		this.changedModules = [];
	}

	apply(compiler) {
		compiler.hooks.invalid.tap('ApiTracker', () => {
			this.watchRun = true;
			this.changedModules = [];
		});

		compiler.hooks.compilation.tap(
			'ApiTracker',
			(compilation, { normalModuleFactory }) => {
				normalModuleFactory.hooks.parser.for('javascript/auto').tap('ApiTracker:parser', (parser, options) => {
					const handler = expression => {
						const { module: { userRequest } } = parser.state;
						const filePath = this.resolvePath(userRequest);
						const symbols = apiTracker.getSymbolSet(filePath);
						if (this.excludePattern && this.excludePattern.test(filePath)) {
							return;
						}

						const tiExpression = this.getTitaniumExpression(expression);
						if (!tiExpression) {
							return;
						}
						const shortExpression = tiExpression.substring(9); // Drop leading 'Titanium.'
						if (!symbols.has(shortExpression)) {
							symbols.add(shortExpression);
						}
					};
					// We need to cheat the HookMap here since we don't know the expressions in advance
					parser.hooks.expressionAnyMember.get = function (key) {
						const hook = this._map.get(key);
						if (hook !== undefined) {
							return hook;
						}

						const newHook = this._factory(key);
						this._map.set(key, newHook);
						newHook.tap('ApiTracker', handler);
						return newHook;
					};
				});

				if (this.watchRun) {
					normalModuleFactory.hooks.module.tap('ApiTracker', module => {
						this.changedModules.push(this.resolvePath(module.userRequest));
					});
				}
			}
		);

		compiler.hooks.done.tap('ApiTracker', () => {
			apiTracker.sendUsage(this.watchRun ? this.changedModules : undefined);
		});
	}

	generateExcludePattern(exclude) {
		exclude.push(`titanium-vdom${path.sep}.*${path.sep}elements.*.js$`);
		const excludes = exclude.map(exclude => {
			if (typeof exclude === 'string') {
				return isWindows
					? exclude.replace(/\\/g, '\\\\') // double escape for windows style path
					: exclude;
			} else if (exclude instanceof RegExp) {
				return exclude.source;
			} else {
				throw new TypeError('Unsupported value in "exclude" option.');
			}
		});
		// eslint-disable-next-line security/detect-non-literal-regexp
		return excludes.length ? new RegExp(excludes.join('|')) : null;
	}

	resolvePath(userRequest) {
		const requestInfo = parseRequest(userRequest, this.cwd);
		const file = requestInfo.file;
		return path.resolve(this.cwd, file);
	}

	getTitaniumExpression(member) {
		const value = this.getMemberValue(member);
		if (value === null) {
			return null;
		}

		if (this.tiNodeRegExp.test(value)) {
			// Normalize 'Ti.*' to 'Titanium.*'
			if (value.startsWith('Ti.')) {
				return `Titanium.${value.substring(3)}`;
			}
			return value;
		}

		return null;
	}

	getMemberValue(node) {
		if (node.type === 'Identifier') {
			return node.name;
		}

		if (node.type === 'StringLiteral') {
			return node.value;
		}

		if (node.type !== 'MemberExpression') {
			return null;
		}

		if (node.computed && (node.property && node.property.type !== 'StringLiteral')) {
			return null;
		}

		const objVal = this.getMemberValue(node.object);
		if (objVal === null) {
			return null;
		}

		const propVal = this.getMemberValue(node.property);
		if (propVal === null) {
			return null;
		}

		return objVal + '.' + propVal;
	}
}
