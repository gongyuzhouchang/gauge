import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'components/gauge/index.ts'),
      name: 'D3GaugeChart',
      fileName: format => `d3-gauge-chart.bundle.${format}.js`,
      formats: ['umd', 'es']
    },
    rollupOptions: {
      // 将d3相关模块全部打包进去
      external: [],
      output: {
        globals: {},
        dir: 'dist/gauge/bundle',
        exports: 'named'
      }
    },
    target: 'es2015',
    minify: 'terser',
    sourcemap: true,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        // 更激进的压缩
        passes: 2
      },
      mangle: {
        // 保留类名和函数名以便调试
        keep_classnames: true,
        keep_fnames: true
      }
    }
  },
  esbuild: {
    target: 'es2015',
    treeShaking: true,
    // 启用更多优化
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true
  }
});
