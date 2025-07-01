import { recursivelyRemoveNullish } from './recursively-remove-nullish';

describe('recursivelyRemoveNull', () => {
  it('should remove null and undefined values from a simple object', () => {
    const input = {
      name: 'Lucas',
      age: null,
      email: undefined,
      active: true
    };

    const expected = {
      name: 'Lucas',
      active: true
    };

    expect(recursivelyRemoveNullish(input)).toEqual(expected);
  });

  it('should handle nested objects', () => {
    const input = {
      name: 'Lucas',
      goals: [{ goal: null, note: 'hello' }],
      friends: {
        count: 10,
        skipped: null
      },
      addresses: null,
      websites: []
    };

    const expected = {
      name: 'Lucas',
      goals: [{ note: 'hello' }],
      friends: {
        count: 10
      }
    };

    expect(recursivelyRemoveNullish(input)).toEqual(expected);
  });

  it('should handle empty objects and arrays', () => {
    const input = {
      emptyObj: {},
      emptyArr: [],
      emptyString: '',
      nested: {
        emptyObj: {},
        emptyArr: [],
        emptyString: ''
      }
    };

    const expected = {};

    expect(recursivelyRemoveNullish(input)).toEqual(expected);
  });

  it('should handle arrays with null values', () => {
    const input = {
      items: [1, null, 2, undefined, 3]
    };

    const expected = {
      items: [1, 2, 3]
    };

    expect(recursivelyRemoveNullish(input)).toEqual(expected);
  });

  it('should handle deeply nested structures', () => {
    const input = {
      level1: {
        level2: {
          level3: {
            value: 'deep',
            nullValue: null,
            emptyObj: {},
            array: [null, { value: 'nested' }, undefined]
          }
        }
      }
    };

    const expected = {
      level1: {
        level2: {
          level3: {
            value: 'deep',
            array: [{ value: 'nested' }]
          }
        }
      }
    };

    expect(recursivelyRemoveNullish(input)).toEqual(expected);
  });

  it('should preserve non-null primitive values', () => {
    const input = {
      string: 'hello',
      number: 42,
      boolean: true,
      null: null,
      undefined: undefined
    };

    const expected = {
      string: 'hello',
      number: 42,
      boolean: true
    };

    expect(recursivelyRemoveNullish(input)).toEqual(expected);
  });

  it('should handle null or undefined input', () => {
    expect(recursivelyRemoveNullish(null)).toBeNull();
    expect(recursivelyRemoveNullish(undefined)).toBeUndefined();
  });
});
