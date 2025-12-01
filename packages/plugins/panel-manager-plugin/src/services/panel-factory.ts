/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { createStore, StoreApi } from 'zustand/vanilla';
import { nanoid } from 'nanoid';
import { inject, injectable } from 'inversify';

import type { PanelFactory, PanelEntityConfig, Area } from '../types';
import { PanelRestore } from './panel-restore';
import { PanelManagerConfig } from './panel-config';
import { merge } from '../utils';

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

export interface PanelEntityState {
  size: number;
  fullscreen: boolean;
}

@injectable()
export class PanelEntity {
  @inject(PanelRestore) restore: PanelRestore;

  /** 面板工厂 */
  @inject(PanelEntityFactoryConstant) public factory: PanelEntityFactoryConstant;

  @inject(PanelEntityConfigConstant) public config: PanelEntityConfigConstant;

  @inject(PanelManagerConfig) readonly globalConfig: PanelManagerConfig;

  private initialized = false;

  /** 实例唯一标识 */
  id: string = nanoid();

  /** 渲染缓存 */
  node: React.ReactNode = null;

  store: StoreApi<PanelEntityState>;

  get area() {
    return this.config.area;
  }

  get mode() {
    return this.config.area.startsWith('docked') ? 'docked' : 'floating';
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

  get fullscreen() {
    return this.store.getState().fullscreen;
  }

  set fullscreen(next: boolean) {
    this.store.setState({ fullscreen: next });
  }

  get resizable() {
    if (this.fullscreen) {
      return false;
    }
    return this.factory.resize !== undefined ? this.factory.resize : this.globalConfig.autoResize;
  }

  get layer() {
    return document.querySelector(
      this.mode ? '.gedit-flow-panel-layer-wrap-docked' : '.gedit-flow-panel-layer-wrap-floating'
    );
  }

  init() {
    if (this.initialized) {
      return;
    }
    this.initialized = true;
    const cache = this.restore.restore<PanelEntityState>(this.key);

    const initialState = merge<PanelEntityState>(
      {
        size: this.config.defaultSize,
        fullscreen: this.config.fullscreen,
      },
      cache ? cache : {},
      {
        size: this.factory.defaultSize || PANEL_SIZE_DEFAULT,
        fullscreen: this.factory.fullscreen || false,
      }
    );

    this.store = createStore<PanelEntityState>(() => initialState);
  }

  mergeState() {}

  dispose() {
    this.restore.store(this.key, this.store.getState());
  }
}
