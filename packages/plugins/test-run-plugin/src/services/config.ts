/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import type { FlowNodeType, FlowNodeEntity } from '@flowgram.ai/document';

import type { MaybePromise } from '../types';
import type { FormSchema, FormComponents } from '../form-engine';
import type { TestRunPipelinePlugin } from './pipeline';

type PropertiesFunctionParams = {
  node: FlowNodeEntity;
};
export type NodeMap = Record<FlowNodeType, NodeTestConfig>;
export interface NodeTestConfig {
  /** Enable node TestRun */
  enabled?: boolean;
  /** Input schema properties */
  properties?:
    | Record<string, FormSchema>
    | ((params: PropertiesFunctionParams) => MaybePromise<Record<string, FormSchema>>);
}

export interface TestRunConfig {
  components: FormComponents;
  nodes: NodeMap;
  plugins: (new () => TestRunPipelinePlugin)[];
}

export const TestRunConfig = Symbol('TestRunConfig');
export const defineConfig = (config: Partial<TestRunConfig>) => {
  const defaultConfig: TestRunConfig = {
    components: {},
    nodes: {},
    plugins: [],
  };
  return {
    ...defaultConfig,
    ...config,
  };
};
