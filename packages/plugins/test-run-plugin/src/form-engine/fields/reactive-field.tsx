/**
 * Copyright (c) 2025 Bytedance Ltd. and/or its affiliates
 * SPDX-License-Identifier: MIT
 */

import { useContext } from 'react';
import React from 'react';

import { useFormState } from '../hooks/use-form';
import { useFieldModel, useFieldState } from '../hooks/use-field';
import { ComponentsContext } from '../contexts';

interface ReactiveFieldProps {
  componentProps?: Record<string, unknown>;
  decoratorProps?: Record<string, unknown>;
}

export const ReactiveField: React.FC<React.PropsWithChildren<ReactiveFieldProps>> = (props) => {
  const formState = useFormState();
  const model = useFieldModel();
  const modelState = useFieldState();
  const components = useContext(ComponentsContext);

  const disabled = modelState.disabled || formState.disabled;
  const componentRender = () => {
    if (!model.componentType || !components[model.componentType]) {
      return props.children;
    }
    return React.createElement(
      components[model.componentType],
      {
        disabled,
        ...model.componentProps,
        ...props.componentProps,
      },
      props.children
    );
  };

  const decoratorRender = (children: React.ReactNode) => {
    if (!model.decoratorType || !components[model.decoratorType]) {
      return <>{children}</>;
    }
    return React.createElement(
      components[model.decoratorType],
      {
        type: model.type,
        required: model.required,
        ...model.decoratorProps,
        ...props.decoratorProps,
      },
      children
    );
  };

  return decoratorRender(componentRender());
};
