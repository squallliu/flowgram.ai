/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { useContext } from 'react';

import { useStoreWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';

import { PanelEntityState } from '../services/panel-factory';
import { PanelContext } from '../contexts';

export const usePanel = () => useContext(PanelContext);

export const usePanelStore = <T>(selector: (s: PanelEntityState) => T) => {
  const panel = usePanel();
  return useStoreWithEqualityFn(panel.store, selector, shallow);
};
