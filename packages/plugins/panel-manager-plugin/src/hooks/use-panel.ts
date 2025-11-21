/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { useContext } from 'react';

import { PanelContext } from '../contexts';

export const usePanel = () => useContext(PanelContext);
