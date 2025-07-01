// 开发模式专用导出文件 - 支持热更新
export { D3GaugeChart } from './D3GaugeChart';
export type { GaugeData } from './types/data';
export type { GaugeConfig } from './types/config';

// 开发时的调试工具
export const createDebugGauge = async (container: HTMLElement, debugOptions = {}) => {
  const { D3GaugeChart } = await import('./D3GaugeChart');

  const defaultConfig = {
    width: 400,
    height: 300,
    segments: [
      { min: 0, max: 25, color: '#ff4444', label: 'Debug 1' },
      { min: 25, max: 50, color: '#ff8844', label: 'Debug 2' },
      { min: 50, max: 75, color: '#88cc44', label: 'Debug 3' },
      { min: 75, max: 100, color: '#44ff44', label: 'Debug 4' }
    ],
    ...debugOptions
  };

  const gauge = new D3GaugeChart(container, defaultConfig);

  // 开发时的调试方法
  (window as any).__debugGauge = gauge;
  console.log('🔧 调试仪表盘已创建，可通过 window.__debugGauge 访问');

  return gauge;
};
