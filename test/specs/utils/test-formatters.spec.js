import { formatAbsolutePathErrors } from '../../../dist/utils/formatters';

describe('utils - formatters', () => {
	describe('formatAbsolutePathErrors', () => {
		it('should format the error correctly for a single problem', () => {
			expect(formatAbsolutePathErrors([{
				message: 'Module not found /permissions',
				file: './app/controllers/phone/cameraGallery.js',
				origin: '\n @ ./app/controllers/phone/cameraGallery.js 193:4-27 264:4-27\n @ ./app/controllers sync ^\\.\\/.*$\n @ ./node_modules/alloy/Alloy/template/lib/alloy.js\n @ ./app/alloy.js\n @ multi ./app/alloy.js',
				name: 'Module not found',
				severity: 900,
				type: 'absolute-path-usage',
				module: '/permissions'
			}])).to.deep.equal([
				'Absolute path require found',
				'',
				'* /permissions in ./app/controllers/phone/cameraGallery.js, replace with @/permissions',
				'',
				'For absolute paths use the "@" alias at the start of your path to allow it to be resolved correctly',
			]);
		});

		it('should format the error correctly for multiple modules across different files', () => {
			expect(formatAbsolutePathErrors([{
				message: 'Module not found /permissions',
				file: './app/controllers/phone/cameraGallery.js',
				origin: '\n @ ./app/controllers/phone/cameraGallery.js 193:4-27 264:4-27\n @ ./app/controllers sync ^\\.\\/.*$\n @ ./node_modules/alloy/Alloy/template/lib/alloy.js\n @ ./app/alloy.js\n @ multi ./app/alloy.js',
				name: 'Module not found',
				severity: 900,
				type: 'absolute-path-usage',
				module: '/permissions'
			}, {
				message: 'Module not found /awesome-module',
				file: './app/controllers/phone/test.js',
				origin: '\n @ ./app/controllers/phone/test.js 193:4-27 264:4-27\n @ ./app/controllers sync ^\\.\\/.*$\n @ ./node_modules/alloy/Alloy/template/lib/alloy.js\n @ ./app/alloy.js\n @ multi ./app/alloy.js',
				name: 'Module not found',
				severity: 900,
				type: 'absolute-path-usage',
				module: '/awesome-module'
			}])).to.deep.equal([
				'Absolute path requires found',
				'',
				'* /permissions in ./app/controllers/phone/cameraGallery.js, replace with @/permissions',
				'* /awesome-module in ./app/controllers/phone/test.js, replace with @/awesome-module',
				'',
				'For absolute paths use the "@" alias at the start of your path to allow it to be resolved correctly',
			]);
		});

		it('should format the error correctly for the same module in  different files', () => {
			expect(formatAbsolutePathErrors([{
				message: 'Module not found /permissions',
				file: './app/controllers/phone/cameraGallery.js',
				origin: '\n @ ./app/controllers/phone/cameraGallery.js 193:4-27 264:4-27\n @ ./app/controllers sync ^\\.\\/.*$\n @ ./node_modules/alloy/Alloy/template/lib/alloy.js\n @ ./app/alloy.js\n @ multi ./app/alloy.js',
				name: 'Module not found',
				severity: 900,
				type: 'absolute-path-usage',
				module: '/permissions'
			}, {
				message: 'Module not found /permissions',
				file: './app/controllers/phone/test.js',
				origin: '\n @ ./app/controllers/phone/test.js 193:4-27 264:4-27\n @ ./app/controllers sync ^\\.\\/.*$\n @ ./node_modules/alloy/Alloy/template/lib/alloy.js\n @ ./app/alloy.js\n @ multi ./app/alloy.js',
				name: 'Module not found',
				severity: 900,
				type: 'absolute-path-usage',
				module: '/permissions'
			}, {
				message: 'Module not found /permissions',
				file: './app/controllers/phone/test2.js',
				origin: '\n @ ./app/controllers/phone/test2.js 193:4-27 264:4-27\n @ ./app/controllers sync ^\\.\\/.*$\n @ ./node_modules/alloy/Alloy/template/lib/alloy.js\n @ ./app/alloy.js\n @ multi ./app/alloy.js',
				name: 'Module not found',
				severity: 900,
				type: 'absolute-path-usage',
				module: '/permissions'
			}])).to.deep.equal([
				'Absolute path require found',
				'',
				'* /permissions in ./app/controllers/phone/cameraGallery.js, ./app/controllers/phone/test.js and 1 other, replace with @/permissions',
				'',
				'For absolute paths use the "@" alias at the start of your path to allow it to be resolved correctly',
			]);
		});
	});
});
