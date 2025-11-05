/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import React from 'react';

import { Field } from '@flowgram.ai/free-layout-editor';
import { provideJsonSchemaOutputs, type IJsonSchema } from '@flowgram.ai/form-materials';

import { FreeFormMetaStoryBuilder, FormHeader } from '../../free-form-meta-story-builder';

const DisplayOutputs = React.lazy(() =>
  import('@flowgram.ai/form-materials').then((module) => ({
    default: module.DisplayOutputs,
  }))
);

const JsonSchemaEditor = React.lazy(() =>
  import('@flowgram.ai/form-materials').then((module) => ({
    default: module.JsonSchemaEditor,
  }))
);

export const DisplayFromScopeStory = () => (
  <FreeFormMetaStoryBuilder
    filterEndNode
    filterStartNode
    transformInitialNode={{
      custom_0: (node) => {
        node.data.outputs = {
          type: 'object',
          properties: {
            result: { type: 'string' },
            status: { type: 'number' },
          },
        };
        return node;
      },
    }}
    formMeta={{
      render: () => (
        <>
          <FormHeader />
          <Field<IJsonSchema | undefined> name="outputs">
            {({ field }) => (
              <JsonSchemaEditor value={field.value} onChange={(value) => field.onChange(value)} />
            )}
          </Field>
          <br />
          <b>Display Outputs by Scope:</b>
          <DisplayOutputs displayFromScope />
        </>
      ),
      effect: {
        outputs: provideJsonSchemaOutputs,
      },
    }}
  />
);

export const DisplayFromFieldStory = () => (
  <FreeFormMetaStoryBuilder
    filterEndNode
    filterStartNode
    transformInitialNode={{
      custom_0: (node) => {
        node.data.outputs = {
          type: 'object',
          properties: {
            result: { type: 'string' },
            status: { type: 'number' },
          },
        };
        return node;
      },
    }}
    formMeta={{
      render: () => (
        <>
          <FormHeader />
          <Field<IJsonSchema | undefined> name="outputs">
            {({ field }) => (
              <JsonSchemaEditor value={field.value} onChange={(value) => field.onChange(value)} />
            )}
          </Field>
          <br />
          <b>Display Outputs By Schema</b>
          <Field<IJsonSchema | undefined> name="outputs">
            {({ field }) => <DisplayOutputs value={field.value} />}
          </Field>
        </>
      ),
    }}
  />
);
