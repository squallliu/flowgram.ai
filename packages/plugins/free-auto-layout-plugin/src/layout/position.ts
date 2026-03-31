/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { WorkflowDocument } from '@flowgram.ai/free-layout-core';
import { PositionSchema, startTween } from '@flowgram.ai/core';

import { LayoutNode } from './type';
import { LayoutStore } from './store';

export class LayoutPosition {
  constructor(private readonly store: LayoutStore) {}

  public async position(): Promise<void> {
    if (this.store.options.enableAnimation) {
      return this.positionWithAnimation();
    }
    return this.positionDirectly();
  }

  private positionDirectly(): void {
    this.store.nodes.forEach((layoutNode) => {
      this.updateNodePosition({ layoutNode, step: 100 });
    });
  }

  private async positionWithAnimation(): Promise<void> {
    return new Promise((resolve) => {
      startTween({
        from: { d: 0 },
        to: { d: 100 },
        duration: this.store.options.animationDuration ?? 0,
        onUpdate: (v) => {
          this.store.nodes.forEach((layoutNode) => {
            this.updateNodePosition({ layoutNode, step: v.d });
          });
        },
        onComplete: () => {
          resolve();
        },
      });
    });
  }

  private updateNodePosition(params: { layoutNode: LayoutNode; step: number }): void {
    const { layoutNode, step } = params;
    const { transform } = layoutNode.entity.transform;

    const centerToTopEdgeOffset =
      (layoutNode.size.height - layoutNode.padding.top - layoutNode.padding.bottom) / 2;

    const layoutPosition: PositionSchema = {
      x: layoutNode.position.x + layoutNode.offset.x,
      y: layoutNode.position.y + layoutNode.offset.y - centerToTopEdgeOffset,
    };

    const deltaX = ((layoutPosition.x - transform.position.x) * step) / 100;
    const deltaY = ((layoutPosition.y - transform.position.y) * step) / 100;

    const position = {
      x: transform.position.x + deltaX,
      y: transform.position.y + deltaY,
    };

    transform.update({
      position,
    });
    const document = layoutNode.entity.document as WorkflowDocument;
    document.layout.updateAffectedTransform(layoutNode.entity);
  }
}
