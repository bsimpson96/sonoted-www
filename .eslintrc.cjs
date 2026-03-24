module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:astro/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ExportDefaultDeclaration',
        message: 'Use named exports only.',
      },
    ],
  },
  overrides: [
    {
      files: ['*.astro'],
      parser: 'astro-eslint-parser',
      parserOptions: { parser: '@typescript-eslint/parser', extraFileExtensions: ['.astro'] },
      rules: {
        // Astro files use default exports for the component itself -- allow
        'no-restricted-syntax': 'off',
      },
    },
    {
      files: ['src/pages/**/*.ts', 'src/pages/**/*.astro'],
      rules: {
        // Astro pages and API routes must use default exports
        'no-restricted-syntax': 'off',
      },
    },
  ],
  env: { node: true, browser: true },
};
