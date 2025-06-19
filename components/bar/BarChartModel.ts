/**
 * 柱状图数据模型
 */

import { Eventful } from '../base/core/Eventful';
import { DEFAULT_CONFIG, type BarChartConfig } from './types/config';
import type { BarChartData } from './types/data';

export class BarChartModel extends Eventful {
    private data: BarChartData[] = [];
    private options: BarChartConfig;
    private selectedIndex: number | null = null;
    private hoveredIndex: number | null = null;

    constructor(options: Partial<BarChartConfig>) {
        super();
        this.options = this.validateOptions(options);
    }

    /**
     * 验证并合并配置项
     */
    private validateOptions(options: Partial<BarChartConfig>): BarChartConfig {
        return {
            ...DEFAULT_CONFIG,
            ...options
        };
    }

    /**
     * 验证数据
     */
    private validateData(data: unknown): BarChartData[] {
        if (!Array.isArray(data)) {
            throw new Error('Data must be an array');
        }

        return data.map((item, index) => {
            if (!item || typeof item !== 'object') {
                throw new Error('Each data item must be an object');
            }

            return {
                name: String(item.name || `Item ${index}`),
                value: Number(item.value || 0),
                id: item.id || index,
                color: item.color
            };
        });
    }

    /**
     * 设置数据
     */
    public setData(data: BarChartData[]): void {
        this.data = this.validateData(data);
        this.selectedIndex = null;
        this.hoveredIndex = null;
        this.emit('dataChanged', this.data);
    }

    /**
     * 获取数据
     */
    public getData(): BarChartData[] {
        return this.data;
    }

    /**
     * 设置配置项
     */
    public setOptions(options: Partial<BarChartConfig>): void {
        const oldOptions = { ...this.options };
        this.options = this.validateOptions({ ...this.options, ...options });
        this.emit('optionsChanged', this.options, oldOptions);
    }

    /**
     * 获取配置项
     */
    public getOptions(): BarChartConfig {
        return { ...this.options };
    }

    /**
     * 设置选中状态
     */
    public setSelected(index: number | null): void {
        if (this.selectedIndex !== index) {
            const oldIndex = this.selectedIndex;
            this.selectedIndex = index;
            this.emit('selectionChanged', 
                index !== null ? this.data[index] : null,
                index,
                oldIndex !== null ? this.data[oldIndex] : null,
                oldIndex
            );
        }
    }

    /**
     * 获取选中状态
     */
    public getSelected(): { data: BarChartData | null; index: number | null } {
        return {
            data: this.selectedIndex !== null ? this.data[this.selectedIndex] : null,
            index: this.selectedIndex
        };
    }

    /**
     * 设置悬停状态
     */
    public setHovered(index: number | null): void {
        if (this.hoveredIndex !== index) {
            const oldIndex = this.hoveredIndex;
            this.hoveredIndex = index;
            this.emit('hoverChanged',
                index !== null ? this.data[index] : null,
                index,
                oldIndex !== null ? this.data[oldIndex] : null,
                oldIndex
            );
        }
    }

    /**
     * 获取悬停状态
     */
    public getHovered(): { data: BarChartData | null; index: number | null } {
        return {
            data: this.hoveredIndex !== null ? this.data[this.hoveredIndex] : null,
            index: this.hoveredIndex
        };
    }

    /**
     * 清空数据
     */
    public clear(): void {
        this.data = [];
        this.selectedIndex = null;
        this.hoveredIndex = null;
        this.emit('cleared');
    }

    /**
     * 销毁
     */
    public destroy(): void {
        this.clear();
        this.off('*');
    }
} 