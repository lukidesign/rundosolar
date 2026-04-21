<template>
  <page-wrapper :title="`电站详情 · ${detail?.name || ''}`">
    <template #extra>
      <a-button @click="router.back()">返回</a-button>
    </template>

    <a-card :bordered="false" :loading="loading">
      <a-descriptions :column="3" bordered size="small" v-if="detail">
        <a-descriptions-item label="电站编码">{{ detail.code }}</a-descriptions-item>
        <a-descriptions-item label="电站名称">{{ detail.name }}</a-descriptions-item>
        <a-descriptions-item label="类型">{{ detail.type }}</a-descriptions-item>
        <a-descriptions-item label="装机容量">{{ detail.capacity }} kW</a-descriptions-item>
        <a-descriptions-item label="省份">{{ detail.province }}</a-descriptions-item>
        <a-descriptions-item label="城市">{{ detail.city }}</a-descriptions-item>
        <a-descriptions-item label="业主">{{ detail.owner }}</a-descriptions-item>
        <a-descriptions-item label="并网日期">{{ detail.onlineDate }}</a-descriptions-item>
        <a-descriptions-item label="状态">
          <a-tag :color="statusColor(detail.status)">{{ detail.status }}</a-tag>
        </a-descriptions-item>
        <a-descriptions-item label="今日发电">{{ detail.dayGen }} kWh</a-descriptions-item>
        <a-descriptions-item label="累计发电">{{ detail.totalGen }} kWh</a-descriptions-item>
      </a-descriptions>
    </a-card>

    <a-card title="运行概况" :bordered="false">
      <a-empty description="详细监控图表待接入实时数据" />
    </a-card>
  </page-wrapper>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import request from '@/api/http/request';

const route = useRoute();
const router = useRouter();
const detail = ref<any>(null);
const loading = ref(false);

const statusColor = (s: string) =>
  ({ 在线: 'green', 离线: 'default', 告警: 'red' } as any)[s] || 'default';

onMounted(async () => {
  loading.value = true;
  try {
    const { data } = await request.get(`/station/detail/${route.params.id}`, {
      params: { id: route.params.id },
    });
    detail.value = data;
  } finally {
    loading.value = false;
  }
});
</script>
