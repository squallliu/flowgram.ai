/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { injectable, inject } from 'inversify';
import { Emitter } from '@flowgram.ai/utils';

import { PanelManagerConfig } from './panel-config';
import type { Area, PanelEntityConfig, PanelFactory } from '../types';
import { PanelEntity, PanelEntityFactory } from './panel-factory';

@injectable()
export class PanelManager {
  @inject(PanelManagerConfig) readonly config: PanelManagerConfig;

  @inject(PanelEntityFactory) readonly createPanel: PanelEntityFactory;

  readonly panelRegistry = new Map<string, PanelFactory<any>>();

  private panels = new Map<string, PanelEntity>();

  private onPanelsChangeEvent = new Emitter<void>();

  public onPanelsChange = this.onPanelsChangeEvent.event;

  init() {
    this.config.factories.forEach((factory) => this.register(factory));
  }

  /** registry panel factory */
  register<T extends any>(factory: PanelFactory<T>) {
    this.panelRegistry.set(factory.key, factory);
  }

  /** open panel */
  public open(key: string, area: Area = 'right', options?: PanelEntityConfig) {
    const factory = this.panelRegistry.get(key);
    if (!factory) {
      return;
    }

    const sameKeyPanels = this.getPanels(area).filter((p) => p.key === key);
    if (!factory.allowDuplicates && sameKeyPanels.length) {
      sameKeyPanels.forEach((p) => this.remove(p.id));
    }

    const panel = this.createPanel({
      factory,
      config: {
        area,
        ...options,
      },
    });

    this.panels.set(panel.id, panel);
    this.trim(area);
    this.onPanelsChangeEvent.fire();
    console.log('jxj', this.panels);
  }

  /** close panel */
  public close(key?: string) {
    const panels = this.getPanels();
    const closedPanels = key ? panels.filter((p) => p.key === key) : panels;
    closedPanels.forEach((p) => this.remove(p.id));
    this.onPanelsChangeEvent.fire();
  }

  private trim(area: Area) {
    const panels = this.getPanels(area);
    const areaConfig = this.getAreaConfig(area);
    console.log('jxj', areaConfig.max, panels.length);
    while (panels.length > areaConfig.max) {
      const removed = panels.shift();
      if (removed) {
        this.remove(removed.id);
      }
    }
  }

  private remove(id: string) {
    const panel = this.panels.get(id);
    if (panel) {
      panel.dispose();
      this.panels.delete(id);
    }
  }

  getPanels(area?: Area) {
    const panels: PanelEntity[] = [];
    this.panels.forEach((panel) => {
      if (!area || panel.area === area) {
        panels.push(panel);
      }
    });
    return panels;
  }

  getAreaConfig(area: Area) {
    switch (area) {
      case 'docked-bottom':
        return this.config.dockedBottom;
      case 'docked-right':
        return this.config.dockedRight;
      case 'bottom':
        return this.config.bottom;
      case 'right':
      default:
        return this.config.right;
    }
  }

  dispose() {
    this.onPanelsChangeEvent.dispose();
  }
}
