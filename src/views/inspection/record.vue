<template>
  <page-wrapper title="巡检记录">
    <template #extra>
      <a-space>
        <a-input-search
          v-model:value="keyword"
          placeholder="搜索电站"
          style="width: 220px"
          allow-clear
          @search="load"
        />
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
        @change="onPageChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'abnormalCount'">
            <a-tag :color="record.abnormalCount > 0 ? 'red' : 'green'">
              {{ record.abnormalCount > 0 ? `异常 ${record.abnormalCount}` : '正常' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'duration'">
            {{ record.duration }} 分钟
          </template>
          <template v-else-if="column.key === 'action'">
            <a @click="onView(record)">查看详情</a>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      :open="detailOpen"
      title="巡检记录详情"
      :footer="null"
      width="640px"
      @cancel="detailOpen = false"
    >
      <a-descriptions v-if="current" :column="2" bordered size="small">
        <a-descriptions-item label="关联任务">{{ current.taskCode }}</a-descriptions-item>
        <a-descriptions-item label="电站">{{ current.stationName }}</a-descriptions-item>
        <a-descriptions-item label="执行人">{{ current.executor }}</a-descriptions-item>
        <a-descriptions-item label="完成时间">{{ current.finishTime }}</a-descriptions-item>
        <a-descriptions-item label="检查项数">{{ current.itemCount }}</a-descriptions-item>
        <a-descriptions-item label="异常数">
          <span :style="{ color: current.abnormalCount > 0 ? '#dc2626' : '#16a34a' }">
            {{ current.abnormalCount }}
          </span>
        </a-descriptions-item>
        <a-descriptions-item label="耗时">{{ current.duration }} 分钟</a-descriptions-item>
        <a-descriptions-item label="结论" :span="2">{{ current.summary }}</a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </page-wrapper>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import request from '@/api/http/request';

interface Record {
  id: number;
  taskCode: string;
  stationName: string;
  executor: string;
  finishTime: string;
  itemCount: number;
  abnormalCount: number;
  duration: number;
  summary: string;
}

const columns = [
  { title: '任务编号', dataIndex: 'taskCode', key: 'taskCode', width: 110 },
  { title: '电站', dataIndex: 'stationName', key: 'stationName' },
  { title: '执行人', dataIndex: 'executor', key: 'executor', width: 110 },
  { title: '完成时间', dataIndex: 'finishTime', key: 'finishTime', width: 170 },
  { title: '检查项', dataIndex: 'itemCount', key: 'itemCount', width: 90 },
  { title: '结果', dataIndex: 'abnormalCount', key: 'abnormalCount', width: 120 },
  { title: '耗时', dataIndex: 'duration', key: 'duration', width: 100 },
  { title: '操作', key: 'action', width: 100 },
];

const list = ref<Record[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const keyword = ref('');
const detailOpen = ref(false);
const current = ref<Record | null>(null);

const load = async () => {
  loading.value = true;
  try {
    const { data } = await request.get<{ total: number; list: Record[] }>(
      '/inspection/record/list',
      { params: { page: page.value, pageSize: pageSize.value, keyword: keyword.value } },
    );
    list.value = data.list;
    total.value = data.total;
  } finally {
    loading.value = false;
  }
};

const onPageChange = (pag: any) => {
  page.value = pag.current;
  pageSize.value = pag.pageSize;
  load();
};

const onView = (r: Record) => {
  current.value = r;
  detailOpen.value = true;
};

onMounted(load);
</script>
