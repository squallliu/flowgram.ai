/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { createStore, StoreApi } from 'zustand/vanilla';
import { nanoid } from 'nanoid';
import { inject, injectable } from 'inversify';

import type { PanelFactory, PanelEntityConfig, Area } from '../types';
import { PanelRestore } from './panel-restore';

export const PanelEntityFactory = Symbol('PanelEntityFactory');
export type PanelEntityFactory = (options: {
  factory: PanelEntityFactoryConstant;
  config: PanelEntityConfigConstant;
}) => PanelEntity;

export const PanelEntityFactoryConstant = Symbol('PanelEntityFactoryConstant');
export type PanelEntityFactoryConstant = PanelFactory<any>;
export const PanelEntityConfigConstant = Symbol('PanelEntityConfigConstant');
export type PanelEntityConfigConstant = PanelEntityConfig<any> & {
  area: Area;
};

const PANEL_SIZE_DEFAULT = 400;

interface PanelEntityState {
  size: number;
}

@injectable()
export class PanelEntity {
  @inject(PanelRestore) restore: PanelRestore;

  /** 面板工厂 */
  @inject(PanelEntityFactoryConstant) public factory: PanelEntityFactoryConstant;

  @inject(PanelEntityConfigConstant) public config: PanelEntityConfigConstant;

  private initialized = false;

  /** 实例唯一标识 */
  id: string = nanoid();

  /** 渲染缓存 */
  node: React.ReactNode = null;

  store: StoreApi<PanelEntityState>;

  get area() {
    return this.config.area;
  }

  get key() {
    return this.factory.key;
  }

  get renderer() {
    if (!this.node) {
      this.node = this.factory.render(this.config.props);
    }
    return this.node;
  }

  init() {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    const cache = this.restore.restore<PanelEntityState>(this.key);
    this.store = createStore<PanelEntityState>(() => ({
      size: this.config.defaultSize || this.factory.defaultSize || PANEL_SIZE_DEFAULT,
      ...(cache ?? {}),
    }));
  }

  dispose() {
    this.restore.store(this.key, this.store.getState());
  }
}
