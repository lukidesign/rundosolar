import type { MockMethod } from 'vite-plugin-mock';

const demoUser = {
  id: 1,
  username: 'admin',
  nickname: '系统管理员',
  avatar: '',
  roles: ['admin'],
};

export default [
  {
    url: '/auth/login',
    method: 'post',
    response: ({ body }: any) => {
      const { username, password } = body || {};
      if (username === 'admin' && password === 'admin123') {
        return {
          code: 0,
          message: 'ok',
          data: { token: 'mock-token-' + Date.now(), user: demoUser },
        };
      }
      return { code: 401, message: '用户名或密码错误', data: null };
    },
  },
  {
    url: '/auth/me',
    method: 'get',
    response: () => ({ code: 0, message: 'ok', data: demoUser }),
  },
] as MockMethod[];
