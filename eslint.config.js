import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";

export default [
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off"
    }
  },
  pluginReactConfig,
  {
    ignores: ["dist/**", "node_modules/**"]
  }
];
