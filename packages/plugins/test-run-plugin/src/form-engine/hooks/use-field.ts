/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { useContext } from 'react';

import { useObserve } from '@flowgram.ai/reactive';

import { FieldModelContext } from '../contexts';

export const useFieldModel = () => useContext(FieldModelContext);
export const useFieldState = () => useObserve(useFieldModel().state.value);
