/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import clsx from 'clsx';

import { useGlobalCSS } from '../../hooks/use-global-css';
import { FloatPanel } from './float-panel';
import { leftArea, rightArea, mainArea, bottomArea, globalCSS } from './css';

export type PanelLayerProps = React.PropsWithChildren<{
  className?: string;
  style?: React.CSSProperties;
}>;

export const PanelLayer: React.FC<PanelLayerProps> = ({ className, style, children }) => {
  useGlobalCSS({
    cssText: globalCSS,
    id: 'flow-panel-layer-css',
  });

  return (
    <div className={clsx('gedit-flow-panel-layer-wrap', className)} style={style}>
      <div className="gedit-flow-panel-left-area" style={leftArea}>
        <div className="gedit-flow-panel-main-area" style={mainArea}>
          {children}
        </div>
        <div className="gedit-flow-panel-bottom-area" style={bottomArea}>
          <FloatPanel area="bottom" />
        </div>
      </div>
      <div className="gedit-flow-panel-right-area" style={rightArea}>
        <FloatPanel area="right" />
      </div>
    </div>
  );
};
