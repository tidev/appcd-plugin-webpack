import { matchesPluginId } from '../../../dist/plugin-api/utils';

describe('Plugin API - utils', () => {
	describe('matchesPluginId', () => {
		it('should match full plugin id', () => {
			const match = matchesPluginId(
				'appcd-webpack-plugin-babel',
				'appcd-webpack-plugin-babel'
			);
			expect(match).to.be.true;
		});

		it('should match short plugin id', () => {
			const match = matchesPluginId(
				'appcd-webpack-plugin-babel',
				'babel'
			);
			expect(match).to.be.true;
		});

		it('should match full plugin id with scope', () => {
			const match = matchesPluginId(
				'@someorg/appcd-webpack-plugin-typescript',
				'@someorg/appcd-webpack-plugin-typescript'
			);
			expect(match).to.be.true;
		});

		it('should match short plugin id with scope', () => {
			const match = matchesPluginId(
				'@someorg/appcd-webpack-plugin-typescript',
				'typescript'
			);
			expect(match).to.be.true;
		});

		it('should match full plugin id with official scopes', () => {
			[ '@appcd', '@titanium-sdk' ].forEach(scope => {
				const match = matchesPluginId(
					`${scope}/webpack-plugin-babel`,
					`${scope}/webpack-plugin-babel`
				);
				expect(match).to.be.true;
			});
		});

		it('should match short plugin id with official scopes', () => {
			[ '@appcd', '@titanium-sdk' ].forEach(scope => {
				const match = matchesPluginId(
					`${scope}/webpack-plugin-babel`,
					'babel'
				);
				expect(match).to.be.true;
			});
		});
	});
});
