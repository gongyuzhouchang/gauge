import { Eventful } from './Eventful';
import type { BaseData, BaseOptions } from '../types/core';

/**
 * Model 模型基类
 * 持有Data实例，负责业务数据处理和业务逻辑
 */
export abstract class Model extends Eventful {
  protected data: any; // Data实例，具体类型由子类定义
  protected options: BaseOptions;
  protected rawData: BaseData | null = null;
  protected processedData: any = null;
  protected initialized: boolean = false;
  protected destroyed: boolean = false;

  constructor(options: BaseOptions = {}) {
    super();
    
    this.options = { ...options };
    
    this.init();
  }

  /**
   * 初始化模型
   */
  private init(): void {
    try {
      // 创建Data实例
      this.createData();
      
      // 执行自定义初始化
      this.onInit();
      
      this.initialized = true;
      this.emit('initialized');
    } catch (error) {
      console.error('Model initialization failed:', error);
      throw error;
    }
  }

  /**
   * 创建Data实例 - 由子类实现
   */
  protected abstract createData(): void;

  /**
   * 自定义初始化逻辑 - 子类可选实现
   */
  protected onInit(): void {
    // 子类可以重写此方法
  }

  /**
   * 设置原始数据
   * @param data 原始数据
   */
  public setData(data: BaseData): void {
    this.checkDestroyed();
    
    if (!this.data) {
      throw new Error('Data instance is not initialized');
    }

    try {
      this.onBeforeSetData(data);
      
      this.rawData = data;
      
      // 验证数据
      if (!this.validateData(data)) {
        throw new Error('Data validation failed');
      }
      
      // 处理数据
      this.processedData = this.processData(data);
      
      // 通过Data实例管理数据
      this.data.setRawData(data);
      this.data.setProcessedData(this.processedData);
      
      this.onAfterSetData(data);
      
      this.emit('dataChanged', {
        rawData: this.rawData,
        processedData: this.processedData
      });
      
    } catch (error) {
      console.error('Failed to set data:', error);
      this.emit('error', { type: 'setData', error, data });
      throw error;
    }
  }

  /**
   * 设置数据前的钩子 - 子类可选实现
   */
  protected onBeforeSetData(data: BaseData): void {
    // 子类可以重写此方法
  }

  /**
   * 设置数据后的钩子 - 子类可选实现
   */
  protected onAfterSetData(data: BaseData): void {
    // 子类可以重写此方法
  }

  /**
   * 验证数据 - 由子类实现
   * @param data 要验证的数据
   * @returns 验证结果
   */
  protected abstract validateData(data: BaseData): boolean;

  /**
   * 处理数据 - 由子类实现
   * @param data 原始数据
   * @returns 处理后的数据
   */
  protected abstract processData(data: BaseData): any;

  /**
   * 获取原始数据
   */
  public getRawData(): BaseData | null {
    return this.rawData;
  }

  /**
   * 获取处理后的数据
   */
  public getProcessedData(): any {
    return this.processedData;
  }

  /**
   * 获取Data实例
   */
  public getData(): any {
    return this.data;
  }

  /**
   * 根据图形元素获取对应的数据项
   * @param element 图形元素
   * @returns 对应的数据项
   */
  public getDataByElement(element: any): any {
    if (!this.data || typeof this.data.getDataByElement !== 'function') {
      return null;
    }
    
    return this.data.getDataByElement(element);
  }

  /**
   * 根据数据项获取对应的图形元素
   * @param dataItem 数据项
   * @returns 对应的图形元素
   */
  public getElementByData(dataItem: any): any {
    if (!this.data || typeof this.data.getElementByData !== 'function') {
      return null;
    }
    
    return this.data.getElementByData(dataItem);
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
      
      // 如果有数据，重新处理数据
      if (this.rawData) {
        this.processedData = this.processData(this.rawData);
        this.data.setProcessedData(this.processedData);
        
        this.emit('dataChanged', {
          rawData: this.rawData,
          processedData: this.processedData
        });
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
   * 刷新数据处理
   */
  public refresh(): void {
    this.checkDestroyed();
    
    if (this.rawData) {
      this.setData(this.rawData);
    }
  }

  /**
   * 清空数据
   */
  public clearData(): void {
    this.checkDestroyed();
    
    this.rawData = null;
    this.processedData = null;
    
    if (this.data && typeof this.data.clear === 'function') {
      this.data.clear();
    }
    
    this.emit('dataCleared');
  }

  /**
   * 检查是否有数据
   */
  public hasData(): boolean {
    return this.rawData !== null;
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
      throw new Error('Model has been destroyed');
    }
  }

  /**
   * 销毁模型
   */
  public destroy(): void {
    if (this.destroyed) {
      return;
    }

    try {
      this.onBeforeDestroy();
      
      // 清空数据
      this.clearData();
      
      // 销毁Data实例
      if (this.data && typeof this.data.destroy === 'function') {
        this.data.destroy();
      }
      
      // 清理事件
      this.clear();
      
      this.onAfterDestroy();
      
      this.destroyed = true;
      this.initialized = false;
      
    } catch (error) {
      console.error('Failed to destroy model:', error);
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