# 仪表盘组件需求文档

## 1. 基本信息

### 1.1 需求概述
- **需求方**：用户
- **主要期望**：实现一个半圆形的恐惧贪婪指数仪表盘组件，支持从0-100的数值显示，具有颜色渐变效果和指针指示
- **时间计划**：即时开发

### 1.2 相关文档
- **产品原型**：用户提供的仪表盘效果图
- **视觉设计**：半圆形仪表盘，从红色（Extreme Fear）到绿色（Extreme Greed）的渐变
- **交互设计**：支持数值变化动画，指针动态指向

### 1.3 参与人员
| 角色 | 姓名 | 职责 |
|-----|------|------|
| 需求方 | 用户 | 提供需求和验收 |
| AI代理 | Claude | 代码实现和技术方案 |

### 1.4 具体要求
1. 实现半圆形仪表盘布局（180度扇形）
2. 支持0-100数值范围显示
3. 实现从红色到绿色的颜色渐变背景
4. 添加指针指向当前数值
5. 在中心显示当前数值和标签文本
6. 支持数值变化时的动画效果
7. 左右两端显示"Extreme Fear"和"Extreme Greed"标签
8. 存在一个半圆形的背景（180度扇形）

### 1.5 验收标准
- **性能指标**：渲染时间 < 100ms，动画流畅60fps
- **功能指标**：准确显示数值，指针位置正确，颜色渐变平滑
- **质量指标**：代码规范，类型安全，可配置性强

### 1.6 现有支持度
- **已支持功能**：基础组件架构（Controller、Model、View、Layout），zrender渲染引擎
- **关联组件**：继承自base核心组件体系

## 2. 任务分类

- [x] 开发新类型图表
- [ ] 添加组件库新机制
- [ ] 增加现有组件功能
- [ ] 修改现有组件功能

## 3. 详细设计要求

### 3.1 默认配置
```typescript
interface GaugeConfig {
    width: number;          // 组件宽度
    height: number;         // 组件高度
    padding: {              // 内边距
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    
    // 仪表盘参数
    gauge: {
        radius: number;         // 半径（自动计算或手动设置）
        startAngle: number;     // 起始角度（-90度）
        endAngle: number;       // 结束角度（90度）
        thickness: number;      // 仪表盘厚度
        backgroundColor: string; // 背景色
        borderWidth: number;    // 边框宽度
        borderColor: string;    // 边框颜色
    };
    
    // 颜色渐变配置
    gradient: {
        startColor: string;     // 起始颜色（红色）
        endColor: string;       // 结束颜色（绿色）
        middleColors?: string[]; // 中间颜色
    };
    
    // 指针配置
    pointer: {
        length: number;         // 指针长度
        width: number;          // 指针宽度
        color: string;          // 指针颜色
        centerRadius: number;   // 中心圆半径
        centerColor: string;    // 中心圆颜色
    };
    
    // 文本配置
    centerText: {
        value: {
            fontSize: number;
            fontWeight: string;
            color: string;
        };
        label: {
            fontSize: number;
            fontWeight: string;
            color: string;
        };
    };
    
    // 标签配置
    labels: {
        show: boolean;
        fontSize: number;
        color: string;
        startLabel: string;     // "Extreme Fear"
        endLabel: string;       // "Extreme Greed"
    };
    
    // 刻度配置
    ticks: {
        show: boolean;
        count: number;          // 刻度数量
        length: number;         // 刻度长度
        width: number;          // 刻度宽度
        color: string;          // 刻度颜色
    };
    
    // 动画配置
    animation: {
        duration: number;       // 动画时长
        easing: string;         // 缓动函数
        delay: number;          // 延迟时间
    };
}
```

### 3.2 配置项
| 配置项 | 类型 | 默认值 | 说明 |
|-------|------|--------|------|
| width | number | 400 | 组件宽度 |
| height | number | 300 | 组件高度 |
| gauge.radius | number | 自动计算 | 仪表盘半径 |
| gauge.thickness | number | 20 | 仪表盘厚度 |
| gradient.startColor | string | #ff4444 | 起始颜色（红色） |
| gradient.endColor | string | #44ff44 | 结束颜色（绿色） |
| pointer.length | number | 0.8 | 指针长度比例 |
| centerText.value.fontSize | number | 48 | 数值字体大小 |
| centerText.label.fontSize | number | 16 | 标签字体大小 |
| animation.duration | number | 1000 | 动画时长（毫秒） |

### 3.3 视图设计
- **布局结构**：半圆形结构，中心显示数值和文本，底部显示标签
- **样式规范**：现代扁平化设计，颜色渐变平滑过渡
- **响应式要求**：支持容器大小变化时自动调整

### 3.4 交互设计
- **基础交互**：支持数值更新，指针动画过渡
- **高级交互**：悬停效果（可选），点击事件（可选）
- **交互限制**：数值范围限制在0-100之间

### 3.5 数据规范
```typescript
interface GaugeData {
    value: number;          // 当前数值（0-100）
    label?: string;         // 自定义标签文本
    min?: number;           // 最小值（默认0）
    max?: number;           // 最大值（默认100）
}
```

- **数据格式**：简单的数值对象
- **数据量级**：单一数值，无大量数据处理需求
- **更新机制**：支持数值实时更新和动画过渡

### 3.6 动画设计
- **触发时机**：数值变化时触发
- **动画效果**：
  - 指针平滑旋转到新位置
  - 数值文本递增/递减动画
  - 渐变色彩过渡（可选）
- **性能考虑**：使用requestAnimationFrame优化动画性能

## 4. 注意事项
- 角度计算需要考虑半圆形的特殊性（-90°到90°）
- 颜色渐变需要根据数值位置动态计算
- 指针旋转动画需要处理角度边界情况
- 文本居中对齐需要精确计算位置
- 响应式设计需要保持比例和布局

## 5. 参考资料
- zrender文档：图形渲染
- D3.js：比例尺和数学计算
- 现有Bar组件：架构参考

## 6. 需求确认结果

### 6.1 数据更新频率
✅ **确认**：手动更新数据，或者能通过API更新

### 6.2 交互需求
✅ **确认**：暂时不需要交互功能

### 6.3 自定义需求
✅ **确认**：
- 标签文本需要可配置
- 颜色需要可配置（分段需要可配置，每段的颜色也需要可配置）
- 数值范围可配置

### 6.4 性能要求
✅ **确认**：预计一个页面一个仪表盘

## 7. 最终确认的功能需求
1. 实现半圆形仪表盘布局（180度扇形）
2. 支持自定义数值范围显示
3. 实现可配置的分段颜色渐变背景
4. 添加指针指向当前数值
5. 在中心显示当前数值和可配置标签文本
6. 支持数值变化时的动画效果
7. 两端显示可配置的标签文本
8. 存在一个半圆形的背景（180度扇形）
9. 支持手动更新和API更新数据
10. 完全可配置的颜色分段系统 