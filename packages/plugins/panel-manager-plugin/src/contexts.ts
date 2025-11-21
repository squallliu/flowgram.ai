/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { createContext } from 'react';

import type { PanelEntity } from './services/panel-factory';

export const PanelContext = createContext({} as PanelEntity);
