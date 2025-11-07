/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import type { TestRunPipelineEntity } from './pipeline';

export const TestRunPipelineFactory = Symbol('TestRunPipelineFactory');
export type TestRunPipelineFactory = () => TestRunPipelineEntity;
