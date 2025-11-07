/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { inject, injectable } from 'inversify';

import type { TestRunFormEntity } from './form';
import { TestRunFormFactory } from './factory';

@injectable()
export class TestRunFormManager {
  @inject(TestRunFormFactory) private readonly factory: TestRunFormFactory;

  private entities = new Map<string, TestRunFormEntity>();

  createForm() {
    return this.factory();
  }

  getForm(id: string) {
    return this.entities.get(id);
  }

  getAllForm() {
    return Array.from(this.entities);
  }

  disposeForm(id: string) {
    const form = this.entities.get(id);
    if (!form) {
      return;
    }
    form.dispose();
    this.entities.delete(id);
  }

  disposeAllForm() {
    for (const id of this.entities.keys()) {
      this.disposeForm(id);
    }
  }
}
