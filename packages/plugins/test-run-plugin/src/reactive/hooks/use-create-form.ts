/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { useEffect, useMemo, useState } from 'react';

import { DisposableCollection } from '@flowgram.ai/utils';
import type { FlowNodeEntity } from '@flowgram.ai/document';

import { TestRunFormEntity } from '../../services/form/form';
import { FormEngineProps, isFormEmpty } from '../../form-engine';
import { useTestRunService } from './use-test-run-service';

interface UseFormOptions {
  node?: FlowNodeEntity;
  /** form loading */
  loadingRenderer?: React.ReactNode;
  /** form empty */
  emptyRenderer?: React.ReactNode;
  defaultValues?: FormEngineProps['defaultValues'];
  onMounted?: FormEngineProps['onMounted'];
  onUnmounted?: FormEngineProps['onUnmounted'];
  onFormValuesChange?: FormEngineProps['onFormValuesChange'];
}

export const useCreateForm = ({
  node,
  loadingRenderer,
  emptyRenderer,
  defaultValues,
  onMounted,
  onUnmounted,
  onFormValuesChange,
}: UseFormOptions) => {
  const testRun = useTestRunService();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<TestRunFormEntity | null>(null);
  const renderer = useMemo(() => {
    if (loading || !form) {
      return loadingRenderer;
    }

    const isEmpty = isFormEmpty(form.schema);

    return form.render({
      defaultValues,
      onFormValuesChange,
      children: isEmpty ? emptyRenderer : null,
    });
  }, [form, loading]);

  const compute = async () => {
    if (!node) {
      return;
    }
    try {
      setLoading(true);
      const formEntity = await testRun.createForm(node);
      setForm(formEntity);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    compute();
  }, [node]);

  useEffect(() => {
    if (!form) {
      return;
    }
    const disposable = new DisposableCollection(
      form.onFormMounted((data) => {
        onMounted?.(data);
      }),
      form.onFormUnmounted(() => {
        onUnmounted?.();
      })
    );
    return () => disposable.dispose();
  }, [form]);

  return {
    renderer,
    loading,
    form,
  };
};
