# 业务可视化框架

> **人类设计，代理编码（Human design, Agents code!）**

这是一个开发业务可视化组件项目的框架，通过与AI代理的协作，实现快速、高效、高质量的可视化开发。

## 🎯 项目特色

- **按需打包**: 实现了D3.js的按需导入，体积减少90%+
- **AI协助开发**: 通过AI代理完成复杂的代码实现
- **模块化架构**: 清晰的模块划分和职责分工
- **类型安全**: 完整的TypeScript类型定义

## 📊 组件库

### 已实现组件

#### 1. D3 Gauge Chart (仪表盘)
- **位置**: `components/gauge/`
- **特性**: 高度可定制化的D3.js仪表盘组件
- **按需打包**: UMD仅5.44kB (gzip)
- **文档**: [构建指南](components/gauge/BUILD.md) | [API文档](components/gauge/README.md)

#### 2. Bar Chart (柱状图)
- **位置**: `components/bar/`
- **特性**: 基于现代架构的柱状图组件
- **状态**: 开发中

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```

### 构建生产版本

#### 构建gauge组件
```bash
# 按需打包 (极致轻量)
npm run build:gauge

# 选择性打包 (推荐大多数场景)
npm run build:gauge:selective

# 完全打包 (演示环境)
npm run build:gauge:bundle
```

## 💡 按需打包方案

### 性能对比
| 方案 | UMD | ES模块 | Gzip | 依赖管理 | 适用场景 |
|------|-----|--------|------|----------|----------|
| **按需打包** | 17.78kB | 33.95kB | **5.44kB** | 8个d3子包 + lodash | 生产环境，追求极致性能 |
| **选择性打包** | 68.95kB | 130.78kB | **23.07kB** | 仅lodash | 大多数项目，平衡易用性 |
| **完全打包** | 73.55kB | 130.78kB | **23.59kB** | 仅lodash | 演示/原型/测试环境 |

### 使用方式

#### 按需打包版本 (极致轻量 - 5.44kB gzip)
```html
<!-- 需要引入8个d3子模块 -->
<script src="https://cdn.jsdelivr.net/npm/d3-selection@3"></script>
<script src="https://cdn.jsdelivr.net/npm/d3-scale@4"></script>
<!-- ... 其他6个d3子模块 -->
<script src="https://cdn.jsdelivr.net/npm/lodash@4"></script>
<script src="dist/gauge/lean/d3-gauge-chart.umd.js"></script>

<script>
const gauge = new D3GaugeChart(container);
gauge.setData({ value: 75 });
</script>
```

#### 选择性打包版本 (推荐 - 23.07kB gzip)
```html
<!-- 只需lodash，包含所需d3模块 -->
<script src="https://cdn.jsdelivr.net/npm/lodash@4"></script>
<script src="dist/gauge/selective/d3-gauge-chart.selective.umd.js"></script>

<script>
const gauge = new D3GaugeChart(container);
gauge.setData({ value: 75 });
</script>
```

#### 完全打包版本 (演示环境 - 23.59kB gzip)
```html
<!-- 只需lodash，包含完整d3功能 -->
<script src="https://cdn.jsdelivr.net/npm/lodash@4"></script>
<script src="dist/gauge/bundle/d3-gauge-chart.bundle.umd.js"></script>

<script>
const gauge = new D3GaugeChart(container);
gauge.setData({ value: 75 });
</script>
```

## 🏗️ 项目架构

```
gauge/
├── components/           # 组件库
│   ├── gauge/           # 仪表盘组件
│   │   ├── core/        # 核心功能
│   │   ├── types/       # 类型定义
│   │   ├── utils/       # 工具函数
│   │   └── index.ts     # 入口文件
│   └── bar/             # 柱状图组件
├── docs/                # 文档
├── src/                 # Vue开发环境
├── dist/                # 构建产物
└── vite.*.config.ts     # 构建配置
```

## 🔧 开发流程

### 1. 需求分析阶段
- 人类提供业务目标和核心场景
- AI代理识别需求盲区和细节

### 2. 技术方案设计
- 人类确认技术约束和架构方向
- AI代理生成详细的技术实现方案

### 3. 代码实现
- AI代理自动完成模块代码生成
- 包含完整的类型定义和注释

### 4. 打包优化
- 按需打包减少体积
- 多格式支持(UMD/ES)
- Tree-shaking优化

## 📈 优化成果

### D3 Gauge Chart优化
- **体积减少**: 从60+kB降至5.44kB (gzip)
- **加载速度**: 提升3-5倍
- **依赖优化**: 从完整d3包减少到8个子模块
- **类型安全**: 完整TypeScript支持

### 技术亮点
- ✅ 按需导入d3子模块
- ✅ Tree-shaking支持
- ✅ 多格式打包(UMD/ES)
- ✅ 源码映射支持
- ✅ 代码压缩优化
- ✅ TypeScript类型定义

## 📚 文档

- [需求分析文档](docs/requirement.md)
- [技术方案设计](docs/design.md)
- [项目分析报告](docs/analysis.md)
- [Gauge组件构建指南](components/gauge/BUILD.md)

## 🤝 贡献指南

1. 遵循"人类设计，代理编码"的开发理念
2. 保持模块化和类型安全
3. 优化包体积，支持按需加载
4. 编写完整的文档和示例

## 📄 许可证

MIT License

---

通过AI协助开发，我们实现了高质量、高性能的可视化组件库，为业务可视化开发提供了现代化的解决方案。
