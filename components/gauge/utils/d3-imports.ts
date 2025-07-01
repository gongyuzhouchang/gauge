/**
 * D3模块按需导入 - 优化版
 * 直接从d3子包导入，实现真正的按需打包
 */

// 选择器模块 - 用于DOM操作
export { select, selectAll } from 'd3-selection';
export type { Selection, BaseType } from 'd3-selection';

// 比例尺模块 - 用于数据映射
export { scaleLinear } from 'd3-scale';
export type { ScaleLinear } from 'd3-scale';

// 形状模块 - 用于生成SVG路径
export { arc } from 'd3-shape';
export type { DefaultArcObject } from 'd3-shape';

// 插值模块 - 用于动画过渡
export { interpolate, interpolateNumber } from 'd3-interpolate';

// 过渡模块 - 用于动画
export { transition } from 'd3-transition';
export type { Transition } from 'd3-transition';

// 缓动函数模块 - 动画效果
export { easeCubicInOut, easeElastic, easeBackOut, easeQuadInOut } from 'd3-ease';

// 颜色模块 - 颜色处理
export { color } from 'd3-color';
