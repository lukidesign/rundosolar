<template>
  <page-wrapper title="实时告警">
    <template #extra>
      <a-space>
        <a-select v-model:value="level" placeholder="告警等级" style="width: 120px" allow-clear @change="load">
          <a-select-option value="紧急">紧急</a-select-option>
          <a-select-option value="严重">严重</a-select-option>
          <a-select-option value="一般">一般</a-select-option>
          <a-select-option value="提示">提示</a-select-option>
        </a-select>
        <a-select v-model:value="status" placeholder="处理状态" style="width: 120px" allow-clear @change="load">
          <a-select-option value="未处理">未处理</a-select-option>
          <a-select-option value="处理中">处理中</a-select-option>
          <a-select-option value="已处理">已处理</a-select-option>
          <a-select-option value="已忽略">已忽略</a-select-option>
        </a-select>
        <a-button type="primary" @click="load">查询</a-button>
      </a-space>
    </template>

    <a-card :bordered="false">
      <a-table
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="{ current: page, pageSize, total, showSizeChanger: true }"
        row-key="id"
        size="middle"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'level'">
            <a-tag :color="levelColor(record.level)">{{ record.level }}</a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-badge :status="statusBadge(record.status)" :text="record.status" />
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
  { title: '告警编号', dataIndex: 'code', key: 'code', width: 110 },
  { title: '电站', dataIndex: 'stationName', key: 'stationName' },
  { title: '设备', dataIndex: 'deviceName', key: 'deviceName', width: 130 },
  { title: '告警类型', dataIndex: 'type', key: 'type', width: 130 },
  { title: '等级', dataIndex: 'level', key: 'level', width: 90 },
  { title: '内容', dataIndex: 'content', key: 'content' },
  { title: '触发时间', dataIndex: 'triggeredAt', key: 'triggeredAt', width: 170 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 100 },
];

const list = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const level = ref<string>();
const status = ref<string>();

const levelColor = (l: string) =>
  ({ 紧急: 'red', 严重: 'orange', 一般: 'gold', 提示: 'blue' } as any)[l] || 'default';
const statusBadge = (s: string) =>
  ({ 未处理: 'error', 处理中: 'processing', 已处理: 'success', 已忽略: 'default' } as any)[s] || 'default';

const load = async () => {
  loading.value = true;
  try {
    const { data } = await request.get<{ total: number; list: any[] }>('/alarm/list', {
      params: { page: page.value, pageSize: pageSize.value, level: level.value, status: status.value },
    });
    list.value = data.list;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
};

const onTableChange = (pag: any) => {
  page.value = pag.current;
  pageSize.value = pag.pageSize;
  load();
};

onMounted(load);
</script>
