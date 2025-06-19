/**
 * 柱状图事件类型定义
 */

import type { BarChartData } from './data';

export interface BarChartEvents {
    // 数据相关
    'dataChanged': (data: BarChartData[]) => void;
    
    // 交互相关
    'barClick': (data: BarChartData, index: number) => void;
    'barHover': (data: BarChartData, index: number) => void;
    'barHoverOut': (data: BarChartData, index: number) => void;
    'selectionChanged': (data: BarChartData | null, index: number | null) => void;
    
    // 生命周期
    'rendered': () => void;
    'resized': () => void;
    'destroyed': () => void;
    
    // 错误处理
    'error': (error: Error) => void;
} 