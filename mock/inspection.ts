import type { MockMethod } from 'vite-plugin-mock';
import Mock from 'mockjs';

const PLAN_CYCLES = ['每日', '每周', '每月', '每季度', '每年'];
const STATIONS = ['京津光伏电站', '沪浙光伏电站', '粤港光伏电站', '川渝光伏电站', '云贵光伏电站'];
const CATEGORIES = ['日常巡检', '专项巡检', '季节性巡检', '设备预防性维护'];
const TASK_STATUS = ['待执行', '执行中', '已完成', '已逾期'];

// ---- 巡检模板 ----
let templates = Array.from({ length: 12 }).map((_, i) => ({
  id: i + 1,
  code: 'TPL' + String(1001 + i),
  name: Mock.Random.pick(CATEGORIES) + '模板',
  category: Mock.Random.pick(CATEGORIES),
  itemCount: Mock.Random.integer(5, 30),
  description: Mock.Random.csentence(10, 20),
  enabled: Mock.Random.boolean(),
  createdAt: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
}));

// ---- 巡检计划 ----
let plans = Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,
  code: 'PL' + String(2001 + i),
  name: Mock.Random.pick(STATIONS) + ' ' + Mock.Random.pick(PLAN_CYCLES) + '巡检',
  stationName: Mock.Random.pick(STATIONS),
  templateName: Mock.Random.pick(templates).name,
  cycle: Mock.Random.pick(PLAN_CYCLES),
  owner: Mock.Random.cname(),
  startDate: Mock.Random.date('yyyy-MM-dd'),
  endDate: Mock.Random.date('yyyy-MM-dd'),
  enabled: Mock.Random.boolean(),
  createdAt: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
}));

// ---- 巡检任务 ----
let tasks = Array.from({ length: 40 }).map((_, i) => {
  const status = Mock.Random.pick(TASK_STATUS);
  return {
    id: i + 1,
    code: 'TK' + String(3001 + i),
    planName: Mock.Random.pick(plans).name,
    stationName: Mock.Random.pick(STATIONS),
    executor: Mock.Random.cname(),
    status,
    planTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    finishTime: status === '已完成' ? Mock.Random.datetime('yyyy-MM-dd HH:mm:ss') : '',
    itemCount: Mock.Random.integer(5, 20),
    abnormalCount: status === '已完成' ? Mock.Random.integer(0, 5) : 0,
  };
});

// ---- 巡检记录 ----
const records = Array.from({ length: 30 }).map((_, i) => ({
  id: i + 1,
  taskCode: 'TK' + String(3001 + Mock.Random.integer(0, 39)),
  stationName: Mock.Random.pick(STATIONS),
  executor: Mock.Random.cname(),
  finishTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
  itemCount: Mock.Random.integer(5, 20),
  abnormalCount: Mock.Random.integer(0, 5),
  duration: Mock.Random.integer(20, 180), // minutes
  summary: Mock.Random.csentence(15, 30),
}));

const paged = <T>(list: T[], query: any) => {
  const page = Number(query.page || query.pageNum || 1);
  const pageSize = Number(query.pageSize || 10);
  const start = (page - 1) * pageSize;
  return { total: list.length, list: list.slice(start, start + pageSize) };
};

export default [
  // Templates
  {
    url: '/inspection/template/list',
    method: 'get',
    response: ({ query }: any) => {
      let list = templates;
      if (query.keyword) list = list.filter((x) => x.name.includes(query.keyword));
      return { code: 0, data: paged(list, query) };
    },
  },
  {
    url: '/inspection/template',
    method: 'post',
    response: ({ body }: any) => {
      const item = {
        id: Date.now(),
        code: 'TPL' + Date.now().toString().slice(-4),
        itemCount: 0,
        enabled: true,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        ...body,
      };
      templates.unshift(item);
      return { code: 0, data: item };
    },
  },
  {
    url: '/inspection/template/:id',
    method: 'put',
    response: ({ query, body }: any) => {
      const id = Number(query.id);
      templates = templates.map((x) => (x.id === id ? { ...x, ...body } : x));
      return { code: 0, data: null };
    },
  },
  {
    url: '/inspection/template/:id',
    method: 'delete',
    response: ({ query }: any) => {
      templates = templates.filter((x) => x.id !== Number(query.id));
      return { code: 0, data: null };
    },
  },

  // Plans
  {
    url: '/inspection/plan/list',
    method: 'get',
    response: ({ query }: any) => {
      let list = plans;
      if (query.keyword) list = list.filter((x) => x.name.includes(query.keyword));
      if (query.cycle) list = list.filter((x) => x.cycle === query.cycle);
      return { code: 0, data: paged(list, query) };
    },
  },
  {
    url: '/inspection/plan',
    method: 'post',
    response: ({ body }: any) => {
      const item = {
        id: Date.now(),
        code: 'PL' + Date.now().toString().slice(-4),
        enabled: true,
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        ...body,
      };
      plans.unshift(item);
      return { code: 0, data: item };
    },
  },
  {
    url: '/inspection/plan/:id',
    method: 'put',
    response: ({ query, body }: any) => {
      const id = Number(query.id);
      plans = plans.map((x) => (x.id === id ? { ...x, ...body } : x));
      return { code: 0, data: null };
    },
  },
  {
    url: '/inspection/plan/:id',
    method: 'delete',
    response: ({ query }: any) => {
      plans = plans.filter((x) => x.id !== Number(query.id));
      return { code: 0, data: null };
    },
  },
  {
    url: '/inspection/plan/:id/dispatch',
    method: 'post',
    response: ({ query }: any) => {
      const id = Number(query.id);
      const plan = plans.find((p) => p.id === id);
      if (plan) {
        const newTask = {
          id: Date.now(),
          code: 'TK' + Date.now().toString().slice(-4),
          planName: plan.name,
          stationName: plan.stationName,
          executor: plan.owner,
          status: '待执行',
          planTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
          finishTime: '',
          itemCount: 10,
          abnormalCount: 0,
        };
        tasks.unshift(newTask);
        return { code: 0, data: newTask };
      }
      return { code: 404, message: '计划不存在', data: null };
    },
  },

  // Tasks
  {
    url: '/inspection/task/list',
    method: 'get',
    response: ({ query }: any) => {
      let list = tasks;
      if (query.keyword) list = list.filter((x) => x.planName.includes(query.keyword));
      if (query.status) list = list.filter((x) => x.status === query.status);
      return { code: 0, data: paged(list, query) };
    },
  },
  {
    url: '/inspection/task/:id/finish',
    method: 'post',
    response: ({ query }: any) => {
      const id = Number(query.id);
      tasks = tasks.map((t) =>
        t.id === id
          ? {
              ...t,
              status: '已完成',
              finishTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
              abnormalCount: Mock.Random.integer(0, 3),
            }
          : t,
      );
      return { code: 0, data: null };
    },
  },

  // Records
  {
    url: '/inspection/record/list',
    method: 'get',
    response: ({ query }: any) => {
      let list = records;
      if (query.keyword) list = list.filter((x) => x.stationName.includes(query.keyword));
      return { code: 0, data: paged(list, query) };
    },
  },
  {
    url: '/inspection/record/:id',
    method: 'get',
    response: ({ query }: any) => {
      const id = Number(query.id);
      const r = records.find((x) => x.id === id) || records[0];
      return { code: 0, data: r };
    },
  },
] as MockMethod[];
