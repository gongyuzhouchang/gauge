# 仪表盘组件文件结构说明

## 📁 文件组织（精简版）

### 🎯 **核心文件**
- `FinalGaugeChart.ts` - **完整的仪表盘组件**
  - ✅ 功能完整，配置灵活
  - ✅ 高DPI支持，清晰显示
  - ✅ 内联类型定义，无外部依赖
  - ✅ 专业级视觉效果
  - ✅ 自包含设计，无导入问题

- `README.md` - **文档说明**

## 🚀 使用建议

### **当前推荐：FinalGaugeChart**
```typescript
import { FinalGaugeChart } from './gauge/FinalGaugeChart';

// 创建仪表盘
const gauge = new FinalGaugeChart(container, {
  width: 400,
  height: 300,
  segments: [
    { min: 0, max: 25, color: '#ff4444', label: 'Extreme Fear' },
    { min: 25, max: 75, color: '#ffcc44', label: 'Neutral' },
    { min: 75, max: 100, color: '#44ff44', label: 'Extreme Greed' }
  ]
});

// 设置数据
gauge.setData({ value: 68, label: 'Greed' });

// 更新数值
gauge.setValue(85);
```

## 📋 待办事项

### **功能增强**
- [ ] 添加动画效果（指针移动动画）
- [ ] 支持更多自定义配置选项
- [ ] 添加事件系统（点击、悬浮等）
- [ ] 添加多种仪表盘样式（垂直、圆形等）
- [ ] 添加数据验证和错误处理

## 🎯 文件清理状态

✅ **已完成精简**
- ❌ 删除了所有有问题的文件（GaugeChart.ts, GaugeChartView.ts, GaugeChartModel.ts, GaugeChartLayout.ts, SimpleGaugeChart.ts, TestGauge.ts）
- ❌ 删除了不再需要的目录（types/, utils/）
- ✅ 保留了核心可用文件（FinalGaugeChart.ts）

## ✨ 优势

### **为什么选择精简架构？**
1. **零依赖问题** - 无导入错误、无基类继承问题
2. **即插即用** - 单文件包含所有功能
3. **高性能** - 针对仪表盘优化的专用实现
4. **维护简单** - 结构清晰，易于理解和修改
5. **类型安全** - 完整的TypeScript支持 

# 恐惧贪婪指数仪表盘组件

一个高性能、可配置的恐惧贪婪指数仪表盘组件，支持丰富的背景自定义功能。

## 特性

### 🎨 分层背景系统（重要更新）
- **底层背景(backdrop)**: 最底层的环状背景，通常更大，包含整个仪表盘
- **仪表盘背景(background)**: 主要的扇形分块仪表盘本身的背景
- **双层配置**: 每层都支持颜色、尺寸、边框、透明度独立配置
- **渐变支持**: 两层背景都支持单色或多色渐变

### 📊 基础功能
- 半圆形恐惧贪婪指数布局（-90°到90°）
- 5段颜色分区：极度恐惧(红)→恐惧(橙)→中性(黄)→贪婪(浅绿)→极度贪婪(绿)
- 动态指针指向当前数值
- 中心数值显示和状态标签
- 端点标签（Extreme Fear / Extreme Greed）
- 高DPI支持，解决模糊问题

## 使用方法

### 基本使用
```typescript
import { FinalGaugeChart } from './gauge/FinalGaugeChart';

const gauge = new FinalGaugeChart(container, {
  width: 400,
  height: 300
});

// 设置数据
gauge.setData({ value: 68, label: 'Greed' });
```

### 分层背景配置
```typescript
// 双层背景配置
const gauge = new FinalGaugeChart(container, {
  // 仪表盘背景（主要的扇形分块）
  background: {
    show: true,
    color: '#f5f5f5',              // 仪表盘背景色
    outerRadiusRatio: 1.0,         // 仪表盘外圆半径比例
    innerRadiusRatio: 0.65,        // 仪表盘内圆半径比例
    border: {
      show: true,
      color: '#ccc',
      width: 2
    },
    opacity: 1.0
  },
  // 底层背景（包含仪表盘的更大环状背景）
  backdrop: {
    show: true,
    color: '#eeeeee',              // 底层背景色，通常比仪表盘浅
    outerRadiusRatio: 1.2,         // 底层外圆更大，包含仪表盘
    innerRadiusRatio: 0.5,         // 底层内圆更小
    border: {
      show: false,                 // 默认不显示底层边框
      color: '#ddd',
      width: 1
    },
    opacity: 0.6                   // 半透明，避免遮挡仪表盘
  }
});

// 渐变底层背景
const gauge = new FinalGaugeChart(container, {
  background: {
    // 仪表盘配置...
  },
  backdrop: {
    show: true,
    color: ['#f8f9fa', '#e9ecef'],  // 底层渐变背景
    outerRadiusRatio: 1.3,          // 更大的底层背景
    innerRadiusRatio: 0.4,
    opacity: 0.8
  }
});
```

### 动态更新配置
```typescript
// 更改背景颜色
gauge.updateConfig({
  background: {
    ...gauge.getConfig().background,
    color: '#e3f2fd'
  }
});

// 应用渐变背景
gauge.updateConfig({
  background: {
    ...gauge.getConfig().background,
    color: ['#667eea', '#764ba2']
  }
});

// 调整背景大小
gauge.updateConfig({
  background: {
    ...gauge.getConfig().background,
    outerRadiusRatio: 1.2,
    innerRadiusRatio: 0.4
  }
});
```

## 配置选项

### 分层背景配置接口
```typescript
interface GaugeConfig {
  // 仪表盘背景配置（主要的扇形分块）
  background: {
    show: boolean;                    // 是否显示仪表盘背景
    color: string | string[];         // 仪表盘背景颜色（单色或渐变色数组）
    outerRadiusRatio: number;         // 仪表盘外圆半径比例 (0-1+)
    innerRadiusRatio: number;         // 仪表盘内圆半径比例 (0-1, 应小于outerRadiusRatio)
    border: {
      show: boolean;                  // 是否显示仪表盘边框
      color: string;                  // 仪表盘边框颜色
      width: number;                  // 仪表盘边框宽度
    };
    opacity: number;                  // 仪表盘背景透明度 (0-1)
  };
  // 底层背景配置（最底层的环状背景）
  backdrop: {
    show: boolean;                    // 是否显示底层背景
    color: string | string[];         // 底层背景颜色（单色或渐变色数组）
    outerRadiusRatio: number;         // 底层外圆半径比例，通常 > background.outerRadiusRatio
    innerRadiusRatio: number;         // 底层内圆半径比例，通常 < background.innerRadiusRatio
    border: {
      show: boolean;                  // 是否显示底层边框
      color: string;                  // 底层边框颜色
      width: number;                  // 底层边框宽度
    };
    opacity: number;                  // 底层背景透明度 (0-1)
  };
}
```

### 默认配置
```typescript
{
  background: {
    show: true,
    color: '#f5f5f5',         // 仪表盘背景色
    outerRadiusRatio: 1.0,    // 仪表盘外圆半径比例
    innerRadiusRatio: 0.65,   // 仪表盘内圆半径比例
    border: {
      show: true,
      color: '#ccc',
      width: 2
    },
    opacity: 1.0
  },
  backdrop: {
    show: true,
    color: '#eeeeee',         // 底层背景色，通常比仪表盘浅
    outerRadiusRatio: 1.2,    // 底层外圆更大，包含仪表盘
    innerRadiusRatio: 0.5,    // 底层内圆更小
    border: {
      show: false,            // 默认不显示底层边框
      color: '#ddd',
      width: 1
    },
    opacity: 0.6             // 半透明，避免遮挡仪表盘
  }
}
```

## 演示页面

在开发演示页面中，提供了两组配置测试按钮：

### 仪表盘背景配置（蓝紫色按钮）
1. **改变仪表盘背景颜色** - 随机切换预设的单色背景
2. **改变仪表盘背景大小** - 随机调整内外圆半径比例
3. **应用仪表盘渐变背景** - 应用随机的渐变色背景
4. **切换仪表盘边框** - 切换边框显示/隐藏及样式
5. **改变仪表盘透明度** - 调整背景透明度

### 底层背景配置（灰色按钮）
1. **改变底层背景颜色** - 随机切换预设的底层单色背景
2. **改变底层背景大小** - 调整底层背景的内外圆尺寸
3. **应用底层渐变背景** - 应用随机的底层渐变色
4. **切换底层边框** - 切换底层背景边框
5. **显示/隐藏底层背景** - 完全控制底层背景的显示状态

## 技术特点

- **零依赖**: 完全自包含，无外部依赖
- **类型安全**: 完整的TypeScript支持
- **高性能**: 优化的Canvas渲染
- **高清显示**: 自动适配高DPI屏幕
- **即插即用**: 单文件包含所有功能

## API

### 方法
- `setData(data: GaugeData)` - 设置仪表盘数据
- `setValue(value: number)` - 设置仪表盘数值
- `updateConfig(config: Partial<GaugeConfig>)` - 更新配置
- `getConfig()` - 获取当前配置
- `getData()` - 获取当前数据
- `destroy()` - 销毁组件

### 事件
暂无事件系统，将来可扩展添加点击、悬停等事件支持。 

# D3仪表盘组件

一个基于D3.js的高性能、可定制仪表盘组件，支持线条指针和图片指针两种样式。

## 特性

- 支持多段颜色配置
- 灵活的刻度和标签系统
- 平滑的动画效果
- **NEW**: 支持自定义图片指针
- 响应式布局
- TypeScript支持

## 图片指针功能

### 配置说明

新增的图片指针功能允许您使用base64编码的图片或普通图片链接来自定义指针样式。

```typescript
const gaugeConfig: GaugeConfig = {
  // ... 其他配置
  pointer: {
    type: 'image', // 指定使用图片指针
    length: 0.85, // 对于图片指针不生效
    width: 4, // 对于图片指针不生效
    color: '#333', // 对于图片指针不生效
    shadow: {
      enable: true,
      offsetX: 2,
      offsetY: 2,
      blur: 4,
      color: 'rgba(0, 0, 0, 0.3)'
    },
    image: {
      // base64图片或图片URL
      src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      width: 30, // 图片宽度（像素）
      height: 100, // 图片高度（像素）
      offsetX: -15, // X轴偏移量（通常设为宽度的一半实现水平居中）
      offsetY: -90, // Y轴偏移量（调整图片相对于旋转中心的位置）
    }
  }
  // ... 其他配置
};
```

### 使用线条指针

如果您想继续使用传统的线条指针：

```typescript
const gaugeConfig: GaugeConfig = {
  // ... 其他配置
  pointer: {
    type: 'line', // 指定使用线条指针
    length: 0.85,
    width: 4,
    color: '#333',
    shadow: {
      enable: true,
      offsetX: 2,
      offsetY: 2,
      blur: 2,
      color: 'rgba(0, 0, 0, 0.2)'
    },
    image: {
      src: '',
      width: 20,
      height: 80,
      offsetX: -10,
      offsetY: -70
    }
  }
  // ... 其他配置
};
```

### 图片指针定位说明

- `offsetX`: 控制图片在X轴上的偏移量，通常设置为图片宽度的负一半来实现水平居中
- `offsetY`: 控制图片在Y轴上的偏移量，负值表示向上偏移，用于将指针的"指向端"对准数值
  - 这样可以确保图片指针与线条指针有相同的角度行为

### 示例：自定义指针图片

```typescript
// 使用向上箭头图片作为指针
const arrowPointerConfig = {
  type: 'image',
  image: {
    src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCAyMCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDAgTCAyMCA4MCBMIDAgODAgWiIgZmlsbD0iIzMzMyIvPgo8L3N2Zz4K',
    width: 20,
    height: 80,
    offsetX: -10,
    offsetY: -75,
  },
  shadow: {
    enable: true,
    offsetX: 2,
    offsetY: 2,
    blur: 4,
    color: 'rgba(0, 0, 0, 0.3)'
  }
};

// 使用向右箭头图片作为指针
const rightArrowConfig = {
  type: 'image',
  image: {
    src: 'data:image/svg+xml;base64,...', // 向右设计的箭头
    width: 80,
    height: 20,
    offsetX: -75,
    offsetY: -10,
  }
};
```

### 工具函数

组件还提供了一些实用的图片处理工具函数：

```typescript
import { isValidBase64Image, preloadImage, getImageDimensions } from './utils/image';

// 验证base64图片格式
const isValid = isValidBase64Image('data:image/png;base64,...');

// 预加载图片
preloadImage('your-image-url').then(img => {
  console.log('图片加载完成', img);
});

// 获取图片尺寸
getImageDimensions('your-image-url').then(({ width, height }) => {
  console.log('图片尺寸:', width, height);
});
```

## 基本用法

```typescript
import { D3GaugeChart } from './D3GaugeChart';

const container = document.getElementById('gauge-container');
const gauge = new D3GaugeChart(container, gaugeConfig);

// 设置数值
gauge.setValue(75);

// 更新配置
gauge.updateConfig(newConfig);
```