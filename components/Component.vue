<template>
  <div class="c">
    <div class="container">
      <div class="title">空调产品-营收及占比趋势（示例数据）</div>
      <div id="chart" ref="chartRef"></div>
      <div class="tooltip" ref="tooltipRef"></div>
    </div>
    <div class="controls">
      <button class="btn" @click="updateData">更新数据</button>
      <button class="btn" @click="toggleSelection">切换选中状态</button>
      <button class="btn" @click="resize">调整大小</button>
      <button class="btn" @click="clear">清空图表</button>
      <button class="btn" @click="destroy">销毁图表</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { BarChart } from './bar/BarChart';
import type { BarChartData } from './bar/types/data';
import type { BarChartConfig } from './bar/types/config';

// 图表容器引用
const chartRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);

// 图表实例
let chart: BarChart | null = null;

// 当前选中的索引
let currentSelectedIndex = ref<number | null>(null);

// 示例数据
const sampleData: BarChartData[] = [
  { name: '1月', value: 320, id: 1 },
  { name: '2月', value: 420, id: 2 },
  { name: '3月', value: 280, id: 3 },
  { name: '4月', value: 580, id: 4 },
  { name: '5月', value: 480, id: 5 },
  { name: '6月', value: 380, id: 6 }
];

// 图表配置
const chartConfig: Partial<BarChartConfig> = {
  width: 800,
  height: 400,
  padding: {
    top: 20,
    right: 30,
    bottom: 40,
    left: 50
  },
  bar: {
    fill: '#5470c6',
    stroke: 'none',
    strokeWidth: 0,
    cornerRadius: 4,
    opacity: 0.8
  },
  hover: {
    fill: '#91cc75',
    opacity: 0.9
  },
  selected: {
    fill: '#fac858',
    stroke: '#ee6666',
    strokeWidth: 2
  },
  animation: {
    duration: 800,
    easing: 'cubicOut'
  }
};

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;
  
  // 创建图表实例
  chart = new BarChart(chartRef.value, chartConfig);
  
  // 设置数据
  chart.setData(sampleData);
  
  // 绑定事件
  chart.on('barHover', (data: BarChartData, index: number) => {
    if (!tooltipRef.value) return;
    
    tooltipRef.value.style.display = 'block';
    tooltipRef.value.innerHTML = `
      <div>类别：${data.name}</div>
      <div>数值：${data.value}</div>
    `;
  });
  
  chart.on('barHoverOut', () => {
    if (!tooltipRef.value) return;
    tooltipRef.value.style.display = 'none';
  });
  
  chart.on('barClick', (data: BarChartData, index: number) => {
    console.log('点击柱子:', data);
    currentSelectedIndex.value = currentSelectedIndex.value === index ? null : index;
  });
  
  chart.on('selectionChanged', (data: BarChartData | null, index: number | null) => {
    console.log('选中状态变化:', data);
    currentSelectedIndex.value = index;
  });
};

// 更新数据
const updateData = () => {
  if (!chart) return;
  
  const newData = sampleData.map(item => ({
    ...item,
    value: Math.floor(Math.random() * 600 + 200)
  }));
  
  chart.setData(newData);
};

// 切换选中状态
const toggleSelection = () => {
  if (!chart) return;
  const newIndex = currentSelectedIndex.value === null ? 0 : (currentSelectedIndex.value + 1) % sampleData.length;
  chart.emit('barClick', sampleData[newIndex], newIndex);
};

// 调整大小
const resize = () => {
  if (!chart) return;
  chart.resize();
};

// 清空图表
const clear = () => {
  if (!chart) return;
  chart.clear();
  currentSelectedIndex.value = null;
};

// 销毁图表
const destroy = () => {
  if (!chart) return;
  chart.destroy();
  chart = null;
  currentSelectedIndex.value = null;
};

// 生命周期钩子
onMounted(() => {
  initChart();
  
  // 监听窗口大小变化
  window.addEventListener('resize', resize);
});

onUnmounted(() => {
  // 移除事件监听
  window.removeEventListener('resize', resize);
  
  // 销毁图表
  if (chart) {
    chart.destroy();
    chart = null;
  }
});
</script>

<style scoped>
.c {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.container {
  width: 100%;
  max-width: 1000px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

#chart {
  width: 100%;
  height: 400px;
  position: relative;
}

.tooltip {
  display: none;
  position: absolute;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  font-size: 14px;
  color: #666;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.controls {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #5470c6;
  color: white;
  cursor: pointer;
  transition: background 0.3s;
}

.btn:hover {
  background: #4160b8;
}

.btn:active {
  background: #3855a5;
}
</style>