import type { MockMethod } from 'vite-plugin-mock';
import Mock from 'mockjs';

export default [
  {
    url: '/dashboard/stats',
    method: 'get',
    response: () => ({
      code: 0,
      data: {
        kpi: {
          totalCapacity: 182350,
          todayGen: 46218.35,
          monthGen: 1284091.2,
          yearGen: 15420380.8,
          activeStations: 46,
          activeAlarms: 12,
          pendingWorkOrders: 8,
          pendingFlaws: 23,
        },
        genTrend: Array.from({ length: 30 }).map((_, i) => ({
          date: `2026-04-${String(i + 1).padStart(2, '0')}`,
          value: Mock.Random.integer(30000, 55000),
        })),
        typePie: [
          { name: '集中式', value: 18 },
          { name: '分布式', value: 12 },
          { name: '工商业', value: 10 },
          { name: '户用', value: 8 },
        ],
        alarmBar: [
          { level: '紧急', count: 3 },
          { level: '严重', count: 5 },
          { level: '一般', count: 9 },
          { level: '提示', count: 15 },
        ],
      },
    }),
  },
] as MockMethod[];
