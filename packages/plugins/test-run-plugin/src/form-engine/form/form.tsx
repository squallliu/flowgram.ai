/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { Form } from '@flowgram.ai/form';

import { FormSchema, FormComponents } from '../types';
import { useCreateForm, type UseCreateFormOptions } from '../hooks';
import { createSchemaField } from '../fields';

const SchemaField = createSchemaField({});

export type FormEngineProps = React.PropsWithChildren<
  {
    /** Form schema */
    schema: FormSchema;
    /** form material map */
    components?: FormComponents;
  } & UseCreateFormOptions
>;

export const FormEngine: React.FC<FormEngineProps> = ({
  schema,
  components,
  children,
  ...props
}) => {
  const { model, control } = useCreateForm(schema, props);

  return (
    <Form control={control}>
      <SchemaField model={model} components={components}>
        {children}
      </SchemaField>
    </Form>
  );
};
