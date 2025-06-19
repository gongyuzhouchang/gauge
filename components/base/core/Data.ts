import type { BaseData, RenderData, LayoutResult, GraphicElement } from '../types/core';

/**
 * Data 数据管理基类
 * 作为Model的内部类，负责数据的存储、处理和管理
 */
export class Data {
  protected rawData: BaseData | null = null;
  protected processedData: RenderData | null = null;
  protected layoutResults: Map<string, LayoutResult> = new Map();
  protected graphicElements: Map<string, GraphicElement> = new Map();
  protected dataElementMap: Map<any, GraphicElement> = new Map();
  protected elementDataMap: Map<GraphicElement, any> = new Map();
  protected destroyed: boolean = false;

  constructor() {
    this.init();
  }

  /**
   * 初始化数据管理器
   */
  private init(): void {
    this.layoutResults = new Map();
    this.graphicElements = new Map();
    this.dataElementMap = new Map();
    this.elementDataMap = new Map();
  }

  /**
   * 设置原始数据
   * @param data 原始数据
   */
  public setRawData(data: BaseData): void {
    this.checkDestroyed();
    this.rawData = data;
  }

  /**
   * 获取原始数据
   */
  public getRawData(): BaseData | null {
    return this.rawData;
  }

  /**
   * 设置处理后的数据
   * @param data 处理后的数据
   */
  public setProcessedData(data: RenderData): void {
    this.checkDestroyed();
    this.processedData = data;
  }

  /**
   * 获取处理后的数据
   */
  public getProcessedData(): RenderData | null {
    return this.processedData;
  }

  /**
   * 存储布局结果
   * @param key 布局键名
   * @param result 布局结果
   */
  public setLayoutResult(key: string, result: LayoutResult): void {
    this.checkDestroyed();
    
    if (!key) {
      throw new Error('Layout key is required');
    }
    
    this.layoutResults.set(key, result);
  }

  /**
   * 获取布局结果
   * @param key 布局键名
   */
  public getLayoutResult(key: string): LayoutResult | undefined {
    return this.layoutResults.get(key);
  }

  /**
   * 获取所有布局结果
   */
  public getAllLayoutResults(): Map<string, LayoutResult> {
    return new Map(this.layoutResults);
  }

  /**
   * 删除布局结果
   * @param key 布局键名
   */
  public removeLayoutResult(key: string): boolean {
    return this.layoutResults.delete(key);
  }

  /**
   * 清空所有布局结果
   */
  public clearLayoutResults(): void {
    this.layoutResults.clear();
  }

  /**
   * 设置图形元素
   * @param id 元素ID
   * @param element 图形元素
   */
  public setGraphicElement(id: string, element: GraphicElement): void {
    this.checkDestroyed();
    
    if (!id) {
      throw new Error('Element ID is required');
    }
    
    if (!element) {
      throw new Error('Graphic element is required');
    }
    
    // 确保元素有ID
    element.id = id;
    
    this.graphicElements.set(id, element);
  }

  /**
   * 获取图形元素
   * @param id 元素ID
   */
  public getGraphicElement(id: string): GraphicElement | undefined {
    return this.graphicElements.get(id);
  }

  /**
   * 获取所有图形元素
   */
  public getAllGraphicElements(): Map<string, GraphicElement> {
    return new Map(this.graphicElements);
  }

  /**
   * 删除图形元素
   * @param id 元素ID
   */
  public removeGraphicElement(id: string): boolean {
    const element = this.graphicElements.get(id);
    if (element) {
      // 同时清理映射关系
      this.elementDataMap.delete(element);
      const dataItem = this.getDataByElement(element);
      if (dataItem) {
        this.dataElementMap.delete(dataItem);
      }
    }
    
    return this.graphicElements.delete(id);
  }

  /**
   * 清空所有图形元素
   */
  public clearGraphicElements(): void {
    this.graphicElements.clear();
    this.dataElementMap.clear();
    this.elementDataMap.clear();
  }

  /**
   * 建立数据项与图形元素的映射关系
   * @param dataItem 数据项
   * @param element 图形元素
   */
  public mapDataToElement(dataItem: any, element: GraphicElement): void {
    this.checkDestroyed();
    
    if (!dataItem || !element) {
      throw new Error('Both dataItem and element are required');
    }
    
    // 建立双向映射
    this.dataElementMap.set(dataItem, element);
    this.elementDataMap.set(element, dataItem);
  }

  /**
   * 根据数据项获取对应的图形元素
   * @param dataItem 数据项
   */
  public getElementByData(dataItem: any): GraphicElement | undefined {
    return this.dataElementMap.get(dataItem);
  }

  /**
   * 根据图形元素获取对应的数据项
   * @param element 图形元素
   */
  public getDataByElement(element: GraphicElement): any {
    return this.elementDataMap.get(element);
  }

  /**
   * 删除数据项与图形元素的映射关系
   * @param dataItem 数据项
   */
  public unmapDataFromElement(dataItem: any): void {
    const element = this.dataElementMap.get(dataItem);
    if (element) {
      this.dataElementMap.delete(dataItem);
      this.elementDataMap.delete(element);
    }
  }

  /**
   * 删除图形元素与数据项的映射关系
   * @param element 图形元素
   */
  public unmapElementFromData(element: GraphicElement): void {
    const dataItem = this.elementDataMap.get(element);
    if (dataItem) {
      this.elementDataMap.delete(element);
      this.dataElementMap.delete(dataItem);
    }
  }

  /**
   * 获取所有数据-元素映射
   */
  public getAllDataElementMappings(): Map<any, GraphicElement> {
    return new Map(this.dataElementMap);
  }

  /**
   * 获取所有元素-数据映射
   */
  public getAllElementDataMappings(): Map<GraphicElement, any> {
    return new Map(this.elementDataMap);
  }

  /**
   * 批量设置图形元素
   * @param elements 元素数组
   */
  public setGraphicElements(elements: GraphicElement[]): void {
    this.checkDestroyed();
    
    if (!Array.isArray(elements)) {
      throw new Error('Elements must be an array');
    }
    
    elements.forEach(element => {
      if (element && element.id) {
        this.setGraphicElement(element.id, element);
      }
    });
  }

  /**
   * 批量建立数据-元素映射
   * @param mappings 映射数组，每项包含 {dataItem, element}
   */
  public batchMapDataToElements(mappings: Array<{dataItem: any, element: GraphicElement}>): void {
    this.checkDestroyed();
    
    if (!Array.isArray(mappings)) {
      throw new Error('Mappings must be an array');
    }
    
    mappings.forEach(mapping => {
      if (mapping && mapping.dataItem && mapping.element) {
        this.mapDataToElement(mapping.dataItem, mapping.element);
      }
    });
  }

  /**
   * 查找符合条件的图形元素
   * @param predicate 查找条件函数
   */
  public findGraphicElements(predicate: (element: GraphicElement) => boolean): GraphicElement[] {
    const results: GraphicElement[] = [];
    
    this.graphicElements.forEach(element => {
      if (predicate(element)) {
        results.push(element);
      }
    });
    
    return results;
  }

  /**
   * 过滤数据项
   * @param predicate 过滤条件函数
   */
  public filterDataItems(predicate: (dataItem: any) => boolean): any[] {
    const results: any[] = [];
    
    this.dataElementMap.forEach((element, dataItem) => {
      if (predicate(dataItem)) {
        results.push(dataItem);
      }
    });
    
    return results;
  }

  /**
   * 统计信息
   */
  public getStats(): {
    rawDataSize: number;
    processedDataSize: number;
    layoutResultsCount: number;
    graphicElementsCount: number;
    mappingsCount: number;
  } {
    return {
      rawDataSize: this.rawData ? (Array.isArray(this.rawData) ? this.rawData.length : Object.keys(this.rawData).length) : 0,
      processedDataSize: this.processedData ? (Array.isArray(this.processedData) ? this.processedData.length : Object.keys(this.processedData).length) : 0,
      layoutResultsCount: this.layoutResults.size,
      graphicElementsCount: this.graphicElements.size,
      mappingsCount: this.dataElementMap.size
    };
  }

  /**
   * 检查是否有数据
   */
  public hasData(): boolean {
    return this.rawData !== null || this.processedData !== null;
  }

  /**
   * 检查是否有布局结果
   */
  public hasLayoutResults(): boolean {
    return this.layoutResults.size > 0;
  }

  /**
   * 检查是否有图形元素
   */
  public hasGraphicElements(): boolean {
    return this.graphicElements.size > 0;
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
      throw new Error('Data has been destroyed');
    }
  }

  /**
   * 清空所有数据
   */
  public clear(): void {
    this.rawData = null;
    this.processedData = null;
    this.clearLayoutResults();
    this.clearGraphicElements();
  }

  /**
   * 销毁数据管理器
   */
  public destroy(): void {
    if (this.destroyed) {
      return;
    }

    try {
      // 清空所有数据
      this.clear();
      
      this.destroyed = true;
    } catch (error) {
      console.error('Failed to destroy data:', error);
    }
  }
} 