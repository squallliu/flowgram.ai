/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { useService } from '@flowgram.ai/core';

import { TestRunService } from '../../services/test-run';

export const useTestRunService = () => useService<TestRunService>(TestRunService);
