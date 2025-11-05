/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import React from 'react';

import { Field } from '@flowgram.ai/free-layout-editor';

import { FreeFormMetaStoryBuilder, FormHeader } from '../../free-form-meta-story-builder';

const BatchVariableSelector = React.lazy(() =>
  import('@flowgram.ai/form-materials').then((module) => ({
    default: module.BatchVariableSelector,
  }))
);

const VariableSelector = React.lazy(() =>
  import('@flowgram.ai/form-materials').then((module) => ({
    default: module.VariableSelector,
  }))
);

export const BasicStory = () => (
  <FreeFormMetaStoryBuilder
    filterEndNode
    formMeta={{
      render: () => (
        <>
          <FormHeader />
          <div style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
              BatchVariableSelector (Array variables only):
            </div>
            <Field<string[] | undefined> name="batch_variable">
              {({ field }) => (
                <BatchVariableSelector
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                />
              )}
            </Field>
          </div>
          <div>
            <div style={{ marginBottom: 8, fontSize: 12, color: '#666' }}>
              VariableSelector (All variables):
            </div>
            <Field<string[] | undefined> name="normal_variable">
              {({ field }) => (
                <VariableSelector value={field.value} onChange={(value) => field.onChange(value)} />
              )}
            </Field>
          </div>
        </>
      ),
    }}
  />
);
