/**
 * D3仪表盘数据类型定义
 */

export interface GaugeData {
  value: number;
  label?: string;
}

export interface GaugeLayout {
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

export interface SegmentData extends GaugeData {
  startAngle: number;
  endAngle: number;
  color: string;
  label: string;
}

export interface TickData {
  value: number;
  angle: number;
  isMain: boolean;
  x: number;
  y: number;
  labelX?: number;
  labelY?: number;
}
