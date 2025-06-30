/**
 * 图片工具函数
 */

/**
 * 验证base64图片格式
 */
export function isValidBase64Image(src: string): boolean {
  const base64Regex = /^data:image\/(png|jpg|jpeg|gif|svg\+xml);base64,/;
  return base64Regex.test(src);
}

/**
 * 预加载图片
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * 获取图片的自然尺寸
 */
export async function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  try {
    const img = await preloadImage(src);
    return { width: img.naturalWidth, height: img.naturalHeight };
  } catch (error) {
    console.warn('Failed to load image:', src);
    // 默认尺寸
    return { width: 20, height: 80 };
  }
}
