'use client';

import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import Link from 'next/link';

interface ContactCTAProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  bgColor?: string;
  textColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

export const ContactCTA = ({
  title = '¿Listo para encontrar tu auto ideal?',
  subtitle = 'Contáctanos hoy mismo',
  buttonText = 'Contáctanos',
  buttonLink = '/contact',
  bgColor = '#ffffff',
  textColor = '#000000',
  buttonBgColor = '#3b82f6',
  buttonTextColor = '#ffffff',
}: ContactCTAProps) => {
  let connectors: any = null;
  let selected = false;

  try {
    const nodeData = useNode((state) => ({ selected: state.events.selected }));
    connectors = nodeData.connectors;
    selected = nodeData.selected;
  } catch {
    connectors = null;
    selected = false;
  }

  return (
    <div
      ref={connectors?.connect || null}
      style={{ backgroundColor: bgColor }}
      className={selected ? 'ring-2 ring-dashed ring-slate-400' : ''}
    >
      <div className='max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between'>
        <h2 className='text-3xl font-extrabold tracking-tight sm:text-4xl'>
          <span className='block' style={{ color: textColor }}>
            {title}
          </span>
          <span className='block' style={{ color: textColor }}>
            {subtitle}
          </span>
        </h2>
        <div className='mt-8 flex lg:mt-0 lg:flex-shrink-0'>
          <Link href={buttonLink} prefetch>
            <Button
              size='lg'
              className='group transition-colors rounded-xl px-6'
              style={{
                backgroundColor: buttonBgColor,
                color: buttonTextColor,
              }}
            >
              <Icon icon='mdi:message-text' className='text-xl mr-2' />
              {buttonText}
              <Icon icon='mdi:arrow-right' className='text-xl ml-2 group-hover:translate-x-1 transition-transform duration-200' />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

(ContactCTA as any).craft = {
  displayName: 'ContactCTA',
  props: {
    title: '¿Listo para encontrar tu auto ideal?',
    subtitle: 'Contáctanos hoy mismo',
    buttonText: 'Contáctanos',
    buttonLink: '/contact',
    bgColor: '#ffffff',
    textColor: '#000000',
    buttonBgColor: '#3b82f6',
    buttonTextColor: '#ffffff',
  },
  rules: {
    canDrag: () => true,
    canDrop: () => true,
    canMoveIn: () => false,
  },
};
