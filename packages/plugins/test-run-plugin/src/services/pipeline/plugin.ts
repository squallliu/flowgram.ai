/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import type { TestRunPipelineEntity } from './pipeline';

export interface TestRunPipelinePlugin {
  name: string;
  apply(pipeline: TestRunPipelineEntity): void;
}
