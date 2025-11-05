/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import React from 'react';

import { FreeFormMetaStoryBuilder, FormHeader } from '../../free-form-meta-story-builder';

const AssignRows = React.lazy(() =>
  import('@flowgram.ai/form-materials').then((module) => ({
    default: module.AssignRows,
  }))
);

export const BasicStory = () => (
  <FreeFormMetaStoryBuilder
    filterEndNode
    formMeta={{
      render: () => (
        <>
          <FormHeader />
          <AssignRows name="assign_rows" />
        </>
      ),
    }}
  />
);
