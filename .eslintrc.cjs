// see docs: https://eslint.org/docs/user-guide/configuring

module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:sonarjs/recommended',
    'sonarjs',
    'plugin:vue/vue3-recommended',
    'plugin:prettier/recommended',
    // 'plugin:compat/recommended',
  ],
  ignorePatterns: [
    'node_modules',
    'vendors',
    'docs',
    'public',
    'dist',
    'build',
    '.browserslistrc',
    '.babelrc.js',
  ],
  env: {
    node: true,
    browser: true,
    es6: true,
    jest: true,
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    project: './tsconfig.json',
    sourceType: 'module',
    extraFileExtensions: ['.vue'],
  },
  settings: {
    // https://github.com/amilajack/eslint-plugin-compat#adding-polyfills
    polyfills: [],
  },
  plugins: ['eslint-plugin-tsdoc'],
  rules: {
    'tsdoc/syntax': 'warn',
    'import/prefer-default-export': 'off',
    'import/extensions': 'warn',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-shadow': 'warn',
    '@typescript-eslint/no-this-alias': [
      'error',
      {
        allowedNames: ['self', 'that'], // Allow `const self = this`; `[]` by default
      },
    ],
    'no-bitwise': 'warn',
    'no-plusplus': 'warn',
    'no-underscore-dangle': 'off',
    'no-shadow': 'error',
    'no-invalid-this': 'warn',
    'no-undefined': 'warn',
    // if 后面必须加{}
    curly: ['error', 'all'],
  },
  globals: { ThsDataVStandardChart: 'readonly', ThsDataVTimeline: 'readonly' },
};
