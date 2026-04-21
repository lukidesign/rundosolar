<template>
  <div class="login-page">
    <div class="login-box">
      <div class="brand">
        <div class="brand-title">Rundo Solar</div>
        <div class="brand-sub">光伏运维管理平台</div>
      </div>

      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        layout="vertical"
        @finish="handleSubmit"
      >
        <a-form-item name="username">
          <a-input
            v-model:value="form.username"
            size="large"
            placeholder="用户名"
            autocomplete="off"
          >
            <template #prefix><user-outlined /></template>
          </a-input>
        </a-form-item>
        <a-form-item name="password">
          <a-input-password
            v-model:value="form.password"
            size="large"
            placeholder="密码"
            autocomplete="off"
          >
            <template #prefix><lock-outlined /></template>
          </a-input-password>
        </a-form-item>

        <a-button
          type="primary"
          html-type="submit"
          size="large"
          block
          :loading="loading"
        >
          登 录
        </a-button>
      </a-form>

      <div class="tip">演示账号: admin / admin123</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import type { FormInstance, Rule } from 'ant-design-vue/es/form';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const route = useRoute();
const user = useUserStore();
const formRef = ref<FormInstance>();
const loading = ref(false);

const form = reactive({ username: 'admin', password: 'admin123' });
const rules: Record<string, Rule[]> = {
  username: [{ required: true, message: '请输入用户名' }],
  password: [{ required: true, message: '请输入密码' }],
};

const handleSubmit = async () => {
  loading.value = true;
  try {
    await user.login(form);
    message.success('登录成功');
    const redirect = (route.query.redirect as string) || '/dashboard';
    router.replace(redirect);
  } catch (e) {
    // 拦截器已报错
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="less" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3a8a 0%, #0ea5e9 100%);
}
.login-box {
  width: 400px;
  padding: 40px 36px 32px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
.brand {
  text-align: center;
  margin-bottom: 32px;
}
.brand-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e3a8a;
  letter-spacing: 1px;
}
.brand-sub {
  margin-top: 8px;
  font-size: 14px;
  color: #64748b;
}
.tip {
  margin-top: 16px;
  text-align: center;
  color: #94a3b8;
  font-size: 12px;
}
</style>
