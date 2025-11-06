/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { FlowDocumentJSON } from '@flowgram.ai/fixed-layout-editor';

const initSchema = {
  nodes: [
    {
      id: 'start_0',
      type: 'start',
      data: {
        title: '开始',
      },
    },
  ],
};

const processStartSchema = {
  nodes: [
    {
      id: 'start_0',
      type: 'start',
      data: {
        title: '开始',
        content: '天气穿衣建议工作流',
      },
    },
    {
      id: 'thinking_0',
      type: 'thinking',
      data: {
        text: '正在生成天气穿衣建议工作流...业务流程：1.进行输入处理 2.获取天气数据 3.生成穿衣建议 4.整理输出。我需要根据这些步骤来生成天气穿衣建议工作流核心节点...',
      },
    },
  ],
};

const addCoreNodesSchema = {
  nodes: [
    {
      id: 'start_0',
      type: 'start',
      data: {
        title: '开始',
        content: '天气穿衣建议工作流',
      },
    },
    {
      id: 'validate_input_0',
      type: 'custom',
      data: {
        title: '输入处理节点',
        content: '验证并清理城市名称输入 - validate_city_input()',
      },
    },
    {
      id: 'thinking_1',
      type: 'thinking',
      data: {
        text: '正在生成错误检查节点与天气检查节点...',
      },
    },
    {
      id: 'fetch_weather_0',
      type: 'custom',
      data: {
        title: '天气数据获取',
        content: '调用wttr.in API获取天气信息 - fetch_weather_data()',
      },
    },
    {
      id: 'generate_suggestion_0',
      type: 'custom',
      data: {
        title: '穿衣建议生成',
        content: '基于天气数据生成穿衣建议 - generate_clothing_suggestion()',
      },
    },
    {
      id: 'format_response_0',
      type: 'custom',
      data: {
        title: '输出整理节点',
        content: '格式化最终回答 - format_final_response()',
      },
    },
    {
      id: 'end_0',
      type: 'end',
      data: {
        title: '结束',
        content: '返回格式化的穿衣建议',
      },
    },
  ],
};

const completeWorkflowLoadingSchema = {
  nodes: [
    {
      id: 'start_0',
      type: 'start',
      data: {
        title: '开始',
        content: '天气穿衣建议工作流',
      },
    },
    {
      id: 'validate_input_0',
      type: 'custom',
      data: {
        title: '输入处理节点',
        content: '验证并清理城市名称输入 - validate_city_input()',
      },
    },
    {
      id: 'condition_0',
      type: 'condition',
      data: {
        title: '输入验证',
        content: '检查输入验证是否有错误',
      },
      blocks: [
        {
          id: 'thinking_2',
          type: 'thinking',
          data: {
            text: '天气数据获取节点生成中',
          },
        },
        {
          id: 'thinking_3',
          type: 'thinking',
          data: {
            text: '格式化错误节点生成中',
          },
        },
      ],
    },
    {
      id: 'condition_1',
      type: 'condition',
      data: {
        title: '天气数据检查',
        content: '检查天气数据获取是否成功',
      },
      blocks: [
        {
          id: 'thinking_4',
          type: 'thinking',
          data: {
            text: '穿衣建议生成节点生成中',
          },
        },
        {
          id: 'thinking_5',
          type: 'thinking',
          data: {
            text: '格式化错误节点生成中',
          },
        },
      ],
    },
    {
      id: 'format_response_0',
      type: 'custom',
      data: {
        title: '输出整理节点',
        content: '格式化最终回答 - format_final_response()',
      },
    },
    {
      id: 'end_0',
      type: 'end',
      data: {
        title: '结束',
        content: '返回格式化的穿衣建议',
      },
    },
  ],
};

const completeWorkflowSchema = {
  nodes: [
    {
      id: 'start_0',
      type: 'start',
      data: {
        title: '开始',
        content: '天气穿衣建议工作流',
      },
    },
    {
      id: 'validate_input_0',
      type: 'custom',
      data: {
        title: '输入处理节点',
        content: '验证并清理城市名称输入 - validate_city_input()',
      },
    },
    {
      id: 'condition_0',
      type: 'condition',
      data: {
        title: '输入验证',
        content: '检查输入验证是否有错误',
      },
      blocks: [
        {
          id: 'block_0',
          type: 'block',
          blocks: [
            {
              id: 'fetch_weather_0',
              type: 'custom',
              data: {
                title: '天气数据获取',
                content: '调用wttr.in API获取天气信息 - fetch_weather_data()',
              },
            },
            {
              id: 'format_data_0',
              type: 'custom',
              data: {
                title: '格式化数据',
                content: '天气数据提取并进行处理格式化',
              },
            },
          ],
        },
        {
          id: 'format_error_0',
          type: 'custom',
          data: {
            title: '格式化错误',
            content: '直接跳转到输出格式化',
          },
        },
      ],
    },
    {
      id: 'condition_1',
      type: 'condition',
      data: {
        title: '天气数据检查',
        content: '检查天气数据获取是否成功',
      },
      blocks: [
        {
          id: 'generate_suggestion_0',
          type: 'custom',
          data: {
            title: '穿衣建议生成',
            content: '基于天气数据生成穿衣建议 - generate_clothing_suggestion()',
          },
        },
        {
          id: 'format_error_1',
          type: 'custom',
          data: {
            title: '格式化错误',
            content: '跳转到输出格式化',
          },
        },
      ],
    },
    {
      id: 'format_response_0',
      type: 'custom',
      data: {
        title: '输出整理节点',
        content: '格式化最终回答 - format_final_response()',
      },
    },
    {
      id: 'end_0',
      type: 'end',
      data: {
        title: '结束',
        content: '返回格式化的穿衣建议',
      },
    },
  ],
};

export const exampleSchemas: FlowDocumentJSON[] = [
  initSchema,
  processStartSchema,
  addCoreNodesSchema,
  completeWorkflowLoadingSchema,
  completeWorkflowSchema,
];
