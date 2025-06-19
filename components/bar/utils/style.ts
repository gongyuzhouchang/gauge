/**
 * 样式工具函数
 */

import type { BarChartConfig } from '../types/config';
import type { BarChartData } from '../types/data';

/**
 * 获取柱子默认样式
 */
export function getBarDefaultStyle(config: BarChartConfig) {
    return {
        ...config.bar,
        cursor: 'pointer'
    };
}

/**
 * 获取柱子悬停样式
 */
export function getBarHoverStyle(config: BarChartConfig) {
    return {
        ...getBarDefaultStyle(config),
        ...config.hover
    };
}

/**
 * 获取柱子选中样式
 */
export function getBarSelectedStyle(config: BarChartConfig) {
    return {
        ...getBarDefaultStyle(config),
        ...config.selected
    };
}

/**
 * 获取柱子样式
 */
export function getBarStyle(
    data: BarChartData,
    config: BarChartConfig,
    isHovered: boolean = false,
    isSelected: boolean = false
) {
    if (isSelected) {
        return getBarSelectedStyle(config);
    }
    
    if (isHovered) {
        return getBarHoverStyle(config);
    }
    
    const style = getBarDefaultStyle(config);
    
    // 使用数据中的自定义颜色
    if (data.color) {
        style.fill = data.color;
    }
    
    return style;
}

/**
 * 获取坐标轴样式
 */
export function getAxisStyle() {
    return {
        stroke: '#333',
        lineWidth: 1
    };
}

/**
 * 获取坐标轴文本样式
 */
export function getAxisLabelStyle() {
    return {
        fontSize: 12,
        fill: '#666',
        textAlign: 'center' as const,
        textBaseline: 'middle' as const
    };
} 