/**
 * D3仪表盘动画控制器
 * 封装D3的过渡(transition)和插值(interpolation)逻辑
 */

import {
  transition,
  interpolate,
  easeCubicInOut,
  type Selection,
  type Transition,
  type BaseType
} from '../utils/d3-imports';
import type { GaugeConfig } from '../types/config';
import { GaugeConst as C } from './constants';

export class GaugeAnimator {
  private config: GaugeConfig;

  constructor(config: GaugeConfig) {
    this.config = config;
  }

  /**
   * 获取一个标准的D3过渡对象
   * 调用者可以用它来制作各种属性的动画
   */
  public getTransition(
    selection: Selection<BaseType, unknown, null, undefined>
  ): Transition<BaseType, unknown, null, undefined> {
    if (!this.config.animation.enable) {
      // 如果禁用了动画，返回一个空的过渡，所有变化立即生效
      return transition().duration(C.ANIMATION_ZERO_DURATION);
    }

    // 使用一个平滑的缓入缓出效果
    return selection
      .transition('gauge-update')
      .duration(this.config.animation.duration)
      .ease(easeCubicInOut);
  }

  /**
   * D3 插值器 (Interpolator) 与 attrTween 详解:
   *
   * 当D3需要对一个复杂的属性（如transform的rotate或arc的d路径）进行动画时，
   * 它需要一个插值器函数来计算动画每一帧的中间值。
   *
   * attrTween('attributeName', interpolatorFactory):
   * - 'attributeName': 要进行动画的属性名。
   * - interpolatorFactory: 一个返回插值器(interpolator)的工厂函数。
   *   - 这个工厂函数只在动画开始时被调用一次。
   *   - 它返回的插值器函数会在动画的每一帧被调用，输入一个0到1的t值（代表动画进度）。
   *
   * interpolate(a, b): D3的通用插值器，可以智能地处理数字、颜色、字符串中的数字等。
   */
  public animatePointer(
    pointerSelection: Selection<SVGLineElement, unknown, null, undefined>,
    newAngle: number
  ): void {
    // Type assertion: SVGLineElement extends BaseType, so this is safe
    const pointerTransition = this.getTransition(
      pointerSelection as unknown as Selection<BaseType, unknown, null, undefined>
    );

    pointerTransition.attrTween('transform', () => {
      // 获取当前变换信息
      const node = pointerSelection.node();
      if (!node) {
        return () => `rotate(${newAngle})`;
      }

      const currentTransform = node.transform?.baseVal?.[0];
      const currentAngle = currentTransform?.angle ?? C.ANIMATION_DEFAULT_ANGLE;

      // 创建一个从当前角度到新角度的数字插值器
      const interpolator = interpolate(currentAngle, newAngle);

      // 返回一个函数，D3会在每一帧调用它来计算旋转角度
      return (t: number) => `rotate(${interpolator(t)})`;
    });
  }

  // 未来可以添加更多动画方法，如数值文本动画、弧形路径动画等
}
