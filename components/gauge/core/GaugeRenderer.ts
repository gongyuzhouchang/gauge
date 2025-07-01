/**
 * D3仪表盘渲染器
 * 负责将布局计算结果渲染为SVG元素
 */

import type { DefaultArcObject } from 'd3-shape';
import { select, arc, interpolate, Selection, type BaseType } from '../utils/d3-imports';
import { GaugeAnimator } from './GaugeAnimator';
import type { GaugeConfig } from '../types/config';
import type { GaugeLayout, SegmentData, TickData } from '../types/data';

export class GaugeRenderer {
  private svg: Selection<SVGSVGElement, unknown, null, undefined>;

  private config: GaugeConfig;

  private layout: GaugeLayout;

  private animator: GaugeAnimator;

  // D3选择集 - 用于存放各个部分的SVG分组
  private backgroundGroup!: Selection<SVGGElement, unknown, null, undefined>;

  private gaugeGroup!: Selection<SVGGElement, unknown, null, undefined>;

  private pointerGroup!: Selection<SVGGElement, unknown, null, undefined>;

  private labelsGroup!: Selection<SVGGElement, unknown, null, undefined>;

  private pointerLine!: Selection<SVGLineElement, number, SVGGElement, unknown>;

  private pointerImage!: Selection<SVGImageElement, number, SVGGElement, unknown>;

  // 常量定义
  private static readonly STROKE_COLOR = '#fff';

  private static readonly STROKE_WIDTH = 2;

  private static readonly TEXT_ANCHOR_MIDDLE = 'middle';

  private static readonly DOMINANT_BASELINE_MIDDLE = 'middle';

  private static readonly TICK_LABEL_CLASS = 'text.tick-label';

  private static readonly ANGLE_OFFSET = 90;

  private static readonly ROTATE_BASE_ANGLE = -90;

  /** 公用二分因子，替代除以2的魔法数字 */
  private static readonly HALF_DIVISOR = 2;

  /**
   * D3 选择集 (Selection) 详解:
   *
   * D3的核心是数据驱动。选择集是D3操作DOM的桥梁，它是一个或多个DOM元素的封装对象。
   * 与jQuery对象类似，但D3的选择集有更强大的数据绑定能力。
   *
   * select(container): 选择第一个匹配的元素，这里我们选择传入的SVG容器。
   * selection.append('g'): 在选择集中的每个元素下追加一个新的子元素（这里是<g>分组元素）。
   * selection.attr('class', '...'): 为选择集中的元素设置属性。
   */
  constructor(
    svg: Selection<SVGSVGElement, unknown, null, undefined>,
    config: GaugeConfig,
    layout: GaugeLayout
  ) {
    this.svg = svg;
    this.config = config;
    this.layout = layout;
    this.animator = new GaugeAnimator(config);

    this.initSvgGroups();
  }

  /**
   * 初始化SVG分组结构
   * 使用<g>元素将图表的不同部分分组，便于管理和渲染
   */
  private initSvgGroups(): void {
    // 设置变换，将(0,0)原点移动到仪表盘中心
    const baseTransform = `translate(${this.layout.centerX}, ${this.layout.centerY})`;
    // 为仪表盘主体和标签应用-90度旋转，以创建上半圆效果
    const rotatedTransform = `${baseTransform} rotate(${GaugeRenderer.ROTATE_BASE_ANGLE})`;

    // 使用旋转
    this.backgroundGroup = this.svg
      .append('g')
      .attr('class', 'gauge-background')
      .attr('transform', rotatedTransform);
    // 使用旋转
    this.gaugeGroup = this.svg
      .append('g')
      .attr('class', 'gauge-main')
      .attr('transform', rotatedTransform);
    // 指针组回到基础变换，只有translate
    this.pointerGroup = this.svg
      .append('g')
      .attr('class', 'gauge-pointer')
      .attr('transform', baseTransform);
    // 使用旋转
    this.labelsGroup = this.svg
      .append('g')
      .attr('class', 'gauge-labels')
      .attr('transform', rotatedTransform);
  }

  /**
   * 渲染背景
   */
  public renderBackground(): void {
    const { background } = this.config;
    if (!background.show) {
      return;
    }

    // 使用与segments相同的角度范围，保持一致性
    const backgroundArc = arc()
      .innerRadius(this.layout.background.innerRadius)
      .outerRadius(this.layout.background.outerRadius)
      .startAngle(0)
      .endAngle(Math.PI);

    // 使用预计算路径，移除 any
    const backgroundPath = backgroundArc({} as DefaultArcObject) ?? '';
    this.backgroundGroup
      .selectAll('path')
      .data([1])
      .join('path')
      .attr('d', backgroundPath)
      .attr('fill', background.color as string)
      .attr('opacity', background.opacity);
  }

  /**
   * 渲染仪表盘主环（作为数据段的底色）
   */
  public renderGaugeBase(): void {
    const { gauge } = this.config;
    if (!gauge.show) {
      return;
    }

    // 使用与segments相同的角度范围，保持一致性
    const gaugeArc = arc()
      .innerRadius(this.layout.gauge.innerRadius)
      .outerRadius(this.layout.gauge.outerRadius)
      .startAngle(0)
      .endAngle(Math.PI);

    // 使用预计算路径，移除 any
    const gaugePath = gaugeArc({} as DefaultArcObject) ?? '';
    this.gaugeGroup
      .selectAll('path.gauge-base')
      .data([1])
      .join('path')
      .attr('class', 'gauge-base')
      .attr('d', gaugePath)
      .attr('fill', gauge.color as string)
      .attr('opacity', gauge.opacity);
  }

  /**
   * D3 数据绑定 (Data-Binding) 与 arc生成器 详解:
   *
   * 这是D3最神奇的部分。
   * 1. segmentsGroup.selectAll('path'): 选择当前分组下所有的<path>元素（即使现在一个也没有）。
   * 2. .data(segments): 将数据(segments数组)绑定到选择集上。
   * 3. .enter(): 这是关键！它会识别出哪些数据项没有对应的DOM元素，并为这些"缺失"的元素创建一个占位符。
   * 4. .append('path'): 在这些占位符上创建新的<path>元素。
   *
   * 总结：D3根据数据自动创建、更新或删除DOM元素，我们只需声明式地描述数据和DOM的对应关系。
   *
   * d3.arc() - 弧形生成器:
   * 这是一个函数，调用它时传入特定格式的数据，它会返回一个SVG路径字符串(d属性的值)。
   * - .innerRadius() / .outerRadius(): 设置内外半径。
   * - .startAngle() / .endAngle(): 设置起始和结束角度。
   *
   * D3的魅力在于，我们可以将arc生成器直接传给.attr('d', ...)，D3会自动为每个数据点调用它。
   */
  public renderSegments(segments: SegmentData[]): void {
    const arcGenerator = arc<SegmentData>()
      .innerRadius(this.layout.gauge.innerRadius)
      .outerRadius(this.layout.gauge.outerRadius)
      .startAngle(d => d.startAngle)
      .endAngle(d => d.endAngle);

    this.gaugeGroup
      .selectAll('path.segment')
      .data(segments)
      .join('path')
      .attr('class', 'segment')
      .attr('d', arcGenerator)
      .attr('fill', d => d.color);

    // 添加分隔线，增强分段效果
    const separatorsData = segments.slice(1).map(d => d.startAngle);
    this.gaugeGroup
      .selectAll<SVGLineElement, number>('line.segment-separator')
      .data(separatorsData)
      .join('line')
      .attr('class', 'segment-separator')
      .attr('x1', angle => this.layout.gauge.innerRadius * Math.cos(angle))
      .attr('y1', angle => this.layout.gauge.innerRadius * Math.sin(angle))
      .attr('x2', angle => this.layout.gauge.outerRadius * Math.cos(angle))
      .attr('y2', angle => this.layout.gauge.outerRadius * Math.sin(angle))
      .attr('stroke', GaugeRenderer.STROKE_COLOR)
      .attr('stroke-width', GaugeRenderer.STROKE_WIDTH)
      .attr('transform', `rotate(${GaugeRenderer.ROTATE_BASE_ANGLE})`);
  }

  /**
   * 渲染刻度
   * 分别控制刻度线和标签的显示
   */
  public renderTicks(ticks: TickData[]): void {
    // 分别控制刻度线的渲染
    if (this.config.ticks.show) {
      // 渲染刻度线
      this.gaugeGroup
        .selectAll<SVGLineElement, TickData>('line.tick-line')
        .data(ticks)
        .join('line')
        .attr('class', 'tick-line')
        .attr('x1', d => d.x) // 直接使用预计算的坐标
        .attr('y1', d => d.y) // 直接使用预计算的坐标
        .attr('x2', d => {
          const tickLength = d.isMain ? this.config.ticks.mainLength : this.config.ticks.length;
          // 计算内端点：从外圆心向内缩进tickLength
          const innerRadius = this.layout.gauge.outerRadius - tickLength;
          return Math.cos(d.angle) * innerRadius;
        })
        .attr('y2', d => {
          const tickLength = d.isMain ? this.config.ticks.mainLength : this.config.ticks.length;
          // 计算内端点：从外圆心向内缩进tickLength
          const innerRadius = this.layout.gauge.outerRadius - tickLength;
          return Math.sin(d.angle) * innerRadius;
        })
        .attr('stroke', this.config.ticks.color)
        .attr('stroke-width', d =>
          d.isMain ? this.config.ticks.mainWidth : this.config.ticks.width
        );
    } else {
      // 如果刻度线不显示，清除所有刻度线
      this.gaugeGroup.selectAll<SVGLineElement, TickData>('line.tick-line').remove();
    }

    // 分别控制刻度标签的渲染
    if (this.config.ticks.label.show) {
      const tickLabels = ticks.filter(d => d.isMain && d.labelX !== undefined);

      if (this.config.ticks.label.position === 'inner') {
        // inner位置：渲染到主SVG，避免旋转变换影响，文字保持水平
        this.svg.selectAll<SVGTextElement, TickData>('text.tick-label').remove();
        this.svg
          .selectAll<SVGTextElement, TickData>('text.tick-label')
          .data(tickLabels)
          .join('text')
          .attr('class', 'tick-label')
          .attr('x', d => this.layout.centerX + d.labelX!)
          .attr('y', d => this.layout.centerY + d.labelY!)
          .attr('text-anchor', GaugeRenderer.TEXT_ANCHOR_MIDDLE)
          .attr('dominant-baseline', GaugeRenderer.DOMINANT_BASELINE_MIDDLE)
          .style('font-size', `${this.config.ticks.label.fontSize}px`)
          .style('font-family', this.config.ticks.label.fontFamily)
          .attr('fill', this.config.ticks.label.color)
          .text(d => d.value.toString());
      } else {
        // outer位置：渲染到gaugeGroup，跟随旋转
        this.svg.selectAll<SVGTextElement, TickData>('text.tick-label').remove();
        this.gaugeGroup
          .selectAll<SVGTextElement, TickData>('text.tick-label')
          .data(tickLabels)
          .join('text')
          .attr('class', 'tick-label')
          .attr('x', d => d.labelX!)
          .attr('y', d => d.labelY!)
          .attr('text-anchor', GaugeRenderer.TEXT_ANCHOR_MIDDLE)
          .attr('dominant-baseline', GaugeRenderer.DOMINANT_BASELINE_MIDDLE)
          .style('font-size', `${this.config.ticks.label.fontSize}px`)
          .style('font-family', this.config.ticks.label.fontFamily)
          .attr('fill', this.config.ticks.label.color)
          .text(d => d.value.toString());
      }
    } else {
      // 如果标签不显示，清除所有标签
      this.svg.selectAll<SVGTextElement, TickData>('text.tick-label').remove();
      this.gaugeGroup.selectAll<SVGTextElement, TickData>('text.tick-label').remove();
    }
  }

  /**
   * 渲染指针和中心圆
   */
  public renderPointer(value: number, angle: number): void {
    const { pointer, centerCircle } = this.config;

    // 强制清除旧的指针元素
    this.pointerGroup.selectAll('line.pointer').remove();
    this.pointerGroup.selectAll('image.pointer').remove();

    if (pointer.type === 'line') {
      // 渲染线条指针（原有逻辑）
      const pointerLength = this.layout.gauge.innerRadius * pointer.length;

      this.pointerLine = this.pointerGroup
        .selectAll<SVGLineElement, number>('line.pointer')
        .data([angle])
        .join('line')
        .attr('class', 'pointer')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', pointerLength)
        .attr('y2', 0)
        .attr('stroke', pointer.color)
        .attr('stroke-width', pointer.width)
        .attr('stroke-linecap', 'round')
        .attr('transform', d => `rotate(${d})`);

      // 渲染中心圆
      this.pointerGroup
        .selectAll('circle.center-circle')
        .data([1])
        .join('circle')
        .attr('class', 'center-circle')
        .attr('r', centerCircle.radius)
        .attr('fill', centerCircle.gradient.end)
        .attr('stroke', centerCircle.borderColor)
        .attr('stroke-width', centerCircle.lineWidth);

      // 添加阴影效果
      if (pointer.shadow.enable) {
        this.pointerLine.attr(
          'filter',
          'drop-shadow(' +
            `${pointer.shadow.offsetX}px ${pointer.shadow.offsetY}px ` +
            `${pointer.shadow.blur}px ${pointer.shadow.color})`
        );
      }
    } else if (pointer.type === 'image' && pointer.image.src) {
      // 渲染图片指针
      let offsetX;
      let offsetY;

      if (pointer.fromInnerEdge) {
        // 从内环边开始指向外环
        const { innerRadius } = this.layout.background;

        // 像线条指针一样：图片在未旋转坐标系中从内环边开始
        const innerOffsetY = innerRadius * Math.cos(Math.abs(GaugeRenderer.ANGLE_OFFSET + angle));
        const innerOffsetX = innerRadius * Math.sin(Math.abs(GaugeRenderer.ANGLE_OFFSET + angle));
        offsetX = innerOffsetX + pointer.image.offsetX;
        offsetY = -innerOffsetY + pointer.image.offsetY;
      } else {
        // 从中心开始（原有逻辑）
        // 根据pointer.length计算起点位置，与线条指针保持一致
        const pointerLength = this.layout.gauge.innerRadius * pointer.length;
        offsetX =
          pointerLength - pointer.image.width / GaugeRenderer.HALF_DIVISOR + pointer.image.offsetX;
        offsetY = -pointer.image.height / GaugeRenderer.HALF_DIVISOR + pointer.image.offsetY;
      }

      this.pointerImage = this.pointerGroup
        .selectAll<SVGImageElement, number>('image.pointer')
        .data([angle])
        .join('image')
        .attr('class', 'pointer')
        .attr('href', pointer.image.src)
        .attr('width', pointer.image.width)
        .attr('height', pointer.image.height)
        .attr('x', offsetX)
        .attr('y', offsetY)
        .attr('transform', d => `rotate(${d + GaugeRenderer.ANGLE_OFFSET})`);

      // 添加阴影效果
      if (pointer.shadow.enable) {
        this.pointerImage.attr(
          'filter',
          'drop-shadow(' +
            `${pointer.shadow.offsetX}px ${pointer.shadow.offsetY}px ` +
            `${pointer.shadow.blur}px ${pointer.shadow.color})`
        );
      }
    } else {
      /* no-op */
    }
  }

  public updatePointer(newAngle: number): void {
    const { pointer } = this.config;

    if (pointer.type === 'line' && this.pointerLine) {
      // 更新线条指针
      const transition = this.animator.getTransition(
        this.pointerLine as unknown as Selection<BaseType, unknown, null, undefined>
      );
      this.pointerLine.data([newAngle]);

      transition.attrTween('transform', (d, i, a) => {
        const element = select(a[i]);
        const currentTransform = element.attr('transform') || 'rotate(0)';
        const currentAngle = parseFloat(currentTransform.replace(/rotate\(|\)/g, ''));
        const interpolator = interpolate(currentAngle, d as number);

        return (t: number) => {
          const interpolatedAngle = interpolator(t);
          return `rotate(${interpolatedAngle})`;
        };
      });
    } else if (pointer.type === 'image' && this.pointerImage) {
      // 更新图片指针
      const transition = this.animator.getTransition(
        this.pointerImage as unknown as Selection<BaseType, unknown, null, undefined>
      );
      this.pointerImage.data([newAngle]);

      transition.attrTween('transform', (d, i, a) => {
        const element = select(a[i]);
        const currentTransform = element.attr('transform') || 'rotate(0)';
        const currentAngle = parseFloat(currentTransform.replace(/rotate\(|\)/g, ''));
        const targetAngle = (d as number) + GaugeRenderer.ANGLE_OFFSET;
        const interpolator = interpolate(currentAngle, targetAngle);

        return (t: number) => {
          const interpolatedAngle = interpolator(t);
          return `rotate(${interpolatedAngle})`;
        };
      });
    } else {
      /* no-op */
    }
  }

  /**
   * 获取指针的D3选择集
   */
  public getPointerSelection(): Selection<
    SVGLineElement | SVGImageElement,
    number,
    SVGGElement,
    unknown
  > {
    const { pointer } = this.config;

    if (pointer.type === 'line') {
      return this.pointerLine as any;
    }
    if (pointer.type === 'image') {
      return this.pointerImage as any;
    }

    // 返回空选择集作为后备
    return this.pointerGroup.selectAll('.pointer') as any;
  }

  /**
   * 清空所有元素
   */
  public clear(): void {
    this.svg.selectAll('*').remove();
  }

  /**
   * 更新配置和布局
   */
  public update(newConfig: GaugeConfig, newLayout: GaugeLayout): void {
    this.config = newConfig;
    this.layout = newLayout;

    // 清空并重新初始化
    this.clear();
    this.initSvgGroups();
  }

  /**
   * 渲染两端标签
   */
  public renderEndLabels(): void {
    const { labels, range } = this.config;
    if (!labels.show) {
      return;
    }

    const { centerX, centerY, gauge } = this.layout;

    // 计算标签距离中心的距离
    const labelRadius =
      labels.position === 'inner'
        ? gauge.innerRadius - labels.offset
        : gauge.outerRadius + labels.offset;

    // 清理旧标签，防止重复渲染
    this.svg.selectAll('text.horizontal-end-label').remove();
    this.svg.selectAll('text.end-label').remove();
    this.labelsGroup.selectAll('text').remove();

    // 计算水平放置的标签位置
    // 左侧标签位置（半圆左端）
    const leftLabelX = centerX - labelRadius;
    const leftLabelY = centerY + labels.offset;

    // 右侧标签位置（半圆右端）
    const rightLabelX = centerX + labelRadius;
    const rightLabelY = centerY + labels.offset;

    const labelData = [
      {
        value: range.min,
        text: labels.startLabel,
        x: leftLabelX,
        y: leftLabelY,
        anchor: 'end' as const
      },
      {
        value: range.max,
        text: labels.endLabel,
        x: rightLabelX,
        y: rightLabelY,
        anchor: 'start' as const
      }
    ];

    type LabelData = (typeof labelData)[number];

    // 直接添加到主SVG上，避免受到旋转变换的影响
    this.svg
      .selectAll<SVGTextElement, LabelData>('text.horizontal-end-label')
      .data(labelData)
      .join('text')
      .attr('class', 'horizontal-end-label')
      .attr('x', d => d.x)
      .attr('y', d => d.y)
      .attr('text-anchor', d => d.anchor)
      .attr('dominant-baseline', GaugeRenderer.DOMINANT_BASELINE_MIDDLE)
      .style('font-size', `${labels.fontSize}px`)
      .attr('fill', labels.color)
      .text(d => d.text);
  }

  /**
   * 渲染数值显示
   */
  public renderValueText(value: number, label: string): void {
    const { text, valueBox } = this.config;
    const { centerX, centerY } = this.layout;

    const valueGroup = this.svg
      .append('g')
      .attr('class', 'value-group')
      .attr('transform', `translate(${centerX}, ${centerY + valueBox.offsetY})`);

    // 数值
    valueGroup
      .append('text')
      .attr('class', 'value-text')
      .attr('text-anchor', GaugeRenderer.TEXT_ANCHOR_MIDDLE)
      .attr('dominant-baseline', GaugeRenderer.DOMINANT_BASELINE_MIDDLE)
      .style('font-size', `${text.fontSize}px`)
      .style('font-weight', text.fontWeight)
      .attr('fill', text.color)
      .text(value);

    // 标签
    if (label) {
      valueGroup
        .append('text')
        .attr('class', 'value-label')
        .attr('y', text.fontSize + valueBox.labelOffsetY)
        .attr('text-anchor', GaugeRenderer.TEXT_ANCHOR_MIDDLE)
        .attr('dominant-baseline', GaugeRenderer.DOMINANT_BASELINE_MIDDLE)
        .style('font-size', `${valueBox.font.size}px`)
        .attr('fill', this.getCurrentSegmentColor(value))
        .text(label);
    }
  }

  /**
   * 更新数值显示
   * 使用D3的.join()模式高效更新，而不是重新创建
   */
  public updateValueText(value: number, label: string): void {
    const valueGroup = this.svg.select<SVGGElement>('.value-group');

    // 更新数值
    valueGroup.select<SVGTextElement>('.value-text').text(value);

    // 更新标签
    valueGroup
      .select<SVGTextElement>('.value-label')
      .text(label)
      .attr('fill', this.getCurrentSegmentColor(value));
  }

  private getCurrentSegmentColor(value: number): string {
    const segment = this.config.segments.find(s => value >= s.min && value <= s.max);
    return segment ? segment.color : this.config.text.color;
  }

  /**
   * 根据数值获取对应区段的标签
   */
  public getCurrentSegmentLabel(value: number): string {
    const segment = this.config.segments.find(s => value >= s.min && value <= s.max);
    return segment ? segment.label : '';
  }
}
