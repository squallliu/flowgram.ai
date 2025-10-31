/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import '@flowgram.ai/free-layout-editor/index.css';

import {
  useNodeRender,
  WorkflowNodeProps,
  WorkflowNodeRenderer,
} from '@flowgram.ai/free-layout-editor';

import { PortRender } from './port';
import { NodeBorderColorMap, NodeColorMap, NodeGlowColorMap } from './node-color';

export const NodeRender = (props: WorkflowNodeProps) => {
  const { selected, node, ports } = useNodeRender();
  const nodeColor = NodeColorMap[node.id] ?? '#fff';
  const borderColor = NodeBorderColorMap[node.id] ?? '#fff';
  const glowColor = NodeGlowColorMap[node.id] ?? '59, 130, 246';

  return (
    <WorkflowNodeRenderer
      className="flowgram-logo-node"
      style={
        {
          background: nodeColor,
          border: selected ? `2px solid ${borderColor}` : `2px solid ${nodeColor}`,
          '--glow-color': glowColor,
        } as React.CSSProperties & { '--glow-color': string }
      }
      portStyle={{
        display: 'none',
      }}
      node={props.node}
    >
      {ports.map((p) => (
        <PortRender key={p.id} entity={p} />
      ))}
    </WorkflowNodeRenderer>
  );
};
