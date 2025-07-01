import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// 开发专用配置 - 支持热更新和源码调试
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@gauge': resolve(__dirname, 'components/gauge'),
      '@bar': resolve(__dirname, 'components/bar'),
      '@base': resolve(__dirname, 'components/base')
    }
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true // 显示错误覆盖层
    }
  },
  // 开发时的依赖处理
  optimizeDeps: {
    include: [
      'd3-selection',
      'd3-scale',
      'd3-shape',
      'd3-interpolate',
      'd3-transition',
      'd3-ease',
      'd3-color',
      'd3-dispatch',
      'd3-timer'
    ]
  },
  // 确保TypeScript编译正确
  esbuild: {
    target: 'es2020'
  },
  define: {
    __DEV__: true
  }
});
