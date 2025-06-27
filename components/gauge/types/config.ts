/**
 * D3仪表盘配置类型定义
 */

export interface GaugeSegment {
  min: number;
  max: number;
  color: string;
  label: string;
}

export interface GaugeConfig {
  // 容器尺寸
  width: number;
  height: number;

  // 数值范围
  range: {
    min: number;
    max: number;
  };

  // 数据段配置
  segments: GaugeSegment[];

  // 指针配置
  pointer: {
    length: number; // 0-1比例
    width: number;
    color: string;
    shadow: {
      enable: boolean;
      offsetX: number;
      offsetY: number;
      blur: number;
      color: string;
    };
  };

  // 文本配置
  text: {
    fontSize: number;
    fontWeight: string;
    color: string;
    fontFamily: string;
  };

  // 标签配置
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

  // 刻度配置
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
    color: string | string[];
    outerRadiusRatio: number;
    innerRadiusRatio: number;
    border: {
      show: boolean;
      color: string;
      width: number;
    };
    opacity: number;
  };

  // 背景配置
  background: {
    show: boolean;
    color: string | string[];
    outerRadiusRatio: number;
    innerRadiusRatio: number;
    border: {
      show: boolean;
      color: string;
      width: number;
    };
    opacity: number;
  };

  // 布局配置
  layout: {
    centerYRatio: number;
    baseRadiusRatio: {
      minHeightRatio: number;
      divider: number;
    };
  };

  // 中心圆配置
  centerCircle: {
    radius: number;
    lineWidth: number;
    gradient: {
      start: string;
      end: string;
    };
    borderColor: string;
  };

  // 数值显示框配置
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

  // 动画配置
  animation: {
    duration: number;
    easing: 'easeCubicInOut' | 'easeElastic' | 'easeBackOut' | 'easeQuadInOut';
    enable: boolean;
  };
}

/**
 * 默认配置
 */
export const DEFAULT_CONFIG: GaugeConfig = {
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
      enable: true,
      offsetX: 2,
      offsetY: 2,
      blur: 2,
      color: 'rgba(0, 0, 0, 0.2)'
    }
  },
  text: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Arial, sans-serif'
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
      fontFamily: 'Arial, sans-serif',
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
      family: 'Arial, sans-serif'
    },
    paddingMultiplier: 2
  },
  animation: {
    duration: 800,
    easing: 'easeCubicInOut',
    enable: true
  }
};
