#!/usr/bin/env node

console.log('🚀 启动热更新开发模式...\n');

import { exec } from 'child_process';

// 方案1: 使用vite的监听模式 + 开发服务器
console.log('🔥 方案1: Vite热更新模式');
console.log('   启动命令: npm run dev');
console.log('   特点: Vue组件热更新，gauge组件需要刷新\n');

// 方案2: 使用构建监听 + 开发服务器
console.log('🔧 方案2: 构建监听模式');
console.log('   启动命令: npm run dev:watch');  
console.log('   特点: gauge源码变化自动重新构建\n');

// 方案3: 纯源码开发模式
console.log('⚡ 方案3: 源码直接导入 (推荐)');
console.log('   启动命令: npm run dev:source');
console.log('   特点: 所有代码都支持热更新\n');

console.log('💡 选择您喜欢的开发方式:');
console.log('   1️⃣  npm run dev          # 基础热更新');
console.log('   2️⃣  npm run dev:watch    # 构建监听');
console.log('   3️⃣  npm run dev:source   # 源码模式 (推荐)');
console.log('');
console.log('🔍 调试提示:');
console.log('   - F12打开控制台查看日志');
console.log('   - window.__debugGauge 访问仪表盘实例');
console.log('   - 修改文件后观察控制台输出');
console.log(''); 