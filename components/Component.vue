<template>
  <div class="c">
    <!-- 仪表盘组件区域 -->
    <div class="container">
      <div class="title">恐惧贪婪指数仪表盘</div>
      <div id="gauge-chart" ref="gaugeChartRef"></div>
    </div>
    <div class="controls">
      <button class="btn btn-fear" @click="updateValue(10)">极度恐惧 (10)</button>
      <button class="btn btn-mild-fear" @click="updateValue(25)">恐惧 (25)</button>
      <button class="btn btn-neutral" @click="updateValue(50)">中性 (50)</button>
      <button class="btn btn-greed" @click="updateValue(68)">贪婪 (68)</button>
      <button class="btn btn-extreme-greed" @click="updateValue(85)">极度贪婪 (85)</button>
    </div>

    <!-- 仪表盘主体配置 -->
    <div class="controls">
      <button class="btn btn-config" @click="changeGaugeColor">改变仪表盘颜色</button>
      <button class="btn btn-config" @click="changeGaugeSize">改变仪表盘大小</button>
      <button class="btn btn-config" @click="applyGaugeGradient">应用仪表盘渐变</button>
      <button class="btn btn-config" @click="toggleGaugeBorder">切换仪表盘边框</button>
      <button class="btn btn-config" @click="changeGaugeOpacity">改变仪表盘透明度</button>
    </div>

    <!-- 背景配置 -->
    <div class="controls">
      <button class="btn btn-backdrop" @click="changeBackgroundColor">改变背景颜色</button>
      <button class="btn btn-backdrop" @click="changeBackgroundSize">改变背景大小</button>
      <button class="btn btn-backdrop" @click="applyBackgroundGradient">应用背景渐变</button>
      <button class="btn btn-backdrop" @click="toggleBackgroundBorder">切换背景边框</button>
      <button class="btn btn-backdrop" @click="toggleBackgroundShow">显示/隐藏背景</button>
    </div>

    <!-- 原有柱状图区域 -->
    <div class="container">
      <div class="title">空调产品-营收及占比趋势（示例数据）</div>
      <div id="chart" ref="chartRef"></div>
      <div ref="tooltipRef" class="tooltip"></div>
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
// import { BarChart } from './bar/BarChart';
// import type { BarChartData } from './bar/types/data';
// import type { BarChartConfig } from './bar/types/config';
// import { FinalGaugeChart } from './gauge/FinalGaugeChart';
import { D3GaugeChart } from './gauge/D3GaugeChart';

// 图表容器引用
// const chartRef = ref<HTMLElement | null>(null);
const gaugeChartRef = ref<HTMLElement | null>(null);
// const tooltipRef = ref<HTMLElement | null>(null);

// 图表实例
// let chart: BarChart | null = null;
// let gaugeChart: FinalGaugeChart | null = null;
let d3GaugeChart: D3GaugeChart | null = null;

// 仪表盘相关方法
function updateValue(value: number) {
  if (d3GaugeChart) {
    d3GaugeChart.setValue(value);
  }
}

// 仪表盘主体配置方法
function changeGaugeColor() {
  if (!d3GaugeChart) {
    return;
  }
  const colors = ['#f5f5f5', '#e3f2fd', '#fff3e0', '#f1f8e9', '#fce4ec'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  d3GaugeChart.updateConfig({
    gauge: {
      ...d3GaugeChart.getConfig().gauge,
      color: randomColor
    }
  });
}

function changeGaugeSize() {
  if (!d3GaugeChart) {
    return;
  }
  const outerRatios = [0.8, 0.9, 1.0, 1.1];
  const innerRatios = [0.5, 0.6, 0.65, 0.7];
  const outerRatio = outerRatios[Math.floor(Math.random() * outerRatios.length)];
  const innerRatio = innerRatios[Math.floor(Math.random() * innerRatios.length)];

  d3GaugeChart.updateConfig({
    gauge: {
      ...d3GaugeChart.getConfig().gauge,
      outerRadiusRatio: outerRatio,
      innerRadiusRatio: innerRatio
    }
  });
}

function applyGaugeGradient() {
  if (!d3GaugeChart) {
    return;
  }
  const gradients = [
    ['#ff6b6b', '#4ecdc4'],
    ['#a8edea', '#fed6e3'],
    ['#ffecd2', '#fcb69f'],
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c']
  ];
  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

  d3GaugeChart.updateConfig({
    gauge: {
      ...d3GaugeChart.getConfig().gauge,
      color: randomGradient
    }
  });
}

function toggleGaugeBorder() {
  if (!d3GaugeChart) {
    return;
  }
  const currentConfig = d3GaugeChart.getConfig();
  const newBorderShow = !currentConfig.gauge.border.show;

  d3GaugeChart.updateConfig({
    gauge: {
      ...currentConfig.gauge,
      border: {
        ...currentConfig.gauge.border,
        show: newBorderShow,
        color: newBorderShow
          ? ['#ff4444', '#00aa44', '#0044aa'][Math.floor(Math.random() * 3)]
          : currentConfig.gauge.border.color,
        width: newBorderShow ? Math.floor(Math.random() * 4) + 1 : currentConfig.gauge.border.width
      }
    }
  });
}

function changeGaugeOpacity() {
  if (!d3GaugeChart) {
    return;
  }
  const opacities = [0.3, 0.5, 0.7, 0.9, 1.0];
  const randomOpacity = opacities[Math.floor(Math.random() * opacities.length)];

  d3GaugeChart.updateConfig({
    gauge: {
      ...d3GaugeChart.getConfig().gauge,
      opacity: randomOpacity
    }
  });
}

// 背景配置方法
function changeBackgroundColor() {
  if (!d3GaugeChart) {
    return;
  }
  const colors = ['#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  d3GaugeChart.updateConfig({
    background: {
      ...d3GaugeChart.getConfig().background,
      color: randomColor
    }
  });
}

function changeBackgroundSize() {
  if (!d3GaugeChart) {
    return;
  }
  const outerRatios = [1.15, 1.2, 1.25, 1.3];
  const innerRatios = [0.4, 0.45, 0.5, 0.55];
  const outerRatio = outerRatios[Math.floor(Math.random() * outerRatios.length)];
  const innerRatio = innerRatios[Math.floor(Math.random() * innerRatios.length)];

  d3GaugeChart.updateConfig({
    background: {
      ...d3GaugeChart.getConfig().background,
      outerRadiusRatio: outerRatio,
      innerRadiusRatio: innerRatio
    }
  });
}

function applyBackgroundGradient() {
  if (!d3GaugeChart) {
    return;
  }
  const gradients = [
    ['#f8f9fa', '#e9ecef'],
    ['#e3f2fd', '#bbdefb'],
    ['#fff3e0', '#ffcc02'],
    ['#f1f8e9', '#c8e6c9'],
    ['#fce4ec', '#f8bbd9']
  ];
  const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

  d3GaugeChart.updateConfig({
    background: {
      ...d3GaugeChart.getConfig().background,
      color: randomGradient
    }
  });
}

function toggleBackgroundBorder() {
  if (!d3GaugeChart) {
    return;
  }
  const currentConfig = d3GaugeChart.getConfig();
  const newBorderShow = !currentConfig.background.border.show;

  d3GaugeChart.updateConfig({
    background: {
      ...currentConfig.background,
      border: {
        ...currentConfig.background.border,
        show: newBorderShow,
        color: newBorderShow
          ? ['#6c757d', '#495057', '#343a40'][Math.floor(Math.random() * 3)]
          : currentConfig.background.border.color,
        width: newBorderShow
          ? Math.floor(Math.random() * 3) + 1
          : currentConfig.background.border.width
      }
    }
  });
}

function toggleBackgroundShow() {
  if (!d3GaugeChart) {
    return;
  }
  const currentConfig = d3GaugeChart.getConfig();
  const newShow = !currentConfig.background.show;

  d3GaugeChart.updateConfig({
    background: {
      ...currentConfig.background,
      show: newShow
    }
  });
}

// 当前选中的索引
const currentSelectedIndex = ref<number | null>(null);

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

// 初始化仪表盘
const initGaugeChart = () => {
  if (!gaugeChartRef.value) {
    return;
  }

  try {
    // 创建D3仪表盘实例
    d3GaugeChart = new D3GaugeChart(gaugeChartRef.value, {
      width: 400,
      height: 300,
      segments: [
        { min: 0, max: 25, color: '#ff4444', label: 'Extreme Fear' },
        { min: 25, max: 45, color: '#ff8844', label: 'Fear' },
        { min: 45, max: 55, color: '#ffcc44', label: 'Neutral' },
        { min: 55, max: 75, color: '#88cc44', label: 'Greed' },
        { min: 75, max: 100, color: '#44ff44', label: 'Extreme Greed' }
      ]
    });

    // 设置初始数据
    d3GaugeChart.setData({ value: 68, label: 'Greed' });

    console.log('D3 仪表盘初始化成功');
  } catch (error) {
    console.error('D3 仪表盘初始化失败:', error);
  }
};

// 初始化图表
const initChart = () => {
  // if (!chartRef.value) return;
  // // 创建图表实例
  // chart = new BarChart(chartRef.value, chartConfig);
  // // 设置数据
  // chart.setData(sampleData);
  // // 绑定事件
  // chart.on('barHover', (data: BarChartData, index: number) => {
  //   if (!tooltipRef.value || !data) return;
  //   tooltipRef.value.style.display = 'block';
  //   tooltipRef.value.innerHTML = `
  //     <div>类别：${data.name}</div>
  //     <div>数值：${data.value}</div>
  //   `;
  // });
  // chart.on('barHoverOut', () => {
  //   if (!tooltipRef.value) return;
  //   tooltipRef.value.style.display = 'none';
  // });
  // chart.on('barClick', (data: BarChartData, index: number) => {
  //   console.log('点击柱子:', data);
  //   currentSelectedIndex.value = currentSelectedIndex.value === index ? null : index;
  // });
  // chart.on('selectionChanged', (data: BarChartData | null, index: number | null) => {
  //   console.log('选中状态变化:', data);
  //   currentSelectedIndex.value = index;
  // });
};

// 更新数据
const updateData = () => {
  // if (!chart) return;

  // const newData = sampleData.map(item => ({
  //   ...item,
  //   value: Math.floor(Math.random() * 600 + 200)
  // }));

  // chart.setData(newData);
  updateValue(Math.random() * 100);
};

// 切换选中状态
const toggleSelection = () => {
  // if (!chart) return;
  // const newIndex = currentSelectedIndex.value === null ? 0 : (currentSelectedIndex.value + 1) % sampleData.length;
  // chart.emit('barClick', sampleData[newIndex], newIndex);
};

// 调整大小
const resize = () => {
  // if (!chart) return;
  // chart.resize();
  if (d3GaugeChart) {
    d3GaugeChart.resize();
  }
};

// 清空图表
const clear = () => {
  // if (!chart) return;
  // chart.clear();
  // currentSelectedIndex.value = null;
};

// 销毁图表
const destroy = () => {
  // if (!chart) return;
  // chart.destroy();
  // chart = null;
  // currentSelectedIndex.value = null;
  if (d3GaugeChart) {
    d3GaugeChart.destroy();
    d3GaugeChart = null;
  }
};

// 生命周期钩子
onMounted(() => {
  // initChart();
  initGaugeChart();

  // 监听窗口大小变化
  window.addEventListener('resize', resize);
});

onUnmounted(() => {
  // 移除事件监听
  window.removeEventListener('resize', resize);

  // // 销毁图表
  // if (chart) {
  //   chart.destroy();
  //   chart = null;
  // }

  // 销毁仪表盘
  if (d3GaugeChart) {
    d3GaugeChart.destroy();
    d3GaugeChart = null;
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
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
}

.btn-fear {
  background: linear-gradient(135deg, #ff4444, #ff6666);
}

.btn-fear:hover {
  background: linear-gradient(135deg, #ff2222, #ff4444);
}

.btn-mild-fear {
  background: linear-gradient(135deg, #ff8844, #ffaa66);
}

.btn-mild-fear:hover {
  background: linear-gradient(135deg, #ff6622, #ff8844);
}

.btn-neutral {
  background: linear-gradient(135deg, #ffcc44, #ffdd66);
  color: #333;
}

.btn-neutral:hover {
  background: linear-gradient(135deg, #ffaa22, #ffcc44);
}

.btn-greed {
  background: linear-gradient(135deg, #88cc44, #aedd66);
}

.btn-greed:hover {
  background: linear-gradient(135deg, #66aa22, #88cc44);
}

.btn-extreme-greed {
  background: linear-gradient(135deg, #44ff44, #66ff66);
}

.btn-extreme-greed:hover {
  background: linear-gradient(135deg, #22dd22, #44ff44);
}

.btn-config {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 12px;
  padding: 8px 12px;
}

.btn-config:hover {
  background: linear-gradient(135deg, #764ba2, #667eea);
  transform: translateY(-2px);
}

.btn-backdrop {
  background: linear-gradient(135deg, #6c757d, #495057);
  color: white;
  font-size: 12px;
  padding: 8px 12px;
}

.btn-backdrop:hover {
  background: linear-gradient(135deg, #495057, #343a40);
  transform: translateY(-2px);
}
</style>
