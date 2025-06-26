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

export interface GaugeConfig {
    width: number;
    height: number;
    range: { min: number; max: number };
    segments: GaugeSegment[];
    pointer: {
        length: number;      // 0-1
        width: number;
        color: string;
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
    };
    // 仪表盘主体配置
    gauge: {
        show: boolean;
        color: string | string[]; // 支持单色或渐变色数组
        outerRadiusRatio: number; // 外圆半径比例 (0-1)
        innerRadiusRatio: number; // 内圆半径比例 (0-1, 应小于outerRadiusRatio)
        border: {
            show: boolean;
            color: string;
            width: number;
        };
        opacity: number; // 透明度 (0-1)
    };
    // 真正的背景
    background: {
        show: boolean;
        color: string | string[]; // 背景颜色（单色或渐变）
        outerRadiusRatio: number; // 背景外圆半径比例，通常 > gauge.outerRadiusRatio
        innerRadiusRatio: number; // 背景内圆半径比例，通常 < gauge.innerRadiusRatio
        border: {
            show: boolean;
            color: string;
            width: number;
        };
        opacity: number; // 背景透明度 (0-1)
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
            color: '#333'
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
            endLabel: 'Extreme Greed'
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
        }
    };

    constructor(container: HTMLElement, options?: Partial<GaugeConfig>) {
        this.config = { ...FinalGaugeChart.DEFAULT_CONFIG, ...options };
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
        this.canvas.style.width = this.config.width + 'px';
        this.canvas.style.height = this.config.height + 'px';
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
        if (!this.data) return;
        this.ctx.clearRect(0, 0, this.config.width, this.config.height);
        const layout = this.calculateLayout();
        
        // Render layers: background -> gauge -> segments -> ticks -> pointer
        this.renderBackground(layout);
        this.renderGauge(layout);
        this.renderSegments(layout);
        this.renderTicks(layout);
        this.renderPointer(layout);
        this.renderCenterCircle(layout);
        this.renderTexts(layout);
        this.renderEndLabels(layout);
    }

    private calculateLayout() {
        const { width, height, gauge, background } = this.config;
        const centerX = width / 2;
        const centerY = height * 0.65;
        const baseRadius = Math.min(width, height * 1.2) / 3;
        
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

    private renderBackground(layout: any): void {
        const { background: backgroundConfig } = this.config;
        if (!backgroundConfig.show) return;

        const { centerX, centerY, background: backgroundLayout } = layout;
        
        let fillStyle: string | CanvasGradient;
        if (Array.isArray(backgroundConfig.color)) {
            const gradient = this.ctx.createRadialGradient(
                centerX, centerY, backgroundLayout.innerRadius,
                centerX, centerY, backgroundLayout.outerRadius
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

    private renderGauge(layout: any): void {
        const { gauge: gaugeConfig } = this.config;
        if (!gaugeConfig.show) return;

        const { centerX, centerY, gauge: gaugeLayout } = layout;
        
        let fillStyle: string | CanvasGradient;
        if (Array.isArray(gaugeConfig.color)) {
            const gradient = this.ctx.createRadialGradient(
                centerX, centerY, gaugeLayout.innerRadius,
                centerX, centerY, gaugeLayout.outerRadius
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

    private renderSegments(layout: any): void {
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

    private renderTicks(layout: any): void {
        const { centerX, centerY, gauge: gaugeLayout } = layout;
        
        for (let i = 0; i <= 10; i++) {
            const angle = Math.PI + (i / 10) * Math.PI;
            const isMainTick = i % 5 === 0;
            const tickLength = isMainTick ? 8 : 4;
            
            const startX = centerX + Math.cos(angle) * (gaugeLayout.outerRadius - tickLength);
            const startY = centerY + Math.sin(angle) * (gaugeLayout.outerRadius - tickLength);
            const endX = centerX + Math.cos(angle) * gaugeLayout.outerRadius;
            const endY = centerY + Math.sin(angle) * gaugeLayout.outerRadius;
            
            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.lineTo(endX, endY);
            this.ctx.strokeStyle = '#999';
            this.ctx.lineWidth = isMainTick ? 2 : 1;
            this.ctx.stroke();
            
            if (isMainTick) {
                const labelRadius = gaugeLayout.outerRadius + 15;
                const labelX = centerX + Math.cos(angle) * labelRadius;
                const labelY = centerY + Math.sin(angle) * labelRadius;
                
                this.ctx.font = '10px Arial';
                this.ctx.fillStyle = '#666';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText((i * 10).toString(), labelX, labelY);
            }
        }
    }

    private renderPointer(layout: any): void {
        const { centerX, centerY, gauge: gaugeLayout } = layout;
        const { range, pointer } = this.config;
        
        const angle = Math.PI + ((this.data!.value - range.min) / (range.max - range.min)) * Math.PI;
        const pointerLength = gaugeLayout.innerRadius * pointer.length;
        const pointerX = centerX + Math.cos(angle) * pointerLength;
        const pointerY = centerY + Math.sin(angle) * pointerLength;

        this.ctx.beginPath();
        this.ctx.moveTo(centerX + 2, centerY + 2);
        this.ctx.lineTo(pointerX + 2, pointerY + 2);
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.lineWidth = pointer.width + 2;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(pointerX, pointerY);
        this.ctx.strokeStyle = pointer.color;
        this.ctx.lineWidth = pointer.width;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();
    }

    private renderCenterCircle(layout: any): void {
        const { centerX, centerY } = layout;
        
        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 12);
        gradient.addColorStop(0, '#666');
        gradient.addColorStop(1, '#333');
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 12, 0, 2 * Math.PI);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 12, 0, 2 * Math.PI);
        this.ctx.strokeStyle = '#222';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    private renderTexts(layout: any): void {
        const { centerX, centerY } = layout;
        const { text } = this.config;
        
        const valueText = this.data!.value.toString();
        this.ctx.font = `${text.fontWeight} ${text.fontSize}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const metrics = this.ctx.measureText(valueText);
        const textWidth = metrics.width;
        const textHeight = text.fontSize;
        const textY = centerY + 50;
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillRect(centerX - textWidth/2 - 10, textY - textHeight/2 - 5, textWidth + 20, textHeight + 10);
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(centerX - textWidth/2 - 10, textY - textHeight/2 - 5, textWidth + 20, textHeight + 10);
        
        this.ctx.fillStyle = text.color;
        this.ctx.fillText(valueText, centerX, textY);

        const currentSegment = this.getCurrentSegment();
        if (currentSegment && currentSegment.label) {
            this.ctx.font = '16px Arial';
            this.ctx.fillStyle = currentSegment.color;
            this.ctx.fillText(currentSegment.label, centerX, textY + textHeight + 5);
        }
    }

    private renderEndLabels(layout: any): void {
        const { labels } = this.config;
        if (!labels.show) return;

        const { centerX, centerY, gauge: gaugeLayout } = layout;
        const labelRadius = gaugeLayout.innerRadius - 15;
        
        this.ctx.font = `${labels.fontSize}px Arial`;
        this.ctx.fillStyle = labels.color;
        this.ctx.textAlign = 'center';

        const startAngle = Math.PI * 1.05;
        const startX = centerX + Math.cos(startAngle) * labelRadius;
        const startY = centerY + Math.sin(startAngle) * labelRadius;
        this.ctx.fillText(labels.startLabel, startX, startY);

        const endAngle = -0.05 * Math.PI;
        const endX = centerX + Math.cos(endAngle) * labelRadius;
        const endY = centerY + Math.sin(endAngle) * labelRadius;
        this.ctx.fillText(labels.endLabel, endX, endY);
    }

    private getCurrentSegment(): GaugeSegment | null {
        if (!this.data) return null;
        return this.config.segments.find(s => this.data!.value >= s.min && this.data!.value <= s.max) || null;
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