/**
 * 柱状图布局计算
 */

import * as d3 from 'd3';
import type { BarChartConfig } from './types/config';
import type { BarChartData, BarLayoutItem, LayoutResult } from './types/data';
import { createXScale, createYScale, calculateAxisTicks } from './utils/scale';

export class BarChartLayout {
    private xScale: d3.ScaleBand<string>;
    private yScale: d3.ScaleLinear<number, number>;

    constructor() {
        this.xScale = d3.scaleBand();
        this.yScale = d3.scaleLinear();
    }

    /**
     * 计算布局
     */
    public calculate(data: BarChartData[], config: BarChartConfig): LayoutResult {
        // 创建比例尺
        this.xScale = createXScale(data, config);
        this.yScale = createYScale(data, config);

        return {
            bars: this.calculateBars(data),
            axes: this.calculateAxes(config)
        };
    }

    /**
     * 计算柱子布局
     */
    private calculateBars(data: BarChartData[]): BarLayoutItem[] {
        return data.map(d => ({
            x: this.xScale(d.name) || 0,
            y: this.yScale(d.value),
            width: this.xScale.bandwidth(),
            height: this.yScale(0) - this.yScale(d.value),
            data: d
        }));
    }

    /**
     * 计算坐标轴布局
     */
    private calculateAxes(config: BarChartConfig) {
        return {
            xAxis: {
                ticks: calculateAxisTicks(this.xScale, config, false)
            },
            yAxis: {
                ticks: calculateAxisTicks(this.yScale, config, true)
            }
        };
    }

    /**
     * 获取X轴比例尺
     */
    public getXScale(): d3.ScaleBand<string> {
        return this.xScale;
    }

    /**
     * 获取Y轴比例尺
     */
    public getYScale(): d3.ScaleLinear<number, number> {
        return this.yScale;
    }
} 