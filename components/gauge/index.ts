/**
 * D3 Gauge Chart - 按需打包入口文件
 */

// 主类导出
export { D3GaugeChart } from './D3GaugeChart';

// 类型定义导出
export type { GaugeConfig, GaugeSegment, DEFAULT_CONFIG } from './types/config';

export type { GaugeData, GaugeLayout, SegmentData, TickData } from './types/data';

// 工具类导出（可选）
export { GaugeLayoutCalculator } from './core/GaugeLayout';
export { GaugeRenderer } from './core/GaugeRenderer';
