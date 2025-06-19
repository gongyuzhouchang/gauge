/**
 * 柱状图数据类型定义
 */

export interface BarChartData {
    name: string;           // 类别名称
    value: number;          // 数值
    color?: string;         // 自定义颜色（可选）
    id?: string | number;   // 唯一标识（可选）
    [key: string]: any;     // 其他扩展字段
}

export type BarChartDataArray = BarChartData[];

/**
 * 布局计算结果类型
 */
export interface BarLayoutItem {
    x: number;             // 柱子x坐标
    y: number;             // 柱子y坐标
    width: number;         // 柱子宽度
    height: number;        // 柱子高度
    data: BarChartData;    // 原始数据
}

export interface LayoutResult {
    bars: BarLayoutItem[];  // 柱子布局数据
    axes: {
        xAxis: {
            ticks: Array<{
                value: string | number;
                position: number;
            }>;
        };
        yAxis: {
            ticks: Array<{
                value: number;
                position: number;
            }>;
        };
    };
} 