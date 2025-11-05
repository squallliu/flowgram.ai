/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import React from 'react';

import { createInferAssignPlugin } from '@flowgram.ai/form-materials';

import { FreeFormMetaStoryBuilder, FormHeader } from '../../free-form-meta-story-builder';

const AssignRows = React.lazy(() =>
  import('@flowgram.ai/form-materials').then((module) => ({
    default: module.AssignRows,
  }))
);

const DisplayOutputs = React.lazy(() =>
  import('@flowgram.ai/form-materials').then((module) => ({
    default: module.DisplayOutputs,
  }))
);

export const BasicStory = () => (
  <FreeFormMetaStoryBuilder
    transformInitialNode={{
      end_0: (node) => {
        node.data.inputsValues = {
          info: {
            type: 'ref',
            content: ['custom_0', 'userInfo'],
          },
        };

        return node;
      },
    }}
    formMeta={{
      render: () => (
        <>
          <FormHeader />
          <AssignRows
            name="assign"
            defaultValue={[
              // 从常量声明变量
              {
                operator: 'declare',
                left: 'userName',
                right: {
                  type: 'constant',
                  content: 'John Doe',
                  schema: { type: 'string' },
                },
              },
              // 从变量声明变量
              {
                operator: 'declare',
                left: 'userInfo',
                right: {
                  type: 'ref',
                  content: ['start_0', 'obj'],
                },
              },
              // 赋值现有变量
              {
                operator: 'assign',
                left: {
                  type: 'ref',
                  content: ['start_0', 'str'],
                },
                right: {
                  type: 'constant',
                  content: 'Hello Flowgram',
                  schema: { type: 'string' },
                },
              },
            ]}
          />
          <DisplayOutputs displayFromScope style={{ marginTop: 10 }} />
        </>
      ),
      plugins: [
        createInferAssignPlugin({
          assignKey: 'assign',
          outputKey: 'outputs',
        }),
      ],
    }}
  />
);
