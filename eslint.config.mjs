import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: { process: false, __dirname: false, MessageFlags: false },
    },
  },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
];
