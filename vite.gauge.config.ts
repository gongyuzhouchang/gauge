import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'components/gauge/index.ts'),
      name: 'D3GaugeChart',
      fileName: format => `d3-gauge-chart.${format}.js`,
      formats: ['umd', 'es']
    },
    rollupOptions: {
      // 外部依赖 - 按需指定具体的d3子包
      external: [
        'd3-selection',
        'd3-scale',
        'd3-shape',
        'd3-interpolate',
        'd3-transition',
        'd3-ease',
        'd3-color'
      ],
      output: {
        globals: {
          'd3-selection': 'd3',
          'd3-scale': 'd3',
          'd3-shape': 'd3',
          'd3-interpolate': 'd3',
          'd3-transition': 'd3',
          'd3-ease': 'd3',
          'd3-color': 'd3'
        },
        dir: 'dist/gauge/lean',
        // 启用代码分割以优化加载
        manualChunks: undefined,
        // 解决named和default exports冲突
        exports: 'named'
      }
    },
    target: 'es2015',
    minify: 'terser',
    sourcemap: true,
    emptyOutDir: true,
    // 优化设置
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // 启用tree-shaking
  esbuild: {
    target: 'es2015',
    treeShaking: true
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});
