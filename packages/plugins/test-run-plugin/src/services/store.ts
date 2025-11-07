/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { createStore } from 'zustand/vanilla';
import type { StoreApi, StateCreator } from 'zustand';
import { injectable, unmanaged } from 'inversify';
/**
 * 包含 Store 的 Service
 */
@injectable()
export class StoreService<State> {
  store: StoreApi<State>;

  get getState() {
    return this.store.getState.bind(this.store);
  }

  get setState() {
    return this.store.setState.bind(this.store);
  }

  constructor(@unmanaged() stateCreator: StateCreator<State>) {
    this.store = createStore(stateCreator);
  }
}
