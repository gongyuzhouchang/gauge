#!/usr/bin/env node

import { spawn, exec } from 'child_process';
import path from 'path';
import fs from 'fs';

console.log('🚀 启动开发热更新模式...\n');

// 启动vite开发服务器
console.log('📡 启动开发服务器...');
const viteProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

// 启动gauge组件监听构建
console.log('🔧 启动gauge组件监听构建...');
const watchProcess = spawn('npm', ['run', 'build:gauge:selective', '--', '--watch'], {
  stdio: 'pipe',
  shell: true
});

watchProcess.stdout.on('data', (data) => {
  console.log(`[Gauge Build] ${data.toString().trim()}`);
});

watchProcess.stderr.on('data', (data) => {
  console.error(`[Gauge Build Error] ${data.toString().trim()}`);
});

// 优雅退出处理
process.on('SIGINT', () => {
  console.log('\n🛑 正在停止开发服务器...');
  viteProcess.kill('SIGINT');
  watchProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  viteProcess.kill('SIGTERM');
  watchProcess.kill('SIGTERM');
  process.exit(0);
});

console.log(`
🎉 开发环境已启动！

📡 开发服务器: http://localhost:3000
🔧 源码监听: 已启动 (gauge组件变化时自动重新构建)
🔥 热更新: 已启用

💡 使用方式:
1. 修改Vue组件 -> 立即热更新
2. 修改gauge源码 -> 自动重新构建 -> 手动刷新页面
3. 按 Ctrl+C 停止服务

🔍 调试提示:
- 打开浏览器控制台查看调试信息
- window.__debugGauge 可访问当前仪表盘实例
`); 