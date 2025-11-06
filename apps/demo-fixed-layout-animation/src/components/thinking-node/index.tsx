/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import classNames from 'classnames';
import { useNodeRender } from '@flowgram.ai/fixed-layout-editor';
import './index.less';

import { useNodeStatus } from '@/hooks/use-node-loading';

export const ThinkingNode = () => {
  const { form } = useNodeRender();
  const { className } = useNodeStatus();
  return (
    <div className={classNames('thinking-node', 'thinking-node-loading', className)}>
      <div className="node-form">{form?.render()}</div>
    </div>
  );
};
