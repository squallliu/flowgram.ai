/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

export const merge = <T>(...objs: Partial<T>[]) => {
  const result: any = {};

  for (const obj of objs) {
    if (!obj || typeof obj !== 'object') continue;

    for (const key of Object.keys(obj)) {
      const value = (obj as any)[key];

      if (result[key] === undefined) {
        result[key] = value;
      }
    }
  }

  return result as T;
};
