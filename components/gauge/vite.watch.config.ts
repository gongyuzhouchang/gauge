import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'index.ts'),
      name: 'D3GaugeChart',
      fileName: format => `d3-gauge-chart.dev.${format}.js`,
      formats: ['umd', 'es']
    },
    rollupOptions: {
      // 开发时只排除lodash，其他都打包进去方便调试
      external: ['lodash-es'],
      output: {
        globals: {
          'lodash-es': '_'
        },
        dir: '../dist/gauge/dev',
        exports: 'named'
      }
    },
    // 开发模式不压缩，保留源码映射
    minify: false,
    sourcemap: true,
    // 监听模式
    watch: {
      include: [resolve(__dirname, '**/*'), resolve(__dirname, '../../components/base/**/*')]
    }
  },
  define: {
    __DEV__: true
  }
});
