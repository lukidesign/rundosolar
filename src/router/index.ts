import { createRouter, createWebHashHistory } from 'vue-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useUserStore } from '@/stores/user';
import { routes } from './routes';

NProgress.configure({ showSpinner: false, trickleSpeed: 120 });

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  NProgress.start();
  const user = useUserStore();
  if (to.path === '/login') return next();
  if (!user.token) return next({ path: '/login', query: { redirect: to.fullPath } });
  next();
});

router.afterEach((to) => {
  const title = (to.meta?.title as string) || 'Rundo Solar';
  document.title = `${title} · Rundo Solar`;
  NProgress.done();
});

export default router;
