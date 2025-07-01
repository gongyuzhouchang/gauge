/**
 * 深度合并对象的工具函数
 * 替代lodash-es的merge，减少bundle size
 */

/**
 * 检查值是否为普通对象
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && value?.constructor === Object;
}

/**
 * 深度合并多个对象
 * @param target 目标对象
 * @param sources 源对象数组
 * @returns 合并后的新对象
 */
export function merge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Array<Partial<T> | undefined>
): T {
  if (sources.length === 0) {
    return target;
  }

  const result = { ...target };

  sources.forEach(source => {
    if (!source) {
      return;
    }

    Object.keys(source).forEach(key => {
      const sourceValue = source[key as keyof T];
      const targetValue = result[key as keyof T];

      if (sourceValue !== undefined) {
        if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
          // 递归合并嵌套对象
          (result as Record<string, unknown>)[key] = merge(
            targetValue as Record<string, unknown>,
            sourceValue as Record<string, unknown>
          );
        } else {
          // 直接赋值（包括数组、基本类型等）
          (result as Record<string, unknown>)[key] = sourceValue;
        }
      }
    });
  });

  return result;
}
