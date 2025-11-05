/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import React from 'react';

import { Field } from '@flowgram.ai/free-layout-editor';
import { createInferInputsPlugin } from '@flowgram.ai/form-materials';

import { FreeFormMetaStoryBuilder, FormHeader } from '../../free-form-meta-story-builder';

const InputsValues = React.lazy(() =>
  import('@flowgram.ai/form-materials').then((module) => ({
    default: module.InputsValues,
  }))
);

const InputsValuesTree = React.lazy(() =>
  import('@flowgram.ai/form-materials').then((module) => ({
    default: module.InputsValuesTree,
  }))
);

/**
 * Basic usage story - demonstrates automatic schema inference from InputsValues
 */
export const BasicStory = () => (
  <FreeFormMetaStoryBuilder
    filterEndNode
    height={500}
    formMeta={{
      render: () => (
        <>
          <FormHeader />
          <div>
            <div>
              <h4>Headers</h4>
              <Field<Record<string, any> | undefined>
                name="headersValues"
                defaultValue={{
                  'Content-Type': {
                    type: 'constant',
                    content: 'application/json',
                    schema: { type: 'string' },
                  },
                  Authorization: {
                    type: 'ref',
                    content: ['start_0', 'str'],
                  },
                }}
              >
                {({ field }) => (
                  <InputsValues value={field.value} onChange={(value) => field.onChange(value)} />
                )}
              </Field>
            </div>

            <div>
              <h4>Body</h4>
              <Field<Record<string, any> | undefined>
                name="bodyValues"
                defaultValue={{
                  page: {
                    index: {
                      type: 'ref',
                      content: ['start_0', 'obj', 'obj2', 'num'],
                    },
                    size: {
                      type: 'constant',
                      content: 10,
                      schema: { type: 'number' },
                    },
                  },
                  query: {
                    type: 'ref',
                    content: ['start_0', 'obj'],
                  },
                }}
              >
                {({ field }) => (
                  <InputsValuesTree
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                  />
                )}
              </Field>
            </div>
          </div>
        </>
      ),
      plugins: [
        createInferInputsPlugin({
          sourceKey: 'headersValues',
          targetKey: 'headersSchema',
        }),
        createInferInputsPlugin({
          sourceKey: 'bodyValues',
          targetKey: 'bodySchema',
        }),
      ],
    }}
  />
);
