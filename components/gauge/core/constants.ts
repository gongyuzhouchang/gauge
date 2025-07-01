export const GaugeConst = {
  // 颜色 & 描边
  STROKE_COLOR: '#fff',
  STROKE_WIDTH: 2,

  // 角度
  ANGLE_OFFSET: 90,
  ROTATE_BASE_ANGLE: -90,

  // 文本对齐
  TEXT_ANCHOR_MIDDLE: 'middle',
  DOMINANT_BASELINE_MIDDLE: 'middle',

  // class 名称
  CLASS_TICK_LABEL: 'tick-label',

  // 常用 SVG 属性名
  ATTR_TEXT_ANCHOR: 'text-anchor',
  ATTR_DOMINANT_BASELINE: 'dominant-baseline',
  ATTR_STROKE_WIDTH: 'stroke-width',

  // 其它
  HALF_DIVISOR: 2
} as const;
