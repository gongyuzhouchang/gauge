/**
 * D3仪表盘主控制器
 * 整合布局、渲染和动画，对外提供接口
 */

import { merge } from 'lodash-es';
import { select, type Selection } from './utils/d3-imports';
import { GaugeLayoutCalculator } from './core/GaugeLayout';
import { GaugeRenderer } from './core/GaugeRenderer';
import { DEFAULT_CONFIG, type GaugeConfig } from './types/config';
import type { GaugeData } from './types/data';

export class D3GaugeChart {
  private container: HTMLElement;

  private svg: Selection<SVGSVGElement, unknown, null, undefined>;

  private config: GaugeConfig;

  private data: GaugeData | null = null;

  private layoutCalculator: GaugeLayoutCalculator;

  private renderer: GaugeRenderer;

  // 常量定义
  private static readonly SVG_ATTRIBUTES = {
    CLASS: 'd3-gauge-chart',
    PRESERVE_ASPECT_RATIO: 'xMidYMid meet'
  } as const;

  constructor(container: HTMLElement, options?: Partial<GaugeConfig>) {
    this.container = container;
    this.config = merge({}, DEFAULT_CONFIG, options);
    this.svg = this.createSvgContainer();
    this.layoutCalculator = new GaugeLayoutCalculator(this.config);
    this.renderer = new GaugeRenderer(this.svg, this.config, this.layoutCalculator.getLayout());
  }

  private createSvgContainer(): Selection<SVGSVGElement, unknown, null, undefined> {
    const { width, height } = this.config;
    return select(this.container)
      .append('svg')
      .attr('class', D3GaugeChart.SVG_ATTRIBUTES.CLASS)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', D3GaugeChart.SVG_ATTRIBUTES.PRESERVE_ASPECT_RATIO);
  }

  private _initialRender(): void {
    if (!this.data) {
      throw new Error('No data available for rendering');
    }

    // 清空并重新渲染
    this.renderer.clear();
    const newLayout = this.layoutCalculator.getLayout();
    this.renderer.update(this.config, newLayout);

    // 计算渲染数据
    const segments = this.layoutCalculator.calculateSegments();
    const ticks = this.layoutCalculator.calculateTicks();
    const { angle } = this.layoutCalculator.calculatePointerPosition(this.data.value);

    // 渲染静态元素（背景、分段、刻度等）
    this.renderer.renderBackground();
    this.renderer.renderGaugeBase();
    this.renderer.renderSegments(segments);
    this.renderer.renderTicks(ticks);
    this.renderer.renderEndLabels();
    this.renderer.renderPointer(this.data.value, angle);

    // 初次创建valueBox DOM元素
    const currentLabel = this.renderer.getCurrentSegmentLabel(this.data.value);
    this.renderer.renderValueText(this.data.value, this.data.label || currentLabel);
  }

  private _updateDynamicElements(value: number): void {
    // 更新指针角度
    const { angle } = this.layoutCalculator.calculatePointerPosition(value);
    this.renderer.updatePointer(angle);

    // 获取当前数值对应的区段标签
    const currentLabel = this.renderer.getCurrentSegmentLabel(value);

    // 更新显示的数值（仅在DOM元素已存在时）
    this.renderer.updateValueText(value, this.data?.label || currentLabel);
  }

  public updateConfig(newConfig: Partial<GaugeConfig>): this {
    // 合并新配置
    this.config = merge({}, this.config, newConfig);

    // 更新所有组件
    this.layoutCalculator.updateConfig(this.config);
    this.renderer.update(this.config, this.layoutCalculator.getLayout());

    // 如果有数据，重新渲染
    if (this.data) {
      this._initialRender();
    }

    return this;
  }

  public setData(data: GaugeData): this {
    if (!this.isValidData(data)) {
      throw new Error('Invalid gauge data provided');
    }

    this.data = data;
    this._initialRender();
    return this;
  }

  public setValue(value: number): this {
    if (!this.isValidValue(value)) {
      throw new Error('Invalid value provided');
    }

    if (this.data) {
      this.data.value = value;
      this._updateDynamicElements(value);
    } else {
      this.setData({ value });
    }
    return this;
  }

  public resize(): void {
    const width = this.container.clientWidth;
    const height = width * (this.config.height / this.config.width);
    this.updateConfig({ width, height });
  }

  public getConfig(): GaugeConfig {
    return this.config;
  }

  public getData(): GaugeData | null {
    return this.data;
  }

  public destroy(): void {
    this.svg.remove();
  }

  /**
   * 验证数据是否有效
   */
  private isValidData(data: GaugeData): boolean {
    return data && this.isValidValue(data.value);
  }

  /**
   * 验证数值是否有效
   */
  private isValidValue(value: number): boolean {
    return (
      typeof value === 'number' &&
      !Number.isNaN(value) &&
      value >= this.config.range.min &&
      value <= this.config.range.max
    );
  }
}
