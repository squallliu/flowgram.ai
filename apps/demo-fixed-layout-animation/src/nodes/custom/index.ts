/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { FlowNodeMeta, FlowNodeRegistry } from '@flowgram.ai/fixed-layout-editor';

export const CustomNodeRegistry: FlowNodeRegistry<FlowNodeMeta> = {
  type: 'custom',
  meta: {},
  // onAdd() {
  //   return {
  //     id: `custom_${nanoid(5)}`,
  //     type: 'custom',
  //     data: {
  //       title: 'Custom',
  //       content: 'this is custom content',
  //     },
  //   };
  // },
};
