/**
 * D3模块按需导入
 * 只导入仪表盘所需的D3功能，减小包体积
 */

// 选择器模块 - 用于DOM操作和选择
export { select, selectAll } from 'd3';
export type { Selection, BaseType } from 'd3';

// 比例尺模块 - 用于数据映射
export { scaleLinear } from 'd3';

// 形状模块 - 用于生成SVG路径
export { arc, line } from 'd3';

// 插值模块 - 用于动画过渡
export { interpolate, interpolateNumber } from 'd3';

// 过渡模块 - 用于动画
export { transition } from 'd3';
export type { Transition } from 'd3';

// 缓动函数模块 - 动画效果
export { easeCubicInOut, easeElastic, easeBackOut, easeQuadInOut } from 'd3';

// 颜色模块 - 颜色处理
export { color } from 'd3';
