# D3 Gauge Chart - 构建指南

## 构建UMD包

### 构建按需打包版本（极致轻量）
```bash
npm run build:gauge
```

### 构建选择性打包版本（推荐）
```bash
npm run build:gauge:selective
```

### 构建完全打包版本（包含所有d3依赖）
```bash
npm run build:gauge:bundle
```

### 构建开发版本（未压缩）
```bash
npm run build:gauge:dev
```

## 构建产物

构建完成后，在 `dist/gauge/` 目录下会生成以下文件：

```
dist/gauge/
├── lean/                          # 按需打包版本（极致轻量）
│   ├── d3-gauge-chart.umd.js      # UMD格式（17.78 kB）
│   ├── d3-gauge-chart.es.js       # ES模块格式（33.95 kB）
│   └── 对应的source map文件
├── selective/                     # 选择性打包版本（推荐）
│   ├── d3-gauge-chart.selective.umd.js    # UMD格式（68.95 kB）
│   ├── d3-gauge-chart.selective.es.js     # ES模块格式（130.78 kB）
│   └── 对应的source map文件
└── bundle/                        # 完全打包版本
    ├── d3-gauge-chart.bundle.umd.js       # UMD格式（73.55 kB）
    ├── d3-gauge-chart.bundle.es.js        # ES模块格式（130.78 kB）
    └── 对应的source map文件
```

## 体积对比

| 打包方式 | UMD压缩后 | ES模块压缩后 | Gzip后 | 外部依赖 |
|---------|-----------|-------------|--------|----------|
| **按需打包** | 17.78 kB | 33.95 kB | **5.44 kB** | 8个d3子包 + lodash |
| **选择性打包** | 68.95 kB | 130.78 kB | **23.07 kB** | 仅lodash |
| **完全打包** | 73.55 kB | 130.78 kB | **23.59 kB** | 仅lodash |

## 使用方式

### 1. 按需打包方式（极致轻量）

#### HTML直接引入
```html
<!DOCTYPE html>
<html>
<head>
  <!-- 先引入d3子模块依赖 -->
  <script src="https://cdn.jsdelivr.net/npm/d3-selection@3"></script>
  <script src="https://cdn.jsdelivr.net/npm/d3-scale@4"></script>
  <script src="https://cdn.jsdelivr.net/npm/d3-shape@3"></script>
  <script src="https://cdn.jsdelivr.net/npm/d3-interpolate@3"></script>
  <script src="https://cdn.jsdelivr.net/npm/d3-transition@3"></script>
  <script src="https://cdn.jsdelivr.net/npm/d3-ease@3"></script>
  <script src="https://cdn.jsdelivr.net/npm/d3-color@3"></script>
  <script src="https://cdn.jsdelivr.net/npm/lodash@4"></script>
  
  <!-- 引入gauge组件 -->
  <script src="dist/gauge/lean/d3-gauge-chart.umd.js"></script>
</head>
<body>
  <div id="gauge-container" style="width: 400px; height: 300px;"></div>
  
  <script>
    const container = document.getElementById('gauge-container');
    const gauge = new D3GaugeChart(container, {
      width: 400,
      height: 300
    });
    
    gauge.setData({ value: 75 });
  </script>
</body>
</html>
```

### 2. 选择性打包方式（推荐大多数场景）

#### HTML直接引入
```html
<!DOCTYPE html>
<html>
<head>
  <!-- 只需引入lodash -->
  <script src="https://cdn.jsdelivr.net/npm/lodash@4"></script>
  
  <!-- 引入gauge组件（包含所需d3子包）-->
  <script src="dist/gauge/selective/d3-gauge-chart.selective.umd.js"></script>
</head>
<body>
  <div id="gauge-container" style="width: 400px; height: 300px;"></div>
  
  <script>
    const container = document.getElementById('gauge-container');
    const gauge = new D3GaugeChart(container, {
      width: 400,
      height: 300
    });
    
    gauge.setData({ value: 75 });
  </script>
</body>
</html>
```

#### ES模块方式
```javascript
import { D3GaugeChart } from './dist/gauge/selective/d3-gauge-chart.selective.es.js';

const container = document.getElementById('gauge-container');
const gauge = new D3GaugeChart(container);
gauge.setData({ value: 75 });
```

### 3. 完全打包方式（演示/测试环境）

#### HTML直接引入
```html
<!DOCTYPE html>
<html>
<head>
  <!-- 只需引入lodash -->
  <script src="https://cdn.jsdelivr.net/npm/lodash@4"></script>
  
  <!-- 引入gauge组件（包含所有d3依赖）-->
  <script src="dist/gauge/bundle/d3-gauge-chart.bundle.umd.js"></script>
</head>
<body>
  <div id="gauge-container" style="width: 400px; height: 300px;"></div>
  
  <script>
    const container = document.getElementById('gauge-container');
    const gauge = new D3GaugeChart(container, {
      width: 400,
      height: 300
    });
    
    gauge.setData({ value: 75 });
  </script>
</body>
</html>
```

## API使用示例

### 基础用法
```javascript
// 创建仪表盘实例
const gauge = new D3GaugeChart(container, {
  width: 400,
  height: 300,
  range: { min: 0, max: 100 }
});

// 设置数据
gauge.setData({ value: 75, label: 'Performance' });

// 更新数值
gauge.setValue(80);

// 更新配置
gauge.updateConfig({
  segments: [
    { min: 0, max: 30, color: '#ff4444', label: 'Low' },
    { min: 30, max: 70, color: '#ffcc44', label: 'Medium' },
    { min: 70, max: 100, color: '#44ff44', label: 'High' }
  ]
});

// 响应式调整
window.addEventListener('resize', () => {
  gauge.resize();
});

// 清理资源
gauge.destroy();
```

### 高级配置
```javascript
const gauge = new D3GaugeChart(container, {
  width: 500,
  height: 400,
  range: { min: 0, max: 100 },
  
  // 自定义数据段
  segments: [
    { min: 0, max: 25, color: '#ff4444', label: 'Critical' },
    { min: 25, max: 50, color: '#ff8844', label: 'Warning' },
    { min: 50, max: 75, color: '#ffcc44', label: 'Good' },
    { min: 75, max: 100, color: '#44ff44', label: 'Excellent' }
  ],
  
  // 指针配置
  pointer: {
    type: 'image',
    length: 0.8,
    fromInnerEdge: true,
    image: {
      src: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz...',
      width: 20,
      height: 80,
      offsetX: -10,
      offsetY: -40
    },
    shadow: {
      enable: true,
      offsetX: 2,
      offsetY: 2,
      blur: 4,
      color: 'rgba(0, 0, 0, 0.3)'
    }
  },
  
  // 刻度配置
  ticks: {
    show: true,
    count: 10,
    mainTickEvery: 2,
    label: {
      show: true,
      position: 'outer',
      fontSize: 12
    }
  },
  
  // 动画配置
  animation: {
    enable: true,
    duration: 1000,
    easing: 'easeCubicInOut'
  }
});
```

## 外部依赖

### 按需打包依赖（极致轻量）
- **d3-selection**: DOM操作
- **d3-scale**: 数据比例尺
- **d3-shape**: SVG形状生成
- **d3-interpolate**: 插值动画
- **d3-transition**: 过渡动画
- **d3-ease**: 缓动函数
- **d3-color**: 颜色处理
- **lodash**: 工具函数

### 选择性打包依赖（推荐）
- **lodash**: 工具函数（唯一外部依赖）
- 内置所需d3子包，无需手动引入

### 完全打包依赖（演示环境）
- **lodash**: 工具函数（唯一外部依赖）
- 内置完整d3功能，包含未使用模块

## 选择建议

1. **生产环境（追求极致性能）**：按需打包版本 - 5.44kB gzip
2. **大多数项目（平衡易用性和性能）**：选择性打包版本 - 23.07kB gzip
3. **演示/原型/测试环境**：完全打包版本 - 23.59kB gzip
4. **使用CDN**：提高加载速度和缓存利用率
5. **启用Gzip压缩**：进一步减少传输体积

## 故障排除

### 常见问题

1. **TypeError: D3GaugeChart is not a constructor**
   - 确保正确引入了所有依赖
   - 检查script标签的顺序

2. **样式显示异常**
   - 确保容器有明确的宽度和高度
   - 检查CSS样式冲突

3. **动画不流畅**
   - 减少动画时长
   - 简化缓动函数
   - 检查浏览器性能

更多信息请参考 [README.md](./README.md)。 