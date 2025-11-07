/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import type { TestRunFormEntity } from './form';

export const TestRunFormFactory = Symbol('TestRunFormFactory');
export type TestRunFormFactory = () => TestRunFormEntity;
