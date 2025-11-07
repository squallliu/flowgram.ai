/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { definePluginCreator } from '@flowgram.ai/core';

import { TestRunFormEntity, TestRunFormFactory, TestRunFormManager } from './services/form';
import {
  TestRunService,
  TestRunPipelineEntity,
  TestRunPipelineFactory,
  TestRunConfig,
  defineConfig,
} from './services';

export const createTestRunPlugin = definePluginCreator<Partial<TestRunConfig>>({
  onBind: ({ bind }, opt) => {
    /** service */
    bind(TestRunService).toSelf().inSingletonScope();
    /** config */
    bind(TestRunConfig).toConstantValue(defineConfig(opt));
    /** form manager */
    bind(TestRunFormManager).toSelf().inSingletonScope();
    /** form entity */
    bind<TestRunFormFactory>(TestRunFormFactory).toFactory<TestRunFormEntity>((context) => () => {
      const e = context.container.resolve(TestRunFormEntity);
      return e;
    });
    /** pipeline entity */
    bind<TestRunPipelineFactory>(TestRunPipelineFactory).toFactory<TestRunPipelineEntity>(
      (context) => () => {
        const e = context.container.resolve(TestRunPipelineEntity);
        e.container = context.container.createChild();
        return e;
      }
    );
  },
});
