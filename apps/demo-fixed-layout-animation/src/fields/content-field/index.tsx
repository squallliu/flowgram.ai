/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { Field } from '@flowgram.ai/fixed-layout-editor';
import './index.less';

export const ContentField = () => (
  <Field<string> name="content">
    {({ field }) => <div className="form-render-content">{field.value}</div>}
  </Field>
);
