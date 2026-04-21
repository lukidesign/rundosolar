<template>
  <page-wrapper title="告警规则">
    <template #extra>
      <a-button type="primary">新增规则</a-button>
    </template>
    <a-card :bordered="false">
      <a-table
        :columns="columns"
        :data-source="list"
        :loading="loading"
        row-key="id"
        size="middle"
        :pagination="{ pageSize: 10 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'enabled'">
            <a-switch :checked="record.enabled" />
          </template>
          <template v-else-if="column.key === 'level'">
            <a-tag :color="levelColor(record.level)">{{ record.level }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a>编辑</a>
              <a style="color: #dc2626">删除</a>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </page-wrapper>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import request from '@/api/http/request';

const columns = [
  { title: '规则名称', dataIndex: 'name', key: 'name' },
  { title: '监控指标', dataIndex: 'metric', key: 'metric', width: 120 },
  { title: '比较符', dataIndex: 'operator', key: 'operator', width: 80 },
  { title: '阈值', dataIndex: 'threshold', key: 'threshold', width: 100 },
  { title: '等级', dataIndex: 'level', key: 'level', width: 90 },
  { title: '启用', dataIndex: 'enabled', key: 'enabled', width: 90 },
  { title: '更新时间', dataIndex: 'updatedAt', key: 'updatedAt', width: 170 },
  { title: '操作', key: 'action', width: 130 },
];

const list = ref<any[]>([]);
const loading = ref(false);

const levelColor = (l: string) =>
  ({ 紧急: 'red', 严重: 'orange', 一般: 'gold', 提示: 'blue' } as any)[l] || 'default';

onMounted(async () => {
  loading.value = true;
  try {
    const { data } = await request.get<{ list: any[] }>('/alarm/rules');
    list.value = data.list;
  } finally {
    loading.value = false;
  }
});
</script>
