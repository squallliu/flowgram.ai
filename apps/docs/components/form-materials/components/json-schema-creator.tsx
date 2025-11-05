/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import React from 'react';

import { Field } from '@flowgram.ai/free-layout-editor';
import type { IJsonSchema } from '@flowgram.ai/form-materials';

import { FreeFormMetaStoryBuilder, FormHeader } from '../../free-form-meta-story-builder';

const JsonSchemaCreator = React.lazy(() =>
  import('@flowgram.ai/form-materials').then((module) => ({
    default: module.JsonSchemaCreator,
  }))
);

const JsonSchemaEditor = React.lazy(() =>
  import('@flowgram.ai/form-materials').then((module) => ({
    default: module.JsonSchemaEditor,
  }))
);

export const BasicStory = () => (
  <FreeFormMetaStoryBuilder
    filterEndNode
    formMeta={{
      render: () => (
        <>
          <FormHeader />
          <Field<IJsonSchema | undefined> name="json_schema">
            {({ field }) => (
              <div>
                <JsonSchemaCreator onSchemaCreate={(schema) => field.onChange(schema)} />
                <div style={{ marginTop: 16 }}>
                  <JsonSchemaEditor
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                </div>
              </div>
            )}
          </Field>
        </>
      ),
    }}
  />
);
