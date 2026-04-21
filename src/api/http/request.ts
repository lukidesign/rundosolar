import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'ant-design-vue';

const instance = axios.create({
  baseURL: '/',
  timeout: 15000,
});

instance.interceptors.response.use(
  (response: AxiosResponse) => {
    // blob 直接返回原始 response，业务自己处理
    if (response.config.responseType === 'blob') {
      return { data: response.data } as any;
    }

    const body = response.data;
    // 约定形状 1：{ code, data, message }
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code === 0 || body.code === 200) {
        return { data: body.data } as any;
      }
      message.error(body.message || '请求失败');
      return Promise.reject(new Error(body.message || '请求失败'));
    }
    // 约定形状 2：裸数据
    return { data: body } as any;
  },
  (error) => {
    message.error(error?.response?.data?.message || error.message || '网络异常');
    return Promise.reject(error);
  },
);

function get<T = any>(url: string, config?: AxiosRequestConfig) {
  return instance.get<any, { data: T }>(url, config);
}
function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
  return instance.post<any, { data: T }>(url, data, config);
}
function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
  return instance.put<any, { data: T }>(url, data, config);
}
function del<T = any>(url: string, config?: AxiosRequestConfig) {
  return instance.delete<any, { data: T }>(url, config);
}

export default { get, post, put, delete: del };
