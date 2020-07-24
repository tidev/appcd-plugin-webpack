import { transformAbsolutePathErrors } from '../../../dist/utils/transformers';

let error;

describe('utils - transformers', () => {
	describe('transformAbsolutePathErrors', () => {
		beforeEach(() => {
			error = {
				message: 'Module not found /permissions',
				file: './app/controllers/phone/cameraGallery.js',
				origin: '\n @ ./app/controllers/phone/cameraGallery.js 193:4-27 264:4-27\n @ ./app/controllers sync ^\\.\\/.*$\n @ ./node_modules/alloy/Alloy/template/lib/alloy.js\n @ ./app/alloy.js\n @ multi ./app/alloy.js',
				name: 'Module not found',
				severity: 900,
				type: 'module-not-found',
				module: '/permissions'
			};
		});

		it('should transform module-not-found errors with absolute paths', () => {
			expect(transformAbsolutePathErrors(error)).to.deep.equal({
				message: 'Absolute path used to require /permissions',
				file: './app/controllers/phone/cameraGallery.js',
				origin: '\n @ ./app/controllers/phone/cameraGallery.js 193:4-27 264:4-27\n @ ./app/controllers sync ^\\.\\/.*$\n @ ./node_modules/alloy/Alloy/template/lib/alloy.js\n @ ./app/alloy.js\n @ multi ./app/alloy.js',
				name: 'Absolute path usage',
				severity: 900,
				type: 'absolute-path-usage',
				module: '/permissions'
			});
		});

		it('should ignore non-absolute paths', () => {
			const nonAbsoluteError = {
				...error,
				module: 'permissions'
			};
			expect(transformAbsolutePathErrors(nonAbsoluteError)).to.deep.equal(nonAbsoluteError);
		});

		it('should ignore other types of errors', () => {
			const nonAbsoluteError = {
				...error,
				type: 'module-too-awesome'
			};
			expect(transformAbsolutePathErrors(nonAbsoluteError)).to.deep.equal(nonAbsoluteError);
		});
	});
});
