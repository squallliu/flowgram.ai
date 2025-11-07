/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { useMemo } from 'react';

import { FormSchemaModel } from '../model';
import { ObjectField } from './object-field';
import { GeneralField } from './general-field';

interface RecursionFieldProps {
  model: FormSchemaModel;
}

export const RecursionField: React.FC<RecursionFieldProps> = ({ model }) => {
  const properties = useMemo(() => model.getPropertyList(), [model]);

  /** general field has no children */
  if (model.type !== 'object') {
    return <GeneralField model={model} />;
  }

  return (
    <ObjectField model={model}>
      {properties.map((item) => (
        <RecursionField key={item.uniqueName} model={item} />
      ))}
    </ObjectField>
  );
};
