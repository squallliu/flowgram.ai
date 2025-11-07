/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { createContext } from 'react';

import type { FormComponents } from './types';
import type { FormSchemaModel } from './model';

/** Model context for each form item */
export const FieldModelContext = createContext<FormSchemaModel>({} as any);
/** The form's model context */
export const FormModelContext = createContext<FormSchemaModel>({} as any);
/** Context of material component map */
export const ComponentsContext = createContext<FormComponents>({});
