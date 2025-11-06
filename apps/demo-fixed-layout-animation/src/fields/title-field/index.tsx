/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { Field } from '@flowgram.ai/fixed-layout-editor';

import { useNodeStatus } from '@/hooks/use-node-loading';
import { LoadingDots } from '@/components/loading-dots';
import './index.less';

export const TitleField = () => {
  const { loading } = useNodeStatus();
  return (
    <Field<string> name="title">
      {({ field }) => (
        <div className="form-render-title">
          <span>{field.value}</span>
          {loading && (
            <span>
              <LoadingDots />
            </span>
          )}
        </div>
      )}
    </Field>
  );
};
