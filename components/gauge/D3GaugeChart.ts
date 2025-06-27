/**
 * D3仪表盘主控制器
 * 整合布局、渲染和动画，对外提供接口
 */

import { merge } from 'lodash-es';
import { select, Selection } from './utils/d3-imports';
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
      .attr('class', 'd3-gauge-chart')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
  }

  private _initialRender(): void {
    if (!this.data) {
      return;
    }

    this.renderer.clear();
    const newLayout = this.layoutCalculator.getLayout();
    this.renderer.update(this.config, newLayout);

    const segments = this.layoutCalculator.calculateSegments();
    const ticks = this.layoutCalculator.calculateTicks();
    const { angle } = this.layoutCalculator.calculatePointerPosition(this.data.value);

    this.renderer.renderBackground();
    this.renderer.renderGaugeBase();
    this.renderer.renderSegments(segments);
    this.renderer.renderTicks(ticks);
    this.renderer.renderEndLabels();
    this.renderer.renderPointer(this.data.value, angle);
    this.renderer.renderValueText(this.data.value, this.data.label || '');
  }

  private _updateDynamicElements(value: number): void {
    if (!this.data) {
      return;
    }
    const { angle } = this.layoutCalculator.calculatePointerPosition(value);
    this.renderer.updatePointer(angle);
    this.renderer.updateValueText(value, this.data.label || '');
  }

  public setData(data: GaugeData): this {
    this.data = data;
    this._initialRender();
    return this;
  }

  public setValue(value: number): this {
    if (this.data) {
      this.data.value = value;
      this._updateDynamicElements(value);
    } else {
      this.setData({ value });
    }
    return this;
  }

  public updateConfig(newConfig: Partial<GaugeConfig>): this {
    this.config = merge({}, this.config, newConfig);
    this.layoutCalculator.updateConfig(this.config);
    this.svg.attr('width', this.config.width).attr('height', this.config.height);
    // Re-render completely on config change
    this._initialRender();
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

  public destroy(): void {
    this.svg.remove();
  }
}
