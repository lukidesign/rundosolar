<template>
  <page-wrapper title="设备树">
    <a-row :gutter="16">
      <a-col :span="8">
        <a-card :bordered="false" title="组织 / 设备">
          <a-input-search
            v-model:value="searchValue"
            placeholder="搜索设备"
            style="margin-bottom: 12px"
          />
          <a-tree
            :tree-data="treeData"
            :default-expand-all="true"
            :selected-keys="selectedKeys"
            @select="onSelect"
          />
        </a-card>
      </a-col>
      <a-col :span="16">
        <a-card :bordered="false" title="设备信息">
          <a-empty v-if="!selectedNode" description="请选择左侧节点" />
          <a-descriptions v-else :column="2" bordered size="small">
            <a-descriptions-item label="节点名称">{{ selectedNode.title }}</a-descriptions-item>
            <a-descriptions-item label="节点 Key">{{ selectedNode.key }}</a-descriptions-item>
            <a-descriptions-item label="类型">
              {{ selectedNode.children ? '分组' : '设备' }}
            </a-descriptions-item>
            <a-descriptions-item label="状态">
              <a-tag color="green">在线</a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </a-card>
      </a-col>
    </a-row>
  </page-wrapper>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface TreeNode {
  title: string;
  key: string;
  children?: TreeNode[];
}

const searchValue = ref('');
const selectedKeys = ref<string[]>([]);
const selectedNode = ref<TreeNode | null>(null);

const treeData: TreeNode[] = [
  {
    title: '京津光伏电站',
    key: 's-1',
    children: [
      {
        title: '1#升压站',
        key: 's-1-1',
        children: [
          { title: '1#逆变器', key: 's-1-1-1' },
          { title: '2#逆变器', key: 's-1-1-2' },
        ],
      },
      {
        title: '2#升压站',
        key: 's-1-2',
        children: [
          { title: '3#逆变器', key: 's-1-2-1' },
          { title: '汇流箱 A', key: 's-1-2-2' },
        ],
      },
    ],
  },
  {
    title: '沪浙光伏电站',
    key: 's-2',
    children: [{ title: '分布式屋顶组', key: 's-2-1' }],
  },
];

const findNode = (list: TreeNode[], key: string): TreeNode | null => {
  for (const n of list) {
    if (n.key === key) return n;
    if (n.children) {
      const r = findNode(n.children, key);
      if (r) return r;
    }
  }
  return null;
};

const onSelect = (keys: string[]) => {
  selectedKeys.value = keys;
  selectedNode.value = keys[0] ? findNode(treeData, keys[0]) : null;
};
</script>
