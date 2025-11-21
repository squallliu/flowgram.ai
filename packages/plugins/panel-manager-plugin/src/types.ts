/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

export type Area = 'right' | 'bottom' | 'docked-right' | 'docked-bottom';

export interface PanelConfig {
  /** max panel */
  max: number;
}

export interface PanelFactory<T extends any> {
  key: string;
  defaultSize: number;
  maxSize?: number;
  minSize?: number;
  style?: React.CSSProperties;
  /** Allows multiple panels with the same key to be rendered simultaneously  */
  allowDuplicates?: boolean;
  resize?: boolean;
  render: (props: T) => React.ReactNode;
}

export interface PanelEntityConfig<T extends any = any> {
  defaultSize?: number;
  style?: React.CSSProperties;
  props?: T;
}
