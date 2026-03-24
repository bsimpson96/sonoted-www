import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import astro from 'eslint-plugin-astro';

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    ignores: ['dist/**', 'node_modules/**', '.astro/**'],
  },
  // TypeScript / TSX files
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    },
    plugins: { '@typescript-eslint': tseslint },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-restricted-syntax': [
        'error',
        { selector: 'ExportDefaultDeclaration', message: 'Use named exports only.' },
      ],
    },
  },
  // Astro files -- use the flat/recommended preset then add overrides
  ...astro.configs['flat/recommended'],
  {
    files: ['src/**/*.astro'],
    plugins: { '@typescript-eslint': tseslint },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      // Astro components use default exports -- allowed
      'no-restricted-syntax': 'off',
    },
  },
  {
    files: ['src/pages/**/*.{ts,astro}'],
    rules: {
      // Astro pages and API routes require default exports
      'no-restricted-syntax': 'off',
    },
  },
];

export default config;
