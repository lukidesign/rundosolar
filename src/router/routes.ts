import type { RouteRecordRaw } from 'vue-router';
import BasicLayout from '@/layouts/BasicLayout.vue';

/**
 * 菜单 / 路由统一定义。
 * meta.title 用于菜单、面包屑、tab 标题。
 * meta.icon 用 @ant-design/icons-vue 的组件名字符串。
 * meta.hidden = true 不进菜单。
 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true },
  },
  { path: '/', redirect: '/dashboard' },
  {
    path: '/',
    component: BasicLayout,
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '工作台', icon: 'DashboardOutlined' },
      },
      {
        path: 'station',
        name: 'Station',
        redirect: '/station/list',
        meta: { title: '电站管理', icon: 'ApartmentOutlined' },
        children: [
          {
            path: 'list',
            name: 'StationList',
            component: () => import('@/views/station/list.vue'),
            meta: { title: '电站列表' },
          },
          {
            path: 'detail/:id',
            name: 'StationDetail',
            component: () => import('@/views/station/detail.vue'),
            meta: { title: '电站详情', hidden: true },
          },
          {
            path: 'device-tree',
            name: 'DeviceTree',
            component: () => import('@/views/station/device-tree.vue'),
            meta: { title: '设备树' },
          },
        ],
      },
      {
        path: 'inspection',
        name: 'Inspection',
        redirect: '/inspection/hidden-flaw',
        meta: { title: '巡检管理', icon: 'FileSearchOutlined' },
        children: [
          {
            path: 'plan',
            name: 'InspectionPlan',
            component: () => import('@/views/inspection/plan.vue'),
            meta: { title: '巡检计划' },
          },
          {
            path: 'task',
            name: 'InspectionTask',
            component: () => import('@/views/inspection/task.vue'),
            meta: { title: '巡检任务' },
          },
          {
            path: 'record',
            name: 'InspectionRecord',
            component: () => import('@/views/inspection/record.vue'),
            meta: { title: '巡检记录' },
          },
          {
            path: 'hidden-flaw',
            name: 'HiddenFlaw',
            component: () => import('@/views/inspection/hidden-flaw/index.vue'),
            meta: { title: '隐患工单' },
          },
          {
            path: 'template',
            name: 'InspectionTemplate',
            component: () => import('@/views/inspection/template.vue'),
            meta: { title: '巡检模板' },
          },
        ],
      },
      {
        path: 'alarm',
        name: 'Alarm',
        redirect: '/alarm/center',
        meta: { title: '告警中心', icon: 'AlertOutlined' },
        children: [
          {
            path: 'center',
            name: 'AlarmCenter',
            component: () => import('@/views/alarm/center.vue'),
            meta: { title: '实时告警' },
          },
          {
            path: 'rules',
            name: 'AlarmRules',
            component: () => import('@/views/alarm/rules.vue'),
            meta: { title: '告警规则' },
          },
        ],
      },
      {
        path: 'work-order',
        name: 'WorkOrder',
        redirect: '/work-order/center',
        meta: { title: '工单中心', icon: 'ScheduleOutlined' },
        children: [
          {
            path: 'center',
            name: 'WorkOrderCenter',
            component: () => import('@/views/work-order/center.vue'),
            meta: { title: '我的工单' },
          },
          {
            path: 'pool',
            name: 'WorkOrderPool',
            component: () => import('@/views/work-order/pool.vue'),
            meta: { title: '工单池' },
          },
        ],
      },
      {
        path: 'report',
        name: 'Report',
        redirect: '/report/production',
        meta: { title: '报表中心', icon: 'BarChartOutlined' },
        children: [
          {
            path: 'production',
            name: 'ReportProduction',
            component: () => import('@/views/report/production.vue'),
            meta: { title: '发电报表' },
          },
          {
            path: 'inspection',
            name: 'ReportInspection',
            component: () => import('@/views/report/inspection.vue'),
            meta: { title: '巡检报表' },
          },
        ],
      },
      {
        path: 'system',
        name: 'System',
        redirect: '/system/user',
        meta: { title: '系统管理', icon: 'SettingOutlined' },
        children: [
          {
            path: 'user',
            name: 'SystemUser',
            component: () => import('@/views/system/user.vue'),
            meta: { title: '用户管理' },
          },
          {
            path: 'role',
            name: 'SystemRole',
            component: () => import('@/views/system/role.vue'),
            meta: { title: '角色管理' },
          },
          {
            path: 'dict',
            name: 'SystemDict',
            component: () => import('@/views/system/dict.vue'),
            meta: { title: '字典管理' },
          },
          {
            path: 'log',
            name: 'SystemLog',
            component: () => import('@/views/system/log.vue'),
            meta: { title: '操作日志' },
          },
        ],
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/common/404.vue'),
    meta: { hidden: true },
  },
];
