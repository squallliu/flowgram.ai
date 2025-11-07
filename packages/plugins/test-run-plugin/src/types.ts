/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import type { FlowNodeType, FlowNodeEntity } from '@flowgram.ai/document';

import type { FormSchema, FormComponents } from './form-engine';

export type MaybePromise<T> = T | Promise<T>;

type PropertiesFunctionParams = {
  node: FlowNodeEntity;
};

export interface NodeTestConfig {
  /** Enable node TestRun */
  enabled?: boolean;
  /** Input schema properties */
  properties?:
    | Record<string, FormSchema>
    | ((params: PropertiesFunctionParams) => MaybePromise<Record<string, FormSchema>>);
}
export type NodeMap = Record<FlowNodeType, NodeTestConfig>;

export interface TestRunPluginConfig {
  components?: FormComponents;
  nodes?: NodeMap;
}
