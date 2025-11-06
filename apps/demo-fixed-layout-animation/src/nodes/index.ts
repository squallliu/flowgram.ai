/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

/**
 * Copyright (c) 202 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import type { FlowNodeMeta, FlowNodeRegistry } from '@flowgram.ai/fixed-layout-editor';

import { ThinkingNodeRegistry } from './thinking';
import { CustomNodeRegistry } from './custom';
import { ConditionNodeRegistry } from './condition';

export const nodeRegistries: FlowNodeRegistry<FlowNodeMeta>[] = [
  ConditionNodeRegistry,
  CustomNodeRegistry,
  ThinkingNodeRegistry,
];
