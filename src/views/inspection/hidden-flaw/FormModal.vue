<template>
  <a-modal
    :open="visible"
    :title="title"
    :width="820"
    :confirm-loading="submitting"
    :mask-closable="false"
    :footer="mode === 'view' ? null : undefined"
    :ok-text="mode === 'edit' ? '保存' : '提交'"
    cancel-text="取消"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      :disabled="mode === 'view'"
    >
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item label="电站名称" name="stationId">
            <a-select
              v-model:value="formState.stationId"
              placeholder="请选择电站"
              show-search
              :filter-option="false"
              :options="stationOptions"
              :field-names="{ label: 'name', value: 'id' }"
              @search="onStationSearch"
              @focus="onStationSearch('')"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="检查类型" name="checkType">
            <a-select
              v-model:value="formState.checkType"
              placeholder="请选择"
              :options="checkTypeOptions"
            />
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item label="发现问题时间" name="discoverTime">
            <a-date-picker
              v-model:value="discoverTimeModel"
              value-format="YYYY-MM-DD HH:mm:ss"
              show-time
              style="width: 100%"
              :disabled-date="disabledFutureDate"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="问题大类" name="problemMajor">
            <a-select
              v-model:value="formState.problemMajor"
              placeholder="请选择"
              :options="problemMajorOptions"
            />
          </a-form-item>
        </a-col>

        <a-col :span="24">
          <a-form-item label="问题细分" name="problemDetail" :label-col="{ span: 3 }" :wrapper-col="{ span: 20 }">
            <a-textarea
              v-model:value="formState.problemDetail"
              :rows="3"
              :maxlength="500"
              show-count
              placeholder="请描述具体问题"
            />
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item label="隐患分级" name="hazardLevel">
            <a-select
              v-model:value="formState.hazardLevel"
              placeholder="请选择"
              :options="hazardLevelOptions"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="整改负责人" name="rectifierId">
            <a-select
              v-model:value="formState.rectifierId"
              placeholder="请选择"
              show-search
              :filter-option="false"
              :options="userOptions"
              :field-names="{ label: 'name', value: 'id' }"
              @search="onUserSearch"
              @focus="onUserSearch('')"
            />
          </a-form-item>
        </a-col>

        <a-col :span="12">
          <a-form-item label="整改期限" name="rectifyDeadline">
            <a-date-picker
              v-model:value="rectifyDeadlineModel"
              value-format="YYYY-MM-DD"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>

        <a-col :span="24">
          <a-form-item label="整改计划" name="rectifyPlan" :label-col="{ span: 3 }" :wrapper-col="{ span: 20 }">
            <a-textarea v-model:value="formState.rectifyPlan" :rows="2" :maxlength="300" show-count />
          </a-form-item>
        </a-col>

        <a-col :span="24">
          <a-form-item label="问题图片" name="problemImages" :label-col="{ span: 3 }" :wrapper-col="{ span: 20 }">
            <a-upload
              v-model:file-list="fileList"
              list-type="picture-card"
              accept="image/*"
              :max-count="9"
              :before-upload="beforeUpload"
              :custom-request="customUpload"
              @preview="handlePreview"
              @remove="handleRemove"
            >
              <div v-if="fileList.length < 9 && mode !== 'view'">
                <plus-outlined />
                <div style="margin-top: 8px">上传</div>
              </div>
            </a-upload>
            <a-image
              v-if="previewUrl"
              :src="previewUrl"
              :style="{ display: 'none' }"
              :preview="{ visible: previewVisible, onVisibleChange: (v: boolean) => (previewVisible = v) }"
            />
          </a-form-item>
        </a-col>

        <a-col :span="24">
          <a-form-item label="备注" name="remark" :label-col="{ span: 3 }" :wrapper-col="{ span: 20 }">
            <a-textarea v-model:value="formState.remark" :rows="2" :maxlength="200" show-count />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import type { FormInstance, Rule } from 'ant-design-vue/es/form';
import type { UploadFile, UploadProps } from 'ant-design-vue/es/upload/interface';
import { PlusOutlined } from '@ant-design/icons-vue';
import dayjs, { Dayjs } from 'dayjs';
import {
  CHECK_TYPE_MAP,
  PROBLEM_MAJOR_MAP,
  HAZARD_LEVEL_MAP,
} from './columns';
import type { HiddenFlawFormState, HiddenFlawItem, ModalMode } from './types';
import {
  createHiddenFlaw,
  updateHiddenFlaw,
  getHiddenFlawDetail,
  searchStations,
  searchUsers,
} from './api';
import { uploadFile } from '@/utils/upload';

interface Props {
  visible: boolean;
  mode: ModalMode;
  id?: number;
}

const props = withDefaults(defineProps<Props>(), { mode: 'create' });
const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void;
  (e: 'success'): void;
}>();

const formRef = ref<FormInstance>();
const submitting = ref(false);

const defaultForm = (): HiddenFlawFormState => ({
  stationId: undefined,
  checkType: undefined,
  discoverTime: undefined,
  problemMajor: undefined,
  problemDetail: '',
  hazardLevel: undefined,
  problemImages: [],
  rectifierId: undefined,
  rectifyDeadline: undefined,
  rectifyPlan: '',
  remark: '',
});

const formState = reactive<HiddenFlawFormState>(defaultForm());
const fileList = ref<UploadFile[]>([]);
const previewUrl = ref('');
const previewVisible = ref(false);

const title = computed(() =>
  props.mode === 'create' ? '上报隐患' : props.mode === 'edit' ? '编辑隐患' : '查看隐患',
);

const toOptions = <T extends string>(map: Record<T, any>) =>
  (Object.keys(map) as T[]).map((k) => ({
    value: k,
    label: typeof map[k] === 'string' ? map[k] : map[k].text,
  }));

const checkTypeOptions = toOptions(CHECK_TYPE_MAP);
const problemMajorOptions = toOptions(PROBLEM_MAJOR_MAP);
const hazardLevelOptions = toOptions(HAZARD_LEVEL_MAP);

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

const discoverTimeModel = computed<Dayjs | undefined>({
  get: () => (formState.discoverTime ? dayjs(formState.discoverTime) : undefined),
  set: (v) => (formState.discoverTime = v ? v.format('YYYY-MM-DD HH:mm:ss') : undefined),
});
const rectifyDeadlineModel = computed<Dayjs | undefined>({
  get: () => (formState.rectifyDeadline ? dayjs(formState.rectifyDeadline) : undefined),
  set: (v) => (formState.rectifyDeadline = v ? v.format('YYYY-MM-DD') : undefined),
});
const disabledFutureDate = (d: Dayjs) => d && d.isAfter(dayjs().endOf('day'));

const rules: Record<string, Rule[]> = {
  stationId: [{ required: true, message: '请选择电站', trigger: 'change' }],
  checkType: [{ required: true, message: '请选择检查类型', trigger: 'change' }],
  discoverTime: [{ required: true, message: '请选择发现问题时间', trigger: 'change' }],
  problemMajor: [{ required: true, message: '请选择问题大类', trigger: 'change' }],
  problemDetail: [{ required: true, message: '请填写问题细分', trigger: 'blur' }],
  hazardLevel: [{ required: true, message: '请选择隐患分级', trigger: 'change' }],
  rectifierId: [{ required: true, message: '请选择整改负责人', trigger: 'change' }],
  rectifyDeadline: [{ required: true, message: '请选择整改期限', trigger: 'change' }],
};

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const okType = /image\/(png|jpe?g|gif|webp)/.test(file.type);
  const okSize = file.size / 1024 / 1024 < 10;
  if (!okType) message.error('仅支持图片格式');
  if (!okSize) message.error('单张图片不得超过 10MB');
  return okType && okSize;
};

const customUpload: UploadProps['customRequest'] = async (options) => {
  try {
    const { url } = await uploadFile(options.file as File);
    options.onSuccess?.({ url }, options.file as any);
  } catch (e) {
    options.onError?.(e as Error);
  }
};

const handlePreview = (file: UploadFile) => {
  previewUrl.value = (file.url || (file.response as any)?.url) ?? '';
  previewVisible.value = true;
};

const handleRemove = (file: UploadFile) => {
  const url = file.url || (file.response as any)?.url;
  formState.problemImages = formState.problemImages.filter((u) => u !== url);
  return true;
};

watch(
  fileList,
  (list) => {
    formState.problemImages = list
      .map((f) => f.url || (f.response as any)?.url)
      .filter(Boolean) as string[];
  },
  { deep: true },
);

const resetForm = () => {
  Object.assign(formState, defaultForm());
  fileList.value = [];
  formRef.value?.resetFields();
};

const fillForm = (data: HiddenFlawItem) => {
  Object.assign(formState, {
    id: data.id,
    stationId: data.stationId,
    checkType: data.checkType,
    discoverTime: data.discoverTime,
    problemMajor: data.problemMajor,
    problemDetail: data.problemDetail,
    hazardLevel: data.hazardLevel,
    problemImages: data.problemImages ?? [],
    rectifierId: data.rectifierId,
    rectifyDeadline: data.rectifyDeadline,
    rectifyPlan: data.rectifyPlan,
    remark: data.remark,
  });
  if (data.stationId)
    stationOptions.value = [{ id: data.stationId, name: data.stationName }];
  if (data.rectifierId)
    userOptions.value = [{ id: data.rectifierId, name: data.rectifierName }];
  fileList.value = (data.problemImages ?? []).map((url, i) => ({
    uid: String(-i - 1),
    name: `image-${i}`,
    status: 'done',
    url,
  }));
};

watch(
  () => [props.visible, props.id, props.mode] as const,
  async ([visible, id]) => {
    if (!visible) return;
    resetForm();
    if ((props.mode === 'edit' || props.mode === 'view') && id) {
      const { data } = await getHiddenFlawDetail(id);
      if (data) fillForm(data);
    }
  },
  { immediate: true },
);

const handleOk = async () => {
  try {
    await formRef.value?.validate();
    submitting.value = true;
    if (props.mode === 'edit' && props.id) {
      await updateHiddenFlaw(props.id, formState);
      message.success('保存成功');
    } else {
      await createHiddenFlaw(formState);
      message.success('提交成功');
    }
    emit('success');
    emit('update:visible', false);
  } catch (e) {
    // 表单校验错误忽略，接口错误由 axios 拦截器处理
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => emit('update:visible', false);
</script>
