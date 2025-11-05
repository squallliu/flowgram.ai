/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import React, { useState } from 'react';

import type { Meta, StoryObj } from 'storybook-react-rsbuild';
import { JsonSchemaCreator, IJsonSchema } from '@flowgram.ai/form-materials';

const JsonSchemaCreatorDemo: React.FC = () => {
  const [schema, setSchema] = useState<IJsonSchema | null>(null);

  return (
    <div style={{ padding: '20px' }}>
      <h2>JSON Schema Creator</h2>
      <JsonSchemaCreator
        onSchemaCreate={(generatedSchema) => {
          console.log('生成的 schema:', generatedSchema);
          setSchema(generatedSchema);
        }}
      />

      {schema && (
        <div style={{ marginTop: '20px' }}>
          <h3>生成的 Schema:</h3>
          <pre
            style={{
              background: '#f5f5f5',
              padding: '16px',
              borderRadius: '4px',
              overflow: 'auto',
            }}
          >
            {JSON.stringify(schema, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

const meta: Meta<typeof JsonSchemaCreatorDemo> = {
  title: 'Form Components/JsonSchemaCreator',
  component: JsonSchemaCreatorDemo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '从 JSON 字符串自动生成 JSONSchema 的组件',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
