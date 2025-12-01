/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import type { StoreApi } from 'zustand';
import { nanoid } from 'nanoid';
import { injectable, interfaces } from 'inversify';
import { Emitter } from '@flowgram.ai/utils';

import { Tap } from './tap';
import type { TestRunPipelinePlugin } from './plugin';
import { StoreService } from '../store';
export interface TestRunPipelineEntityOptions {
  plugins: (new () => TestRunPipelinePlugin)[];
}

interface TestRunPipelineEntityState<T = any> {
  status: 'idle' | 'preparing' | 'executing' | 'canceled' | 'finished' | 'disposed';
  data?: T;
  result?: any;
  getData: () => T;
  setData: (next: any) => void;
}

export interface TestRunPipelineEntityCtx<T = any> {
  id: string;
  store: StoreApi<TestRunPipelineEntityState<T>>;
  operate: {
    update: (data: any) => void;
    cancel: () => void;
  };
}

const initialState: Omit<TestRunPipelineEntityState, 'getData' | 'setData'> = {
  status: 'idle',
  data: {},
};

@injectable()
export class TestRunPipelineEntity extends StoreService<TestRunPipelineEntityState> {
  container: interfaces.Container | undefined;

  id = nanoid();

  plugins: TestRunPipelinePlugin[] = [];

  prepare = new Tap<TestRunPipelineEntityCtx>();

  private execute?: (ctx: TestRunPipelineEntityCtx) => Promise<void> | void;

  private progress?: (ctx: TestRunPipelineEntityCtx) => Promise<void> | void;

  get status() {
    return this.getState().status;
  }

  set status(next: TestRunPipelineEntityState['status']) {
    this.setState({ status: next });
  }

  onProgressEmitter = new Emitter<any>();

  onProgress = this.onProgressEmitter.event;

  onFinishedEmitter = new Emitter();

  onFinished = this.onFinishedEmitter.event;

  constructor() {
    super((set, get) => ({
      ...initialState,
      getData: () => get().data || {},
      setData: (next: any) => set((state) => ({ ...state, data: { ...state.data, ...next } })),
    }));
  }

  public init(options: TestRunPipelineEntityOptions) {
    if (!this.container) {
      return;
    }
    const { plugins } = options;
    for (const PluginClass of plugins) {
      const plugin = this.container.resolve<TestRunPipelinePlugin>(PluginClass);
      plugin.apply(this);
      this.plugins.push(plugin);
    }
  }

  public registerExecute(fn: (ctx: TestRunPipelineEntityCtx) => Promise<void> | void) {
    this.execute = fn;
  }

  public registerProgress(fn: (ctx: TestRunPipelineEntityCtx) => Promise<void> | void) {
    this.progress = fn;
  }

  async start<T>(options?: { data: T }) {
    const { data } = options || {};
    if (this.status !== 'idle') {
      return;
    }
    /** initialization data */
    this.setState({ data });
    const ctx: TestRunPipelineEntityCtx = {
      id: this.id,
      store: this.store,
      operate: {
        update: this.update.bind(this),
        cancel: this.cancel.bind(this),
      },
    };

    this.status = 'preparing';
    await this.prepare.call(ctx);
    if (this.status !== 'preparing') {
      return;
    }

    this.status = 'executing';
    if (this.execute) {
      await this.execute(ctx);
    }
    if (this.progress) {
      await this.progress(ctx);
    }
    if (this.status === 'executing') {
      this.status = 'finished';
      this.onFinishedEmitter.fire(this.getState().result);
    }
  }

  update(result: any) {
    this.setState({ result });
    this.onProgressEmitter.fire(result);
  }

  cancel() {
    if ((this.status = 'preparing')) {
      this.prepare.freeze();
    }
    this.status = 'canceled';
  }

  dispose() {
    this.status = 'disposed';
    this.plugins.forEach((p) => {
      if (p.dispose) {
        p.dispose();
      }
    });
    this.onProgressEmitter.dispose();
    this.onFinishedEmitter.dispose();
  }
}
