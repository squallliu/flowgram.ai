/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import type { FormSchemaModel } from '../model';
import { FieldModelContext } from '../contexts';
import { ReactiveField } from './reactive-field';

export interface ObjectFieldProps {
  model: FormSchemaModel;
}

export const ObjectField: React.FC<React.PropsWithChildren<ObjectFieldProps>> = ({
  model,
  children,
}) => (
  <FieldModelContext.Provider value={model}>
    <ReactiveField>{children}</ReactiveField>
  </FieldModelContext.Provider>
);
