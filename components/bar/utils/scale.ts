/**
 * 比例尺工具函数
 */

import * as d3 from 'd3';
import type { BarChartData } from '../types/data';
import type { BarChartConfig } from '../types/config';

/**
 * 创建X轴比例尺
 */
export function createXScale(data: BarChartData[], config: BarChartConfig): d3.ScaleBand<string> {
    const { width, padding } = config;
    
    return d3.scaleBand()
        .domain(data.map(d => d.name))
        .range([padding.left, width - padding.right])
        .padding(0.1);
}

/**
 * 创建Y轴比例尺
 */
export function createYScale(data: BarChartData[], config: BarChartConfig): d3.ScaleLinear<number, number> {
    const { height, padding } = config;
    const maxValue = d3.max(data, d => d.value) || 0;
    
    return d3.scaleLinear()
        .domain([0, maxValue])
        .range([height - padding.bottom, padding.top])
        .nice();  // 优化刻度值
}

/**
 * 计算坐标轴刻度
 */
export function calculateAxisTicks(scale: d3.AxisScale<any>, config: BarChartConfig, isYAxis: boolean = false) {
    const ticks = isYAxis ? scale.ticks(5) : scale.domain();
    
    return ticks.map(tick => ({
        value: tick,
        position: isYAxis ? scale(tick) : (scale as d3.ScaleBand<string>)(tick as string)
    }));
} 