/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */
import {
  FlowNodeBaseType,
  FlowNodeEntity,
  FlowNodeJSON,
  FlowNodeMeta,
  FlowNodeRegistry,
  FlowNodeSplitType,
} from '@flowgram.ai/fixed-layout-editor';

export const ConditionNodeRegistry: FlowNodeRegistry<FlowNodeMeta> = {
  type: 'condition',
  extend: FlowNodeSplitType.DYNAMIC_SPLIT,
  onBlockChildCreate(
    originParent: FlowNodeEntity,
    blockData: FlowNodeJSON,
    addedNodes: FlowNodeEntity[] = [] // 新创建的节点都要存在这里
  ) {
    const { document } = originParent;
    const parent = document.getNode(`$inlineBlocks$${originParent.id}`);
    const blockNode = document.addNode(
      {
        id: `$block$${blockData.id}`,
        type: FlowNodeBaseType.BLOCK,
        parent,
      },
      addedNodes
    );
    const createdNode = document.addNode(
      {
        ...blockData,
        type: blockData.type || FlowNodeBaseType.BLOCK,
        parent: blockNode,
      },
      addedNodes
    );
    addedNodes.push(blockNode, createdNode);
    return createdNode;
  },
};
