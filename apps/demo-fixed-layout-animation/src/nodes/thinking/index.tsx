/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { FlowNodeMeta, FlowNodeRegistry } from '@flowgram.ai/fixed-layout-editor';

import { ThinkingTextField } from '@/fields/thinking-text-field';
import { LoadingDots } from '@/components/loading-dots';

export const ThinkingNodeRegistry: FlowNodeRegistry<FlowNodeMeta> = {
  type: 'thinking',
  meta: {
    renderKey: 'ThinkingNode',
  },
  formMeta: {
    render: () => (
      <>
        <div
          style={{
            marginBottom: 16,
          }}
        >
          <LoadingDots />
        </div>
        <ThinkingTextField />
      </>
    ),
  },
};
