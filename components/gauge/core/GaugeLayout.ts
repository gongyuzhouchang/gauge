/**
 * 仪表盘布局计算器
 * 负责计算各个元素的位置和尺寸
 */

import { scaleLinear, type ScaleLinear } from '../utils/d3-imports';
import type { GaugeConfig } from '../types/config';
import type { GaugeLayout, TickData, SegmentData } from '../types/data';

export class GaugeLayoutCalculator {
  private config: GaugeConfig;

  private layout: GaugeLayout;

  // D3比例尺 - 核心概念讲解
  private angleScale: ScaleLinear<number, number>;

  constructor(config: GaugeConfig) {
    this.config = config;
    this.layout = this.calculateBaseLayout();

    /**
     * D3比例尺详解：
     * 比例尺(Scale)是D3的核心概念之一，用于将数据域映射到视觉域
     *
     * scaleLinear(): 创建线性比例尺
     * - domain(): 设置输入域(数据范围)
     * - range(): 设置输出域(像素/角度范围)
     *
     * 在仪表盘中，我们需要将数值(0-100)映射到角度(π到0)
     * 为什么是π到0？因为SVG坐标系中：
     * - π弧度 = 180度 = 左侧
     * - 0弧度 = 0度 = 右侧
     * 这样数值从小到大，指针从左到右移动
     *
     * 最终修正：根据用户反馈和原始实现，正确的上半圆坐标系
     * 应该是从左侧(-180°)到顶部(-90°)再到右侧(0°)。
     * 对应的角度范围是 [-Math.PI, 0]。
     */
    this.angleScale = scaleLinear()
      .domain([this.config.range.min, this.config.range.max])
      .range([0, Math.PI]);
  }

  /**
   * 计算基础布局
   * 这个方法确定仪表盘的基本几何参数
   */
  private calculateBaseLayout(): GaugeLayout {
    const { width, height, gauge, background, layout } = this.config;

    // 计算中心点
    const centerX = width / 2;
    const centerY = height * layout.centerYRatio;

    // 计算基础半径
    // 这个算法确保仪表盘在不同尺寸容器中都能合适显示
    const baseRadius =
      Math.min(width, height * layout.baseRadiusRatio.minHeightRatio) /
      layout.baseRadiusRatio.divider;

    // 计算各层的半径
    const gaugeOuterRadius = baseRadius * gauge.outerRadiusRatio;
    const gaugeInnerRadius = baseRadius * gauge.innerRadiusRatio;
    const backgroundOuterRadius = baseRadius * background.outerRadiusRatio;
    const backgroundInnerRadius = baseRadius * background.innerRadiusRatio;

    return {
      centerX,
      centerY,
      baseRadius,
      gauge: {
        outerRadius: gaugeOuterRadius,
        innerRadius: gaugeInnerRadius,
        thickness: gaugeOuterRadius - gaugeInnerRadius
      },
      background: {
        outerRadius: backgroundOuterRadius,
        innerRadius: backgroundInnerRadius,
        thickness: backgroundOuterRadius - backgroundInnerRadius
      }
    };
  }

  /**
   * 计算数据段的角度信息
   * 将每个数据段转换为SVG可用的角度数据
   */
  public calculateSegments(): SegmentData[] {
    return this.config.segments.map(segment => ({
      ...segment,
      value: (segment.min + segment.max) / 2,
      startAngle: this.angleScale(segment.min),
      endAngle: this.angleScale(segment.max)
    }));
  }

  /**
   * 计算刻度数据
   * 生成刻度线的位置和标签信息
   */
  public calculateTicks(): TickData[] {
    const { ticks, range } = this.config;
    console.log('ticks: ', ticks);
    // 修改条件：只要刻度线显示或标签显示，就生成刻度数据
    if (!ticks.show && !ticks.label.show) {
      return [];
    }

    const tickData: TickData[] = [];
    const { centerX, centerY, gauge } = this.layout;
    const endRadius = gauge.outerRadius;

    for (let i = 0; i <= ticks.count; i++) {
      // 计算当前刻度的数值
      const value = range.min + (i / ticks.count) * (range.max - range.min);

      // 使用比例尺计算角度
      const angle = this.angleScale(value);

      // 判断是否为主刻度
      const isMain = i % ticks.mainTickEvery === 0;

      // 计算刻度长度
      const tickLength = isMain ? ticks.mainLength : ticks.length;

      // 计算刻度线的起点和终点坐标
      // 这里使用了三角函数将极坐标转换为直角坐标
      const startRadius = endRadius - tickLength;

      let labelX;
      let labelY;
      if (isMain && ticks.label.show) {
        if (ticks.label.position === 'inner') {
          // inner位置：保持环形布局，但投影到内圆下方区域
          // 使用与其他元素一致的角度变换
          const adjustedAngleForInner = angle - Math.PI;
          const baseRadius = gauge.innerRadius * 0.6; // 内圆下方的半径
          const offsetY = gauge.innerRadius * 0.1; // 向下偏移

          labelX = Math.cos(adjustedAngleForInner) * baseRadius;
          labelY = Math.sin(adjustedAngleForInner) * baseRadius;
        } else {
          // outer位置：保持原有的圆弧分布
          const labelRadius = endRadius + ticks.label.offset;
          labelX = Math.cos(angle) * labelRadius;
          labelY = Math.sin(angle) * labelRadius;
        }
      }

      // 为了与D3 arc生成器保持一致，需要调整手动坐标计算的角度
      // angleScale输出[0,π]，但配合rotate(-90)后，需要转换为正确的刻度位置
      const adjustedAngle = angle - Math.PI / 2;

      let adjustedLabelX;
      let adjustedLabelY;
      if (labelX !== undefined && labelY !== undefined) {
        if (ticks.label.position === 'inner') {
          // inner位置：使用直接计算的坐标，不需要旋转变换
          adjustedLabelX = labelX;
          adjustedLabelY = labelY;
        } else {
          // outer位置：保持原有计算方式
          adjustedLabelX = Math.cos(adjustedAngle) * (endRadius + ticks.label.offset);
          adjustedLabelY = Math.sin(adjustedAngle) * (endRadius + ticks.label.offset);
        }
      }

      tickData.push({
        value,
        angle: adjustedAngle, // 使用调整后的角度
        isMain,
        // 使用调整后的角度计算坐标，使其与segments对齐
        x: Math.cos(adjustedAngle) * endRadius,
        y: Math.sin(adjustedAngle) * endRadius,
        labelX: adjustedLabelX,
        labelY: adjustedLabelY
      });
    }

    console.log('tickData: ', tickData);
    return tickData;
  }

  /**
   * 将数值转换为角度
   * 这是一个便捷方法，对外暴露比例尺功能
   */
  public valueToAngle(value: number): number {
    return this.angleScale(value);
  }

  /**
   * 计算指针的坐标
   */
  public calculatePointerPosition(value: number): { x: number; y: number; angle: number } {
    const angle = this.valueToAngle(value);
    const { centerX, centerY, gauge } = this.layout;
    const pointerLength = gauge.innerRadius * this.config.pointer.length;

    const normalizedRatio = angle / Math.PI - 1;
    const angleDeg = normalizedRatio * 180;

    return {
      x: centerX + Math.cos(angle) * pointerLength,
      y: centerY + Math.sin(angle) * pointerLength,
      angle: angleDeg
    };
  }

  /**
   * 更新配置并重新计算布局
   */
  public updateConfig(newConfig: GaugeConfig): void {
    this.config = newConfig;
    this.layout = this.calculateBaseLayout();
    this.angleScale.domain([newConfig.range.min, newConfig.range.max]).range([0, Math.PI]);
  }

  /**
   * 获取当前布局
   */
  public getLayout(): GaugeLayout {
    return this.layout;
  }

  /**
   * 获取配置
   */
  public getConfig(): GaugeConfig {
    return this.config;
  }
}
