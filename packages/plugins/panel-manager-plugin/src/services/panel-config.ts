/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { PluginContext } from '@flowgram.ai/core';

import type { PanelFactory, PanelConfig } from '../types';
import type { PanelLayerProps } from '../components/panel-layer';

export interface PanelManagerConfig {
  factories: PanelFactory<any>[];
  right: PanelConfig;
  bottom: PanelConfig;
  autoResize: boolean;
  layerProps: PanelLayerProps;
  getPopupContainer: (ctx: PluginContext) => HTMLElement; // default playground.node.parentElement
}

export const PanelManagerConfig = Symbol('PanelManagerConfig');

export const defineConfig = (config: Partial<PanelManagerConfig>) => {
  const defaultConfig: PanelManagerConfig = {
    right: {
      max: 1,
    },
    bottom: {
      max: 1,
    },
    factories: [],
    autoResize: true,
    layerProps: {},
    getPopupContainer: (ctx: PluginContext) => ctx.playground.node.parentNode as HTMLElement,
  };
  return {
    ...defaultConfig,
    ...config,
  };
};
