import request from '@/api/http/request';
import type { HiddenFlawItem, HiddenFlawQuery, HiddenFlawFormState } from './types';

export function getHiddenFlawList(params: HiddenFlawQuery) {
  return request.get<{ list: HiddenFlawItem[]; total: number }>(
    '/inspection/hidden-flaw/list',
    { params },
  );
}

export function createHiddenFlaw(data: HiddenFlawFormState) {
  return request.post('/inspection/hidden-flaw', data);
}

export function updateHiddenFlaw(id: number, data: HiddenFlawFormState) {
  return request.put(`/inspection/hidden-flaw/${id}`, data);
}

export function getHiddenFlawDetail(id: number) {
  return request.get<HiddenFlawItem>(`/inspection/hidden-flaw/${id}`);
}

export function deleteHiddenFlaw(id: number) {
  return request.delete(`/inspection/hidden-flaw/${id}`);
}

export function rectifyHiddenFlaw(
  id: number,
  data: { rectifyResult: string; rectifyImages: string[] },
) {
  return request.post(`/inspection/hidden-flaw/${id}/rectify`, data);
}

export function exportHiddenFlaw(params: HiddenFlawQuery) {
  return request.post('/inspection/hidden-flaw/export', params, { responseType: 'blob' });
}

/** 电站下拉（远程搜索） */
export function searchStations(keyword: string) {
  return request.get<{ id: number; name: string }[]>('/station/search', { params: { keyword } });
}

/** 整改负责人下拉 */
export function searchUsers(keyword: string) {
  return request.get<{ id: number; name: string }[]>('/user/search', { params: { keyword } });
}
