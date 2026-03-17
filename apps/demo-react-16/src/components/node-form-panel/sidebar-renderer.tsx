/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import React, { useCallback, useEffect } from 'react';

import { type PanelFactory, usePanelManager } from '@flowgram.ai/panel-manager-plugin';
import { useClientContext, useRefresh } from '@flowgram.ai/free-layout-editor';

export interface NodeFormPanelProps {
  nodeId: string;
}

export const SidebarRenderer: React.FC<NodeFormPanelProps> = ({ nodeId }) => {
  const panelManager = usePanelManager();
  const { selection, playground, document } = useClientContext();
  const refresh = useRefresh();
  const handleClose = useCallback(() => {
    panelManager.close(nodeFormPanelFactory.key);
  }, []);
  const node = nodeId ? document.getNode(nodeId) : undefined;
  /**
   * Listen readonly
   */
  useEffect(() => {
    const disposable = playground.config.onReadonlyOrDisabledChange(() => {
      handleClose();
      refresh();
    });
    return () => disposable.dispose();
  }, [playground]);
  /**
   * Listen selection
   */
  useEffect(() => {
    const toDispose = selection.onSelectionChanged(() => {
      /**
       * 如果没有选中任何节点，则自动关闭侧边栏
       * If no node is selected, the sidebar is automatically closed
       */
      if (selection.selection.length === 0) {
        handleClose();
      } else if (selection.selection.length === 1 && selection.selection[0] !== node) {
        handleClose();
      }
    });
    return () => toDispose.dispose();
  }, [selection, handleClose, node]);
  /**
   * Close when node disposed
   */
  useEffect(() => {
    if (node) {
      const toDispose = node.onDispose(() => {
        panelManager.close(nodeFormPanelFactory.key);
      });
      return () => toDispose.dispose();
    }
    return () => {};
  }, [node]);

  if (!node) {
    return null;
  }

  if (playground.config.readonly) {
    return null;
  }
  return (
    <div
      style={{
        background: 'rgb(251, 251, 251)',
        height: '100%',
        borderRadius: 8,
        border: '1px solid rgba(82,100,154, 0.13)',
        boxSizing: 'border-box',
      }}
    >
      {node.form?.getValueIn('title')} Node Form Panel
      <input
        onBlur={() => {
          console.log('onBlur is before then close panel');
        }}
      />
    </div>
  );
};

export const nodeFormPanelFactory: PanelFactory<NodeFormPanelProps> = {
  key: 'node-form-panel',
  defaultSize: 400,
  render: (props: NodeFormPanelProps) => <SidebarRenderer {...props} />,
};
