<template>
  <page-wrapper title="隐患工单">
    <!-- 搜索区 -->
    <a-card :bordered="false" class="mb-3">
      <a-form layout="inline" :model="query" @keyup.enter="handleSearch">
        <a-form-item label="电站名称">
          <a-select
            v-model:value="query.stationId"
            placeholder="请选择"
            allow-clear
            show-search
            :filter-option="false"
            :options="stationOptions"
            :field-names="{ label: 'name', value: 'id' }"
            style="width: 200px"
            @search="onStationSearch"
            @focus="onStationSearch('')"
          />
        </a-form-item>
        <a-form-item label="整改负责人">
          <a-select
            v-model:value="query.rectifierId"
            placeholder="请选择"
            allow-clear
            show-search
            :filter-option="false"
            :options="userOptions"
            :field-names="{ label: 'name', value: 'id' }"
            style="width: 200px"
            @search="onUserSearch"
            @focus="onUserSearch('')"
          />
        </a-form-item>
        <a-form-item label="检查类型">
          <a-select
            v-model:value="query.checkType"
            placeholder="请选择"
            allow-clear
            :options="checkTypeOptions"
            style="width: 160px"
          />
        </a-form-item>
        <a-form-item label="发现问题时间">
          <a-range-picker v-model:value="dateRange" value-format="YYYY-MM-DD" />
        </a-form-item>
        <a-form-item label="整改情况">
          <a-select
            v-model:value="query.rectifyStatus"
            placeholder="请选择"
            allow-clear
            :options="rectifyStatusOptions"
            style="width: 160px"
          />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button @click="handleReset">重置</a-button>
            <a-button type="primary" @click="handleSearch">搜索</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 工具栏 + 表格 -->
    <a-card :bordered="false">
      <a-space class="mb-3">
        <a-button type="primary" @click="openCreate">
          <plus-outlined /> 上报隐患
        </a-button>
        <a-button :loading="exporting" @click="handleExport">批量导出</a-button>
      </a-space>

      <a-table
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="pagination"
        :scroll="{ x: 1600 }"
        row-key="id"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'hazardLevel'">
            <a-tag :color="HAZARD_LEVEL_MAP[record.hazardLevel as HazardLevel].color">
              {{ HAZARD_LEVEL_MAP[record.hazardLevel as HazardLevel].text }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'rectifyStatus'">
            <a-badge
              :status="(RECTIFY_STATUS_MAP[record.rectifyStatus as RectifyStatus].color as any)"
              :text="RECTIFY_STATUS_MAP[record.rectifyStatus as RectifyStatus].text"
            />
          </template>
          <template v-else-if="column.key === 'problemImages'">
            <div v-if="record.problemImages?.length" class="img-cell">
              <a-image-preview-group>
                <a-image
                  :src="record.problemImages[0]"
                  :width="48"
                  :height="48"
                  :fallback="fallbackImg"
                />
                <template v-for="(url, i) in record.problemImages.slice(1)" :key="i">
                  <a-image :src="url" :style="{ display: 'none' }" :fallback="fallbackImg" />
                </template>
              </a-image-preview-group>
              <span v-if="record.problemImages.length > 1" class="img-count">
                +{{ record.problemImages.length - 1 }}
              </span>
            </div>
            <span v-else>--</span>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space :size="4">
              <a
                v-if="record.rectifyStatus !== 'DONE'"
                @click="openRectify(record)"
              >完成整改</a>
              <a @click="openEdit(record.id)">编辑</a>
              <a @click="openView(record.id)">查看</a>
              <a-popconfirm title="确认删除该隐患?" @confirm="handleDelete(record.id)">
                <a class="text-danger">删除</a>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 上报 / 编辑 / 查看 弹窗 -->
    <form-modal
      v-model:visible="modalVisible"
      :mode="modalMode"
      :id="currentId"
      @success="fetchList"
    />

    <!-- 完成整改 弹窗 -->
    <rectify-modal
      v-model:visible="rectifyVisible"
      :id="currentId"
      @success="fetchList"
    />
  </page-wrapper>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import type { TablePaginationConfig } from 'ant-design-vue';
import dayjs, { Dayjs } from 'dayjs';
import FormModal from './FormModal.vue';
import RectifyModal from './RectifyModal.vue';
import {
  columns,
  CHECK_TYPE_MAP,
  RECTIFY_STATUS_MAP,
  HAZARD_LEVEL_MAP,
  PROBLEM_MAJOR_MAP,
} from './columns';
import type {
  HiddenFlawItem,
  HiddenFlawQuery,
  ModalMode,
  HazardLevel,
  RectifyStatus,
} from './types';
import {
  getHiddenFlawList,
  deleteHiddenFlaw,
  searchStations,
  searchUsers,
} from './api';

// --- 搜索表单 ---
const query = reactive<HiddenFlawQuery>({
  pageNum: 1,
  pageSize: 10,
});
const dateRange = ref<[Dayjs, Dayjs] | []>([]);

const toOptions = <T extends string>(map: Record<T, any>) =>
  (Object.keys(map) as T[]).map((k) => ({
    value: k,
    label: typeof map[k] === 'string' ? map[k] : map[k].text,
  }));
const checkTypeOptions = toOptions(CHECK_TYPE_MAP);
const rectifyStatusOptions = toOptions(RECTIFY_STATUS_MAP);

// --- 搜索区远程下拉 ---
const stationOptions = ref<{ id: number; name: string }[]>([]);
const userOptions = ref<{ id: number; name: string }[]>([]);
let stationTimer: any;
let userTimer: any;
const onStationSearch = (kw: string) => {
  clearTimeout(stationTimer);
  stationTimer = setTimeout(async () => {
    const { data } = await searchStations(kw);
    stationOptions.value = data ?? [];
  }, 300);
};
const onUserSearch = (kw: string) => {
  clearTimeout(userTimer);
  userTimer = setTimeout(async () => {
    const { data } = await searchUsers(kw);
    userOptions.value = data ?? [];
  }, 300);
};

// --- 表格 ---
const list = ref<HiddenFlawItem[]>([]);
const loading = ref(false);
const pagination = reactive<TablePaginationConfig>({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (t) => `共 ${t} 条`,
});

const fetchList = async () => {
  loading.value = true;
  try {
    if (dateRange.value && dateRange.value.length === 2) {
      const [s, e] = dateRange.value as any;
      query.discoverTimeStart = typeof s === 'string' ? s : dayjs(s).format('YYYY-MM-DD');
      query.discoverTimeEnd = typeof e === 'string' ? e : dayjs(e).format('YYYY-MM-DD');
    } else {
      query.discoverTimeStart = undefined;
      query.discoverTimeEnd = undefined;
    }
    const { data } = await getHiddenFlawList({
      ...query,
      pageNum: pagination.current || 1,
      pageSize: pagination.pageSize || 10,
    });
    list.value = data.list;
    pagination.total = data.total;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.current = 1;
  fetchList();
};
const handleReset = () => {
  query.stationId = undefined;
  query.rectifierId = undefined;
  query.checkType = undefined;
  query.rectifyStatus = undefined;
  query.sortField = undefined;
  query.sortOrder = undefined;
  dateRange.value = [];
  pagination.current = 1;
  fetchList();
};

const handleTableChange = (pag: TablePaginationConfig, _filters: any, sorter: any) => {
  pagination.current = pag.current || 1;
  pagination.pageSize = pag.pageSize || 10;
  if (sorter?.field) {
    query.sortField = sorter.field as string;
    query.sortOrder = sorter.order as 'ascend' | 'descend' | undefined;
  } else {
    query.sortField = undefined;
    query.sortOrder = undefined;
  }
  fetchList();
};

// --- 弹窗 ---
const modalVisible = ref(false);
const modalMode = ref<ModalMode>('create');
const currentId = ref<number | undefined>();

const openCreate = () => {
  modalMode.value = 'create';
  currentId.value = undefined;
  modalVisible.value = true;
};
const openEdit = (id: number) => {
  modalMode.value = 'edit';
  currentId.value = id;
  modalVisible.value = true;
};
const openView = (id: number) => {
  modalMode.value = 'view';
  currentId.value = id;
  modalVisible.value = true;
};

const rectifyVisible = ref(false);
const openRectify = (record: HiddenFlawItem) => {
  currentId.value = record.id;
  rectifyVisible.value = true;
};

// --- 删除 ---
const handleDelete = async (id: number) => {
  await deleteHiddenFlaw(id);
  message.success('删除成功');
  fetchList();
};

// --- 导出 (xlsx) ---
const exporting = ref(false);
const handleExport = async () => {
  exporting.value = true;
  try {
    const XLSX = await import('xlsx');
    const { data } = await getHiddenFlawList({
      ...query,
      pageNum: 1,
      pageSize: 99999,
    });
    const rows = (data.list || []).map((it) => ({
      ID: it.id,
      电站: it.stationName,
      检查类型: CHECK_TYPE_MAP[it.checkType] || it.checkType,
      问题大类: PROBLEM_MAJOR_MAP[it.problemMajor] || it.problemMajor,
      问题描述: it.problemDetail,
      隐患分级: HAZARD_LEVEL_MAP[it.hazardLevel]?.text || it.hazardLevel,
      整改状态: RECTIFY_STATUS_MAP[it.rectifyStatus]?.text || it.rectifyStatus,
      整改负责人: it.rectifierName,
      发现时间: it.discoverTime,
      整改期限: it.rectifyDeadline || '',
      整改方案: it.rectifyPlan || '',
      整改结果: it.rectifyResult || '',
      备注: it.remark || '',
      创建时间: it.createdAt,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '隐患工单');
    XLSX.writeFile(wb, `隐患工单_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`);
    message.success('导出成功');
  } finally {
    exporting.value = false;
  }
};

/** 图片加载失败时的占位 */
// 纯色占位图，无中文字符，btoa 安全
const fallbackImg =
  'data:image/svg+xml;base64,' +
  btoa('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="100%" height="100%" fill="#f0f0f0"/></svg>');

onMounted(() => {
  fetchList();
});
</script>

<style lang="less" scoped>
/* 图片列：缩略图 + 数量角标 */
.img-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}
.img-count {
  font-size: 12px;
  color: #1890ff;
  white-space: nowrap;
}

/* 若列内出现纯文字，最多 3 行省略 */
.img-cell-text {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  word-break: break-all;
}
</style>
