<template>
  <page-wrapper title="工作台">
    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :sm="12" :md="6" v-for="kpi in kpiCards" :key="kpi.label">
        <a-card class="kpi-card" :bordered="false">
          <div class="kpi-label">
            <component :is="kpi.icon" class="kpi-icon" :style="{ color: kpi.color }" />
            <span>{{ kpi.label }}</span>
          </div>
          <div class="kpi-value" :style="{ color: kpi.color }">
            {{ kpi.value }}
            <span class="kpi-unit">{{ kpi.unit }}</span>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :lg="16">
        <a-card title="近30日发电量趋势" :bordered="false">
          <div ref="trendRef" class="chart chart-lg"></div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="8">
        <a-card title="电站类型分布" :bordered="false">
          <div ref="pieRef" class="chart chart-lg"></div>
        </a-card>
      </a-col>
      <a-col :xs="24">
        <a-card title="告警等级分布" :bordered="false">
          <div ref="barRef" class="chart chart-md"></div>
        </a-card>
      </a-col>
    </a-row>
  </page-wrapper>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import * as echarts from 'echarts';
import {
  ThunderboltOutlined,
  AppstoreOutlined,
  AlertOutlined,
  ScheduleOutlined,
} from '@ant-design/icons-vue';
import request from '@/api/http/request';

interface DashboardData {
  kpi: {
    totalCapacity: number;
    todayGen: number;
    monthGen: number;
    yearGen: number;
    activeStations: number;
    activeAlarms: number;
    pendingWorkOrders: number;
    pendingFlaws: number;
  };
  genTrend: { date: string; value: number }[];
  typePie: { name: string; value: number }[];
  alarmBar: { level: string; count: number }[];
}

const data = ref<DashboardData | null>(null);

const trendRef = ref<HTMLDivElement>();
const pieRef = ref<HTMLDivElement>();
const barRef = ref<HTMLDivElement>();
let charts: echarts.ECharts[] = [];

const kpiCards = computed(() => {
  const k = data.value?.kpi;
  if (!k) return [];
  return [
    { label: '装机容量', value: k.totalCapacity.toLocaleString(), unit: 'kW', icon: ThunderboltOutlined, color: '#1e3a8a' },
    { label: '今日发电', value: k.todayGen.toLocaleString(), unit: 'kWh', icon: ThunderboltOutlined, color: '#0ea5e9' },
    { label: '在线电站', value: k.activeStations, unit: '座', icon: AppstoreOutlined, color: '#16a34a' },
    { label: '未处理告警', value: k.activeAlarms, unit: '条', icon: AlertOutlined, color: '#dc2626' },
    { label: '本月发电', value: (k.monthGen / 10000).toFixed(2), unit: '万kWh', icon: ThunderboltOutlined, color: '#f59e0b' },
    { label: '年累计发电', value: (k.yearGen / 10000).toFixed(2), unit: '万kWh', icon: ThunderboltOutlined, color: '#7c3aed' },
    { label: '待办工单', value: k.pendingWorkOrders, unit: '单', icon: ScheduleOutlined, color: '#0891b2' },
    { label: '隐患工单', value: k.pendingFlaws, unit: '单', icon: AlertOutlined, color: '#ea580c' },
  ];
});

const renderTrend = () => {
  if (!trendRef.value || !data.value) return;
  const chart = echarts.init(trendRef.value);
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: {
      type: 'category',
      data: data.value.genTrend.map((d) => d.date.slice(5)),
      axisLabel: { color: '#64748b' },
    },
    yAxis: { type: 'value', axisLabel: { color: '#64748b' } },
    series: [
      {
        name: '发电量',
        type: 'line',
        smooth: true,
        data: data.value.genTrend.map((d) => d.value),
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(14,165,233,0.4)' },
            { offset: 1, color: 'rgba(14,165,233,0.02)' },
          ]),
        },
        lineStyle: { color: '#0ea5e9', width: 2 },
        itemStyle: { color: '#0ea5e9' },
      },
    ],
  });
  charts.push(chart);
};

const renderPie = () => {
  if (!pieRef.value || !data.value) return;
  const chart = echarts.init(pieRef.value);
  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['42%', '68%'],
        avoidLabelOverlap: true,
        data: data.value.typePie,
        label: { formatter: '{b}\n{d}%' },
      },
    ],
  });
  charts.push(chart);
};

const renderBar = () => {
  if (!barRef.value || !data.value) return;
  const chart = echarts.init(barRef.value);
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 20, top: 30, bottom: 30 },
    xAxis: { type: 'category', data: data.value.alarmBar.map((x) => x.level) },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'bar',
        data: data.value.alarmBar.map((x, i) => ({
          value: x.count,
          itemStyle: { color: ['#dc2626', '#f97316', '#f59e0b', '#0ea5e9'][i] },
        })),
        barWidth: 32,
      },
    ],
  });
  charts.push(chart);
};

const onResize = () => charts.forEach((c) => c.resize());

onMounted(async () => {
  const { data: res } = await request.get<DashboardData>('/dashboard/stats');
  data.value = res;
  await new Promise((r) => setTimeout(r, 50));
  renderTrend();
  renderPie();
  renderBar();
  window.addEventListener('resize', onResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize);
  charts.forEach((c) => c.dispose());
  charts = [];
});
</script>

<style lang="less" scoped>
.kpi-card {
  :deep(.ant-card-body) {
    padding: 16px 20px;
  }
}
.kpi-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 13px;
  .kpi-icon {
    font-size: 16px;
  }
}
.kpi-value {
  margin-top: 10px;
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
  .kpi-unit {
    font-size: 12px;
    color: #94a3b8;
    margin-left: 4px;
    font-weight: 400;
  }
}
.chart {
  width: 100%;
}
.chart-lg {
  height: 320px;
}
.chart-md {
  height: 260px;
}
</style>
