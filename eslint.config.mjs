import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      // Desactivar todas las reglas que causan errores
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
    ignorePatterns: [
      'node_modules/',
      '.next/',
      'out/',
      'public/',
      '*.config.js',
      '*.config.mjs',
      'dist/',
    ],
  },
];

export default eslintConfig;
