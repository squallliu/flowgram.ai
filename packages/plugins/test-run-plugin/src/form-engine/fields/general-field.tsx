/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { Field } from '@flowgram.ai/form';

import { ReactiveField } from './reactive-field';
import type { FormSchemaModel } from '../model';
import { FieldModelContext } from '../contexts';

export interface GeneralFieldProps {
  model: FormSchemaModel;
}

export const GeneralField: React.FC<GeneralFieldProps> = ({ model }) => (
  <FieldModelContext.Provider value={model}>
    <Field
      name={model.uniqueName}
      defaultValue={model.defaultValue}
      render={({ field, fieldState }) => (
        <ReactiveField
          componentProps={{
            value: field.value,
            onChange: field.onChange,
            onFocus: field.onFocus,
            onBlur: field.onBlur,
            ...fieldState,
          }}
          decoratorProps={fieldState}
        />
      )}
    />
  </FieldModelContext.Provider>
);
