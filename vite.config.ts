import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // 开发时直接从源码加载gauge组件，避免频繁构建
      '@gauge': resolve(__dirname, 'components/gauge')
    }
  },
  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    hmr: true // 确保热模块替换开启
  },
  // 构建配置
  build: {
    rollupOptions: {
      external: ['lodash-es'],
      output: {
        globals: {
          'lodash-es': '_'
        }
      }
    }
  },
  // 优化依赖预构建
  optimizeDeps: {
    include: ['lodash-es']
  }
});
