type Object = { [key: string]: any };

/**
 * Performs a deep merge of objects similar to Lodash's _.merge
 * @param target The target object to merge into
 * @param source The source object to merge from
 * @returns The merged object
 */
export function deepMerge(target: Object, source: Object): Object {
  const output = { ...target };

  if (!isObject(target) || !isObject(source)) {
    return source;
  }

  Object.keys(source).forEach((key) => {
    if (isObject(source[key])) {
      if (!(key in target)) {
        Object.assign(output, { [key]: source[key] });
      } else {
        output[key] = deepMerge(target[key], source[key]);
      }
    } else {
      Object.assign(output, { [key]: source[key] });
    }
  });

  return output;
}

/**
 * Checks if value is an object (excluding null)
 */
function isObject(item: any): item is Object {
  return item && typeof item === 'object' && !Array.isArray(item);
}
