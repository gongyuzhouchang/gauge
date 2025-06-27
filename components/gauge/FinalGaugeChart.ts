/**
 * 最终版本的恐惧贪婪指数仪表盘
 * 合并了TestGauge的稳定实现和配置系统的灵活性
 */

// 内联配置类型，避免导入问题
export interface GaugeSegment {
  min: number;
  max: number;
  color: string;
  label: string;
}

// 合并所有配置项到一个接口
export interface GaugeConfig {
  width: number;
  height: number;
  range: { min: number; max: number };
  segments: GaugeSegment[];
  pointer: {
    length: number; // 0-1
    width: number;
    color: string;
    shadow: {
      offsetX: number;
      offsetY: number;
      blur: number;
      color: string;
    };
  };
  text: {
    fontSize: number;
    fontWeight: string;
    color: string;
  };
  labels: {
    show: boolean;
    fontSize: number;
    color: string;
    startLabel: string;
    endLabel: string;
    position: 'inner' | 'outer';
    offset: number;
    angleOffset: number;
  };
  ticks: {
    show: boolean;
    color: string;
    count: number;
    mainTickEvery: number;
    length: number;
    mainLength: number;
    width: number;
    mainWidth: number;
    label: {
      show: boolean;
      position: 'inner' | 'outer';
      fontSize: number;
      fontFamily: string;
      color: string;
      offset: number;
    };
  };
  // 仪表盘主体配置
  gauge: {
    show: boolean;
    // 支持单色或渐变色数组
    color: string | string[];
    // 外圆半径比例 (0-1)
    outerRadiusRatio: number;
    // 内圆半径比例 (0-1, 应小于outerRadiusRatio)
    innerRadiusRatio: number;
    border: {
      show: boolean;
      color: string;
      width: number;
    };
    // 透明度 (0-1)
    opacity: number;
  };
  // 真正的背景
  background: {
    show: boolean;
    // 背景颜色（单色或渐变）
    color: string | string[];
    // 背景外圆半径比例，通常 > gauge.outerRadiusRatio
    outerRadiusRatio: number;
    // 背景内圆半径比例，通常 < gauge.innerRadiusRatio
    innerRadiusRatio: number;
    border: {
      show: boolean;
      color: string;
      width: number;
    };
    // 背景透明度 (0-1)
    opacity: number;
  };
  layout: {
    centerYRatio: number;
    baseRadiusRatio: {
      minHeightRatio: number;
      divider: number;
    };
  };
  centerCircle: {
    radius: number;
    lineWidth: number;
    gradient: {
      start: string;
      end: string;
    };
    borderColor: string;
  };
  valueBox: {
    offsetY: number;
    paddingX: number;
    paddingY: number;
    bgColor: string;
    borderColor: string;
    borderWidth: number;
    labelOffsetY: number;
    font: {
      size: number;
      family: string;
    };
    paddingMultiplier: number;
  };
}

interface GaugeLayout {
  centerX: number;
  centerY: number;
  baseRadius: number;
  gauge: {
    outerRadius: number;
    innerRadius: number;
    thickness: number;
  };
  background: {
    outerRadius: number;
    innerRadius: number;
    thickness: number;
  };
}

export interface GaugeData {
  value: number;
  label?: string;
}

export class FinalGaugeChart {
  private canvas: HTMLCanvasElement;

  private ctx: CanvasRenderingContext2D;

  private config: GaugeConfig;

  private data: GaugeData | null = null;

  // 默认配置
  private static readonly DEFAULT_CONFIG: GaugeConfig = {
    width: 400,
    height: 300,
    range: { min: 0, max: 100 },
    segments: [
      { min: 0, max: 25, color: '#ff4444', label: 'Extreme Fear' },
      { min: 25, max: 45, color: '#ff8844', label: 'Fear' },
      { min: 45, max: 55, color: '#ffcc44', label: 'Neutral' },
      { min: 55, max: 75, color: '#88cc44', label: 'Greed' },
      { min: 75, max: 100, color: '#44ff44', label: 'Extreme Greed' }
    ],
    pointer: {
      length: 0.85,
      width: 4,
      color: '#333',
      shadow: {
        offsetX: 2,
        offsetY: 2,
        blur: 2,
        color: 'rgba(0, 0, 0, 0.2)'
      }
    },
    text: {
      fontSize: 36,
      fontWeight: 'bold',
      color: '#333'
    },
    labels: {
      show: true,
      fontSize: 12,
      color: '#888',
      startLabel: 'Extreme Fear',
      endLabel: 'Extreme Greed',
      position: 'inner',
      offset: 15,
      angleOffset: 0.05
    },
    ticks: {
      show: true,
      color: '#999',
      count: 10,
      mainTickEvery: 5,
      length: 4,
      mainLength: 8,
      width: 1,
      mainWidth: 2,
      label: {
        show: true,
        position: 'inner',
        fontSize: 10,
        fontFamily: 'Arial',
        color: '#666',
        offset: 15
      }
    },
    gauge: {
      show: true,
      color: '#f5f5f5',
      outerRadiusRatio: 1.0,
      innerRadiusRatio: 0.65,
      border: {
        show: true,
        color: '#ccc',
        width: 2
      },
      opacity: 1.0
    },
    background: {
      show: true,
      color: '#eeeeee',
      outerRadiusRatio: 1.2,
      innerRadiusRatio: 0.5,
      border: {
        show: false,
        color: '#ddd',
        width: 1
      },
      opacity: 0.6
    },
    layout: {
      centerYRatio: 0.65,
      baseRadiusRatio: {
        minHeightRatio: 1.2,
        divider: 3
      }
    },
    centerCircle: {
      radius: 12,
      lineWidth: 2,
      gradient: {
        start: '#666',
        end: '#333'
      },
      borderColor: '#222'
    },
    valueBox: {
      offsetY: 50,
      paddingX: 10,
      paddingY: 5,
      bgColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: '#ddd',
      borderWidth: 1,
      labelOffsetY: 5,
      font: {
        size: 16,
        family: 'Arial'
      },
      paddingMultiplier: 2
    }
  };

  private static readonly DEFAULT_LAYOUT_CONFIG = {
    centerYRatio: 0.65,
    baseRadiusRatio: {
      minHeightRatio: 1.2,
      divider: 3
    }
  };

  private static readonly DEFAULT_POINTER_CONFIG = {
    length: 0.85,
    width: 4,
    color: '#333',
    shadow: {
      offsetX: 2,
      offsetY: 2,
      blur: 2,
      color: 'rgba(0, 0, 0, 0.2)'
    }
  };

  private static readonly DEFAULT_CENTER_CIRCLE_CONFIG = {
    radius: 12,
    lineWidth: 2,
    gradient: {
      start: '#666',
      end: '#333'
    },
    borderColor: '#222'
  };

  private static readonly DEFAULT_VALUE_BOX_CONFIG = {
    offsetY: 50,
    paddingX: 10,
    paddingY: 5,
    bgColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#ddd',
    borderWidth: 1,
    labelOffsetY: 5
  };

  constructor(container: HTMLElement, options?: Partial<GaugeConfig>) {
    const config = {
      ...FinalGaugeChart.DEFAULT_CONFIG,
      ...options
    };

    // Manual deep merge for nested objects to avoid complex functions
    config.pointer = { ...FinalGaugeChart.DEFAULT_CONFIG.pointer, ...options?.pointer };
    config.pointer.shadow = {
      ...FinalGaugeChart.DEFAULT_CONFIG.pointer.shadow,
      ...options?.pointer?.shadow
    };
    config.labels = { ...FinalGaugeChart.DEFAULT_CONFIG.labels, ...options?.labels };
    config.ticks = { ...FinalGaugeChart.DEFAULT_CONFIG.ticks, ...options?.ticks };
    config.ticks.label = {
      ...FinalGaugeChart.DEFAULT_CONFIG.ticks.label,
      ...options?.ticks?.label
    };
    config.gauge = { ...FinalGaugeChart.DEFAULT_CONFIG.gauge, ...options?.gauge };
    config.gauge.border = {
      ...FinalGaugeChart.DEFAULT_CONFIG.gauge.border,
      ...options?.gauge?.border
    };
    config.background = { ...FinalGaugeChart.DEFAULT_CONFIG.background, ...options?.background };
    config.background.border = {
      ...FinalGaugeChart.DEFAULT_CONFIG.background.border,
      ...options?.background?.border
    };
    config.layout = { ...FinalGaugeChart.DEFAULT_CONFIG.layout, ...options?.layout };
    config.centerCircle = {
      ...FinalGaugeChart.DEFAULT_CONFIG.centerCircle,
      ...options?.centerCircle
    };
    config.valueBox = { ...FinalGaugeChart.DEFAULT_CONFIG.valueBox, ...options?.valueBox };
    config.valueBox.font = {
      ...FinalGaugeChart.DEFAULT_CONFIG.valueBox.font,
      ...options?.valueBox?.font
    };

    this.config = config;

    this.canvas = document.createElement('canvas');
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = context;
    this.setupCanvas(container);
  }

  private setupCanvas(container: HTMLElement): void {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.config.width * dpr;
    this.canvas.height = this.config.height * dpr;
    this.canvas.style.width = `${this.config.width}px`;
    this.canvas.style.height = `${this.config.height}px`;
    container.appendChild(this.canvas);
    this.ctx.scale(dpr, dpr);
  }

  public setData(data: GaugeData): void {
    this.data = data;
    this.render();
  }

  public setValue(value: number): void {
    if (this.data) {
      this.data.value = value;
    } else {
      this.data = { value };
    }
    this.render();
  }

  public updateConfig(newConfig: Partial<GaugeConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (this.data) {
      this.render();
    }
  }

  private render(): void {
    if (!this.data) {
      return;
    }
    this.ctx.clearRect(0, 0, this.config.width, this.config.height);
    const layout = this.calculateLayout();

    // Render layers: background -> gauge -> segments -> ticks -> pointer
    this.renderBackground(layout);
    this.renderGauge(layout);
    this.renderSegments(layout);
    if (this.config.ticks.show) {
      this.renderTicks(layout);
    }
    this.renderPointer(layout);
    this.renderCenterCircle(layout);
    this.renderTexts(layout);
    this.renderEndLabels(layout);
  }

  private calculateLayout(): GaugeLayout {
    const { width, height, gauge, background, layout } = this.config;
    const centerX = width / 2;
    const centerY = height * layout.centerYRatio;
    const baseRadius =
      Math.min(width, height * layout.baseRadiusRatio.minHeightRatio) /
      layout.baseRadiusRatio.divider;

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

  private renderBackground(layout: GaugeLayout): void {
    const { background: backgroundConfig } = this.config;
    if (!backgroundConfig.show) {
      return;
    }

    const { centerX, centerY, background: backgroundLayout } = layout;

    let fillStyle: string | CanvasGradient;
    if (Array.isArray(backgroundConfig.color)) {
      const gradient = this.ctx.createRadialGradient(
        centerX,
        centerY,
        backgroundLayout.innerRadius,
        centerX,
        centerY,
        backgroundLayout.outerRadius
      );
      backgroundConfig.color.forEach((color: string, index: number) => {
        gradient.addColorStop(index / (backgroundConfig.color.length - 1), color);
      });
      fillStyle = gradient;
    } else {
      fillStyle = backgroundConfig.color;
    }

    this.ctx.save();
    this.ctx.globalAlpha = backgroundConfig.opacity;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, backgroundLayout.outerRadius, Math.PI, 0);
    this.ctx.arc(centerX, centerY, backgroundLayout.innerRadius, 0, Math.PI, true);
    this.ctx.closePath();
    this.ctx.fillStyle = fillStyle;
    this.ctx.fill();
    this.ctx.restore();

    if (backgroundConfig.border.show) {
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, backgroundLayout.outerRadius, Math.PI, 0);
      this.ctx.strokeStyle = backgroundConfig.border.color;
      this.ctx.lineWidth = backgroundConfig.border.width;
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, backgroundLayout.innerRadius, Math.PI, 0);
      this.ctx.stroke();
    }
  }

  private renderGauge(layout: GaugeLayout): void {
    const { gauge: gaugeConfig } = this.config;
    if (!gaugeConfig.show) {
      return;
    }

    const { centerX, centerY, gauge: gaugeLayout } = layout;

    let fillStyle: string | CanvasGradient;
    if (Array.isArray(gaugeConfig.color)) {
      const gradient = this.ctx.createRadialGradient(
        centerX,
        centerY,
        gaugeLayout.innerRadius,
        centerX,
        centerY,
        gaugeLayout.outerRadius
      );
      gaugeConfig.color.forEach((color: string, index: number) => {
        gradient.addColorStop(index / (gaugeConfig.color.length - 1), color);
      });
      fillStyle = gradient;
    } else {
      fillStyle = gaugeConfig.color;
    }

    this.ctx.save();
    this.ctx.globalAlpha = gaugeConfig.opacity;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, gaugeLayout.outerRadius, Math.PI, 0);
    this.ctx.arc(centerX, centerY, gaugeLayout.innerRadius, 0, Math.PI, true);
    this.ctx.closePath();
    this.ctx.fillStyle = fillStyle;
    this.ctx.fill();
    this.ctx.restore();

    if (gaugeConfig.border.show) {
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, gaugeLayout.outerRadius, Math.PI, 0);
      this.ctx.strokeStyle = gaugeConfig.border.color;
      this.ctx.lineWidth = gaugeConfig.border.width;
      this.ctx.stroke();

      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, gaugeLayout.innerRadius, Math.PI, 0);
      this.ctx.stroke();
    }
  }

  private renderSegments(layout: GaugeLayout): void {
    const { centerX, centerY, gauge: gaugeLayout } = layout;
    const { range, segments } = this.config;

    segments.forEach((segment, index) => {
      const startAngle = Math.PI + ((segment.min - range.min) / (range.max - range.min)) * Math.PI;
      const endAngle = Math.PI + ((segment.max - range.min) / (range.max - range.min)) * Math.PI;

      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, gaugeLayout.outerRadius, startAngle, endAngle);
      this.ctx.arc(centerX, centerY, gaugeLayout.innerRadius, endAngle, startAngle, true);
      this.ctx.closePath();
      this.ctx.fillStyle = segment.color;
      this.ctx.fill();

      if (index > 0) {
        this.ctx.beginPath();
        const lineStartX = centerX + Math.cos(startAngle) * gaugeLayout.innerRadius;
        const lineStartY = centerY + Math.sin(startAngle) * gaugeLayout.innerRadius;
        const lineEndX = centerX + Math.cos(startAngle) * gaugeLayout.outerRadius;
        const lineEndY = centerY + Math.sin(startAngle) * gaugeLayout.outerRadius;
        this.ctx.moveTo(lineStartX, lineStartY);
        this.ctx.lineTo(lineEndX, lineEndY);
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
    });
  }

  private renderTicks(layout: GaugeLayout): void {
    const { centerX, centerY, gauge: gaugeLayout } = layout;
    const { ticks, range } = this.config;

    for (let i = 0; i <= ticks.count; i++) {
      const angle = Math.PI + (i / ticks.count) * Math.PI;
      const isMainTick = i % ticks.mainTickEvery === 0;
      const tickLength = isMainTick ? ticks.mainLength : ticks.length;

      const startX = centerX + Math.cos(angle) * (gaugeLayout.outerRadius - tickLength);
      const startY = centerY + Math.sin(angle) * (gaugeLayout.outerRadius - tickLength);
      const endX = centerX + Math.cos(angle) * gaugeLayout.outerRadius;
      const endY = centerY + Math.sin(angle) * gaugeLayout.outerRadius;

      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endX, endY);
      this.ctx.strokeStyle = ticks.color;
      this.ctx.lineWidth = isMainTick ? ticks.mainWidth : ticks.width;
      this.ctx.stroke();

      if (isMainTick && ticks.label.show) {
        const { label } = ticks;
        const labelRadius =
          label.position === 'outer'
            ? gaugeLayout.outerRadius + label.offset
            : gaugeLayout.innerRadius - label.offset;

        const labelX = centerX + Math.cos(angle) * labelRadius;
        const labelY = centerY + Math.sin(angle) * labelRadius;

        this.ctx.font = `${label.fontSize}px ${label.fontFamily}`;
        this.ctx.fillStyle = label.color;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        const labelText = ((i / ticks.count) * (range.max - range.min) + range.min).toString();
        this.ctx.fillText(labelText, labelX, labelY);
      }
    }
  }

  private renderPointer(layout: GaugeLayout): void {
    const { centerX, centerY, gauge: gaugeLayout } = layout;
    const { range, pointer } = this.config;

    const angle = Math.PI + ((this.data!.value - range.min) / (range.max - range.min)) * Math.PI;
    const pointerLength = gaugeLayout.innerRadius * pointer.length;
    const pointerX = centerX + Math.cos(angle) * pointerLength;
    const pointerY = centerY + Math.sin(angle) * pointerLength;

    // Shadow
    this.ctx.beginPath();
    this.ctx.moveTo(centerX + pointer.shadow.offsetX, centerY + pointer.shadow.offsetY);
    this.ctx.lineTo(pointerX + pointer.shadow.offsetX, pointerY + pointer.shadow.offsetY);
    this.ctx.strokeStyle = pointer.shadow.color;
    this.ctx.lineWidth = pointer.width + pointer.shadow.blur;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();

    // Pointer
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY);
    this.ctx.lineTo(pointerX, pointerY);
    this.ctx.strokeStyle = pointer.color;
    this.ctx.lineWidth = pointer.width;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();
  }

  private renderCenterCircle(layout: GaugeLayout): void {
    const { centerX, centerY } = layout;
    const { centerCircle } = this.config;

    const gradient = this.ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      centerCircle.radius
    );
    gradient.addColorStop(0, centerCircle.gradient.start);
    gradient.addColorStop(1, centerCircle.gradient.end);

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, centerCircle.radius, 0, 2 * Math.PI);
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, centerCircle.radius, 0, 2 * Math.PI);
    this.ctx.strokeStyle = centerCircle.borderColor;
    this.ctx.lineWidth = centerCircle.lineWidth;
    this.ctx.stroke();
  }

  private renderTexts(layout: GaugeLayout): void {
    const { centerX, centerY } = layout;
    const { text, valueBox } = this.config;

    const valueText = this.data!.value.toString();
    this.ctx.font = `${text.fontWeight} ${text.fontSize}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const metrics = this.ctx.measureText(valueText);
    const textWidth = metrics.width;
    const textHeight = text.fontSize;
    const textY = centerY + valueBox.offsetY;

    this.ctx.fillStyle = valueBox.bgColor;
    this.ctx.fillRect(
      centerX - textWidth / 2 - valueBox.paddingX,
      textY - textHeight / 2 - valueBox.paddingY,
      textWidth + valueBox.paddingX * valueBox.paddingMultiplier,
      textHeight + valueBox.paddingY * valueBox.paddingMultiplier
    );
    this.ctx.strokeStyle = valueBox.borderColor;
    this.ctx.lineWidth = valueBox.borderWidth;
    this.ctx.strokeRect(
      centerX - textWidth / 2 - valueBox.paddingX,
      textY - textHeight / 2 - valueBox.paddingY,
      textWidth + valueBox.paddingX * valueBox.paddingMultiplier,
      textHeight + valueBox.paddingY * valueBox.paddingMultiplier
    );

    this.ctx.fillStyle = text.color;
    this.ctx.fillText(valueText, centerX, textY);

    const currentSegment = this.getCurrentSegment();
    if (currentSegment && currentSegment.label) {
      this.ctx.font = `${valueBox.font.size}px ${valueBox.font.family}`;
      this.ctx.fillStyle = currentSegment.color;
      this.ctx.fillText(currentSegment.label, centerX, textY + textHeight + valueBox.labelOffsetY);
    }
  }

  private renderEndLabels(layout: GaugeLayout): void {
    const { labels } = this.config;
    if (!labels.show) {
      return;
    }

    const { centerX, centerY, gauge: gaugeLayout } = layout;
    const labelRadius =
      labels.position === 'inner'
        ? gaugeLayout.innerRadius - labels.offset
        : gaugeLayout.outerRadius + labels.offset;

    this.ctx.font = `${labels.fontSize}px Arial`;
    this.ctx.fillStyle = labels.color;
    this.ctx.textAlign = 'center';

    const startAngle = Math.PI * (1 + labels.angleOffset);
    const startX = centerX + Math.cos(startAngle) * labelRadius;
    const startY = centerY + Math.sin(startAngle) * labelRadius;
    this.ctx.fillText(labels.startLabel, startX, startY);

    const endAngle = -labels.angleOffset * Math.PI;
    const endX = centerX + Math.cos(endAngle) * labelRadius;
    const endY = centerY + Math.sin(endAngle) * labelRadius;
    this.ctx.fillText(labels.endLabel, endX, endY);
  }

  private getCurrentSegment(): GaugeSegment | null {
    if (!this.data) {
      return null;
    }
    return (
      this.config.segments.find(s => this.data!.value >= s.min && this.data!.value <= s.max) || null
    );
  }

  public getConfig(): GaugeConfig {
    return this.config;
  }

  public getData(): GaugeData | null {
    return this.data;
  }

  public destroy(): void {
    if (this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas);
    }
  }
}
