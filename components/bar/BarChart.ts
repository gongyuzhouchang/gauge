/**
 * 柱状图控制器
 */

import { Controller } from '../base/core/Controller';
import { BarChartModel } from './BarChartModel';
import { BarChartView } from './BarChartView';
import { BarChartLayout } from './BarChartLayout';
import type { BarChartConfig } from './types/config';
import type { BarChartData } from './types/data';
import { getBarStyle } from './utils/style';
import * as zr from 'zrender';
// zrender 渲染器需要注册
import CanvasPainter from 'zrender/lib/canvas/Painter.js';

zr.registerPainter('canvas', CanvasPainter)

export class BarChart extends Controller {
    protected declare model: BarChartModel;
    protected declare view: BarChartView;
    private layout!: BarChartLayout;

    constructor(container: HTMLElement, options?: Partial<BarChartConfig>) {
        super(container, options || {});
        this.createModules();
        this.bindInternalEvents();
    }

    /**
     * 创建模块
     */
    protected createModules(): void {
        this.model = new BarChartModel(this.options as BarChartConfig);
        this.view = new BarChartView(this.container, this.options as BarChartConfig);
        this.layout = new BarChartLayout();
    }

    /**
     * 绑定内部事件
     */
    protected bindInternalEvents(): void {
        // 数据变更事件
        this.model.on('dataChanged', () => {
            this.render();
        });

        // 配置变更事件
        this.model.on('optionsChanged', () => {
            this.render();
        });

        // 选中状态变更事件
        this.model.on('selectionChanged', (data: BarChartData | null, index: number | null) => {
            this.updateBarStyles();
            this.emit('selectionChanged', data, index);
        });

        // 悬停状态变更事件
        this.model.on('hoverChanged', (data: BarChartData | null, index: number | null) => {
            this.updateBarStyles();
            this.emit('hoverChanged', data, index);
        });

        // 柱子点击事件
        this.view.on('barClick', (index: number) => {
            const currentSelected = this.model.getSelected();
            if (currentSelected.index === index) {
                this.model.setSelected(null);
            } else {
                this.model.setSelected(index);
            }
            this.emit('barClick', this.model.getData()[index], index);
        });

        // 柱子悬停事件
        this.view.on('barHover', (index: number) => {
            this.model.setHovered(index);
            this.emit('barHover', this.model.getData()[index], index);
        });

        // 柱子移出事件
        this.view.on('barHoverOut', (index: number) => {
            this.model.setHovered(null);
            this.emit('barHoverOut', this.model.getData()[index], index);
        });
    }

    /**
     * 更新所有柱子样式
     */
    private updateBarStyles(): void {
        const selected = this.model.getSelected();
        const hovered = this.model.getHovered();
        const data = this.model.getData();
        const config = this.model.getOptions();

        data.forEach((item, index) => {
            const isSelected = index === selected.index;
            const isHovered = index === hovered.index;
            const style = getBarStyle(item, config, isHovered, isSelected);
            this.view.updateBarStyle(index, style);
        });
    }

    // /**
    //  * 设置数据
    //  */
    // public setData(data: BarChartData[]): void {
    //     this.model.setData(data);
    // }

    /**
     * 获取数据
     */
    public getData(): BarChartData[] {
        return this.model.getData();
    }

    /**
     * 更新配置
     */
    public updateOptions(options: Partial<BarChartConfig>): void {
        this.model.setOptions(options);
    }

    /**
     * 获取配置
     */
    public getOptions(): BarChartConfig {
        return this.model.getOptions();
    }

    /**
     * 渲染图表
     */
    public render(): void {
        const data = this.model.getData();
        const config = this.model.getOptions();
        const layout = this.layout.calculate(data, config);
        this.view.render({
            layout,
            config
        });
        this.updateBarStyles();
        this.emit('rendered');
    }

    /**
     * 调整大小
     */
    public resize(): void {
        this.view.resize();
        this.render();
        this.emit('resized');
    }

    /**
     * 清空图表
     */
    public clear(): void {
        this.model.clear();
        this.view.clear();
        this.emit('cleared');
    }

    /**
     * 销毁实例
     */
    public destroy(): void {
        this.model.destroy();
        this.view.destroy();
        this.emit('destroyed');
        this.off('*');
    }
} 