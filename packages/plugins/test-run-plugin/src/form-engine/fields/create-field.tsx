/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { PropsWithChildren } from 'react';

import { SchemaField, type SchemaFieldProps } from './schema-field';
import { FormComponents } from '../types';

type InnerSchemaFieldProps = Omit<SchemaFieldProps, 'components'> &
  Pick<Partial<SchemaFieldProps>, 'components'>;

export interface CreateSchemaFieldOptions {
  components?: FormComponents;
}
export const createSchemaField = (options: CreateSchemaFieldOptions) => {
  const InnerSchemaField: React.FC<PropsWithChildren<InnerSchemaFieldProps>> = ({
    components,
    ...props
  }) => (
    <SchemaField
      components={{
        ...options.components,
        ...components,
      }}
      {...props}
    />
  );

  return InnerSchemaField;
};
