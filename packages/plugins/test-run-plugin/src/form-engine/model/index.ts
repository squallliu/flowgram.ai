/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { ReactiveState } from '@flowgram.ai/reactive';

import { getUniqueFieldName, mergeFieldPath } from '../utils';
import { FormSchema, FormSchemaType, FormSchemaModelState } from '../types';

export class FormSchemaModel implements FormSchema {
  name?: string;

  type?: FormSchemaType;

  defaultValue?: any;

  properties?: Record<string, FormSchema>;

  ['x-index']?: number;

  ['x-component']?: string;

  ['x-component-props']?: Record<string, unknown>;

  ['x-decorator']?: string;

  ['x-decorator-props']?: Record<string, unknown>;

  [key: string]: any;

  path: string[] = [];

  state = new ReactiveState<FormSchemaModelState>({ disabled: false });

  get componentType() {
    return this['x-component'];
  }

  get componentProps() {
    return this['x-component-props'];
  }

  get decoratorType() {
    return this['x-decorator'];
  }

  get decoratorProps() {
    return this['x-decorator-props'];
  }

  get uniqueName() {
    return getUniqueFieldName(...this.path);
  }

  constructor(json: FormSchema, path: string[] = []) {
    this.fromJSON(json);
    this.path = path;
  }

  private fromJSON(json: FormSchema) {
    Object.entries(json).forEach(([key, value]) => {
      this[key] = value;
    });
  }

  getPropertyList() {
    const orderProperties: FormSchemaModel[] = [];
    const unOrderProperties: FormSchemaModel[] = [];
    Object.entries(this.properties || {}).forEach(([key, item]) => {
      const index = item['x-index'];
      const defaultValues = this.defaultValue;
      /**
       * The upper layer's default value has a higher priority than its own default value,
       * because the upper layer's default value ultimately comes from the outside world.
       */
      if (typeof defaultValues === 'object' && defaultValues !== null && key in defaultValues) {
        item.defaultValue = defaultValues[key];
      }
      const current = new FormSchemaModel(item, mergeFieldPath(this.path, key));
      if (index !== undefined && !isNaN(index)) {
        orderProperties[index] = current;
      } else {
        unOrderProperties.push(current);
      }
    });
    return orderProperties.concat(unOrderProperties).filter((item) => !!item);
  }
}
