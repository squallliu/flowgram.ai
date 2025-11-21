/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { definePluginCreator } from '@flowgram.ai/core';

import {
  PanelEntityFactory,
  PanelEntity,
  PanelEntityFactoryConstant,
  PanelEntityConfigConstant,
} from './services/panel-factory';
import { defineConfig } from './services/panel-config';
import {
  PanelManager,
  PanelManagerConfig,
  PanelLayer,
  PanelRestore,
  PanelRestoreImpl,
} from './services';

export const createPanelManagerPlugin = definePluginCreator<Partial<PanelManagerConfig>>({
  onBind: ({ bind }, opt) => {
    bind(PanelManager).to(PanelManager).inSingletonScope();
    bind(PanelRestore).to(PanelRestoreImpl).inSingletonScope();
    bind(PanelManagerConfig).toConstantValue(defineConfig(opt));
    bind(PanelEntityFactory).toFactory(
      (context) =>
        ({
          factory,
          config,
        }: {
          factory: PanelEntityFactoryConstant;
          config: PanelEntityConfigConstant;
        }) => {
          const container = context.container.createChild();
          container.bind(PanelEntityFactoryConstant).toConstantValue(factory);
          container.bind(PanelEntityConfigConstant).toConstantValue(config);
          const panel = container.resolve(PanelEntity);
          panel.init();
          return panel;
        }
    );
  },
  onInit(ctx) {
    ctx.playground.registerLayer(PanelLayer);
    const panelManager = ctx.container.get<PanelManager>(PanelManager);
    panelManager.init();
  },
});
