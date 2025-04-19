// @ts-check

/// <reference lib="esnext" />
/// <reference types="node" />

import url from 'node:url';

import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import ts from 'typescript-eslint';

import svelteConfig from './svelte.config.js';

const gitignorePath = url.fileURLToPath(new url.URL('.gitignore', import.meta.url));

export default ts.config(
  includeIgnoreFile(gitignorePath),
  {
    ignores: ['tests/__compiled__/'],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  {
    files: ['**/*.svelte', '**/*.svelte.js', '**/*.svelte.ts'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
        svelteConfig,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': ['warn'],
      '@typescript-eslint/no-explicit-any': ['warn'],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'prefer-const': ['warn'],
      'svelte/no-useless-children-snippet': ['warn'],
    },
  }
);
