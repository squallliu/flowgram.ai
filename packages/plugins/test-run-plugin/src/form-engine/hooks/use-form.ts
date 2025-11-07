/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { useContext } from 'react';

import { useObserve } from '@flowgram.ai/reactive';

import { FormModelContext } from '../contexts';

export const useFormModel = () => useContext(FormModelContext);
export const useFormState = () => useObserve(useFormModel().state.value);
