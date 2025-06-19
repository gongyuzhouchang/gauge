/**
 * 柱状图配置类型定义
 */

export interface BarChartConfig {
    // 容器配置
    width: number;          // 图表宽度
    height: number;         // 图表高度
    padding: {              // 内边距
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    
    // 柱子样式
    bar: {
        fill: string;         // 填充色
        stroke: string;       // 边框色
        strokeWidth: number;  // 边框宽度
        cornerRadius: number; // 圆角
        opacity: number;      // 透明度
    };
    
    // 交互样式
    hover: {
        fill: string;         // 悬停填充色
        opacity: number;      // 悬停透明度
    };
    
    selected: {
        fill: string;         // 选中填充色
        stroke: string;       // 选中边框色
        strokeWidth: number;  // 选中边框宽度
    };
    
    // 坐标轴配置
    xAxis: {
        show: boolean;        // 是否显示
        tickSize: number;     // 刻度大小
        tickPadding: number;  // 刻度间距
    };
    
    yAxis: {
        show: boolean;        // 是否显示
        tickSize: number;     // 刻度大小
        tickPadding: number;  // 刻度间距
    };
    
    // 动画配置
    animation: {
        duration: number;     // 动画时长
        easing: string;       // 缓动函数
    };
}

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: BarChartConfig = {
    width: 400,
    height: 300,
    padding: {
        top: 20,
        right: 20,
        bottom: 40,
        left: 60
    },
    bar: {
        fill: '#5470c6',
        stroke: 'none',
        strokeWidth: 0,
        cornerRadius: 0,
        opacity: 1
    },
    hover: {
        fill: '#91cc75',
        opacity: 0.8
    },
    selected: {
        fill: '#fac858',
        stroke: '#ee6666',
        strokeWidth: 2
    },
    xAxis: {
        show: true,
        tickSize: 6,
        tickPadding: 3
    },
    yAxis: {
        show: true,
        tickSize: 6,
        tickPadding: 3
    },
    animation: {
        duration: 1000,
        easing: 'cubicOut'
    }
}; 