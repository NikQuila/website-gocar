import React from 'react';
import { useNode, useEditor } from '@craftjs/core';

interface ButtonProps {
  text?: string;
  link?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  bgColor?: string;
  textColor?: string;
  borderRadius?: number;
  fullWidth?: boolean;
}

export const Button = ({
  text = 'Click aquí',
  link = '#',
  variant = 'primary',
  size = 'md',
  bgColor = '#3b82f6',
  textColor = '#ffffff',
  borderRadius = 8,
  fullWidth = false,
}: ButtonProps) => {
  const { connectors, selected } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const { isEnabled } = useEditor((state) => ({
    isEnabled: state.options.enabled,
  }));

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const getStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      borderRadius: `${borderRadius}px`,
      transition: 'all 0.2s ease',
      cursor: isEnabled ? 'move' : 'pointer',
      display: fullWidth ? 'block' : 'inline-block',
      width: fullWidth ? '100%' : 'auto',
      textAlign: 'center',
      fontWeight: 600,
      textDecoration: 'none',
      border: '2px solid transparent',
    };

    switch (variant) {
      case 'primary':
        return { ...base, backgroundColor: bgColor, color: textColor };
      case 'secondary':
        return {
          ...base,
          backgroundColor: `${bgColor}15`,
          color: bgColor,
        };
      case 'outline':
        return {
          ...base,
          backgroundColor: 'transparent',
          color: bgColor,
          borderColor: bgColor,
        };
      case 'ghost':
        return {
          ...base,
          backgroundColor: 'transparent',
          color: bgColor,
        };
      default:
        return { ...base, backgroundColor: bgColor, color: textColor };
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isEnabled) {
      e.preventDefault();
      return;
    }
    if (link && link !== '#') {
      if (link.startsWith('http')) {
        window.open(link, '_blank');
      } else {
        window.location.href = link;
      }
    }
  };

  return (
    <div
      ref={connectors.connect}
      style={{
        display: fullWidth ? 'block' : 'inline-block',
        border: selected ? '1px dashed #1e88e5' : '1px solid transparent',
        padding: '2px',
      }}
    >
      <button
        className={`${sizeClasses[size]} hover:opacity-90 hover:shadow-md`}
        style={getStyles()}
        onClick={handleClick}
      >
        {text}
      </button>
    </div>
  );
};

(Button as any).craft = {
  displayName: 'Button',
  props: {
    text: 'Click aquí',
    link: '#',
    variant: 'primary',
    size: 'md',
    bgColor: '#3b82f6',
    textColor: '#ffffff',
    borderRadius: 8,
    fullWidth: false,
  },
  rules: {
    canDrag: () => true,
    canDrop: () => false,
    canMoveIn: () => false,
  },
};
