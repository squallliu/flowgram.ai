/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import React from 'react';

import type { Validate, FieldState } from '@flowgram.ai/form';

/** field type */
export type FormSchemaType = 'string' | 'number' | 'boolean' | 'object' | string;

export type FormSchemaValidate = Validate;

export interface FormSchema {
  /** core */
  name?: string;
  type?: FormSchemaType;
  defaultValue?: any;

  /** children */
  properties?: Record<string, FormSchema>;

  /** ui */
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  ['x-index']?: number;
  ['x-visible']?: boolean;
  ['x-hidden']?: boolean;
  ['x-component']?: string;
  ['x-component-props']?: Record<string, unknown>;
  ['x-decorator']?: string;
  ['x-decorator-props']?: Record<string, unknown>;

  /** rule */
  required?: boolean;
  ['x-validator']?: FormSchemaValidate;

  /** custom */
  [key: string]: any;
}

export type FormComponentProps = {
  type?: FormSchemaType;
  disabled?: boolean;
  [key: string]: any;
} & FormSchema['x-component-props'] &
  FormSchema['x-decorator-props'] &
  Partial<FieldState>;
export type FormComponent = React.FunctionComponent<any>;
export type FormComponents = Record<string, FormComponent>;

/** ui state */
export interface FormSchemaModelState {
  disabled: boolean;
}
