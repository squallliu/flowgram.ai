/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { MaybePromise } from '../../types';

interface TapValue<T> {
  name: string;
  fn: (arg: T) => MaybePromise<void>;
}

export class Tap<T> {
  private taps: TapValue<T>[] = [];

  private frozen = false;

  tap(name: string, fn: TapValue<T>['fn']) {
    this.taps.push({ name, fn });
  }

  async call(ctx: T) {
    for (const tap of this.taps) {
      if (this.frozen) {
        return;
      }
      await tap.fn(ctx);
    }
  }

  freeze() {
    this.frozen = true;
  }
}
