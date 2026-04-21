<template>
  <page-wrapper title="巡检模板">
    <template #extra>
      <a-space>
        <a-input-search
          v-model:value="keyword"
          placeholder="搜索模板名称"
          style="width: 220px"
          allow-clear
          @search="load"
        />
        <a-button type="primary" @click="onCreate">新增模板</a-button>
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
            <a-switch :checked="record.enabled" @change="(v: boolean) => onToggle(record, v)" />
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a @click="onEdit(record)">编辑</a>
              <a-popconfirm title="确定删除该模板？" @confirm="onDelete(record)">
                <a style="color: #dc2626">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      :open="modalOpen"
      :title="form.id ? '编辑模板' : '新增模板'"
      @ok="onSubmit"
      @cancel="modalOpen = false"
      :confirm-loading="submitting"
    >
      <a-form :model="form" layout="vertical">
        <a-form-item label="模板名称" required>
          <a-input v-model:value="form.name" />
        </a-form-item>
        <a-form-item label="分类">
          <a-select v-model:value="form.category">
            <a-select-option value="日常巡检">日常巡检</a-select-option>
            <a-select-option value="专项巡检">专项巡检</a-select-option>
            <a-select-option value="季节性巡检">季节性巡检</a-select-option>
            <a-select-option value="设备预防性维护">设备预防性维护</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="检查项数量">
          <a-input-number v-model:value="form.itemCount" :min="1" :max="200" style="width: 100%" />
        </a-form-item>
        <a-form-item label="说明">
          <a-textarea v-model:value="form.description" :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>
  </page-wrapper>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import request from '@/api/http/request';

interface Template {
  id: number;
  code: string;
  name: string;
  category: string;
  itemCount: number;
  description: string;
  enabled: boolean;
  createdAt: string;
}

const columns = [
  { title: '模板编号', dataIndex: 'code', key: 'code', width: 110 },
  { title: '模板名称', dataIndex: 'name', key: 'name' },
  { title: '分类', dataIndex: 'category', key: 'category', width: 140 },
  { title: '检查项', dataIndex: 'itemCount', key: 'itemCount', width: 90 },
  { title: '说明', dataIndex: 'description', key: 'description', ellipsis: true },
  { title: '启用', dataIndex: 'enabled', key: 'enabled', width: 80 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 170 },
  { title: '操作', key: 'action', width: 130 },
];

const list = ref<Template[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const loading = ref(false);
const keyword = ref('');
const modalOpen = ref(false);
const submitting = ref(false);
const form = reactive<Partial<Template>>({
  id: undefined,
  name: '',
  category: '日常巡检',
  itemCount: 10,
  description: '',
});

const load = async () => {
  loading.value = true;
  try {
    const { data } = await request.get<{ total: number; list: Template[] }>(
      '/inspection/template/list',
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

const onCreate = () => {
  Object.assign(form, { id: undefined, name: '', category: '日常巡检', itemCount: 10, description: '' });
  modalOpen.value = true;
};

const onEdit = (r: Template) => {
  Object.assign(form, r);
  modalOpen.value = true;
};

const onToggle = async (r: Template, v: boolean) => {
  await request.put(`/inspection/template/${r.id}`, { enabled: v });
  r.enabled = v;
  message.success('状态已更新');
};

const onDelete = async (r: Template) => {
  await request.delete(`/inspection/template/${r.id}`);
  message.success('已删除');
  load();
};

const onSubmit = async () => {
  if (!form.name) {
    message.warning('请输入模板名称');
    return;
  }
  submitting.value = true;
  try {
    if (form.id) {
      await request.put(`/inspection/template/${form.id}`, form);
      message.success('已保存');
    } else {
      await request.post('/inspection/template', form);
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
