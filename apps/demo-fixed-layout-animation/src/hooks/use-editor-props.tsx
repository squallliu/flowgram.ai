/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import '@flowgram.ai/fixed-layout-editor/index.css';

import { useMemo } from 'react';

import { createMinimapPlugin } from '@flowgram.ai/minimap-plugin';
import { defaultFixedSemiMaterials } from '@flowgram.ai/fixed-semi-materials';
import { FixedLayoutProps, FlowRendererKey } from '@flowgram.ai/fixed-layout-editor';

import { WorkflowLoadSchemaService } from '@/services';
import { nodeRegistries } from '@/nodes';
import { ThinkingNode } from '@/components/thinking-node';
import { NodeRender } from '@/components/node-render';
import { FormRender } from '@/components/form-render';

export function useEditorProps(): FixedLayoutProps {
  return useMemo<FixedLayoutProps>(
    () => ({
      plugins: () => [
        createMinimapPlugin({
          disableLayer: true,
          enableDisplayAllNodes: true,
          canvasStyle: {
            canvasWidth: 200,
            canvasHeight: 100,
            canvasPadding: 50,
          },
        }),
      ],
      nodeRegistries,
      initialData: {
        nodes: [],
      },
      materials: {
        renderDefaultNode: NodeRender,
        components: {
          ...defaultFixedSemiMaterials,
          [FlowRendererKey.DRAG_NODE]: () => <></>,
          [FlowRendererKey.BRANCH_ADDER]: () => <></>,
          [FlowRendererKey.ADDER]: () => <></>,
        },
        renderNodes: {
          ThinkingNode,
        },
      },
      onAllLayersRendered: (ctx) => {
        setTimeout(() => {
          ctx.playground.config.fitView(ctx.document.root.bounds.pad(30));
        }, 10);
      },
      onBind: ({ bind }) => {
        bind(WorkflowLoadSchemaService).toSelf().inSingletonScope();
      },
      /**
       * Get the default node registry, which will be merged with the 'nodeRegistries'
       * 提供默认的节点注册，这个会和 nodeRegistries 做合并
       */
      getNodeDefaultRegistry(type) {
        return {
          type,
          meta: {
            defaultExpanded: true,
          },
          formMeta: {
            /**
             * Render form
             */
            render: FormRender,
          },
        };
      },
      /**
       * Redo/Undo enable
       */
      history: {
        enable: true,
        enableChangeNode: true, // Listen Node engine data change
        onApply: (ctx) => {
          if (ctx.document.disposed) return;
          // Listen change to trigger auto save
          // console.log('auto save: ', ctx.document.toJSON());
        },
      },
      /**
       * Node engine enable, you can configure formMeta in the FlowNodeRegistry
       */ nodeEngine: {
        enable: true,
      },
    }),
    []
  );
}
