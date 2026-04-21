<template>
  <page-wrapper :title="title">
    <template #extra>
      <a-space>
        <a-button type="primary">新增</a-button>
      </a-space>
    </template>
    <a-card :bordered="false">
      <a-empty :description="description || '模块建设中，敬请期待'">
        <template #image>
          <tool-outlined style="font-size: 48px; color: #cbd5e1" />
        </template>
      </a-empty>
    </a-card>
  </page-wrapper>
</template>

<script setup lang="ts">
import { ToolOutlined } from '@ant-design/icons-vue';
defineProps<{ title: string; description?: string }>();
</script>
