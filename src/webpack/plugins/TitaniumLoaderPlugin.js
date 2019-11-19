const RuleSet = require('webpack/lib/RuleSet');

export class TitaniumLoaderPlugin {
	constructor(options) {
		this.options = options;
	}

	apply(compiler) {
		if (this.options.type === 'vue') {
			const rawRules = compiler.options.module.rules;
			const { rules } = new RuleSet(rawRules);

			let vueRuleIndex = rules.findIndex(rule => rule.use && rule.use.find(u => u.loader === 'vue-loader'));
			if (vueRuleIndex === -1) {
				throw new Error(
					'[TitaniumLoaderPlugin Error] No matching rule for vue-loader found.\n'
					+ 'Make sure there is at least one root-level rule that uses vue-loader.'
				);
			}

			const vueRule = rules[vueRuleIndex];
			vueRule.use.unshift({
				loader: require.resolve('../loaders/titanium-vue-loader'),
				options: {
					compiler: this.options.compiler
				}
			});

			compiler.options.module.rules = rules;
		} else if (this.options.type === 'angular') {
			// TODO: Add loader for html template files and scan for Titanium API usage
		}
	}
}
