/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { useState } from 'react';

import { FlowDocumentJSON, useService } from '@flowgram.ai/fixed-layout-editor';

import './index.less';
import { WorkflowLoadSchemaService } from '@/services';

import { exampleSchemas } from './example-schemas';

export const UpdateSchema = () => {
  const loadSchemaService = useService(WorkflowLoadSchemaService);
  const [currentSchemaIndex, setCurrentSchemaIndex] = useState<number>(0);

  const handleUpdateSchema = (): void => {
    const currentSchema: FlowDocumentJSON = exampleSchemas[currentSchemaIndex];

    // Update the document with current schema
    loadSchemaService.load(currentSchema);

    // Move to next schema index, cycle back to 0 when reaching the end
    setCurrentSchemaIndex((currentSchemaIndex + 1) % exampleSchemas.length);
  };

  const handleForceUpdateSchema = (): void => {
    const currentSchema: FlowDocumentJSON = exampleSchemas[currentSchemaIndex];

    // Update the document with current schema
    loadSchemaService.forceLoad(currentSchema);

    // Move to next schema index, cycle back to 0 when reaching the end
    setCurrentSchemaIndex((currentSchemaIndex + 1) % exampleSchemas.length);
  };

  return (
    <div className="update-schema-button-container">
      <button onClick={handleUpdateSchema} className="update-schema-button">
        <span className="button-content">{`更新 ${currentSchemaIndex}/${exampleSchemas.length}`}</span>
      </button>
      <button onClick={handleForceUpdateSchema} className="update-schema-button">
        <span className="button-content">{`强制更新 ${currentSchemaIndex}/${exampleSchemas.length}`}</span>
      </button>
    </div>
  );
};
