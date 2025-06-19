/**
 * 柱状图视图渲染
 */

import * as zrender from 'zrender';
import { Group, Line, Rect, Text, ElementEvent } from 'zrender';
import { View } from '../base/core/View';
import type { BarChartConfig } from './types/config';
import type { BarLayoutItem, LayoutResult } from './types/data';
import { getBarStyle, getAxisStyle, getAxisLabelStyle } from './utils/style';
import { createBarAnimation, getEasing } from './utils/animation';
import type { BaseOptions, RenderData, ContainerElement } from '../base/types/core';

interface BarChartRenderData extends RenderData {
    layout: LayoutResult;
    config: BarChartConfig;
}

export class BarChartView extends View {
    protected zr!: ReturnType<typeof zrender.init>;
    protected barGroup!: Group;
    protected axisGroup!: Group;
    private bars: Rect[] = [];
    private isFirstRender: boolean = true;

    constructor(container: ContainerElement, options: BarChartConfig) {
        super(container, options as BaseOptions);
        super.init()
    }

    /**
     * 初始化渲染器
     */
    protected initRenderer(): void {
        try {
            // 初始化ZRender实例
            const zr = zrender.init(this.container, {
                width: this.container.clientWidth,
                height: this.container.clientHeight
            });
            if (!zr) {
                throw new Error('Failed to initialize ZRender');
            }

            // 初始化分组
            const barGroup = new Group();
            const axisGroup = new Group();

            // 添加分组到ZRender实例
            zr.add(axisGroup);
            zr.add(barGroup);

            // 设置实例变量
            this.zr = zr;
            this.barGroup = barGroup;
            this.axisGroup = axisGroup;
        } catch (error) {
            console.error('Failed to initialize renderer:', error);
            throw error;
        }
    }

    /**
     * 绑定交互事件
     */
    protected bindInteractionEvents(): void {
        if (!this.barGroup) {
            console.warn('Bar group is not initialized');
            return;
        }

        this.barGroup.on('mouseover', (e: ElementEvent) => {
            const targetRect = e.target as Rect;
            const index = this.bars.indexOf(targetRect);
            if (index !== -1) {
                this.handleInteraction('barHover', { index, event: e });
            }
        });

        this.barGroup.on('mouseout', (e: ElementEvent) => {
            const targetRect = e.target as Rect;
            const index = this.bars.indexOf(targetRect);
            if (index !== -1) {
                this.handleInteraction('barHoverOut', { index, event: e });
            }
        });

        this.barGroup.on('click', (e: ElementEvent) => {
            const targetRect = e.target as Rect;
            const index = this.bars.indexOf(targetRect);
            if (index !== -1) {
                this.handleInteraction('barClick', { index, event: e });
            }
        });
    }

    /**
     * 执行渲染
     */
    protected doRender(data: BarChartRenderData): void {
        if (!this.isInitialized() || !this.zr || !this.barGroup || !this.axisGroup) {
            console.warn('View is not initialized yet');
            return;
        }
        // 清空现有内容，但保持分组结构
        this.clearContent();

        // 渲染内容
        this.renderAxes(data.layout.axes, data.config);
        this.renderBars(data.layout.bars, data.config);
        
        if (this.isFirstRender) {
            this.isFirstRender = false;
        }
    }

    /**
     * 清空内容但保持分组结构
     */
    private clearContent(): void {
        // 清空柱子数组
        this.bars = [];

        // 清空分组内容
        if (this.barGroup && this.axisGroup) {
            const barGroup = this.barGroup;
            const axisGroup = this.axisGroup;
            barGroup.removeAll();
            axisGroup.removeAll();
        }
    }

    /**
     * 渲染柱子
     */
    private renderBars(bars: BarLayoutItem[], config: BarChartConfig): void {
        const barGroup = this.barGroup;
        bars.forEach((bar, index) => {
            const rect = new Rect({
                shape: {
                    x: bar.x,
                    y: bar.y,
                    width: bar.width,
                    height: 0  // 初始高度为0，用于动画
                },
                style: getBarStyle(bar.data, config)
            });

            if (this.isFirstRender) {
                // 仅在首次渲染时执行动画
                createBarAnimation(
                    0,
                    bar.height,
                    config.animation.duration,
                    getEasing(config),
                    (height) => {
                        rect.shape.height = height;
                        rect.dirty();
                    }
                );
            } else {
                rect.shape.height = bar.height;
            }

            barGroup.add(rect);
            this.bars.push(rect);
        });
    }

    /**
     * 渲染坐标轴
     */
    private renderAxes(axes: any, config: BarChartConfig): void {
        const axisStyle = getAxisStyle();
        const labelStyle = getAxisLabelStyle();

        // 渲染X轴
        if (config.xAxis.show) {
            const xAxis = new Line({
                shape: {
                    x1: config.padding.left,
                    y1: config.height - config.padding.bottom,
                    x2: config.width - config.padding.right,
                    y2: config.height - config.padding.bottom
                },
                style: axisStyle
            });
            this.axisGroup.add(xAxis);

            // 渲染X轴刻度和标签
            axes.xAxis.ticks.forEach((tick: any) => {
                const tickLine = new Line({
                    shape: {
                        x1: tick.position + (config.xAxis.tickSize / 2),
                        y1: config.height - config.padding.bottom,
                        x2: tick.position + (config.xAxis.tickSize / 2),
                        y2: config.height - config.padding.bottom + config.xAxis.tickSize
                    },
                    style: axisStyle
                });

                const label = new Text({
                    style: {
                        ...labelStyle,
                        text: String(tick.value),
                        x: tick.position + (config.xAxis.tickSize / 2),
                        y: config.height - config.padding.bottom + config.xAxis.tickSize + config.xAxis.tickPadding
                    }
                });

                this.axisGroup.add(tickLine);
                this.axisGroup.add(label);
            });
        }

        // 渲染Y轴
        if (config.yAxis.show) {
            const yAxis = new Line({
                shape: {
                    x1: config.padding.left,
                    y1: config.padding.top,
                    x2: config.padding.left,
                    y2: config.height - config.padding.bottom
                },
                style: axisStyle
            });
            this.axisGroup.add(yAxis);

            // 渲染Y轴刻度和标签
            axes.yAxis.ticks.forEach((tick: any) => {
                const tickLine = new Line({
                    shape: {
                        x1: config.padding.left - config.yAxis.tickSize,
                        y1: tick.position,
                        x2: config.padding.left,
                        y2: tick.position
                    },
                    style: axisStyle
                });

                const label = new Text({
                    style: {
                        ...labelStyle,
                        text: String(tick.value),
                        x: config.padding.left - config.yAxis.tickSize - config.yAxis.tickPadding,
                        y: tick.position,
                        align: 'right'
                    }
                });

                this.axisGroup.add(tickLine);
                this.axisGroup.add(label);
            });
        }
    }

    /**
     * 执行清空
     */
    protected doClear(): void {
        if (!this.isInitialized()) {
            console.warn('View is not initialized yet');
            return;
        }

        this.clearContent();
    }

    /**
     * 更新柱子样式
     */
    public updateBarStyle(index: number, style: any): void {
        const bar = this.bars[index];
        if (bar) {
            bar.setStyle(style);
        }
    }

    /**
     * 调整大小
     */
    protected doResize(): void {
        const { width, height } = this.container.getBoundingClientRect();
        this.zr.resize({ width, height });
    }

    /**
     * 清理渲染器
     */
    protected cleanupRenderer(): void {
        try {
            this.clearContent();

            // 销毁ZRender实例
            if (this.zr) {
                this.zr.dispose();
                this.zr = undefined as any;
            }

            // 清空引用
            this.barGroup = undefined as any;
            this.axisGroup = undefined as any;
        } catch (error) {
            console.error('Failed to cleanup renderer:', error);
        }
    }

    /**
     * 解绑事件
     */
    protected unbindInteractionEvents(): void {
        try {
            if (this.barGroup && typeof this.barGroup.off === 'function') {
                this.barGroup.off('mouseover');
                this.barGroup.off('mouseout');
                this.barGroup.off('click');
            }
        } catch (error) {
            console.error('Failed to unbind events:', error);
        }
    }
} 