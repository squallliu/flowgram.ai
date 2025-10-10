/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { useMemo } from 'react';

import { FormMeta, WorkflowJSON } from '@flowgram.ai/free-layout-editor';

import { FreeEditor } from '../free-editor';
import { INITIAL_DATA } from './initial-data';
import { CUSTOM_REGISTRY, DEFAULT_FORM_META, END_REGISTRY, START_REGISTRY } from './constants';

interface PropsType {
  formMeta?: FormMeta;
  initialData?: WorkflowJSON;
}

export function FreeFormMetaStoryBuilder(props: PropsType) {
  const { formMeta = DEFAULT_FORM_META, initialData } = props;

  const registries = useMemo(
    () => [
      START_REGISTRY,
      END_REGISTRY,
      {
        ...CUSTOM_REGISTRY,
        formMeta: {
          ...formMeta,
        },
      },
    ],
    [formMeta]
  );

  const initialDataWithDefault = useMemo(
    () => ({
      nodes: [
        ...(initialData?.nodes || []),
        ...INITIAL_DATA.nodes.filter(
          (node) => !initialData?.nodes?.find((item) => item.id === node.id)
        ),
      ],
      edges: [...(initialData?.edges || []), ...INITIAL_DATA.edges],
    }),
    [initialData]
  );

  return (
    <div>
      <FreeEditor registries={registries} initialData={initialDataWithDefault} />
    </div>
  );
}
