/**
 * 核心类型定义
 */

// 事件处理函数类型
export type EventHandler = (...args: any[]) => void;

// 事件映射表类型
export type EventMap = Map<string, EventHandler[]>;

// 基础配置接口
export interface BaseOptions {
  [key: string]: any;
}

// 容器元素类型
export type ContainerElement = HTMLElement;

// 数据类型
export interface BaseData {
  [key: string]: any;
}

// 渲染数据类型
export interface RenderData {
  [key: string]: any;
}

// 布局结果类型
export interface LayoutResult {
  [key: string]: any;
}

// 图形元素类型
export interface GraphicElement {
  id: string;
  type: string;
  data: any;
  [key: string]: any;
} 