<template>
  <page-wrapper title="巡检任务">
    <template #extra>
      <a-space>
        <a-input-search
          v-model:value="keyword"
          placeholder="搜索计划名称"
          style="width: 220px"
          allow-clear
          @search="load"
        />
        <a-select
          v-model:value="status"
          placeholder="状态"
          style="width: 120px"
          allow-clear
          @change="load"
        >
          <a-select-option v-for="s in TASK_STATUS" :key="s" :value="s">{{ s }}</a-select-option>
        </a-select>
        <a-button type="primary" @click="load">查询</a-button>
      </a-space>
    </template>

    <a-card :bordered="false">
      <a-row :gutter="16" style="margin-bottom: 16px">
        <a-col :span="6" v-for="(stat, i) in stats" :key="i">
          <a-card size="small" :bordered="false" class="stat-card">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value" :style="{ color: stat.color }">{{ stat.value }}</div>
          </a-card>
        </a-col>
      </a-row>

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
          <template v-if="column.key === 'status'">
            <a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag>
          </template>
          <template v-else-if="column.key === 'abnormalCount'">
            <span :style="{ color: record.abnormalCount > 0 ? '#dc2626' : '#16a34a' }">
              {{ record.abnormalCount }}
            </span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a
                v-if="record.status !== '已完成'"
                @click="onFinish(record)"
              >完成任务</a>
              <a v-else style="color: #94a3b8">已完成</a>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </page-wrapper>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import request from '@/api/http/request';

const TASK_STATUS = ['待执行', '执行中', '已完成', '已逾期'];

interface Task {
  id: number;
  code: string;
  planName: string;
  stationName: string;
  executor: string;
  status: string;
  planTime: string;
  finishTime: string;
  itemCount: number;
  abnormalCount: number;
}

const columns = [
  { title: '任务编号', dataIndex: 'code', key: 'code', width: 110 },
  { title: '计划名称', dataIndex: 'planName', key: 'planName' },
  { title: '电站', dataIndex: 'stationName', key: 'stationName', width: 150 },
  { title: '执行人', dataIndex: 'executor', key: 'executor', width: 100 },
  { title: '计划时间', dataIndex: 'planTime', key: 'planTime', width: 170 },
  { title: '完成时间', dataIndex: 'finishTime', key: 'finishTime', width: 170 },
  { title: '项数', dataIndex: 'itemCount', key: 'itemCount', width: 70 },
  { title: '异常', dataIndex: 'abnormalCount', key: 'abnormalCount', width: 70 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 90 },
  { title: '操作', key: 'action', width: 120 },
];

const list = ref<Task[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const keyword = ref('');
const status = ref<string>();

const statusColor = (s: string) =>
  ({ 待执行: 'blue', 执行中: 'orange', 已完成: 'green', 已逾期: 'red' } as any)[s] || 'default';

const stats = computed(() => [
  { label: '本页总数', value: list.value.length, color: '#1e3a8a' },
  {
    label: '待执行',
    value: list.value.filter((t) => t.status === '待执行').length,
    color: '#0ea5e9',
  },
  {
    label: '已完成',
    value: list.value.filter((t) => t.status === '已完成').length,
    color: '#16a34a',
  },
  {
    label: '已逾期',
    value: list.value.filter((t) => t.status === '已逾期').length,
    color: '#dc2626',
  },
]);

const load = async () => {
  loading.value = true;
  try {
    const { data } = await request.get<{ total: number; list: Task[] }>('/inspection/task/list', {
      params: { page: page.value, pageSize: pageSize.value, keyword: keyword.value, status: status.value },
    });
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

const onFinish = async (r: Task) => {
  await request.post(`/inspection/task/${r.id}/finish`);
  message.success('任务已完成');
  load();
};

onMounted(load);
</script>

<style lang="less" scoped>
.stat-card {
  background: #f8fafc;
  :deep(.ant-card-body) {
    padding: 12px 16px;
  }
}
.stat-label {
  color: #64748b;
  font-size: 13px;
}
.stat-value {
  font-size: 22px;
  font-weight: 700;
  margin-top: 4px;
}
</style>
