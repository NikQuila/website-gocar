import React, { forwardRef } from 'react';
import { useNode } from '@craftjs/core';

interface ImageProps {
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
}

interface CraftComponent {
  craft: {
    displayName: string;
    props: Record<string, any>;
  };
}

const ImageComponent = forwardRef<HTMLDivElement, ImageProps>(
  (
    {
      src = 'https://via.placeholder.com/300x200',
      alt = 'Image',
      width = '100%',
      height = 'auto',
    }: ImageProps,
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
        <img
          src={src}
          alt={alt}
          style={{
            width,
            height,
            display: 'block',
            borderRadius: '4px',
          }}
        />
      </div>
    );
  }
);

ImageComponent.displayName = 'Image';

// Add craft property
(ImageComponent as unknown as CraftComponent).craft = {
  displayName: 'Image',
  props: {
    src: 'https://via.placeholder.com/300x200',
    alt: 'Image',
    width: '100%',
    height: 'auto',
  },
};

export const Image = ImageComponent as typeof ImageComponent & CraftComponent;
