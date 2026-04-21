<template>
  <a-layout class="basic-layout">
    <!-- Top Bar (#001529, 48px, fixed) -->
    <a-layout-header class="top-header">
      <div class="top-left">
        <div class="brand">
          <span class="brand-logo">
            <span class="hex hex-a"></span>
            <span class="hex hex-b"></span>
            <span class="hex hex-c"></span>
          </span>
          <span class="brand-title">RunDo 光伏运维平台</span>
        </div>
        <a-menu
          theme="dark"
          mode="horizontal"
          :selected-keys="activeTopKey ? [activeTopKey] : []"
          class="top-menu"
          @click="onTopMenuClick"
        >
          <a-menu-item v-for="m in modules" :key="m.path">
            {{ m.title }}
          </a-menu-item>
        </a-menu>
      </div>

      <div class="top-right">
        <a-tooltip title="搜索">
          <search-outlined class="top-icon" />
        </a-tooltip>
        <a-tooltip title="消息">
          <a-badge :count="3" :offset="[-2, 4]">
            <bell-outlined class="top-icon" />
          </a-badge>
        </a-tooltip>
        <a-tooltip title="全屏">
          <fullscreen-outlined class="top-icon" />
        </a-tooltip>
        <a-dropdown>
          <span class="user-info">
            <a-avatar size="small" class="avatar">
              {{ userName.charAt(0).toUpperCase() }}
            </a-avatar>
            <span class="user-name">{{ userName }}</span>
          </span>
          <template #overlay>
            <a-menu>
              <a-menu-item key="profile" disabled>
                <user-outlined /> 个人中心
              </a-menu-item>
              <a-menu-divider />
              <a-menu-item key="logout" @click="handleLogout">
                <logout-outlined /> 退出登录
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </a-layout-header>

    <a-layout class="body-layout">
      <!-- Sidebar (light, 208px) -->
      <a-layout-sider
        :width="208"
        theme="light"
        class="sub-sider"
        :collapsed-width="64"
        v-model:collapsed="collapsed"
      >
        <a-menu
          theme="light"
          mode="inline"
          :selected-keys="selectedKeys"
          :open-keys="openKeys"
          class="sub-menu"
          @update:openKeys="(k: string[]) => (openKeys = k)"
          @click="onSubMenuClick"
        >
          <template v-for="item in subMenu" :key="item.path">
            <a-sub-menu v-if="item.children?.length" :key="item.path">
              <template #title>
                <component :is="iconMap[item.icon]" v-if="item.icon" />
                <span>{{ item.title }}</span>
              </template>
              <a-menu-item v-for="child in item.children" :key="child.path">
                {{ child.title }}
              </a-menu-item>
            </a-sub-menu>
            <a-menu-item v-else :key="item.path">
              <component :is="iconMap[item.icon]" v-if="item.icon" />
              <span>{{ item.title }}</span>
            </a-menu-item>
          </template>
        </a-menu>

        <div class="sider-footer">
          <span class="theme-toggle" @click="collapsed = !collapsed">
            <menu-fold-outlined v-if="!collapsed" />
            <menu-unfold-outlined v-else />
          </span>
        </div>
      </a-layout-sider>

      <a-layout-content class="content">
        <a-breadcrumb class="crumb">
          <a-breadcrumb-item v-for="(c, i) in crumbs" :key="i">{{ c }}</a-breadcrumb-item>
        </a-breadcrumb>
        <div class="page-slot">
          <router-view />
        </div>
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import {
  DashboardOutlined,
  ApartmentOutlined,
  FileSearchOutlined,
  AlertOutlined,
  ScheduleOutlined,
  BarChartOutlined,
  SettingOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SearchOutlined,
  BellOutlined,
  FullscreenOutlined,
} from '@ant-design/icons-vue';
import { routes } from '@/router/routes';

const router = useRouter();
const route = useRoute();
const user = useUserStore();

const collapsed = ref(false);

const iconMap: Record<string, any> = {
  DashboardOutlined,
  ApartmentOutlined,
  FileSearchOutlined,
  AlertOutlined,
  ScheduleOutlined,
  BarChartOutlined,
  SettingOutlined,
};

interface MenuNode {
  path: string;
  title: string;
  icon: string;
  children?: MenuNode[];
}

const modules = computed<MenuNode[]>(() => {
  const layoutRoute = routes.find((r) => r.path === '/' && r.children);
  if (!layoutRoute?.children) return [];
  return layoutRoute.children
    .filter((c) => !c.meta?.hidden)
    .map((c) => {
      const basePath = c.path.startsWith('/') ? c.path : `/${c.path}`;
      const children = (c.children || [])
        .filter((cc) => !cc.meta?.hidden)
        .map((cc) => ({
          path: `${basePath}/${cc.path}`.replace(/\/+/g, '/'),
          title: (cc.meta?.title as string) || cc.path,
          icon: '',
        }));
      return {
        path: basePath,
        title: (c.meta?.title as string) || c.path,
        icon: (c.meta?.icon as string) || '',
        children,
      };
    });
});

const activeTopKey = computed(() => {
  const p = route.path;
  const match = modules.value.find((m) => p === m.path || p.startsWith(m.path + '/'));
  return match?.path || '';
});

const activeModule = computed(() =>
  modules.value.find((m) => m.path === activeTopKey.value) || null,
);

const subMenu = computed<MenuNode[]>(() => {
  const mod = activeModule.value;
  if (!mod) return [];
  // 如果子菜单多于一层就展开成分组；这里统一挂在顶级模块下
  if (!mod.children?.length) return [{ ...mod }];
  return [
    {
      path: mod.path,
      title: mod.title,
      icon: mod.icon,
      children: mod.children,
    },
  ];
});

const selectedKeys = ref<string[]>([]);
const openKeys = ref<string[]>([]);

const syncKeys = () => {
  const p = route.path;
  selectedKeys.value = [p];
  const mod = activeModule.value;
  if (mod && !openKeys.value.includes(mod.path)) openKeys.value.push(mod.path);
};

watch(() => route.path, syncKeys, { immediate: true });

const onTopMenuClick = ({ key }: { key: string }) => {
  const mod = modules.value.find((m) => m.path === key);
  if (!mod) return;
  const first = mod.children?.[0]?.path;
  router.push(first || mod.path);
};

const onSubMenuClick = ({ key }: { key: string }) => {
  if (key) router.push(key);
};

const crumbs = computed(() => {
  const arr: string[] = [];
  for (const m of route.matched) {
    const t = m.meta?.title as string | undefined;
    if (t && !arr.includes(t)) arr.push(t);
  }
  return arr;
});

const userName = computed(() => user.info?.nickname || user.info?.username || 'admin');

const handleLogout = () => {
  user.logout();
  router.replace('/login');
};
</script>

<style lang="less" scoped>
@primary: #1677ff;
@primary-bg: rgba(22, 119, 255, 0.08);

.basic-layout {
  min-height: 100vh;
}

// ===== Top Bar =====
.top-header {
  background: #001529;
  height: 48px;
  line-height: 48px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 999;
}
.top-left {
  display: flex;
  align-items: center;
  height: 48px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 20px 0 20px;
  color: #fff;
  min-width: 208px;
  .brand-title {
    font-size: 16px;
    font-weight: 600;
    white-space: nowrap;
  }
}
.brand-logo {
  position: relative;
  width: 22px;
  height: 22px;
  display: inline-block;
  .hex {
    position: absolute;
    width: 10px;
    height: 11px;
    border-radius: 2px;
    transform: rotate(30deg);
  }
  .hex-a {
    top: 0;
    left: 6px;
    background: #0ea5e9;
  }
  .hex-b {
    bottom: 0;
    left: 0;
    background: #fbbf24;
  }
  .hex-c {
    bottom: 0;
    right: 0;
    background: #34d399;
  }
}
:deep(.top-menu) {
  background: transparent;
  border-bottom: none;
  line-height: 48px;
  flex: 1;
  min-width: 0;
  .ant-menu-item {
    height: 48px;
    line-height: 48px;
    top: 0;
    padding: 0 16px;
    color: rgba(255, 255, 255, 0.65);
    &:hover,
    &-active,
    &-selected {
      color: #fff;
      background: transparent;
      border-bottom-color: transparent !important;
    }
    &-selected::after,
    &-active::after {
      border-bottom: 2px solid @primary !important;
    }
  }
}

.top-right {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 20px;
  color: #fff;
  .top-icon {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.85);
    cursor: pointer;
    &:hover {
      color: #fff;
    }
  }
  .user-info {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: #fff;
    .avatar {
      background: @primary;
    }
    .user-name {
      font-size: 14px;
    }
  }
}

// ===== Body =====
.body-layout {
  background: #f0f2f5;
}

.sub-sider {
  background: #fff;
  border-right: 1px solid #f0f0f0;
  position: relative;
  min-height: calc(100vh - 48px);
}
:deep(.sub-menu) {
  border-right: 0;
  padding-top: 8px;
  .ant-menu-item,
  .ant-menu-submenu-title {
    height: 48px;
    line-height: 48px;
    margin: 0;
    color: rgba(0, 0, 0, 0.85);
    font-size: 14px;
  }
  .ant-menu-item .anticon,
  .ant-menu-submenu-title .anticon {
    font-size: 16px;
    margin-right: 10px;
  }
  .ant-menu-item-selected {
    background: @primary-bg !important;
    color: @primary !important;
    &::after {
      border-right: 3px solid @primary !important;
    }
  }
  .ant-menu-submenu-selected > .ant-menu-submenu-title {
    color: @primary;
  }
}
.sider-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  padding: 10px 14px;
  border-top: 1px solid #f0f0f0;
  background: #fff;
  .theme-toggle {
    font-size: 16px;
    color: rgba(0, 0, 0, 0.65);
    cursor: pointer;
    &:hover {
      color: @primary;
    }
  }
}

// ===== Content =====
.content {
  padding: 12px 16px 16px;
  min-height: calc(100vh - 48px);
  overflow: auto;
}
.crumb {
  padding: 4px 4px 10px;
  font-size: 13px;
}
.page-slot {
  flex: 1;
}
</style>
