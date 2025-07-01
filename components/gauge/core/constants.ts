export const GaugeConst = {
  // 颜色 & 描边
  STROKE_COLOR: '#fff',
  STROKE_WIDTH: 2,

  // 角度 & 数学
  ANGLE_OFFSET: 90,
  ROTATE_BASE_ANGLE: -90,
  // eslint-disable-next-line no-magic-numbers
  PI_HALF: Math.PI / 2,
  ANGLE_TO_DEGREES: 180,
  ANGLE_NORMALIZATION_OFFSET: 1,
  HALF_DIVISOR: 2,

  // 文本
  TEXT_ANCHOR_MIDDLE: 'middle',
  DOMINANT_BASELINE_MIDDLE: 'middle',
  LABEL_FONT_SIZE_DEFAULT: 10,

  // class 名称
  CLASS_TICK_LABEL: 'tick-label',

  // 常用 SVG 属性名
  ATTR_TEXT_ANCHOR: 'text-anchor',
  ATTR_DOMINANT_BASELINE: 'dominant-baseline',
  ATTR_STROKE_WIDTH: 'stroke-width',

  // 动画
  ANIMATION_ZERO_DURATION: 0,
  ANIMATION_DEFAULT_ANGLE: 0,

  // 布局 & 比例
  LAYOUT_INNER_RADIUS_RATIO: 0.8,
  LAYOUT_LABEL_OFFSET_RATIO: 0.5
} as const;
