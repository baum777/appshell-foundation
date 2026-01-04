import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Run backend tests from both the canonical `tests/` tree and the intentionally added `src/tests/` tree.
    include: ['tests/**/*.spec.ts', 'src/tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    setupFiles: ['./tests/setup.ts'],
  },
});
