import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // `testing.jsx` is a standalone HTML mockup, not a module.
  globalIgnores(['dist', 'testing.jsx']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Allow intentionally-unused `_` args / caught errors and `catch (_) {}`.
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^[A-Z_]',
        argsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      'no-empty': ['error', { allowEmptyCatch: true }],
      // Dev-only hot-reload hint; the app builds and runs without it.
      'react-refresh/only-export-components': 'off',
      // React 19 compiler-era hints — surfaced as warnings, not build blockers.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
    },
  },
  {
    // Config/build files run in Node, where `process` and `require` exist.
    files: ['vite.config.js', 'tailwind.config.js', 'postcss.config.js', '**/*.config.js'],
    languageOptions: { globals: globals.node },
  },
])
