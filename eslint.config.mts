import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  { files: ["**/*.json"], plugins: { json }, language: "json/json", extends: ["json/recommended"] },
  { files: ["**/*.md"], plugins: { markdown }, language: "markdown/gfm", extends: ["markdown/recommended"] },
  globalIgnores([
    "dist",
    "node_modules",
    "coverage",
    "build",
    "out",
    "public",
    "vendor",
    "tmp",
    "temp",
    "logs",
    "log",
    "**/*.log",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "tsconfig.json",
    "eslint.config.mts",
    ".eslintrc*",
    "jest.config.*",
    ".prettierrc*",
    ".stylelintrc*",
    ".editorconfig",
    ".git",
    ".github",
    ".vscode",
    ".idea",
    ".DS_Store"
  ]),
]);
