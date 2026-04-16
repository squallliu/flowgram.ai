/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { Rectangle } from '@flowgram.ai/utils';

import { type WorkflowNodeEntity } from '../entities/workflow-node-entity';
export type WorkflowPortType = 'input' | 'output';

export const getPortEntityIdByNodeId = (
  nodeId: string,
  portType: WorkflowPortType,
  portID: string | number = ''
): string => `port_${portType}_${nodeId}_${portID}`;

export const getPortEntityId = (
  node: WorkflowNodeEntity,
  portType: WorkflowPortType,
  portID: string | number = ''
): string => getPortEntityIdByNodeId(node.id, portType, portID);

export const WORKFLOW_LINE_ENTITY = 'WorkflowLineEntity';

export function domReactToBounds(react: DOMRect): Rectangle {
  return new Rectangle(react.x, react.y, react.width, react.height);
}
