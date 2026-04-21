import type { MockMethod } from 'vite-plugin-mock';
import Mock from 'mockjs';

const LEVELS = ['紧急', '严重', '一般', '提示'];
const STATUSES = ['未处理', '处理中', '已处理', '已忽略'];
const TYPES = ['组件故障', '逆变器离线', '通讯中断', '发电异常', 'IV 诊断告警', '温度过高'];

const alarms = Array.from({ length: 60 }).map((_, i) => ({
  id: i + 1,
  code: 'AL' + String(20000 + i),
  stationName: Mock.Random.pick(['京津', '沪浙', '粤港']) + '光伏电站',
  deviceName: Mock.Random.pick(['#1 逆变器', '#2 组串', '汇流箱 A', '升压站']),
  type: Mock.Random.pick(TYPES),
  level: Mock.Random.pick(LEVELS),
  status: Mock.Random.pick(STATUSES),
  content: Mock.Random.csentence(10, 18),
  triggeredAt: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
}));

const rules = Array.from({ length: 18 }).map((_, i) => ({
  id: i + 1,
  name: Mock.Random.pick(TYPES) + ' 规则',
  metric: Mock.Random.pick(['有功功率', '直流电压', '温度', '绝缘阻抗']),
  operator: Mock.Random.pick(['>', '<', '>=', '<=', '==']),
  threshold: Mock.Random.integer(10, 1000),
  level: Mock.Random.pick(LEVELS),
  enabled: Mock.Random.boolean(),
  updatedAt: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
}));

export default [
  {
    url: '/alarm/list',
    method: 'get',
    response: ({ query }: any) => {
      const { page = 1, pageSize = 10, level = '', status = '' } = query || {};
      let list = alarms;
      if (level) list = list.filter((x) => x.level === level);
      if (status) list = list.filter((x) => x.status === status);
      const start = (Number(page) - 1) * Number(pageSize);
      return {
        code: 0,
        data: { total: list.length, list: list.slice(start, start + Number(pageSize)) },
      };
    },
  },
  {
    url: '/alarm/rules',
    method: 'get',
    response: () => ({ code: 0, data: { list: rules, total: rules.length } }),
  },
] as MockMethod[];
