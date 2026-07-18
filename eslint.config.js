import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

const browserGlobals = {
  window: "readonly",
  document: "readonly",
  navigator: "readonly",
  localStorage: "readonly",
  sessionStorage: "readonly",
  Notification: "readonly",
  crypto: "readonly",
  URL: "readonly",
  URLSearchParams: "readonly",
  fetch: "readonly",
  FileReader: "readonly",
  Blob: "readonly",
  FormData: "readonly",
  alert: "readonly",
  confirm: "readonly",
  btoa: "readonly",
  atob: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  setInterval: "readonly",
  clearInterval: "readonly",
  requestAnimationFrame: "readonly",
  cancelAnimationFrame: "readonly",
  console: "readonly",
  prompt: "readonly",
  Image: "readonly",
  File: "readonly",
  AbortSignal: "readonly",
  CustomEvent: "readonly",
  ResizeObserver: "readonly",
  IntersectionObserver: "readonly",
  getComputedStyle: "readonly",
  CSS: "readonly",
};

const nodeGlobals = {
  process: "readonly",
  Buffer: "readonly",
  console: "readonly",
  fetch: "readonly",
  URL: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  AbortController: "readonly",
};

export default [
  {
    ignores: [
      ".agents/**",
      ".cursor/**",
      ".gemini/**",
      ".impeccable/**",
      "dist/**",
      "node_modules/**",
      "coverage/**",
    ],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}", "vite.config.js", "vitest.config.js"],
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: browserGlobals,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "react-hooks/set-state-in-effect": "off",
      "no-unused-vars": "warn",
      "no-undef": "error",
    },
  },
  {
    files: ["api/**/*.js", "scripts/**/*.js", "scripts/**/*.mjs", "*.config.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: nodeGlobals,
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
    },
  },
];
