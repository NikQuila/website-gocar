import React from 'react';

/**
 * Website (read-only) version of EditableText.
 * Simply renders the stored HTML content — no contentEditable, no toolbar.
 */

interface EditableTextProps {
  value: string;
  nodeId: string;
  propName: string;
  tag?: keyof React.JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  tag = 'span',
  className,
  style,
}) => {
  return React.createElement(tag, {
    className,
    style,
    dangerouslySetInnerHTML: { __html: value || '' },
  });
};

interface EditableArrayTextProps {
  value: string;
  nodeId: string;
  arrayProp: string;
  index: number;
  field: string;
  tag?: keyof React.JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
}

export const EditableArrayText: React.FC<EditableArrayTextProps> = ({
  value,
  tag = 'span',
  className,
  style,
}) => {
  return React.createElement(tag, {
    className,
    style,
    dangerouslySetInnerHTML: { __html: value || '' },
  });
};
