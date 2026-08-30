import { defineConfig } from 'vitest/config'

export default defineConfig({
  // globals so the shared store contract suite can use ambient describe/it/expect and run
  // unchanged under jest in apps/app.
  test: { globals: true, include: ['test/**/*.test.ts'] },
})
