/** 隐患分级 */
export type HazardLevel =
  | 'MAJOR_II'    // II 类重大缺陷
  | 'GENERAL'     // 一般隐患
  | 'NONE';       // 非隐患

/** 整改情况 */
export type RectifyStatus =
  | 'PENDING'     // 待整改
  | 'PROCESSING'  // 整改中
  | 'DONE'        // 已完成
  | 'REJECTED';   // 已驳回

/** 检查类型 */
export type CheckType =
  | 'SELF'        // 部门自查
  | 'CUSTOMER'    // 客户来报
  | 'CROSS'       // 交叉检查
  | 'EXTERNAL';   // 外部检查

/** 问题大类 */
export type ProblemMajor =
  | 'PERSONAL_SAFETY' // 人身安全隐患
  | 'OTHER_SAFETY'    // 其他安全隐患
  | 'DEVICE'          // 设备隐患
  | 'ENV';            // 环境隐患

export interface HiddenFlawItem {
  id: number;
  stationId: number;
  stationName: string;
  rectifierId: number;
  rectifierName: string;
  checkType: CheckType;
  discoverTime: string;         // ISO
  problemMajor: ProblemMajor;
  problemDetail: string;
  hazardLevel: HazardLevel;
  problemImages: string[];       // 图片 URL 列表
  rectifyStatus: RectifyStatus;
  rectifyPlan?: string;
  rectifyDeadline?: string;      // ISO
  rectifyResult?: string;
  rectifyImages?: string[];
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HiddenFlawQuery {
  stationId?: number;
  rectifierId?: number;
  checkType?: CheckType;
  rectifyStatus?: RectifyStatus;
  discoverTimeStart?: string;
  discoverTimeEnd?: string;
  pageNum: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
}

export interface HiddenFlawFormState {
  id?: number;
  stationId?: number;
  checkType?: CheckType;
  discoverTime?: string;
  problemMajor?: ProblemMajor;
  problemDetail?: string;
  hazardLevel?: HazardLevel;
  problemImages: string[];
  rectifierId?: number;
  rectifyDeadline?: string;
  rectifyPlan?: string;
  remark?: string;
}

export type ModalMode = 'create' | 'edit' | 'view';
