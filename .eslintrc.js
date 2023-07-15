module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  plugins: ['@typescript-eslint', 'import', 'prettier', 'jest'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'array-callback-return': 'off',
    'no-console': 'error',
    '@typescript-eslint/triple-slash-reference': 'off',
    'import/order': [
      'warn',
      {
        alphabetize: {
          caseInsensitive: true,
          order: 'asc',
        },
        pathGroups: [
          {
            pattern: '#/**',
            group: 'external',
            position: 'after',
          },
        ],
        groups: ['builtin', 'external', 'internal', 'index', 'sibling', 'parent'],
      },
    ],
    'no-loop-func': 'off',
  },
};
