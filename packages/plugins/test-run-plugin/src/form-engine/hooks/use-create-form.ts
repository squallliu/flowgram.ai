/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useMemo } from 'react';

import type { OnFormValuesChangePayload } from '@flowgram.ai/form-core';
import { createForm, ValidateTrigger, type IForm } from '@flowgram.ai/form';

import { createValidate } from '../utils';
import { FormSchema, FormSchemaValidate } from '../types';
import { FormSchemaModel } from '../model';

export interface FormInstance {
  model: FormSchemaModel;
  form: IForm;
}
export interface UseCreateFormOptions {
  defaultValues?: any;
  validate?: Record<string, FormSchemaValidate>;
  validateTrigger?: ValidateTrigger;
  onMounted?: (form: FormInstance) => void;
  onFormValuesChange?: (payload: OnFormValuesChangePayload) => void;
  onUnmounted?: () => void;
}

export const useCreateForm = (schema: FormSchema, options: UseCreateFormOptions = {}) => {
  const { form, control } = useMemo(
    () =>
      createForm({
        validate: {
          ...createValidate(schema),
          ...options.validate,
        },
        validateTrigger: options.validateTrigger ?? ValidateTrigger.onBlur,
      }),
    [schema]
  );

  const model = useMemo(
    () => new FormSchemaModel({ type: 'object', ...schema, defaultValue: options.defaultValues }),
    [schema]
  );

  /** Lifecycle and event binding */
  useEffect(() => {
    if (options.onMounted) {
      options.onMounted({ model, form });
    }
    const disposable = control._formModel.onFormValuesChange((payload) => {
      if (options.onFormValuesChange) {
        options.onFormValuesChange(payload);
      }
    });
    return () => {
      disposable.dispose();
      if (options.onUnmounted) {
        options.onUnmounted();
      }
    };
  }, [control]);

  return {
    form,
    control,
    model,
  };
};
