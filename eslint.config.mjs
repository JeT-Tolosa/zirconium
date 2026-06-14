import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['**/*.d.ts', '.vite/**', 'dist/**', 'node_modules/**'],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  // GLOBAL TS/JS RULES
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },

    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          caughtErrors: 'all',
          argsIgnorePattern: '^_',
        },
      ],

      'no-console': 'off',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
    },
  },

  // ELECTRON MAIN PROCESS
  {
    files: ['src/main/**/*.{ts,js}'],
    languageOptions: {
      globals: globals.node,
    },
  },

  // RENDERER PROCESS
  {
    files: ['src/renderer/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: globals.browser,
    },
  },
];

// import js from '@eslint/js';
// import globals from 'globals';
// import tseslint from 'typescript-eslint';

// export default [

//   {
//     ignores: ['*.d.ts', '.vite/**', 'dist/**', 'node_modules/**'],
//   },
//   js.configs.recommended,
//   ...tseslint.configs.recommended,
//   {
//     files: ['src/**/*.{js,mjs,cjs,ts,mts,cts}'],
//     languageOptions: { globals: globals.browser },
//   },
//   {
//     rules: {
//     "@typescript-eslint/no-empty-object-type": "off",
//     "@typescript-eslint/no-unused-vars": ["error", {
//             "vars": "all",
//             "args": "after-used",
//             "caughtErrors": "all",
//             "ignoreRestSiblings": false,
//             "ignoreUsingDeclarations": false,
//             "reportUsedIgnorePattern": false,
//             "argsIgnorePattern": "^_"
//         }],
//   },

// }
// ];

// export default defineConfig({
//   rules: {
//     "@typescript-eslint/no-empty-object-type": "error"
//   }
// });
