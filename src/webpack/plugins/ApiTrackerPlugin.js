import path from 'path';

import { apiTracker } from '../utils/api-tracker';
import { isWindows, sendData, parseRequest } from '../../utils';

export class ApiTrackerPlugin {
	constructor(options) {
		this.excludePattern = this.generateExcludePattern((options && options.exclude) || []);
		this.tiNodeRegExp = /^Ti(tanium)?/;
		this.cwd = options.cwd;
	}

	apply(compiler) {
		compiler.hooks.normalModuleFactory.tap('ApiTracker:normalModuleFactory', factory => {
			factory.hooks.parser.for('javascript/auto').tap('ApiTracker:parser', (parser, options) => {
				const handler = expression => {
					const { module: { userRequest } } = parser.state;
					const requestInfo = parseRequest(userRequest, this.cwd);
					const file = requestInfo.file;
					if (this.excludePattern && this.excludePattern.test(file)) {
						return;
					}
					const tiExpression = this.getTitaniumExpression(expression);
					const fullFilePath = path.resolve(this.cwd, file);
					const symbols = apiTracker.getSymbolSet(fullFilePath);
					if (tiExpression && !symbols.has(tiExpression)) {
						symbols.add(tiExpression);
						parser.hooks.expressionAnyMember.for(tiExpression).tap('ApiTracker:expressionAnyMember', handler);
						parser.hooks.expressionAnyMember.for(tiExpression.replace(/^Titanium/, 'Ti')).tap('ApiTracker:expressionAnyMember', handler);
					}
				};
				parser.hooks.expressionAnyMember.for('Titanium').tap('ApiTracker:expressionAnyMember', handler);
				parser.hooks.expressionAnyMember.for('Ti').tap('ApiTracker:expressionAnyMember', handler);
			});
		});

		compiler.hooks.done.tap('ApiTracker:done', () => {
			sendData('api-usage', apiTracker.toJson());
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
		return excludes.length ? new RegExp(excludes.join('|')) : null;
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
