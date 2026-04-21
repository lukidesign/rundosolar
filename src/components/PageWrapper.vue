<template>
  <div class="page-wrapper">
    <div v-if="title || $slots.header" class="page-wrapper-header">
      <div class="page-wrapper-title">
        <slot name="header">{{ title }}</slot>
      </div>
      <div v-if="$slots.extra" class="page-wrapper-extra">
        <slot name="extra" />
      </div>
    </div>
    <div class="page-wrapper-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title?: string }>();
</script>

<style lang="less" scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-wrapper-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fff;
  border-radius: 4px;
}

.page-wrapper-title {
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
}

.page-wrapper-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
