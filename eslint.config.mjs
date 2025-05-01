// @ts-check
import eslintConfig from "@k4i/config/eslint-config";
import { defineConfig } from "eslint/config";

/** @type {import('eslint').Linter.Config[]} */
export default defineConfig([
 eslintConfig.base,
 eslintConfig.node,
 eslintConfig.prettier,
 [
  {
   name: "Override",
   rules: {
    "no-lonely-if": "off",
    "prefer-const": "off",
    "array-callback-return": "off",
    "no-empty": "off",
    "require-await": "off",
    "node/no-process-exit": "off",
    "import-x/order": "off",
    camelcase: "off",
    "prefer-destructuring": "off",
    "node/no-missing-require": "off",
    "no-unused-vars": "off",
    "no-use-before-define": "off",
    "object-shorthand": "off",
    "node/no-unpublished-require": "off",
   },
  },
 ],
]);
