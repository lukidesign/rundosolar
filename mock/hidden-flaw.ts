import type { MockMethod } from 'vite-plugin-mock';
import Mock from 'mockjs';

type HazardLevel = 'MAJOR_II' | 'GENERAL' | 'NONE';
type RectifyStatus = 'PENDING' | 'PROCESSING' | 'DONE' | 'REJECTED';
type CheckType = 'SELF' | 'CUSTOMER' | 'CROSS' | 'EXTERNAL';
type ProblemMajor = 'PERSONAL_SAFETY' | 'OTHER_SAFETY' | 'DEVICE' | 'ENV';

interface HiddenFlawItem {
  id: number;
  stationId: number;
  stationName: string;
  rectifierId: number;
  rectifierName: string;
  checkType: CheckType;
  discoverTime: string;
  problemMajor: ProblemMajor;
  problemDetail: string;
  hazardLevel: HazardLevel;
  problemImages: string[];
  rectifyStatus: RectifyStatus;
  rectifyPlan?: string;
  rectifyDeadline?: string;
  rectifyResult?: string;
  rectifyImages?: string[];
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

const STATIONS = [
  { id: 1, name: '广东珠海斗门光伏电站' },
  { id: 2, name: '江苏盐城滨海光伏电站' },
  { id: 3, name: '山东菏泽定陶光伏电站' },
  { id: 4, name: '浙江嘉兴海盐光伏电站' },
  { id: 5, name: '安徽阜阳太和光伏电站' },
  { id: 6, name: '河北张家口尚义光伏电站' },
  { id: 7, name: '宁夏中卫沙坡头光伏电站' },
  { id: 8, name: '甘肃金昌永昌光伏电站' },
];

const USERS = [
  { id: 101, name: '张伟' },
  { id: 102, name: '李娜' },
  { id: 103, name: '王强' },
  { id: 104, name: '刘洋' },
  { id: 105, name: '陈静' },
  { id: 106, name: '赵磊' },
  { id: 107, name: '孙丽' },
];

const CHECK_TYPES: CheckType[] = ['SELF', 'CUSTOMER', 'CROSS', 'EXTERNAL'];
const PROBLEM_MAJORS: ProblemMajor[] = ['PERSONAL_SAFETY', 'OTHER_SAFETY', 'DEVICE', 'ENV'];
const HAZARD_LEVELS: HazardLevel[] = ['MAJOR_II', 'GENERAL', 'NONE'];
const RECTIFY_STATUSES: RectifyStatus[] = ['PENDING', 'PROCESSING', 'DONE', 'REJECTED'];

const PROBLEM_DETAILS = [
  '组件表面出现大面积积灰，影响发电效率',
  '逆变器风扇异响，疑似轴承磨损',
  '汇流箱内线缆绝缘层破损，存在短路风险',
  '支架地脚螺栓锈蚀严重，需更换紧固件',
  '围栏缺失，存在小动物进入风险',
  '接地电阻实测值超出规范要求',
  '组件边框出现热斑，局部温升异常',
  '电缆沟盖板破损，雨水倒灌',
  '监控摄像头离线超过 48 小时',
  'SVG 设备告警灯常亮',
];

const SAMPLE_IMG =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="#cfd8dc"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#455a64" font-size="18">Flaw</text></svg>`,
  ).toString('base64');

let autoId = 1;
const db: HiddenFlawItem[] = [];

function seed() {
  for (let i = 0; i < 30; i++) {
    const station = Mock.Random.pick(STATIONS);
    const user = Mock.Random.pick(USERS);
    const createdAt = Mock.Random.datetime('yyyy-MM-dd HH:mm:ss');
    db.push({
      id: autoId++,
      stationId: station.id,
      stationName: station.name,
      rectifierId: user.id,
      rectifierName: user.name,
      checkType: Mock.Random.pick(CHECK_TYPES),
      discoverTime: createdAt,
      problemMajor: Mock.Random.pick(PROBLEM_MAJORS),
      problemDetail: Mock.Random.pick(PROBLEM_DETAILS),
      hazardLevel: Mock.Random.pick(HAZARD_LEVELS),
      problemImages: Array.from({ length: Mock.Random.integer(1, 3) }, () => SAMPLE_IMG),
      rectifyStatus: Mock.Random.pick(RECTIFY_STATUSES),
      rectifyPlan: Mock.Random.cword(10, 30),
      rectifyDeadline: Mock.Random.date('yyyy-MM-dd'),
      rectifyResult: '',
      rectifyImages: [],
      remark: Mock.Random.cword(0, 20),
      createdAt,
      updatedAt: createdAt,
    });
  }
}
seed();

function paginate<T>(arr: T[], pageNum: number, pageSize: number) {
  const start = (pageNum - 1) * pageSize;
  return arr.slice(start, start + pageSize);
}

function ok<T>(data: T) {
  return { code: 0, message: 'ok', data };
}

const mocks: MockMethod[] = [
  {
    url: '/inspection/hidden-flaw/list',
    method: 'get',
    response: ({ query }: any) => {
      let list = [...db];
      if (query.stationId) list = list.filter((i) => i.stationId === Number(query.stationId));
      if (query.rectifierId)
        list = list.filter((i) => i.rectifierId === Number(query.rectifierId));
      if (query.checkType) list = list.filter((i) => i.checkType === query.checkType);
      if (query.rectifyStatus)
        list = list.filter((i) => i.rectifyStatus === query.rectifyStatus);
      if (query.discoverTimeStart)
        list = list.filter((i) => i.discoverTime >= query.discoverTimeStart);
      if (query.discoverTimeEnd)
        list = list.filter((i) => i.discoverTime <= query.discoverTimeEnd + ' 23:59:59');

      if (query.sortField) {
        const order = query.sortOrder === 'descend' ? -1 : 1;
        list.sort((a: any, b: any) => {
          const va = a[query.sortField];
          const vb = b[query.sortField];
          if (va === vb) return 0;
          return va > vb ? order : -order;
        });
      }

      const total = list.length;
      const pageNum = Number(query.pageNum) || 1;
      const pageSize = Number(query.pageSize) || 10;
      return ok({ list: paginate(list, pageNum, pageSize), total });
    },
  },
  {
    url: '/inspection/hidden-flaw/:id',
    method: 'get',
    response: ({ query, url }: any) => {
      const id = Number(url.split('/').pop().split('?')[0]);
      const item = db.find((i) => i.id === id);
      return item ? ok(item) : { code: 404, message: 'not found', data: null };
    },
  },
  {
    url: '/inspection/hidden-flaw',
    method: 'post',
    response: ({ body }: any) => {
      const station = STATIONS.find((s) => s.id === body.stationId);
      const user = USERS.find((u) => u.id === body.rectifierId);
      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const item: HiddenFlawItem = {
        id: autoId++,
        stationId: body.stationId,
        stationName: station?.name || '',
        rectifierId: body.rectifierId,
        rectifierName: user?.name || '',
        checkType: body.checkType,
        discoverTime: body.discoverTime,
        problemMajor: body.problemMajor,
        problemDetail: body.problemDetail,
        hazardLevel: body.hazardLevel,
        problemImages: body.problemImages || [],
        rectifyStatus: 'PENDING',
        rectifyPlan: body.rectifyPlan,
        rectifyDeadline: body.rectifyDeadline,
        remark: body.remark,
        createdAt: now,
        updatedAt: now,
      };
      db.unshift(item);
      return ok(item);
    },
  },
  {
    url: '/inspection/hidden-flaw/:id',
    method: 'put',
    response: ({ body, url }: any) => {
      const id = Number(url.split('/').pop().split('?')[0]);
      const idx = db.findIndex((i) => i.id === id);
      if (idx < 0) return { code: 404, message: 'not found', data: null };
      const station = STATIONS.find((s) => s.id === body.stationId);
      const user = USERS.find((u) => u.id === body.rectifierId);
      db[idx] = {
        ...db[idx],
        ...body,
        stationName: station?.name || db[idx].stationName,
        rectifierName: user?.name || db[idx].rectifierName,
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };
      return ok(db[idx]);
    },
  },
  {
    url: '/inspection/hidden-flaw/:id',
    method: 'delete',
    response: ({ url }: any) => {
      const id = Number(url.split('/').pop().split('?')[0]);
      const idx = db.findIndex((i) => i.id === id);
      if (idx >= 0) db.splice(idx, 1);
      return ok(true);
    },
  },
  {
    url: '/inspection/hidden-flaw/:id/rectify',
    method: 'post',
    response: ({ body, url }: any) => {
      const parts = url.split('?')[0].split('/');
      const id = Number(parts[parts.length - 2]);
      const idx = db.findIndex((i) => i.id === id);
      if (idx < 0) return { code: 404, message: 'not found', data: null };
      db[idx] = {
        ...db[idx],
        rectifyResult: body.rectifyResult,
        rectifyImages: body.rectifyImages || [],
        rectifyStatus: 'DONE',
        updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };
      return ok(db[idx]);
    },
  },
  {
    url: '/inspection/hidden-flaw/export',
    method: 'post',
    rawResponse: async (req: any, res: any) => {
      const csv = [
        'id,stationName,rectifierName,checkType,discoverTime,problemMajor,problemDetail,hazardLevel,rectifyStatus',
        ...db.map((i) =>
          [
            i.id,
            i.stationName,
            i.rectifierName,
            i.checkType,
            i.discoverTime,
            i.problemMajor,
            `"${i.problemDetail.replace(/"/g, '""')}"`,
            i.hazardLevel,
            i.rectifyStatus,
          ].join(','),
        ),
      ].join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="hidden-flaw.csv"');
      // 加 UTF-8 BOM 以便 Excel 正确显示中文
      res.end('\ufeff' + csv);
    },
  },
  {
    url: '/station/search',
    method: 'get',
    response: ({ query }: any) => {
      const kw = (query.keyword || '').trim();
      const list = kw ? STATIONS.filter((s) => s.name.includes(kw)) : STATIONS;
      return ok(list);
    },
  },
  {
    url: '/user/search',
    method: 'get',
    response: ({ query }: any) => {
      const kw = (query.keyword || '').trim();
      const list = kw ? USERS.filter((u) => u.name.includes(kw)) : USERS;
      return ok(list);
    },
  },
];

export default mocks;
