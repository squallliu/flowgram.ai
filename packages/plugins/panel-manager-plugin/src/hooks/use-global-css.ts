/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { useEffect } from 'react';

interface UseGlobalCSSOptions {
  cssText: string;
  id: string;
  cleanup?: boolean;
}

export const useGlobalCSS = ({ cssText, id, cleanup }: UseGlobalCSSOptions) => {
  useEffect(() => {
    /** SSR safe */
    if (typeof document === 'undefined') return;

    if (document.getElementById(id)) return;

    const style = document.createElement('style');
    style.id = id;
    style.textContent = cssText;
    document.head.appendChild(style);

    return () => {
      const existing = document.getElementById(id);
      if (existing && cleanup) existing.remove();
    };
  }, [id]);
};
