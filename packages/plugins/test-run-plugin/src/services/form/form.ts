/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { createElement, type ReactNode } from 'react';

import { nanoid } from 'nanoid';
import { injectable, inject } from 'inversify';
import { Emitter } from '@flowgram.ai/utils';

import { TestRunConfig } from '../config';
import { FormSchema, FormEngine, type FormInstance, type FormEngineProps } from '../../form-engine';

export type FormRenderProps = Omit<
  FormEngineProps,
  'schema' | 'components' | 'onMounted' | 'onUnmounted'
>;

@injectable()
export class TestRunFormEntity {
  @inject(TestRunConfig) private readonly config: TestRunConfig;

  private _schema: FormSchema;

  private initialized = false;

  id = nanoid();

  form: FormInstance | null = null;

  onFormMountedEmitter = new Emitter<FormInstance>();

  onFormMounted = this.onFormMountedEmitter.event;

  onFormUnmountedEmitter = new Emitter<void>();

  onFormUnmounted = this.onFormUnmountedEmitter.event;

  get schema() {
    return this._schema;
  }

  init(options: { schema: FormSchema }) {
    if (this.initialized) return;

    this._schema = options.schema;
    this.initialized = true;
  }

  render(props?: FormRenderProps): ReactNode {
    if (!this.initialized) {
      return null;
    }
    const { children, ...restProps } = props || {};
    return createElement(
      FormEngine,
      {
        schema: this.schema,
        components: this.config.components,
        onMounted: (instance) => {
          this.form = instance;
          this.onFormMountedEmitter.fire(instance);
        },
        onUnmounted: this.onFormUnmountedEmitter.fire.bind(this.onFormUnmountedEmitter),
        ...restProps,
      },
      children
    );
  }

  dispose() {
    this._schema = {};
    this.form = null;
    this.onFormMountedEmitter.dispose();
    this.onFormUnmountedEmitter.dispose();
  }
}
