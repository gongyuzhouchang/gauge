import { Eventful } from './Eventful';
import type { BaseOptions, ContainerElement, RenderData } from '../types/core';

/**
 * View 视图基类
 * 负责视图渲染和用户交互
 */
export abstract class View extends Eventful {
  protected container: ContainerElement;
  protected options: BaseOptions;
  protected renderData: RenderData | null = null;
  protected initialized: boolean = false;
  protected destroyed: boolean = false;
  protected needsRender: boolean = false;

  constructor(container: ContainerElement, options: BaseOptions = {}) {
    super();
    console.log('View constructor start');
    
    if (!container) {
      throw new Error('Container element is required');
    }

    this.container = container;
    this.options = { ...options };
    
    this.init();
    console.log('View constructor end');
  }

  /**
   * 初始化视图
   */
  protected init(): void {
    console.log('View init start');
    try {
      // 初始化渲染器
      this.initRenderer();
      console.log('View after initRenderer');
      
      // 绑定交互事件
      this.bindInteractionEvents();
      console.log('View after bindInteractionEvents');
      
      // 执行自定义初始化
      this.onInit();
      console.log('View after onInit');
      
      this.initialized = true;
      this.emit('initialized');
    } catch (error) {
      console.error('View initialization failed:', error);
      throw error;
    }
    console.log('View init end');
  }

  /**
   * 初始化渲染器 - 由子类实现
   */
  protected abstract initRenderer(): void;

  /**
   * 绑定交互事件 - 由子类实现
   */
  protected abstract bindInteractionEvents(): void;

  /**
   * 自定义初始化逻辑 - 子类可选实现
   */
  protected onInit(): void {
    // 子类可以重写此方法
  }

  /**
   * 渲染视图
   * @param data 渲染数据
   */
  public render(data?: RenderData): void {
    this.checkDestroyed();
    
    try {
      this.onBeforeRender();
      
      if (data !== undefined) {
        this.renderData = data;
      }
      
      if (this.renderData) {
        this.doRender(this.renderData);
        this.needsRender = false;
      }
      
      this.onAfterRender();
      this.emit('rendered', this.renderData);
    } catch (error) {
      console.error('Failed to render view:', error);
      this.emit('error', { type: 'render', error, data });
      throw error;
    }
  }

  /**
   * 执行渲染 - 由子类实现
   * @param data 渲染数据
   */
  protected abstract doRender(data: RenderData): void;

  /**
   * 渲染前的钩子 - 子类可选实现
   */
  protected onBeforeRender(): void {
    // 子类可以重写此方法
  }

  /**
   * 渲染后的钩子 - 子类可选实现
   */
  protected onAfterRender(): void {
    // 子类可以重写此方法
  }

  /**
   * 更新视图
   * @param data 新的渲染数据
   */
  public update(data?: RenderData): void {
    this.checkDestroyed();
    
    try {
      this.onBeforeUpdate();
      
      if (data !== undefined) {
        this.renderData = data;
      }
      
      if (this.renderData) {
        this.doUpdate(this.renderData);
      }
      
      this.onAfterUpdate();
      this.emit('updated', this.renderData);
    } catch (error) {
      console.error('Failed to update view:', error);
      this.emit('error', { type: 'update', error, data });
      throw error;
    }
  }

  /**
   * 执行更新 - 子类可选实现，默认调用渲染
   * @param data 渲染数据
   */
  protected doUpdate(data: RenderData): void {
    // 默认实现：重新渲染
    this.doRender(data);
  }

  /**
   * 更新前的钩子 - 子类可选实现
   */
  protected onBeforeUpdate(): void {
    // 子类可以重写此方法
  }

  /**
   * 更新后的钩子 - 子类可选实现
   */
  protected onAfterUpdate(): void {
    // 子类可以重写此方法
  }

  /**
   * 清空视图
   */
  public clear(): void {
    this.checkDestroyed();
    
    try {
      this.onBeforeClear();
      this.doClear();
      this.renderData = null;
      this.onAfterClear();
      this.emit('cleared');
    } catch (error) {
      console.error('Failed to clear view:', error);
      this.emit('error', { type: 'clear', error });
    }
  }

  /**
   * 执行清空 - 由子类实现
   */
  protected abstract doClear(): void;

  /**
   * 清空前的钩子 - 子类可选实现
   */
  protected onBeforeClear(): void {
    // 子类可以重写此方法
  }

  /**
   * 清空后的钩子 - 子类可选实现
   */
  protected onAfterClear(): void {
    // 子类可以重写此方法
  }

  /**
   * 调整大小
   */
  public resize(): void {
    this.checkDestroyed();
    
    try {
      this.onBeforeResize();
      this.doResize();
      
      // 如果有渲染数据，重新渲染
      if (this.renderData) {
        this.needsRender = true;
        this.render();
      }
      
      this.onAfterResize();
      this.emit('resized');
    } catch (error) {
      console.error('Failed to resize view:', error);
      this.emit('error', { type: 'resize', error });
    }
  }

  /**
   * 执行调整大小 - 子类可选实现
   */
  protected doResize(): void {
    // 子类可以重写此方法
  }

  /**
   * 调整大小前的钩子 - 子类可选实现
   */
  protected onBeforeResize(): void {
    // 子类可以重写此方法
  }

  /**
   * 调整大小后的钩子 - 子类可选实现
   */
  protected onAfterResize(): void {
    // 子类可以重写此方法
  }

  /**
   * 更新配置
   * @param options 新的配置项
   */
  public updateOptions(options: BaseOptions): void {
    this.checkDestroyed();
    
    const oldOptions = { ...this.options };
    this.options = { ...this.options, ...options };
    
    try {
      this.onOptionsUpdate(this.options, oldOptions);
      
      // 如果有渲染数据，重新渲染
      if (this.renderData) {
        this.needsRender = true;
        this.render();
      }
      
      this.emit('optionsUpdated', { newOptions: this.options, oldOptions });
    } catch (error) {
      console.error('Failed to update options:', error);
      this.emit('error', { type: 'updateOptions', error, options });
      throw error;
    }
  }

  /**
   * 配置更新处理 - 子类可选实现
   */
  protected onOptionsUpdate(newOptions: BaseOptions, oldOptions: BaseOptions): void {
    // 子类可以重写此方法
  }

  /**
   * 获取当前配置
   */
  public getOptions(): BaseOptions {
    return { ...this.options };
  }

  /**
   * 获取容器元素
   */
  public getContainer(): ContainerElement {
    return this.container;
  }

  /**
   * 获取当前渲染数据
   */
  public getRenderData(): RenderData | null {
    return this.renderData;
  }

  /**
   * 标记需要重新渲染
   */
  public markNeedsRender(): void {
    this.needsRender = true;
  }

  /**
   * 检查是否需要重新渲染
   */
  public needsRerender(): boolean {
    return this.needsRender;
  }

  /**
   * 处理交互事件 - 子类可选实现
   * @param eventType 事件类型
   * @param eventData 事件数据
   */
  protected handleInteraction(eventType: string, eventData: any): void {
    this.emit('interaction', {
      type: eventType,
      data: eventData,
      target: eventData.target || null
    });
    
    // 触发具体的事件
    this.emit(eventType, eventData);
  }

  /**
   * 检查是否已初始化
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * 检查是否已销毁
   */
  public isDestroyed(): boolean {
    return this.destroyed;
  }

  /**
   * 检查销毁状态，如果已销毁则抛出错误
   */
  private checkDestroyed(): void {
    if (this.destroyed) {
      throw new Error('View has been destroyed');
    }
  }

  /**
   * 销毁视图
   */
  public destroy(): void {
    if (this.destroyed) {
      return;
    }

    try {
      this.onBeforeDestroy();
      
      // 清空视图
      this.clear();
      
      // 解绑交互事件
      this.unbindInteractionEvents();
      
      // 清理渲染器
      this.cleanupRenderer();
      
      // 清理事件
      this.clear();
      
      this.onAfterDestroy();
      
      this.destroyed = true;
      this.initialized = false;
      
    } catch (error) {
      console.error('Failed to destroy view:', error);
    }
  }

  /**
   * 解绑交互事件 - 子类可选实现
   */
  protected unbindInteractionEvents(): void {
    // 子类可以重写此方法
  }

  /**
   * 清理渲染器 - 子类可选实现
   */
  protected cleanupRenderer(): void {
    // 子类可以重写此方法
  }

  /**
   * 销毁前的钩子 - 子类可选实现
   */
  protected onBeforeDestroy(): void {
    // 子类可以重写此方法
  }

  /**
   * 销毁后的钩子 - 子类可选实现
   */
  protected onAfterDestroy(): void {
    // 子类可以重写此方法
  }
} 