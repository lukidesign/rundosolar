import type { TableColumnType } from 'ant-design-vue';
import type { HiddenFlawItem, HazardLevel, RectifyStatus, CheckType, ProblemMajor } from './types';

export const CHECK_TYPE_MAP: Record<CheckType, string> = {
  SELF: '部门自查',
  CUSTOMER: '客户来报',
  CROSS: '交叉检查',
  EXTERNAL: '外部检查',
};

export const PROBLEM_MAJOR_MAP: Record<ProblemMajor, string> = {
  PERSONAL_SAFETY: '人身安全隐患',
  OTHER_SAFETY: '其他安全隐患',
  DEVICE: '设备隐患',
  ENV: '环境隐患',
};

export const HAZARD_LEVEL_MAP: Record<HazardLevel, { text: string; color: string }> = {
  MAJOR_II: { text: 'II类重大缺陷', color: 'red' },
  GENERAL: { text: '一般隐患', color: 'orange' },
  NONE: { text: '非隐患', color: 'default' },
};

export const RECTIFY_STATUS_MAP: Record<RectifyStatus, { text: string; color: string }> = {
  PENDING: { text: '待整改', color: 'default' },
  PROCESSING: { text: '整改中', color: 'processing' },
  DONE: { text: '已完成', color: 'success' },
  REJECTED: { text: '已驳回', color: 'error' },
};

export const columns: TableColumnType<HiddenFlawItem>[] = [
  {
    title: '序号',
    key: 'index',
    width: 70,
    align: 'center',
    customRender: ({ index }) => index + 1,
  },
  {
    title: '电站名称',
    dataIndex: 'stationName',
    key: 'stationName',
    width: 180,
    ellipsis: true,
  },
  {
    title: '整改负责人',
    dataIndex: 'rectifierName',
    key: 'rectifierName',
    width: 120,
  },
  {
    title: '检查类型',
    dataIndex: 'checkType',
    key: 'checkType',
    width: 110,
    customRender: ({ text }) => CHECK_TYPE_MAP[text as CheckType] ?? '--',
  },
  {
    title: '发现问题时间',
    dataIndex: 'discoverTime',
    key: 'discoverTime',
    width: 140,
    sorter: true,
    customRender: ({ text }) => (text ? text.slice(0, 10) : '--'),
  },
  {
    title: '问题大类',
    dataIndex: 'problemMajor',
    key: 'problemMajor',
    width: 130,
    customRender: ({ text }) => PROBLEM_MAJOR_MAP[text as ProblemMajor] ?? '--',
  },
  {
    title: '问题细分',
    dataIndex: 'problemDetail',
    key: 'problemDetail',
    width: 160,
    ellipsis: true,
  },
  {
    title: '隐患分级',
    dataIndex: 'hazardLevel',
    key: 'hazardLevel',
    width: 130,
  },
  {
    title: '问题图片',
    dataIndex: 'problemImages',
    key: 'problemImages',
    width: 120,
  },
  {
    title: '整改情况',
    dataIndex: 'rectifyStatus',
    key: 'rectifyStatus',
    width: 110,
  },
  {
    title: '操作',
    key: 'action',
    width: 260,
    fixed: 'right',
  },
];
