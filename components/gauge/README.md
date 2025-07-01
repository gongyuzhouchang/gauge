# D3 Gauge Chart (仪表盘)

功能强大、高度可定制的仪表盘组件，基于 D3.js 实现。

- **核心特点**:
  - 🎨 **高度可配置**: 从指针样式、背景、刻度到文本标签，均可深度定制。
  - 🚀 **性能卓越**: 实现了 D3.js 的按需导入，核心包 gzip 后仅 **5.44kB**。
  - 🖼️ **多种指针类型**: 支持线条、箭头以及自定义图片指针。
  - 🌈 **渐变与分层背景**: 支持仪表盘和背景色的渐变，以及多层背景配置。
  - ✏️ **动态更新**: 所有配置项均支持动态更新，无需重新创建实例。
  - 💡 **类型安全**: 提供完整的 TypeScript 类型定义。
- **相关文档**:
  - [构建与打包方案说明](./SUMMARY.md)
  - [开发过程记录](./BUILD.md)

## 🚀 快速开始

### 在项目中使用

首先，在您的 HTML 文件中准备一个用于渲染图表的容器。

```html
<div id="my-gauge-chart" style="width: 500px; height: 350px;"></div>
```

然后，通过 JavaScript 创建并使用仪表盘。

```javascript
import { D3GaugeChart } from './index'; // 从组件入口导入

// 1. 获取容器元素
const container = document.getElementById('my-gauge-chart');

// 2. 创建仪表盘实例
const gaugeChart = new D3GaugeChart(container);

// 3. 设置初始数据
gaugeChart.setData({ value: 75 });

// 4. 动态更新数值
setInterval(() => {
  const newValue = Math.floor(Math.random() * 101);
  gaugeChart.setValue(newValue);
}, 3000);
```

## ⚙️ API 与配置选项

### 主要方法

- `new D3GaugeChart(container, options)`: 构造函数，创建一个新的仪表盘实例。
  - `container`: `HTMLElement` - 渲染图表的 DOM 容器。
  - `options`: `Partial<GaugeConfig>` - (可选) 初始化配置对象。
- `setData(data)`: 设置或更新仪表盘的完整数据。
  - `data`: `{ value: number, label?: string }`
- `setValue(value)`: 仅更新仪表盘的指针数值。
  - `value`: `number`
- `updateConfig(newConfig)`: 动态更新仪表盘的配置。
  - `newConfig`: `Partial<GaugeConfig>`
- `destroy()`: 销毁实例，并从 DOM 中移除图表。

### 常用配置示例

所有配置项均可以通过构造函数或 `updateConfig` 方法进行设置。

#### 1. 自定义分段

```javascript
gaugeChart.updateConfig({
  segments: [
    { min: 0, max: 30, color: '#ff6b6b', label: '低' },
    { min: 30, max: 70, color: '#feca57', label: '中' },
    { min: 70, max: 100, color: '#1dd1a1', label: '高' }
  ]
});
```

#### 2. 配置指针样式

**使用图片指针 (默认):**

```javascript
gaugeChart.updateConfig({
  pointer: {
    type: 'image',
    image: {
      src: 'your-base64-or-url-encoded-image', // 替换为你的指针图片
      width: 20,
      height: 80,
      offsetX: -10, // 水平偏移，用于对准中心
      offsetY: -80  // 垂直偏移
    }
  }
});
```

**使用线条指针:**

```javascript
gaugeChart.updateConfig({
  pointer: {
    type: 'line',
    length: 0.9, // 占半径的比例
    width: 3,
    color: '#2c3e50'
  }
});
```

#### 3. 配置仪表盘和背景

```javascript
gaugeChart.updateConfig({
  // 仪表盘主体 (扇形区域)
  gauge: {
    color: ['#667eea', '#764ba2'], // 应用渐变色
    innerRadiusRatio: 0.6,
    outerRadiusRatio: 1.0,
    border: { show: false }
  },
  // 底部背景层
  background: {
    show: true,
    color: '#f0f2f5',
    innerRadiusRatio: 0.5,
    outerRadiusRatio: 1.05, // 通常比 gauge 层稍大
    opacity: 0.8
  }
});
```

#### 4. 显示刻度和标签

```javascript
gaugeChart.updateConfig({
  ticks: {
    show: true,
    count: 10, // 10个主刻度
    label: { show: true }
  },
  labels: {
    show: true,
    startLabel: '0%',
    endLabel: '100%'
  }
});
```

> 完整的配置选项请参考 `types/config.ts` 中的 `GaugeConfig` 类型定义。

## 📦 构建与打包

本项目提供了多种打包策略，以适应不同场景的需求。详细信息请参考项目根目录的 `README.md`。

| 构建命令 | 描述 |
| :--- | :--- |
| `npm run build:gauge` | **按需打包**: 体积最小，生产环境首选。 |
| `npm run build:gauge:selective` | **选择性打包**: 平衡体积和易用性。 |
| `npm run build:gauge:bundle` | **完全打包**: 包含所有依赖，用于演示或测试。 |

## 🔧 开发与测试

- **开发**: 运行 `npm run dev` 启动开发服务器，在 `src/App.vue` 中进行组件调试。
- **测试**: 直接在浏览器中打开 `test-simple.html` 文件，可测试打包后的 UMD 模块。