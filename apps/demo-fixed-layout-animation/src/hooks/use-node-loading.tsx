/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useState } from 'react';

import { FlowNodeFormData, FormModelV2, useNodeRender } from '@flowgram.ai/fixed-layout-editor';

interface NodeStatus {
  loading: boolean;
  className: string;
}

const NodeStatusKey = 'status';

export const useNodeStatus = () => {
  const { node } = useNodeRender();
  const formModel = node.getData(FlowNodeFormData).getFormModel<FormModelV2>();
  const formStatus = formModel.getValueIn<NodeStatus>(NodeStatusKey);

  const [loading, setLoading] = useState(formStatus?.loading ?? false);
  const [className, setClassName] = useState(formStatus?.className ?? '');

  // 初始化表单值
  useEffect(() => {
    const initSize = formModel.getValueIn<{ width: number; height: number }>(NodeStatusKey);
    if (!initSize) {
      formModel.setValueIn(NodeStatusKey, {
        loading: false,
      });
    }
  }, [formModel]);

  // 同步表单外部值变化：初始化/undo/redo/协同
  useEffect(() => {
    const disposer = formModel.onFormValuesChange(({ name }) => {
      if (name !== NodeStatusKey && name !== '') {
        return;
      }
      const newStatus = formModel.getValueIn<NodeStatus>(NodeStatusKey);
      if (!newStatus) {
        return;
      }
      setLoading(newStatus.loading);
      setClassName(newStatus.className);
    });
    return () => disposer.dispose();
  }, [formModel]);

  return {
    loading,
    className,
  };
};
