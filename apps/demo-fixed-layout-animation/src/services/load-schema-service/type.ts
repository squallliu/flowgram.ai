/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { FlowNodeJSON } from '@flowgram.ai/fixed-layout-editor';

export interface SchemaPatchData {
  nodeID: string;
  schema: FlowNodeJSON;
  parentID?: string;
  index?: number;
  fromNodeID?: string;
}

export interface SchemaPatch {
  create: SchemaPatchData[];
  remove: string[];
}
