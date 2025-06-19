import { Eventful } from './Eventful';
import type { BaseOptions, ContainerElement } from '../types/core';

/**
 * Controller 控制器基类
 * 继承自Eventful，作为框架的核心调度者，负责协调其他模块
 */
export abstract class Controller extends Eventful {
  protected container: ContainerElement;
  protected options: BaseOptions;
  protected model: any; // 具体类型由子类定义
  protected view: any;  // 具体类型由子类定义
  protected initialized: boolean = false;
  protected destroyed: boolean = false;

  constructor(container: ContainerElement, options: BaseOptions = {}) {
    super();
    
    if (!container) {
      throw new Error('Container element is required');
    }

    this.container = container;
    this.options = { ...options };
    
    this.init();
  }

  /**
   * 初始化控制器
   */
  private init(): void {
    try {
      // 创建模块实例
      this.createModules();
      
      // 绑定内部事件
      this.bindInternalEvents();
      
      // 执行自定义初始化
      this.onInit();
      
      this.initialized = true;
      this.emit('initialized');
    } catch (error) {
      console.error('Controller initialization failed:', error);
      throw error;
    }
  }

  /**
   * 创建模块实例 - 由子类实现
   */
  protected abstract createModules(): void;

  /**
   * 绑定内部事件 - 由子类实现
   */
  protected abstract bindInternalEvents(): void;

  /**
   * 自定义初始化逻辑 - 子类可选实现
   */
  protected onInit(): void {
    // 子类可以重写此方法
  }

  /**
   * 设置数据 - 对外API
   * @param data 数据
   */
  public setData(data: any): void {
    this.checkDestroyed();
    
    if (!this.model) {
      throw new Error('Model is not initialized');
    }

    try {
      this.onBeforeSetData(data);
      this.model.setData(data);
      this.onAfterSetData(data);
      this.emit('dataSet', data);
    } catch (error) {
      console.error('Failed to set data:', error);
      this.emit('error', { type: 'setData', error, data });
      throw error;
    }
  }

  /**
   * 设置数据前的钩子 - 子类可选实现
   */
  protected onBeforeSetData(data: any): void {
    // 子类可以重写此方法
  }

  /**
   * 设置数据后的钩子 - 子类可选实现
   */
  protected onAfterSetData(data: any): void {
    // 子类可以重写此方法
  }

  /**
   * 更新配置 - 对外API
   * @param options 新的配置项
   */
  public updateOptions(options: BaseOptions): void {
    this.checkDestroyed();
    
    const oldOptions = { ...this.options };
    this.options = { ...this.options, ...options };
    
    try {
      this.onOptionsUpdate(this.options, oldOptions);
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
   * 重新渲染 - 对外API
   */
  public render(): void {
    this.checkDestroyed();
    
    if (!this.view) {
      throw new Error('View is not initialized');
    }

    try {
      this.onBeforeRender();
      this.view.render();
      this.onAfterRender();
      this.emit('rendered');
    } catch (error) {
      console.error('Failed to render:', error);
      this.emit('error', { type: 'render', error });
      throw error;
    }
  }

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
   * 调整大小 - 对外API
   */
  public resize(): void {
    this.checkDestroyed();
    
    if (!this.view) {
      return;
    }

    try {
      this.onBeforeResize();
      this.view.resize();
      this.onAfterResize();
      this.emit('resized');
    } catch (error) {
      console.error('Failed to resize:', error);
      this.emit('error', { type: 'resize', error });
    }
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
      throw new Error('Controller has been destroyed');
    }
  }

  /**
   * 销毁控制器 - 对外API
   */
  public destroy(): void {
    if (this.destroyed) {
      return;
    }

    try {
      this.onBeforeDestroy();
      
      // 销毁模块
      if (this.view && typeof this.view.destroy === 'function') {
        this.view.destroy();
      }
      
      if (this.model && typeof this.model.destroy === 'function') {
        this.model.destroy();
      }

      // 清理事件
      this.clear();
      
      this.onAfterDestroy();
      
      this.destroyed = true;
      this.initialized = false;
      
    } catch (error) {
      console.error('Failed to destroy controller:', error);
    }
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