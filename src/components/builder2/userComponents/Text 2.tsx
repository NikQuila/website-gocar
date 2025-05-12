import React, { forwardRef } from 'react';
import { useNode } from '@craftjs/core';

export type TextAlignType = 'left' | 'center' | 'right';

interface TextProps {
  text?: string;
  fontSize?: number;
  textAlign?: TextAlignType;
  color?: string;
}

interface CraftComponent {
  craft: {
    displayName: string;
    props: Record<string, any>;
    related?: {
      toolbar?: React.ComponentType<any>;
    };
  };
}

const TextComponent = forwardRef<HTMLDivElement, TextProps>(
  (
    {
      text = 'Edit me',
      fontSize = 16,
      textAlign = 'left' as TextAlignType,
      color = '#000000',
    }: TextProps,
    ref
  ) => {
    const { connectors, selected } = useNode((state) => ({
      selected: state.events.selected,
    }));

    return (
      <div
        ref={(node) => {
          if (node) {
            connectors.connect(node);
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }
        }}
        style={{
          padding: '10px',
          margin: '5px 0',
          borderRadius: '4px',
          border: selected ? '1px dashed #1e88e5' : '1px dashed transparent',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: `${fontSize}px`,
            textAlign,
            color,
          }}
        >
          {text}
        </p>
      </div>
    );
  }
);

TextComponent.displayName = 'Text';

// Add craft property
(TextComponent as unknown as CraftComponent).craft = {
  displayName: 'Text',
  props: {
    text: 'Edit me',
    fontSize: 16,
    textAlign: 'left',
    color: '#000000',
  },
};

export const Text = TextComponent as typeof TextComponent & CraftComponent;
