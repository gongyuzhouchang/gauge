import type { EventHandler, EventMap } from '../types/core';

/**
 * Eventful 事件基类
 * 提供事件机制的基础类，是整个框架的事件基础
 */
export class Eventful {
  private _events: EventMap;

  constructor() {
    this._events = new Map();
  }

  /**
   * 绑定事件监听器
   * @param eventName 事件名称
   * @param handler 事件处理函数
   */
  on(eventName: string, handler: EventHandler): void {
    if (!eventName || typeof handler !== 'function') {
      throw new Error('Invalid event name or handler');
    }

    if (!this._events.has(eventName)) {
      this._events.set(eventName, []);
    }
    
    const handlers = this._events.get(eventName)!;
    handlers.push(handler);
  }

  /**
   * 解绑事件监听器
   * @param eventName 事件名称
   * @param handler 事件处理函数，如果不传则解绑该事件的所有监听器
   */
  off(eventName: string, handler?: EventHandler): void {
    if (!eventName) {
      return;
    }

    if (!handler) {
      // 移除该事件的所有监听器
      this._events.delete(eventName);
      return;
    }

    const handlers = this._events.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
        
        // 如果没有监听器了，删除该事件
        if (handlers.length === 0) {
          this._events.delete(eventName);
        }
      }
    }
  }

  /**
   * 触发事件
   * @param eventName 事件名称
   * @param args 事件参数
   */
  emit(eventName: string, ...args: any[]): void {
    if (!eventName) {
      return;
    }

    const handlers = this._events.get(eventName);
    if (handlers && handlers.length > 0) {
      // 复制数组避免在执行过程中被修改
      const handlersCopy = [...handlers];
      handlersCopy.forEach(handler => {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in event handler for "${eventName}":`, error);
        }
      });
    }
  }

  /**
   * 绑定一次性事件监听器
   * @param eventName 事件名称
   * @param handler 事件处理函数
   */
  once(eventName: string, handler: EventHandler): void {
    const onceHandler: EventHandler = (...args: any[]) => {
      handler(...args);
      this.off(eventName, onceHandler);
    };
    
    this.on(eventName, onceHandler);
  }

  /**
   * 检查是否有指定事件的监听器
   * @param eventName 事件名称
   * @returns 是否有监听器
   */
  hasListeners(eventName: string): boolean {
    const handlers = this._events.get(eventName);
    return !!(handlers && handlers.length > 0);
  }

  /**
   * 获取指定事件的监听器数量
   * @param eventName 事件名称
   * @returns 监听器数量
   */
  listenerCount(eventName: string): number {
    const handlers = this._events.get(eventName);
    return handlers ? handlers.length : 0;
  }

  /**
   * 获取所有事件名称
   * @returns 事件名称数组
   */
  eventNames(): string[] {
    return Array.from(this._events.keys());
  }

  /**
   * 清除所有事件监听器
   */
  clear(): void {
    this._events.clear();
  }

  /**
   * 销毁实例，清理所有资源
   */
  destroy(): void {
    this.clear();
  }
} 