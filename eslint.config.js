// @ts-check

/** @type {import('eslint').Linter.Config[]} */
import eslintConfig from '@k4i/eslint-config';

export default [
  // prettier
  ...eslintConfig.base,
  ...eslintConfig.node,
  ...eslintConfig.prettier,
];
