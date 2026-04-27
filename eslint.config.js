import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [

  {
    ignores: ['*.d.ts', '.vite/**', 'dist/**', 'node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['./src/**/*.{js,mjs,cjs,ts,mts,cts}'],
    languageOptions: { globals: globals.browser },
  },
  {
    rules: {
    "@typescript-eslint/no-empty-object-type": "off",
    "@typescript-eslint/no-unused-vars": ["error", {
            "vars": "all",
            "args": "after-used",
            "caughtErrors": "all",
            "ignoreRestSiblings": false,
            "ignoreUsingDeclarations": false,
            "reportUsedIgnorePattern": false,
            "argsIgnorePattern": "^_" 
        }],
    "type.eslint@typescript-eslint/no-explicit-any": "off", 
  },
  
}
];

// export default defineConfig({
//   rules: {
//     "@typescript-eslint/no-empty-object-type": "error"
//   }
// });