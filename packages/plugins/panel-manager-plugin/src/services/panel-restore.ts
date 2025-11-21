/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { injectable } from 'inversify';

export const PanelRestore = Symbol('PanelRestore');
export interface PanelRestore {
  store: (k: string, v: any) => void;
  restore: <T>(k: string) => T | undefined;
}

@injectable()
export class PanelRestoreImpl implements PanelRestore {
  map = new Map<string, any>();

  store(k: string, v: any) {
    this.map.set(k, v);
  }

  restore<T>(k: string): T | undefined {
    return this.map.get(k) as T;
  }
}
