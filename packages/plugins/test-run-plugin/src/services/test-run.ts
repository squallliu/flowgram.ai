/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { inject, injectable } from 'inversify';
import { Disposable, DisposableCollection, Emitter } from '@flowgram.ai/utils';
import type { FlowNodeEntity, FlowNodeType } from '@flowgram.ai/document';

import { TestRunPipelineFactory } from './pipeline/factory';
import { TestRunFormManager } from './form';
import { FormSchema } from '../form-engine';
import { TestRunPipelineEntity, type TestRunPipelineEntityOptions } from './pipeline';
import { TestRunConfig } from './config';

@injectable()
export class TestRunService {
  @inject(TestRunConfig) private readonly config: TestRunConfig;

  @inject(TestRunPipelineFactory) private readonly pipelineFactory: TestRunPipelineFactory;

  @inject(TestRunFormManager) readonly formManager: TestRunFormManager;

  pipelineEntities = new Map<string, TestRunPipelineEntity>();

  pipelineBindings = new Map<string, Disposable>();

  onPipelineProgressEmitter = new Emitter();

  onPipelineProgress = this.onPipelineProgressEmitter.event;

  onPipelineFinishedEmitter = new Emitter();

  onPipelineFinished = this.onPipelineFinishedEmitter.event;

  public isEnabled(nodeType: FlowNodeType) {
    const config = this.config.nodes[nodeType];
    return config && config?.enabled !== false;
  }

  async toSchema(node: FlowNodeEntity) {
    const nodeType = node.flowNodeType;
    const config = this.config.nodes[nodeType];
    if (!this.isEnabled(nodeType)) {
      return {};
    }
    const properties =
      typeof config.properties === 'function'
        ? await config.properties({ node })
        : config.properties;

    return {
      type: 'object',
      properties,
    };
  }

  createFormWithSchema(schema: FormSchema) {
    const form = this.formManager.createForm();
    form.init({ schema });
    return form;
  }

  async createForm(node: FlowNodeEntity) {
    const schema = await this.toSchema(node);
    return this.createFormWithSchema(schema);
  }

  createPipeline(options: TestRunPipelineEntityOptions) {
    const pipeline = this.pipelineFactory();
    this.pipelineEntities.set(pipeline.id, pipeline);
    pipeline.init(options);
    return pipeline;
  }

  connectPipeline(pipeline: TestRunPipelineEntity) {
    if (this.pipelineBindings.get(pipeline.id)) {
      return;
    }
    const disposable = new DisposableCollection(
      pipeline.onProgress(this.onPipelineProgressEmitter.fire.bind(this.onPipelineProgressEmitter)),
      pipeline.onFinished(this.onPipelineFinishedEmitter.fire.bind(this.onPipelineFinishedEmitter))
    );
    this.pipelineBindings.set(pipeline.id, disposable);
  }

  disconnectPipeline(id: string) {
    if (this.pipelineBindings.has(id)) {
      const disposable = this.pipelineBindings.get(id);
      disposable?.dispose();
      this.pipelineBindings.delete(id);
    }
  }

  disconnectAllPipeline() {
    for (const id of this.pipelineBindings.keys()) {
      this.disconnectPipeline(id);
    }
  }
}
