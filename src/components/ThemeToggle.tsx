'use client';

import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import useThemeStore from '@/store/useThemeStore';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <Button
      isIconOnly
      variant='light'
      aria-label='Toggle theme'
      onClick={toggleTheme}
      className='rounded-full text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-dark-card'
    >
      <Icon
        icon={theme === 'dark' ? 'ph:sun-bold' : 'ph:moon-bold'}
        className='w-5 h-5'
      />
    </Button>
  );
}
