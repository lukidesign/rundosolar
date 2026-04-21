<template>
  <svg aria-hidden="true" class="svg-icon" :style="styleObj">
    <use :xlink:href="symbolId" :fill="color" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    name: string;
    prefix?: string;
    color?: string;
    size?: string | number;
  }>(),
  { prefix: 'icon', color: 'currentColor', size: '1em' },
);

const symbolId = computed(() => `#${props.prefix}-${props.name}`);
const styleObj = computed(() => {
  const s = typeof props.size === 'number' ? `${props.size}px` : props.size;
  return { width: s, height: s };
});
</script>

<style scoped>
.svg-icon {
  display: inline-block;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
