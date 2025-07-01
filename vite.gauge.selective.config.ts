import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'components/gauge/index.ts'),
      name: 'D3GaugeChart',
      fileName: format => `d3-gauge-chart.selective.${format}.js`,
      formats: ['umd', 'es']
    },
    rollupOptions: {
      // 将所有d3子模块打包进去
      external: [],
      output: {
        globals: {},
        dir: 'dist/gauge/selective',
        exports: 'named'
      }
    },
    target: 'es2015',
    minify: 'terser',
    sourcemap: true,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  esbuild: {
    target: 'es2015',
    treeShaking: true
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});
