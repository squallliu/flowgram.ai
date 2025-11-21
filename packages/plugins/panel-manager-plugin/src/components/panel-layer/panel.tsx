/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { useEffect, startTransition, useState, useRef } from 'react';

import { useStoreWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import clsx from 'clsx';

import { Area } from '../../types';
import { PanelEntity } from '../../services/panel-factory';
import { usePanelManager } from '../../hooks/use-panel-manager';
import { PanelContext } from '../../contexts';

const PanelItem: React.FC<{ panel: PanelEntity }> = ({ panel }) => {
  const panelManager = usePanelManager();
  const ref = useRef<HTMLDivElement>(null);
  const resize =
    panel.factory.resize !== undefined ? panel.factory.resize : panelManager.config.autoResize;

  const isHorizontal = ['right', 'docked-right'].includes(panel.area);

  const size = useStoreWithEqualityFn(panel.store, (s) => s.size, shallow);

  const sizeStyle = isHorizontal ? { width: size } : { height: size };
  const handleResize = (next: number) => {
    let nextSize = next;
    if (typeof panel.factory.maxSize === 'number' && nextSize > panel.factory.maxSize) {
      nextSize = panel.factory.maxSize;
    } else if (typeof panel.factory.minSize === 'number' && nextSize < panel.factory.minSize) {
      nextSize = panel.factory.minSize;
    }
    panel.store.setState({ size: nextSize });
  };

  useEffect(() => {
    /** The set size may be illegal and needs to be updated according to the real element rendered for the first time. */
    if (ref.current) {
      const { width, height } = ref.current.getBoundingClientRect();
      const realSize = isHorizontal ? width : height;
      panel.store.setState({ size: realSize });
    }
  }, []);

  return (
    <div
      className={clsx(
        'gedit-flow-panel-wrap',
        isHorizontal ? 'panel-horizontal' : 'panel-vertical'
      )}
      key={panel.id}
      ref={ref}
      style={{ ...panel.factory.style, ...panel.config.style, ...sizeStyle }}
    >
      {resize &&
        panelManager.config.resizeBarRender({
          size,
          direction: isHorizontal ? 'vertical' : 'horizontal',
          onResize: handleResize,
        })}
      {panel.renderer}
    </div>
  );
};

export const PanelArea: React.FC<{ area: Area }> = ({ area }) => {
  const panelManager = usePanelManager();
  const [panels, setPanels] = useState(panelManager.getPanels(area));

  useEffect(() => {
    const dispose = panelManager.onPanelsChange(() => {
      startTransition(() => {
        setPanels(panelManager.getPanels(area));
      });
    });
    return () => dispose.dispose();
  }, []);

  return (
    <>
      {panels.map((panel) => (
        <PanelContext.Provider value={panel} key={panel.id}>
          <PanelItem panel={panel} />
        </PanelContext.Provider>
      ))}
    </>
  );
};
