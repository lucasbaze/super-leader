import { deepMerge } from './deep-merge';

describe('deepMerge', () => {
  describe('basic functionality', () => {
    it('should merge two simple objects', () => {
      const target = { a: 1, b: 2 };
      const source = { b: 3, c: 4 };
      const result = deepMerge(target, source);

      expect(result).toEqual({ a: 1, b: 3, c: 4 });
      // Original objects should not be modified
      expect(target).toEqual({ a: 1, b: 2 });
      expect(source).toEqual({ b: 3, c: 4 });
    });

    it('should return source when target is not an object', () => {
      const target = null;
      const source = { a: 1, b: 2 };
      const result = deepMerge(target as any, source);

      expect(result).toEqual(source);
    });

    it('should return source when source is not an object', () => {
      const target = { a: 1, b: 2 };
      const source = null;
      const result = deepMerge(target, source as any);

      expect(result).toEqual(source);
    });
  });

  describe('nested objects', () => {
    it('should deeply merge nested objects', () => {
      const target = {
        a: 1,
        b: {
          c: 3,
          d: 4
        }
      };
      const source = {
        b: {
          d: 5,
          e: 6
        },
        f: 7
      };

      const result = deepMerge(target, source);

      expect(result).toEqual({
        a: 1,
        b: {
          c: 3,
          d: 5,
          e: 6
        },
        f: 7
      });
    });

    it('should handle deeply nested objects', () => {
      const target = {
        a: {
          b: {
            c: {
              d: 1
            }
          }
        }
      };

      const source = {
        a: {
          b: {
            c: {
              e: 2
            },
            f: 3
          }
        }
      };

      const result = deepMerge(target, source);

      expect(result).toEqual({
        a: {
          b: {
            c: {
              d: 1,
              e: 2
            },
            f: 3
          }
        }
      });
    });
  });

  describe('edge cases', () => {
    it('should handle arrays as source values (arrays replace, not merge)', () => {
      const target = { a: [1, 2, 3] };
      const source = { a: [4, 5] };
      const result = deepMerge(target, source);

      expect(result).toEqual({ a: [4, 5] });
    });

    it('should handle empty objects', () => {
      const target = {};
      const source = {};
      const result = deepMerge(target, source);

      expect(result).toEqual({});
    });

    it('should handle objects with different types of values', () => {
      const target = {
        a: 1,
        b: 'string',
        c: true,
        d: null,
        e: undefined
      };

      const source = {
        a: 2,
        b: 'new string',
        c: false,
        d: {},
        e: []
      };

      const result = deepMerge(target, source);

      expect(result).toEqual({
        a: 2,
        b: 'new string',
        c: false,
        d: {},
        e: []
      });
    });
  });
});
