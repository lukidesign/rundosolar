<template>
  <page-wrapper title="电站列表">
    <template #extra>
      <a-space>
        <a-input-search
          v-model:value="keyword"
          placeholder="搜索电站名称 / 编码"
          style="width: 260px"
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
          <a-select-option value="在线">在线</a-select-option>
          <a-select-option value="离线">离线</a-select-option>
          <a-select-option value="告警">告警</a-select-option>
        </a-select>
        <a-button type="primary" @click="load">查询</a-button>
      </a-space>
    </template>

    <a-card :bordered="false">
      <a-table
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showTotal: (t: number) => `共 ${t} 条`,
        }"
        row-key="id"
        size="middle"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a @click="goDetail(record.id)">详情</a>
          </template>
        </template>
      </a-table>
    </a-card>
  </page-wrapper>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import request from '@/api/http/request';

const router = useRouter();

interface Station {
  id: number;
  code: string;
  name: string;
  type: string;
  capacity: number;
  province: string;
  city: string;
  owner: string;
  onlineDate: string;
  status: string;
  dayGen: number;
  totalGen: number;
}

const columns = [
  { title: '电站编码', dataIndex: 'code', key: 'code', width: 110 },
  { title: '电站名称', dataIndex: 'name', key: 'name' },
  { title: '类型', dataIndex: 'type', key: 'type', width: 90 },
  { title: '装机容量(kW)', dataIndex: 'capacity', key: 'capacity', width: 120 },
  { title: '省份', dataIndex: 'province', key: 'province', width: 110 },
  { title: '业主', dataIndex: 'owner', key: 'owner', width: 110 },
  { title: '并网日期', dataIndex: 'onlineDate', key: 'onlineDate', width: 120 },
  { title: '状态', dataIndex: 'status', key: 'status', width: 90 },
  { title: '操作', key: 'action', width: 80 },
];

const list = ref<Station[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const keyword = ref('');
const status = ref<string>();

const statusColor = (s: string) =>
  ({ 在线: 'green', 离线: 'default', 告警: 'red' } as any)[s] || 'default';

const load = async () => {
  loading.value = true;
  try {
    const { data } = await request.get<{ total: number; list: Station[] }>(
      '/station/list',
      { params: { page: page.value, pageSize: pageSize.value, keyword: keyword.value, status: status.value } },
    );
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

const goDetail = (id: number) => router.push(`/station/detail/${id}`);

onMounted(load);
</script>
