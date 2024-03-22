import { defineConfig } from 'tsup';

export default defineConfig(options => {
  return {
    entry: ['src/index.ts'],
    format: ['cjs'],
    target: ['es2021', 'node16'],
    external: [],
    shims: true,
    clean: true,
    sourcemap: !!options.watch,
    splitting: true,
  };
});
