# 柱状图组件需求文档

## 1. 基本信息

### 1.1 需求概述
- **需求方**：业务可视化开发者
- **主要期望**：开发一个基于D3计算布局、ZRender渲染的柱状图组件
- **时间计划**：按框架开发流程推进

### 1.2 相关文档
- **产品原型**：标准柱状图组件
- **视觉设计**：基础柱状图视觉规范
- **交互设计**：悬停、点击、选中交互规范

### 1.3 参与人员
| 角色 | 姓名 | 职责 |
|-----|------|------|
| 可视化开发 | 用户 | 需求提供、验收 |
| AI代理 | Assistant | 架构设计、代码实现 |

### 1.4 具体要求
1. 使用D3最新版进行数据计算和布局
2. 使用ZRender最新版进行图形渲染
3. 支持笛卡尔坐标系单柱布局
4. 支持完整的交互生命周期
5. 实现流畅的动画效果

### 1.5 验收标准
- **性能指标**：支持1000条数据流畅渲染
- **功能指标**：完整交互功能、动画效果
- **质量指标**：代码规范、架构清晰

### 1.6 现有支持度
- **已支持功能**：框架基础架构（Controller、View、Model、Eventful）
- **关联组件**：无

## 2. 任务分类
> 请选择以下分类中的一项或多项：

- [x] 开发新类型图表
- [ ] 添加组件库新机制
- [ ] 增加现有组件功能
  - [ ] 图表组件
  - [ ] 非图表组件
- [ ] 修改现有组件功能
  - [ ] 图表组件
  - [ ] 非图表组件

## 3. 详细设计要求

### 3.1 默认配置
```typescript
interface BarChartConfig {
  // 容器配置
  width: number;          // 图表宽度，默认400
  height: number;         // 图表高度，默认300
  padding: {              // 内边距
    top: number;          // 默认20
    right: number;        // 默认20
    bottom: number;       // 默认40
    left: number;         // 默认60
  };
  
  // 柱子样式
  bar: {
    fill: string;         // 填充色，默认'#5470c6'
    stroke: string;       // 边框色，默认'none'
    strokeWidth: number;  // 边框宽度，默认0
    cornerRadius: number; // 圆角，默认0
    opacity: number;      // 透明度，默认1
  };
  
  // 交互样式
  hover: {
    fill: string;         // 悬停填充色，默认'#91cc75'
    opacity: number;      // 悬停透明度，默认0.8
  };
  
  selected: {
    fill: string;         // 选中填充色，默认'#fac858'
    stroke: string;       // 选中边框色，默认'#ee6666'
    strokeWidth: number;  // 选中边框宽度，默认2
  };
  
  // 坐标轴配置
  xAxis: {
    show: boolean;        // 是否显示，默认true
    tickSize: number;     // 刻度大小，默认6
    tickPadding: number;  // 刻度间距，默认3
  };
  
  yAxis: {
    show: boolean;        // 是否显示，默认true
    tickSize: number;     // 刻度大小，默认6
    tickPadding: number;  // 刻度间距，默认3
  };
  
  // 动画配置
  animation: {
    duration: number;     // 动画时长，默认1000ms
    easing: string;       // 缓动函数，默认'cubicOut'
  };
}
```

### 3.2 配置项
| 配置项 | 类型 | 默认值 | 说明 |
|-------|------|--------|------|
| width | number | 400 | 图表宽度 |
| height | number | 300 | 图表高度 |
| padding | object | {top:20,right:20,bottom:40,left:60} | 内边距 |
| bar.fill | string | '#5470c6' | 柱子填充色 |
| hover.fill | string | '#91cc75' | 悬停填充色 |
| selected.fill | string | '#fac858' | 选中填充色 |
| animation.duration | number | 1000 | 动画时长(ms) |

### 3.3 视图设计
- **布局结构**：标准笛卡尔坐标系，X轴为类别轴，Y轴为数值轴
- **样式规范**：简洁现代风格，支持主题定制
- **响应式要求**：支持容器大小变化时自动调整布局

### 3.4 交互设计
- **基础交互**：
  - 悬停高亮：鼠标悬停时柱子高亮显示
  - 移出还原：鼠标移出时恢复原始样式
- **高级交互**：
  - 点击选中：点击柱子时切换为选中状态
  - 二次点击取消选中：再次点击已选中柱子时取消选中
- **交互限制**：同时只能选中一个柱子

### 3.5 数据规范
```typescript
interface BarChartData {
  name: string;    // 类别名称
  value: number;   // 数值
  [key: string]: any; // 扩展属性
}

type BarChartDataArray = BarChartData[];
```

- **数据格式**：对象数组，每个对象包含name和value字段
- **数据量级**：最大支持1000条数据
- **更新机制**：业务方手动调用setData方法更新

### 3.6 动画设计
- **触发时机**：仅在首次渲染时播放动画
- **动画效果**：
  - 柱子起点固定在X轴位置
  - 初始高度为0
  - 按照动画时长逐渐增长到目标高度
  - 使用缓动函数实现自然的动画效果
- **非动画场景**：
  - 数据更新时直接渲染新状态，无过渡动画
  - 交互状态变化（悬停、选中）立即生效，无过渡动画
- **性能考虑**：使用requestAnimationFrame优化动画性能

## 4. 注意事项
- 使用D3的最新版本进行数据处理和布局计算
- 使用ZRender的最新版本进行图形渲染
- 确保1000条数据的渲染性能
- 交互状态管理要清晰，避免状态冲突
- 动画要流畅自然，不能影响用户体验

### 3.7 事件回调设计
```typescript
interface BarChartEvents {
  onBarClick?: (data: BarChartData, index: number, event: MouseEvent) => void;
  onBarHover?: (data: BarChartData, index: number, event: MouseEvent) => void;
  onBarHoverOut?: (data: BarChartData, index: number, event: MouseEvent) => void;
  onSelectionChange?: (selectedData: BarChartData | null, selectedIndex: number | null) => void;
}
```

### 3.8 异常处理设计
- **空数据处理**：显示空状态占位符，提示"暂无数据"
- **异常值处理**：
  - 负数值：支持显示，Y轴范围自动调整包含负值
  - 缺失字段：自动补全（name默认为索引，value默认为0）
- **容器限制**：最小尺寸200x150，过小时显示提示信息

### 3.9 数据字段扩展
```typescript
interface BarChartData {
  name: string;           // 类别名称（必填）
  value: number;          // 数值（必填）
  color?: string;         // 自定义颜色（可选）
  id?: string | number;   // 唯一标识（可选）
  [key: string]: any;     // 其他扩展字段
}
```

### 3.10 坐标轴详细配置
- **Y轴范围**：自动计算（包含0和数据最值），支持手动设置
- **X轴标签**：超过20个数据时自动旋转45度，超过50个时隔n显示
- **网格线**：Y轴显示水平网格线，默认开启

## 5. 参考资料
- D3.js官方文档
- ZRender官方文档
- 业务可视化框架架构文档
