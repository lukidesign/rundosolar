<template>
  <a-modal
    :open="visible"
    title="完成整改"
    :width="640"
    :confirm-loading="submitting"
    :mask-closable="false"
    ok-text="提交"
    cancel-text="取消"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 18 }"
    >
      <a-form-item label="整改结果" name="rectifyResult">
        <a-textarea
          v-model:value="formState.rectifyResult"
          :rows="4"
          :maxlength="500"
          show-count
          placeholder="请填写整改过程、处理结果、验证情况等"
        />
      </a-form-item>

      <a-form-item label="整改图片" name="rectifyImages">
        <a-upload
          v-model:file-list="fileList"
          list-type="picture-card"
          accept="image/*"
          :max-count="9"
          :before-upload="beforeUpload"
          :custom-request="customUpload"
          @preview="handlePreview"
        >
          <div v-if="fileList.length < 9">
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
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import type { FormInstance, Rule } from 'ant-design-vue/es/form';
import type { UploadFile, UploadProps } from 'ant-design-vue/es/upload/interface';
import { PlusOutlined } from '@ant-design/icons-vue';
import { rectifyHiddenFlaw } from './api';
import { uploadFile } from '@/utils/upload';

interface Props {
  visible: boolean;
  id?: number;
}
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void;
  (e: 'success'): void;
}>();

const formRef = ref<FormInstance>();
const submitting = ref(false);

const formState = reactive<{ rectifyResult: string; rectifyImages: string[] }>({
  rectifyResult: '',
  rectifyImages: [],
});

const fileList = ref<UploadFile[]>([]);
const previewUrl = ref('');
const previewVisible = ref(false);

const rules: Record<string, Rule[]> = {
  rectifyResult: [{ required: true, message: '请填写整改结果', trigger: 'blur' }],
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

watch(
  fileList,
  (list) => {
    formState.rectifyImages = list
      .map((f) => f.url || (f.response as any)?.url)
      .filter(Boolean) as string[];
  },
  { deep: true },
);

watch(
  () => props.visible,
  (v) => {
    if (v) {
      formState.rectifyResult = '';
      formState.rectifyImages = [];
      fileList.value = [];
      formRef.value?.resetFields();
    }
  },
);

const handleOk = async () => {
  if (!props.id) return;
  try {
    await formRef.value?.validate();
    submitting.value = true;
    await rectifyHiddenFlaw(props.id, {
      rectifyResult: formState.rectifyResult,
      rectifyImages: formState.rectifyImages,
    });
    message.success('整改已提交');
    emit('success');
    emit('update:visible', false);
  } catch (e) {
    // ignore
  } finally {
    submitting.value = false;
  }
};
const handleCancel = () => emit('update:visible', false);
</script>
