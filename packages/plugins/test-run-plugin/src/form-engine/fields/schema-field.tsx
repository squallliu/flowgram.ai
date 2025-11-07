/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { useState } from 'react';

import type { FormComponents } from '../types';
import { FormSchemaModel } from '../model';
import { ComponentsContext, FormModelContext } from '../contexts';
import { RecursionField } from './recursion-field';

export interface SchemaFieldProps {
  model: FormSchemaModel;
  components: FormComponents;
}
export const SchemaField: React.FC<React.PropsWithChildren<SchemaFieldProps>> = ({
  components,
  model,
  children,
}) => {
  /** Only initialized once, dynamic is not supported */
  const [innerComponents] = useState(() => components);
  return (
    <ComponentsContext.Provider value={innerComponents}>
      <FormModelContext.Provider value={model}>
        <RecursionField model={model} />
        {children}
      </FormModelContext.Provider>
    </ComponentsContext.Provider>
  );
};
