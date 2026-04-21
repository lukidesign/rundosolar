import { defineStore } from 'pinia';
import { ref } from 'vue';
import request from '@/api/http/request';

interface LoginPayload {
  username: string;
  password: string;
}

interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  roles: string[];
}

const TOKEN_KEY = 'rundosolar_token';

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(localStorage.getItem(TOKEN_KEY) || '');
  const info = ref<UserInfo | null>(null);

  async function login(payload: LoginPayload) {
    const { data } = await request.post<{ token: string; user: UserInfo }>(
      '/auth/login',
      payload,
    );
    token.value = data.token;
    info.value = data.user;
    localStorage.setItem(TOKEN_KEY, data.token);
  }

  async function fetchInfo() {
    if (!token.value) return;
    const { data } = await request.get<UserInfo>('/auth/me');
    info.value = data;
  }

  function logout() {
    token.value = '';
    info.value = null;
    localStorage.removeItem(TOKEN_KEY);
  }

  return { token, info, login, fetchInfo, logout };
});
