import type { MockMethod } from 'vite-plugin-mock';
import Mock from 'mockjs';

const stations = Array.from({ length: 48 }).map((_, i) => {
  const capacity = Mock.Random.integer(200, 5000);
  const status = Mock.Random.pick(['在线', '在线', '在线', '离线', '告警']);
  return {
    id: i + 1,
    code: 'PV' + String(1000 + i),
    name: Mock.Random.pick(['京津', '沪浙', '粤港', '川渝', '云贵', '闽赣']) + Mock.Random.cword(2, 3) + '光伏电站',
    type: Mock.Random.pick(['集中式', '分布式', '工商业', '户用']),
    capacity,
    province: Mock.Random.province(),
    city: Mock.Random.city(),
    owner: Mock.Random.cname(),
    onlineDate: Mock.Random.date('yyyy-MM-dd'),
    status,
    dayGen: +(Math.random() * capacity * 5).toFixed(2),
    totalGen: +(Math.random() * capacity * 1000).toFixed(2),
  };
});

export default [
  {
    url: '/station/list',
    method: 'get',
    response: ({ query }: any) => {
      const { page = 1, pageSize = 10, keyword = '', status = '' } = query || {};
      let list = stations;
      if (keyword) list = list.filter((s) => s.name.includes(keyword) || s.code.includes(keyword));
      if (status) list = list.filter((s) => s.status === status);
      const start = (Number(page) - 1) * Number(pageSize);
      return {
        code: 0,
        message: 'ok',
        data: {
          total: list.length,
          list: list.slice(start, start + Number(pageSize)),
        },
      };
    },
  },
  {
    url: '/station/detail/:id',
    method: 'get',
    response: ({ query }: any) => {
      const id = Number(query.id);
      const s = stations.find((x) => x.id === id) || stations[0];
      return { code: 0, message: 'ok', data: s };
    },
  },
  {
    url: '/station/summary',
    method: 'get',
    response: () => ({
      code: 0,
      data: {
        total: stations.length,
        online: stations.filter((s) => s.status === '在线').length,
        offline: stations.filter((s) => s.status === '离线').length,
        alarm: stations.filter((s) => s.status === '告警').length,
        totalCapacity: stations.reduce((a, b) => a + b.capacity, 0),
        todayGen: stations.reduce((a, b) => a + b.dayGen, 0).toFixed(2),
      },
    }),
  },
] as MockMethod[];
