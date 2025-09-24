'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/i18n/hooks/useTranslation';
import { useLanguageStore } from '@/store/useLanguageStore';
import {
  AVAILABLE_LANGUAGES,
  LANGUAGE_NAMES,
  LANGUAGE_FLAGS,
  Language,
} from '@/i18n/types';
import { Icon } from '@iconify/react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from '@heroui/react';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'button' | 'minimal';
}

export function LanguageSelector({
  className = '',
  variant = 'button',
}: LanguageSelectorProps) {
  const { changeLanguage, currentLanguage, isReady } = useTranslation();
  const { setLanguage } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);

  // Sincronizar i18n con Zustand store
  useEffect(() => {
    if (isReady && currentLanguage) {
      setLanguage(currentLanguage as Language);
    }
  }, [currentLanguage, isReady, setLanguage]);

  if (!isReady) {
    return null; // No mostrar el selector si i18n no está listo
  }

  const currentLanguageName =
    LANGUAGE_NAMES[currentLanguage as Language] || currentLanguage;
  const currentLanguageFlag = LANGUAGE_FLAGS[currentLanguage as Language];

  const handleLanguageChange = (language: string) => {
    changeLanguage(language);
    setLanguage(language as Language);
    setIsOpen(false);
  };

  if (variant === 'minimal') {
    return (
      <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
        <DropdownTrigger>
          <Button
            variant='light'
            radius='full'
            size='md'
            className={`rounded-full text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-dark-card ${className}`}
            isIconOnly
            aria-label={`Language: ${currentLanguageName}`}
          >
            {currentLanguageFlag ? (
              <Icon icon={currentLanguageFlag} className='w-5 h-5' />
            ) : (
              <span className='text-[10px] font-bold'>
                {currentLanguage?.toUpperCase()}
              </span>
            )}
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          selectedKeys={new Set([currentLanguage])}
          onAction={(key) => handleLanguageChange(key as string)}
        >
          {Object.entries(AVAILABLE_LANGUAGES).map(([key, value]) => {
            const flagIcon = LANGUAGE_FLAGS[value as Language];
            return (
              <DropdownItem
                key={value}
                className='hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200'
                startContent={
                  flagIcon ? (
                    <Icon icon={flagIcon} className='w-8 h-8 drop-shadow-md' />
                  ) : (
                    <Icon
                      icon='material-symbols:language'
                      className='text-lg'
                    />
                  )
                }
              >
                {LANGUAGE_NAMES[value as Language]}
              </DropdownItem>
            );
          })}
        </DropdownMenu>
      </Dropdown>
    );
  }

  return (
    <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
      <DropdownTrigger>
        <Button
          variant='flat'
          className={`flex items-center gap-2 hover:scale-105 transition-transform duration-200 ${className}`}
          startContent={
            currentLanguageFlag ? (
              <Icon
                icon={currentLanguageFlag}
                className='w-10 h-10 drop-shadow-md'
              />
            ) : (
              <Icon icon='material-symbols:language' className='text-lg' />
            )
          }
          endContent={
            <Icon
              icon='material-symbols:keyboard-arrow-down'
              className={`text-lg transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          }
        >
          {currentLanguageName}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        selectedKeys={new Set([currentLanguage])}
        onAction={(key) => handleLanguageChange(key as string)}
      >
        {Object.entries(AVAILABLE_LANGUAGES).map(([key, value]) => {
          const flagIcon = LANGUAGE_FLAGS[value as Language];
          return (
            <DropdownItem
              key={value}
              className='hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200'
              startContent={
                flagIcon ? (
                  <Icon icon={flagIcon} className='w-8 h-8 drop-shadow-md' />
                ) : (
                  <Icon icon='material-symbols:language' className='text-lg' />
                )
              }
            >
              {LANGUAGE_NAMES[value as Language]}
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
}
