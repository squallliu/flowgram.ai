/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import React from 'react';

import { Field } from '@flowgram.ai/free-layout-editor';
import { AssignValueType } from '@flowgram.ai/form-materials';

import { FreeFormMetaStoryBuilder, FormHeader } from '../../free-form-meta-story-builder';

const AssignRow = React.lazy(() =>
  import('@flowgram.ai/form-materials').then((module) => ({
    default: module.AssignRow,
  }))
);

export const AssignModeStory = () => (
  <FreeFormMetaStoryBuilder
    filterEndNode
    formMeta={{
      render: () => (
        <>
          <FormHeader />
          <Field<AssignValueType | undefined>
            defaultValue={{
              operator: 'assign',
              left: { type: 'ref', content: ['start_0', 'str'] },
              right: { type: 'constant', content: 'Hello World', schema: { type: 'string' } },
            }}
            name="assign_row"
          >
            {({ field }) => (
              <AssignRow value={field.value} onChange={(value) => field.onChange(value)} />
            )}
          </Field>
        </>
      ),
    }}
  />
);

export const DeclareModeStory = () => (
  <FreeFormMetaStoryBuilder
    filterEndNode
    formMeta={{
      render: () => (
        <>
          <FormHeader />
          <Field<AssignValueType | undefined> name="assign_row">
            {({ field }) => (
              <AssignRow
                value={{
                  operator: 'declare',
                  left: 'newVariable',
                  right: {
                    type: 'constant',
                    content: 'Hello World',
                    schema: { type: 'string' },
                  },
                }}
                onChange={(value) => field.onChange(value)}
              />
            )}
          </Field>
        </>
      ),
    }}
  />
);
