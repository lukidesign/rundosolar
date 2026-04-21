<template>
  <page-wrapper title="巡检计划">
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
          v-model:value="cycle"
          placeholder="周期"
          style="width: 120px"
          allow-clear
          @change="load"
        >
          <a-select-option v-for="c in CYCLES" :key="c" :value="c">{{ c }}</a-select-option>
        </a-select>
        <a-button type="primary" @click="onCreate">新增计划</a-button>
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
          <template v-if="column.key === 'enabled'">
            <a-tag :color="record.enabled ? 'green' : 'default'">
              {{ record.enabled ? '启用' : '停用' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="onDispatch(record)">立即派发</a>
              <a @click="onEdit(record)">编辑</a>
              <a-popconfirm title="确定删除该计划？" @confirm="onDelete(record)">
                <a style="color: #dc2626">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      :open="modalOpen"
      :title="form.id ? '编辑计划' : '新增计划'"
      @ok="onSubmit"
      @cancel="modalOpen = false"
      :confirm-loading="submitting"
      width="560px"
    >
      <a-form :model="form" layout="vertical">
        <a-form-item label="计划名称" required>
          <a-input v-model:value="form.name" />
        </a-form-item>
        <a-row :gutter="12">
          <a-col :span="12">
            <a-form-item label="电站">
              <a-select v-model:value="form.stationName">
                <a-select-option v-for="s in STATIONS" :key="s" :value="s">{{ s }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="巡检周期">
              <a-select v-model:value="form.cycle">
                <a-select-option v-for="c in CYCLES" :key="c" :value="c">{{ c }}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="使用模板">
              <a-input v-model:value="form.templateName" placeholder="可填任意模板名" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="负责人">
              <a-input v-model:value="form.owner" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="开始日期">
              <a-date-picker v-model:value="form.startDate" value-format="YYYY-MM-DD" style="width: 100%" />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="结束日期">
              <a-date-picker v-model:value="form.endDate" value-format="YYYY-MM-DD" style="width: 100%" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-modal>
  </page-wrapper>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import request from '@/api/http/request';

const CYCLES = ['每日', '每周', '每月', '每季度', '每年'];
const STATIONS = ['京津光伏电站', '沪浙光伏电站', '粤港光伏电站', '川渝光伏电站', '云贵光伏电站'];

interface Plan {
  id: number;
  code: string;
  name: string;
  stationName: string;
  templateName: string;
  cycle: string;
  owner: string;
  startDate: string;
  endDate: string;
  enabled: boolean;
  createdAt: string;
}

const columns = [
  { title: '计划编号', dataIndex: 'code', key: 'code', width: 110 },
  { title: '计划名称', dataIndex: 'name', key: 'name' },
  { title: '电站', dataIndex: 'stationName', key: 'stationName', width: 150 },
  { title: '模板', dataIndex: 'templateName', key: 'templateName' },
  { title: '周期', dataIndex: 'cycle', key: 'cycle', width: 90 },
  { title: '负责人', dataIndex: 'owner', key: 'owner', width: 100 },
  { title: '开始', dataIndex: 'startDate', key: 'startDate', width: 110 },
  { title: '结束', dataIndex: 'endDate', key: 'endDate', width: 110 },
  { title: '状态', dataIndex: 'enabled', key: 'enabled', width: 80 },
  { title: '操作', key: 'action', width: 180 },
];

const list = ref<Plan[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const keyword = ref('');
const cycle = ref<string>();

const modalOpen = ref(false);
const submitting = ref(false);
const form = reactive<Partial<Plan>>({});

const load = async () => {
  loading.value = true;
  try {
    const { data } = await request.get<{ total: number; list: Plan[] }>('/inspection/plan/list', {
      params: { page: page.value, pageSize: pageSize.value, keyword: keyword.value, cycle: cycle.value },
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

const onCreate = () => {
  Object.keys(form).forEach((k) => delete (form as any)[k]);
  Object.assign(form, {
    name: '',
    stationName: STATIONS[0],
    cycle: '每月',
    templateName: '',
    owner: '',
    startDate: '',
    endDate: '',
  });
  modalOpen.value = true;
};

const onEdit = (r: Plan) => {
  Object.assign(form, r);
  modalOpen.value = true;
};

const onDelete = async (r: Plan) => {
  await request.delete(`/inspection/plan/${r.id}`);
  message.success('已删除');
  load();
};

const onDispatch = async (r: Plan) => {
  await request.post(`/inspection/plan/${r.id}/dispatch`);
  message.success(`已为 "${r.name}" 派发一条任务`);
};

const onSubmit = async () => {
  if (!form.name) {
    message.warning('请输入计划名称');
    return;
  }
  submitting.value = true;
  try {
    if (form.id) {
      await request.put(`/inspection/plan/${form.id}`, form);
      message.success('已保存');
    } else {
      await request.post('/inspection/plan', form);
      message.success('已新增');
    }
    modalOpen.value = false;
    load();
  } finally {
    submitting.value = false;
  }
};

onMounted(load);
</script>
