// @ts-check
import tseslint from 'typescript-eslint'

/**
 * The lint the gate has always reported but nothing ran in CI. Deliberately the untyped
 * recommended set: it needs no project graph, so it runs in a couple of seconds over the whole
 * monorepo and cannot drift out of sync with the workspaces' own tsconfigs.
 */
export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.expo/**',
      'apps/app/expo-env.d.ts',
      'apps/app/plugins/**',
    ],
  },
  ...tseslint.configs.recommended,
  {
    // Metro's config, the jest setup and React Native's own asset references are CommonJS by
    // design: `require('../assets/logo.png')` is how the bundler is told about an image.
    files: ['**/metro.config.js', '**/jest.config.js', 'apps/app/test/setup.ts', '**/*.tsx'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', 'packages/storage/src/contract.ts'],
    rules: {
      // jest and vitest mocks are untyped by nature, and the contract suite declares its runner
      // globals rather than importing one.
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
)
