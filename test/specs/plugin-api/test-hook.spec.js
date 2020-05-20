import Hook from '../../../dist/plugin-api/hooks/hook';

describe('Hook', () => {
	let hook;

	beforeEach(() => {
		hook = new Hook('test');
	});

	afterEach(() => {
		hook = null;
	});

	describe('constructor', () => {
		it('should initialize properties', () => {
			expect(hook.name).to.equal('test');
			expect(hook.rawValues).to.be.empty;
			expect(hook.appliedValues).to.be.empty;
		});

		it('should throw error if name is not a string', () => {
			expect(() => new Hook()).to.throw();
			expect(() => new Hook(1)).to.throw();
			expect(() => new Hook({})).to.throw();
		});
	});

	describe('add()', () => {
		it('should throw if "name" is missing in options', () => {
			expect(() => hook.add('bad')).to.throw();
		});

		it('should add value to raw values', () => {
			hook.add('value', { name: 'my-plugin' });
			expect(hook.rawValues).to.deep.include({ value: 'value', name: 'my-plugin' });
		});

		it('should insert at correct position using before option', () => {
			hook.add('value3', { name: 'my-plugin3', before: 'my-plugin2' });
			hook.add('value1', { name: 'my-plugin1' });
			hook.add('value2', { name: 'my-plugin2', before: 'my-plugin1' });
			expect(hook.orderedValues).to.eql([
				{ value: 'value3', name: 'my-plugin3' },
				{ value: 'value2', name: 'my-plugin2' },
				{ value: 'value1', name: 'my-plugin1' }
			]);
			hook.add('value4', { name: 'my-plugin4', before: 'my-plugin1' });
			expect(hook.orderedValues).to.eql([
				{ value: 'value3', name: 'my-plugin3' },
				{ value: 'value2', name: 'my-plugin2' },
				{ value: 'value4', name: 'my-plugin4' },
				{ value: 'value1', name: 'my-plugin1' }
			]);
		});

		it('should insert at correct position using after option', () => {
			hook.add('value3', { name: 'my-plugin3', after: 'my-plugin1' });
			hook.add('value1', { name: 'my-plugin1' });
			hook.add('value2', { name: 'my-plugin2' });
			expect(hook.orderedValues).to.eql([
				{ value: 'value1', name: 'my-plugin1' },
				{ value: 'value3', name: 'my-plugin3' },
				{ value: 'value2', name: 'my-plugin2' }
			]);
			hook.add('value4', { name: 'my-plugin4', after: 'my-plugin2' });
			expect(hook.orderedValues).to.eql([
				{ value: 'value1', name: 'my-plugin1' },
				{ value: 'value3', name: 'my-plugin3' },
				{ value: 'value2', name: 'my-plugin2' },
				{ value: 'value4', name: 'my-plugin4' }
			]);
		});

		it('should push to end with invalid before/after option', () => {
			hook.add('value1', { name: 'my-plugin1' });
			hook.add('value2', { name: 'my-plugin2' });
			hook.add('value3', { name: 'my-plugin3', before: 'foo' });
			expect(hook.orderedValues[2]).to.eql({ value: 'value3', name: 'my-plugin3' });
			hook.add('value4', { name: 'my-plugin4', after: 'foo' });
			expect(hook.orderedValues[3]).to.eql({ value: 'value4', name: 'my-plugin4' });
		});
	});

	describe('remove()', () => {
		it('should remove all raw values with specified name', () => {
			hook.add('value1', { name: 'my-plugin1' });
			hook.add('value2', { name: 'my-plugin1' });
			hook.add('value3', { name: 'my-plugin2' });
			hook.remove('my-plugin1');
			expect(hook.rawValues).to.have.lengthOf(1);
			expect(hook.rawValues[0]).to.eql({ value: 'value3', name: 'my-plugin2' });
		});
	});

	describe('apply()', () => {
		it('should store all non-function values', () => {
			const value = 'test';
			hook.add(value, { name: 'my-plugin1' });
			hook.apply();
			expect(hook.appliedValues).to.have.lengthOf(1);
			expect(hook.appliedValues[0].value).to.equal(value);
		});

		it('should call function values', () => {
			const spy = sinon.spy();
			hook.add(spy, { name: 'my-plugin1' });
			hook.apply();
			expect(spy.calledOnce).to.be.true;
		});

		it('should call function values and pass all arguments', () => {
			const spy = sinon.spy();
			hook.add(spy, { name: 'my-plugin1' });
			hook.apply('first', 2);
			expect(spy.calledOnce).to.be.true;
			expect(spy.calledWith('first', 2)).to.be.true;
		});

		it('should call function values and store return value', () => {
			const returnValue = 'test';
			const func = () => returnValue;
			const spy = sinon.spy(func);
			hook.add(spy, { name: 'my-plugin1' });
			hook.apply();
			expect(spy.calledOnce).to.be.true;
			expect(hook.appliedValues).to.have.lengthOf(1);
			expect(hook.appliedValues[0].value).to.equal(returnValue);
		});

		it('should apply raw values in order', () => {
			hook.add('value1', { name: 'my-plugin1' });
			hook.add('value2', { name: 'my-plugin2' });
			hook.add('value3', { name: 'my-plugin3', before: 'my-plugin2' });
			hook.apply();
			expect(hook.appliedValues).to.have.lengthOf(3);
			expect(hook.appliedValues).to.eql([
				{ value: 'value1', name: 'my-plugin1' },
				{ value: 'value3', name: 'my-plugin3' },
				{ value: 'value2', name: 'my-plugin2' }
			]);
		});
	});
});
