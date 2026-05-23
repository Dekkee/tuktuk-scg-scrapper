import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        include: ['packages/**/*.{test,spec}.{ts,tsx}'],
    },
});
