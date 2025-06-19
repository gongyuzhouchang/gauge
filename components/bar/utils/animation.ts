/**
 * 动画工具函数
 */

import type { BarChartConfig } from '../types/config';

/**
 * 缓动函数集合
 */
export const easings = {
    linear: (t: number): number => t,
    
    cubicIn: (t: number): number => t * t * t,
    
    cubicOut: (t: number): number => {
        const t1 = t - 1;
        return t1 * t1 * t1 + 1;
    },
    
    cubicInOut: (t: number): number => {
        if (t < 0.5) {
            return 4 * t * t * t;
        }
        const t1 = 2 * t - 2;
        return 0.5 * t1 * t1 * t1 + 1;
    }
};

/**
 * 获取缓动函数
 */
export function getEasing(config: BarChartConfig): (t: number) => number {
    const easing = config.animation.easing;
    return easings[easing as keyof typeof easings] || easings.cubicOut;
}

/**
 * 动画帧请求
 */
export function requestAnimation(
    duration: number,
    onFrame: (progress: number) => void,
    onComplete?: () => void
): () => void {
    const startTime = performance.now();
    let animationFrame: number;

    function update(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        onFrame(progress);

        if (progress < 1) {
            animationFrame = requestAnimationFrame(update);
        } else {
            onComplete?.();
        }
    }

    animationFrame = requestAnimationFrame(update);

    // 返回取消动画的函数
    return () => {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    };
}

/**
 * 创建柱状图动画
 */
export function createBarAnimation(
    from: number,
    to: number,
    duration: number,
    easing: (t: number) => number,
    onFrame: (value: number) => void,
    onComplete?: () => void
): () => void {
    return requestAnimation(
        duration,
        (progress) => {
            const easedProgress = easing(progress);
            const currentValue = from + (to - from) * easedProgress;
            onFrame(currentValue);
        },
        onComplete
    );
} 