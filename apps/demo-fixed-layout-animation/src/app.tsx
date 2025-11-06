/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import '@flowgram.ai/fixed-layout-editor/index.css';

import { createRoot } from 'react-dom/client';
import { FixedLayoutEditorProvider, EditorRenderer } from '@flowgram.ai/fixed-layout-editor';

import { useEditorProps } from '@/hooks/use-editor-props';
import { UpdateSchema } from '@/components/update-schema';
import { Tools } from '@/components/tools';

const FlowGramApp = () => {
  const editorProps = useEditorProps();
  return (
    <FixedLayoutEditorProvider {...editorProps}>
      <EditorRenderer />
      <Tools />
      <UpdateSchema />
    </FixedLayoutEditorProvider>
  );
};

const app = createRoot(document.getElementById('root')!);

app.render(<FlowGramApp />);
